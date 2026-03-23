import requests
import base64
from datetime import datetime
from django.conf import settings
from ..models import PaymentGateway

def get_mpesa_config():
    """Retrieve M-Pesa configuration from the database."""
    try:
        gateway = PaymentGateway.objects.get(name__iexact="mpesa", is_active=True)
        return gateway.config
    except PaymentGateway.DoesNotExist:
        # Fallback to verified sandbox credentials
        return {
            "consumer_key": "AYbVQZbEGbPOhmRbnRsOhsTl30Y8xYM3TVuJQuh6E3AaJrE1", 
            "consumer_secret": "D5qB6Lx6xUFtKmzzFl0DA8wUxX4x24AdGLZWOlG0lDoIX7hrxbgD0PRWSGU0Xuxe", 
            "business_short_code": "174379",
            "passkey": "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919"
        }

def get_access_token():
    config = get_mpesa_config()
    consumer_key = config.get("consumer_key", "AYbVQZbEGbPOhmRbnRsOhsTl30Y8xYM3TVuJQuh6E3AaJrE1")
    consumer_secret = config.get("consumer_secret", "D5qB6Lx6xUFtKmzzFl0DA8wUxX4x24AdGLZWOlG0lDoIX7hrxbgD0PRWSGU0Xuxe")
    
    # Use sandbox URL for testing
    api_url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
    
    try:
        response = requests.get(api_url, auth=(consumer_key, consumer_secret))
        if response.status_code == 200:
            return response.json().get("access_token")
        else:
            print(f"M-Pesa Auth Error: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"M-Pesa Auth Exception: {e}")
    return None

def stk_push(phone_number, amount, reference, description, callback_url):
    access_token = get_access_token()
    if not access_token:
        return {"status": False, "message": "M-Pesa access token failed"}

    config = get_mpesa_config()
    business_short_code = config.get("business_short_code", "174379")
    passkey = config.get("passkey", "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919")
    
    # Generate timestamp in Safaricom format: YYYYMMDDHHmmss
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    password_str = f"{business_short_code}{passkey}{timestamp}"
    password = base64.b64encode(password_str.encode()).decode()

    # Use sandbox URL for testing
    api_url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    # Normalize phone number to 254XXXXXXXXX
    if phone_number.startswith('0'):
        phone_number = '254' + phone_number[1:]
    elif phone_number.startswith('+'):
        phone_number = phone_number[1:]
    
    data = {
        "BusinessShortCode": business_short_code,
        "Password": password,
        "Timestamp": timestamp,
        "TransactionType": "CustomerPayBillOnline",
        "Amount": str(int(float(amount))), # Safaricom often expects string or integer
        "PartyA": phone_number,
        "PartyB": business_short_code,
        "PhoneNumber": phone_number,
        "CallBackURL": callback_url,
        "AccountReference": reference if reference else "Test",
        "TransactionDesc": description if description else "Test"
    }

    try:
        response = requests.post(api_url, json=data, headers=headers)
        return response.json()
    except Exception as e:
        return {"ResponseCode": "1", "CustomerMessage": f"Connection error: {str(e)}"}

def process_callback(data):
    from ..models import Order, Transaction
    callback_data = data.get('Body', {}).get('stkCallback', {})
    result_code = callback_data.get('ResultCode')
    checkout_request_id = callback_data.get('CheckoutRequestID')
    
    try:
        order = Order.objects.get(transaction_id=checkout_request_id)
        if result_code == 0:
            order.status = 'A' # Paid
            order.save()
            
            Transaction.objects.update_or_create(
                order=order,
                transaction_id=checkout_request_id,
                defaults={
                    'payment_method': 'MPESA',
                    'amount': order.total_amount,
                    'status': 'S',
                    'response_data': callback_data
                }
            )
        else:
            order.status = 'C' # Cancelled/Failed
            order.save()
            
            Transaction.objects.update_or_create(
                order=order,
                transaction_id=checkout_request_id,
                defaults={
                    'payment_method': 'MPESA',
                    'amount': order.total_amount,
                    'status': 'F',
                    'response_data': callback_data
                }
            )
    except Order.DoesNotExist:
        pass
        
    return {"ResultCode": 0, "ResultDesc": "Accepted"}, 200
