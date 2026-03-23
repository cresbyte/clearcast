from rest_framework import serializers
from django.utils import timezone
from django.conf import settings
from catalog.models import Product, ProductVariant
from catalog.serializers import ProductSerializer, ProductVariantSerializer
from .models import Cart, CartItem, Coupon, Order, OrderItem, Transaction, PaymentGateway
from base.models import Address
import uuid
import random

class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), source='product', write_only=True
    )
    variant = ProductVariantSerializer(read_only=True)
    variant_id = serializers.PrimaryKeyRelatedField(
        queryset=ProductVariant.objects.all(), source='variant', write_only=True, required=False, allow_null=True
    )

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_id', 'variant', 'variant_id', 'quantity']

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ['id', 'items', 'total_price', 'created_at', 'updated_at']

    def get_total_price(self, obj):
        total = 0
        for item in obj.items.all():
            price = item.variant.current_price if item.variant else (item.product.sale_price or item.product.base_price)
            total += price * item.quantity
        return total

class PaymentGatewaySerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentGateway
        fields = ['id', 'name', 'is_active', 'config', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class PaymentGatewayPublicSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentGateway
        fields = ['id', 'name']

class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = [
            'id', 'code', 'discount_type', 'value', 'valid_from', 'valid_to', 
            'active', 'usage_limit', 'used_count', 'min_order_amount', 'allowed_users'
        ]


# ===================== ORDER SERIALIZERS =====================

class OrderItemSerializer(serializers.ModelSerializer):
    """Serializer for order items with product details"""
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_image = serializers.SerializerMethodField()
    variant_name = serializers.CharField(source='variant.name', read_only=True, allow_null=True)
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'product_image', 'variant', 'variant_name', 'price', 'quantity']
        read_only_fields = ['id', 'price']
    
    def get_product_image(self, obj):
        """Get the feature image of the product"""
        feature_image = obj.product.images.filter(is_feature=True).first()
        if feature_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(feature_image.image.url)
            return feature_image.image.url
        # Fallback to first image
        first_image = obj.product.images.first()
        if first_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(first_image.image.url)
            return first_image.image.url
        return None


class TransactionSerializer(serializers.ModelSerializer):
    """Serializer for payment transactions"""
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Transaction
        fields = ['id', 'transaction_id', 'payment_method', 'amount', 'status', 'status_display', 'response_data', 'created_at']
        read_only_fields = ['id', 'transaction_id', 'created_at']


class OrderSerializer(serializers.ModelSerializer):
    """Serializer for orders with nested items and transactions"""
    items = OrderItemSerializer(many=True, read_only=True)
    transactions = TransactionSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    coupon_code = serializers.CharField(source='coupon.code', read_only=True, allow_null=True)
    subtotal = serializers.SerializerMethodField()
    discount_amount = serializers.SerializerMethodField()
    
    # Dynamically attached payment properties for frontend
    payment_url = serializers.CharField(read_only=True, required=False)
    is_redirect = serializers.BooleanField(read_only=True, required=False)
    is_stk = serializers.BooleanField(read_only=True, required=False)
    is_paystack_inline = serializers.BooleanField(read_only=True, required=False)
    paystack_access_code = serializers.CharField(read_only=True, required=False)
    paystack_public_key = serializers.CharField(read_only=True, required=False)
    paystack_reference = serializers.CharField(read_only=True, required=False)
    
    class Meta:
        model = Order
        fields = [
            'id', 'full_name', 'email', 'shipping_address', 
            'coupon', 'coupon_code', 'subtotal', 'discount_amount', 'total_amount', 
            'status', 'status_display',
            'transaction_id', 'items', 'transactions',
            'payment_url', 'is_redirect', 'is_stk', 'is_paystack_inline',
            'paystack_access_code', 'paystack_public_key', 'paystack_reference',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'transaction_id', 'created_at', 'updated_at']

    def get_subtotal(self, obj):
        return sum(item.price * item.quantity for item in obj.items.all())

    def get_discount_amount(self, obj):
        subtotal = self.get_subtotal(obj)
        return max(subtotal - obj.total_amount, 0)


class OrderItemCreateSerializer(serializers.Serializer):
    """Serializer for creating order items"""
    product_id = serializers.IntegerField()
    variant_id = serializers.IntegerField(required=False, allow_null=True)
    quantity = serializers.IntegerField(min_value=1)


class OrderCreateSerializer(serializers.Serializer):
    """Serializer for creating a new order with payment simulation"""
    address_id = serializers.IntegerField()
    payment_method = serializers.CharField(max_length=50) # Allow arbitrary casing, handled in validate()
    items = OrderItemCreateSerializer(many=True)
    
    # M-Pesa fields (optional)
    phone_number = serializers.CharField(required=False, allow_blank=True)
    
    # Coupon field
    coupon_code = serializers.CharField(required=False, allow_blank=True, write_only=True)
    
    def validate_address_id(self, value):
        """Validate that the address exists and belongs to the user"""
        user = self.context['request'].user
        try:
            address = Address.objects.get(id=value, user=user)
        except Address.DoesNotExist:
            raise serializers.ValidationError("Address not found")
        return value
    
    def validate_items(self, value):
        """Validate items have sufficient stock"""
        if not value:
            raise serializers.ValidationError("At least one item is required")
        
        for item in value:
            product_id = item['product_id']
            variant_id = item.get('variant_id')
            quantity = item['quantity']
            
            try:
                product = Product.objects.get(id=product_id)
            except Product.DoesNotExist:
                raise serializers.ValidationError(f"Product {product_id} not found")
            
            if variant_id:
                try:
                    variant = ProductVariant.objects.get(id=variant_id, product=product)
                    if variant.stock_quantity < quantity:
                        raise serializers.ValidationError(
                            f"Insufficient stock for {product.name} - {variant.name}. Available: {variant.stock_quantity}"
                        )
                except ProductVariant.DoesNotExist:
                    raise serializers.ValidationError(f"Variant {variant_id} not found for product {product.name}")
            else:
                if product.stock_quantity < quantity:
                    raise serializers.ValidationError(
                        f"Insufficient stock for {product.name}. Available: {product.stock_quantity}"
                    )
        
        return value
    
    def _calculate_total(self, items_data):
        total_amount = 0
        order_items_to_create = []
        
        for item_data in items_data:
            product = Product.objects.get(id=item_data['product_id'])
            variant = None
            if item_data.get('variant_id'):
                variant = ProductVariant.objects.get(id=item_data['variant_id'])
            
            # Capture price at time of purchase
            if variant:
                price = variant.current_price
            else:
                price = product.sale_price or product.base_price
            
            quantity = item_data['quantity']
            total_amount += price * quantity
            
            order_items_to_create.append({
                'product': product,
                'variant': variant,
                'price': price,
                'quantity': quantity
            })
        return total_amount, order_items_to_create

    def validate(self, data):
        """Validate payment method and coupon"""
        payment_method = data.get('payment_method', '').lower().replace('-', '')
        
        valid_gateways = ['paystack', 'mpesa', 'paypal', 'stripe']
        if payment_method not in valid_gateways:
            raise serializers.ValidationError({'payment_method': f'"{data.get("payment_method")}" is not a valid choice.'})
            
        # Reassign normalized payment method for use in create()
        data['payment_method'] = payment_method
        
        if payment_method == 'mpesa':
            if not data.get('phone_number'):
                raise serializers.ValidationError({'phone_number': 'Phone number is required for M-Pesa payment'})
        
        # Calculate total and validate coupon
        items_data = data.get('items')
        total_amount, order_items = self._calculate_total(items_data)
        
        coupon_code = data.get('coupon_code')
        coupon = None
        discount_amount = 0
        
        if coupon_code:
            user = self.context['request'].user
            try:
                coupon = Coupon.objects.get(code=coupon_code)
                now = timezone.now()
                
                # Basic Validation
                if not coupon.active:
                    raise serializers.ValidationError({"coupon_code": "This coupon is not active."})
                if now < coupon.valid_from or now > coupon.valid_to:
                    raise serializers.ValidationError({"coupon_code": "This coupon has expired or is not yet valid."})
                if coupon.usage_limit > 0 and coupon.used_count >= coupon.usage_limit:
                    raise serializers.ValidationError({"coupon_code": "This coupon has reached its usage limit."})
                if total_amount < coupon.min_order_amount:
                    raise serializers.ValidationError({"coupon_code": f"Minimum order amount of {coupon.min_order_amount} required."})
                
                # Check allowed users
                if coupon.allowed_users.exists() and user not in coupon.allowed_users.all():
                    raise serializers.ValidationError({"coupon_code": "This coupon is not valid for your account."})
                
                # Check prior usage by this user
                if Order.objects.filter(user=user, coupon=coupon).exclude(status='C').exists():
                    raise serializers.ValidationError({"coupon_code": "You have already used this coupon."})

                # Calculate discount
                if coupon.discount_type == 'P':  # Percentage
                    discount_amount = (total_amount * coupon.value) / 100
                else:  # Fixed Amount
                    discount_amount = coupon.value
                
                # Ensure we don't discount more than total
                if discount_amount > total_amount:
                    discount_amount = total_amount
                    
            except Coupon.DoesNotExist:
                raise serializers.ValidationError({"coupon_code": "Invalid coupon code."})
        
        # Inject calculated values into data for use in create()
        data['order_params'] = {
            'total_amount': total_amount,
            'order_items': order_items,
            'coupon': coupon,
            'discount_amount': discount_amount
        }
        
        return data
    
        return {
            'transaction_id': transaction_id,
            'is_success': is_success,
            'response_data': response_data
        }
    
    def _process_payment(self, payment_method, amount, data, order_id=None):
        """Process real payment via configured gateways"""
        from .payments import paystack_checkout, mpesa_checkout
        user = self.context['request'].user
        reference = f"ORD-{order_id}-{uuid.uuid4().hex[:6].upper()}" if order_id else f"PRE-{uuid.uuid4().hex[:8].upper()}"
        
        try:
            gateway = PaymentGateway.objects.get(name__iexact=payment_method, is_active=True)
        except PaymentGateway.DoesNotExist:
            return {'is_success': False, 'message': f'{payment_method.capitalize()} payment gateway is not configured or active.'}

        if payment_method.lower() == 'paystack':
            # Paystack initialization for inline JS
            config = paystack_checkout.get_paystack_config()
            public_key = config.get("public_key", "")
            
            callback_url = f"{settings.FRONTEND_URL}/profile/orders/{order_id}"
            response = paystack_checkout.initialize_transaction(user.email, amount, reference, callback_url)
            if response.get('status'):
                return {
                    'transaction_id': reference,
                    'is_success': True,
                    'is_paystack_inline': True,
                    'access_code': response['data']['access_code'],
                    'public_key': public_key,
                    'reference': response['data']['reference'],
                    'response_data': response['data']
                }
            return {'is_success': False, 'message': response.get('message', 'Paystack initialization failed')}

        elif payment_method.lower() == 'mpesa':
            # M-Pesa STK Push
            phone = data.get('phone_number')
            # Normalize phone to 254...
            if phone.startswith('0'): phone = '254' + phone[1:]
            elif phone.startswith('+'): phone = phone[1:]
            
            callback_url = "https://4384-2a09-bac5-d4f4-1c3-00-2d-96.ngrok-free.app/api/orders/gateways/mpesa-callback/"
            response = mpesa_checkout.stk_push(phone, amount, reference, f"Order {order_id}", callback_url)
            
            if response.get('ResponseCode') == '0':
                return {
                    'transaction_id': response.get('CheckoutRequestID', reference),
                    'is_success': True,
                    'is_stk': True,
                    'message': 'STK Push sent successfully',
                    'response_data': response
                }
            return {'is_success': False, 'message': response.get('CustomerMessage', 'M-Pesa STK Push failed')}

        return self._simulate_payment(payment_method, amount, data)
    
    def create(self, validated_data):
        """Create order with items and process payment"""
        user = self.context['request'].user
        address_id = validated_data['address_id']
        payment_method = validated_data['payment_method']
        
        order_params = validated_data.get('order_params', {})
        total_amount = order_params.get('total_amount', 0)
        order_items_to_create = order_params.get('order_items', [])
        coupon = order_params.get('coupon')
        discount_amount = order_params.get('discount_amount', 0)
        
        # Only recalculate if not present (shouldn't happen if validated)
        if not order_items_to_create:
            # Fallback if created directly ? But validate is always called via save()
            pass 

        # Apply discount final calculation
        final_amount = total_amount - discount_amount
        
        # Get address and build shipping address string
        address = Address.objects.get(id=address_id, user=user)
        full_name = " ".join([n for n in [address.first_name, address.last_name] if n]).strip()
        
        shipping_address = f"{full_name}\n"
        shipping_address += f"{address.street_line1}\n"
        if address.street_line2:
            shipping_address += f"{address.street_line2}\n"
        shipping_address += f"{address.city}, {address.state_province} {address.postal_code}\n"
        shipping_address += address.country
        
        # Initially create order as Pending ('P') if using asynchronous payments
        # But here we currently have 'A' for Paid in simulation.
        # For Paystack/Mpesa, we create as Pending and update via callback/verify
        
        # For now, let's keep it simple: create order, then process payment
        order = Order.objects.create(
            user=user,
            full_name=full_name,
            email=user.email,
            shipping_address=shipping_address,
            total_amount=final_amount,
            coupon=coupon,
            status='P', # Pending
            transaction_id=''
        )

        # Process real payment
        payment_result = self._process_payment(payment_method, final_amount, validated_data, order.id)
        
        if not payment_result['is_success']:
            order.delete() # Cleanup if payment initialization fails
            raise serializers.ValidationError({
                'payment': payment_result.get('message', 'Payment initialization failed')
            })
        
        order.transaction_id = payment_result['transaction_id']
        
        # If simulation return success, mark as Paid
        if not payment_result.get('is_redirect') and not payment_result.get('is_paystack_inline') and not payment_result.get('is_stk') and payment_result.get('is_success'):
            order.status = 'A'
        
        order.save()
        
        # Increment coupon usage
        if coupon:
            coupon.used_count += 1
            coupon.save()
        
        # Create order items and reduce stock
        for item_info in order_items_to_create:
            OrderItem.objects.create(
                order=order,
                product=item_info['product'],
                variant=item_info['variant'],
                price=item_info['price'],
                quantity=item_info['quantity']
            )
            
            # Reduce stock
            if item_info['variant']:
                item_info['variant'].stock_quantity -= item_info['quantity']
                item_info['variant'].save()
            else:
                item_info['product'].stock_quantity -= item_info['quantity']
                item_info['product'].save()
        
        # Create transaction record
        tx_status = 'S'
        if payment_result.get('is_redirect') or payment_result.get('is_paystack_inline') or payment_result.get('is_stk'):
            tx_status = 'P'
            
        Transaction.objects.create(
            order=order,
            transaction_id=payment_result['transaction_id'],
            payment_method=payment_method.upper(),
            amount=final_amount,
            status=tx_status,
            response_data=payment_result['response_data']
        )
        
        # Clear user's cart
        Cart.objects.filter(user=user).delete()
        
        # Add payment metadata to the order object for the view to return
        order.payment_url = payment_result.get('payment_url')
        order.is_redirect = payment_result.get('is_redirect', False)
        order.is_stk = payment_result.get('is_stk', False)
        order.is_paystack_inline = payment_result.get('is_paystack_inline', False)
        order.paystack_access_code = payment_result.get('access_code')
        order.paystack_public_key = payment_result.get('public_key')
        order.paystack_reference = payment_result.get('reference')

        return order
