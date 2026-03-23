import requests
from django.conf import settings
from ..models import PaymentGateway

def get_paystack_config():
    try:
        gateway = PaymentGateway.objects.get(name="Paystack", is_active=True)
        return gateway.config
    except PaymentGateway.DoesNotExist:
        return {}

def initialize_transaction(email, amount, reference, callback_url):
    url = "https://api.paystack.co/transaction/initialize"
    headers = {
        "Authorization": f"Bearer sk_test_6b6118d3feafe92c6ec2f2ff16a8b119eca38564",
        "Content-Type": "application/json",
    }
    # Amount in kobo for Paystack (NGN, GHS, etc.)
    # For simplicity, assuming amount is in standard units and needs to be multiplied by 100
    data = {
        "email": email,
        "amount": int(float(amount) * 100),
        "reference": reference,
        "callback_url": callback_url,
        "currency": "KES",
    }

    response = requests.post(url, headers=headers, json=data)
    return response.json()

def verify_transaction(reference):
    url = f"https://api.paystack.co/transaction/verify/{reference}"
    headers = {
        "Authorization": f"Bearer sk_test_6b6118d3feafe92c6ec2f2ff16a8b119eca38564",
    }

    response = requests.get(url, headers=headers)
    return response.json()

def process_verification(reference):
    from ..models import Order, Transaction
    response = verify_transaction(reference)
    
    if response.get('status') and response.get('data', {}).get('status') == 'success':
        try:
            order = Order.objects.get(transaction_id=reference)
            order.status = 'A'
            order.save()
            
            Transaction.objects.update_or_create(
                order=order,
                transaction_id=reference,
                defaults={
                    'payment_method': 'PAYSTACK',
                    'amount': order.total_amount,
                    'status': 'S',
                    'response_data': response['data']
                }
            )
            return {'status': 'success', 'order_id': order.id}, 200
        except Order.DoesNotExist:
            return {'error': 'Order not found'}, 404
            
    # Handle failed or abandoned transaction
    try:
        order = Order.objects.get(transaction_id=reference)
        Transaction.objects.update_or_create(
            order=order,
            transaction_id=reference,
            defaults={
                'payment_method': 'PAYSTACK',
                'amount': order.total_amount,
                'status': 'F',
                'response_data': response.get('data', response)
            }
        )
    except Order.DoesNotExist:
        pass
        
    return {'status': 'failed', 'message': response.get('message')}, 400

def process_webhook(body, headers):
    import hmac
    import hashlib
    from ..models import Order, Transaction
    
    paystack_signature = headers.get('x-paystack-signature')
    if not paystack_signature:
        return {'error': 'Missing signature'}, 400
        
    # Using hardcoded test key as defined above
    secret_key = "sk_test_6b6118d3feafe92c6ec2f2ff16a8b119eca38564"
    hash_digest = hmac.new(secret_key.encode('utf-8'), body, hashlib.sha512).hexdigest()
    
    if hash_digest != paystack_signature:
        return {'error': 'Invalid signature'}, 400
        
    import json
    try:
        event_data = json.loads(body)
    except json.JSONDecodeError:
        return {'error': 'Invalid JSON'}, 400
        
    if event_data.get('event') == 'charge.success':
        data = event_data.get('data', {})
        reference = data.get('reference')
        
        try:
            order = Order.objects.get(transaction_id=reference)
            if order.status != 'A':
                order.status = 'A'
                order.save()
                
                Transaction.objects.update_or_create(
                    order=order,
                    transaction_id=reference,
                    defaults={
                        'payment_method': 'PAYSTACK',
                        'amount': order.total_amount,
                        'status': 'S',
                        'response_data': data
                    }
                )
        except Order.DoesNotExist:
            pass
            
    elif event_data.get('event') in ['charge.failed', 'transfer.failed']:
        data = event_data.get('data', {})
        reference = data.get('reference')
        
        try:
            order = Order.objects.get(transaction_id=reference)
            Transaction.objects.update_or_create(
                order=order,
                transaction_id=reference,
                defaults={
                    'payment_method': 'PAYSTACK',
                    'amount': order.total_amount,
                    'status': 'F',
                    'response_data': data
                }
            )
        except Order.DoesNotExist:
            pass
            
    return {'status': 'success'}, 200
