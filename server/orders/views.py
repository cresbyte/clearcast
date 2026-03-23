from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Cart, CartItem, Order, Coupon, PaymentGateway
from .serializers import (
    CartSerializer, CartItemSerializer, 
    OrderSerializer, OrderCreateSerializer, CouponSerializer,
    PaymentGatewaySerializer, PaymentGatewayPublicSerializer
)
from catalog.models import Product, ProductVariant
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.utils import timezone



class CouponViewSet(viewsets.ModelViewSet):
    serializer_class = CouponSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Coupon.objects.all().order_by('id')
        
        # For regular users, show available coupons
        now = timezone.now()
        used_coupons_ids = Order.objects.filter(
            user=self.request.user
        ).exclude(status='C').values_list('coupon_id', flat=True)
        
        return Coupon.objects.filter(
            active=True,
            valid_to__gte=now
        ).filter(
            Q(allowed_users=self.request.user) | Q(allowed_users__isnull=True)
        ).exclude(
            id__in=used_coupons_ids
        ).distinct()

    @action(detail=False, methods=['post'])
    def validate(self, request):
        code = request.data.get('code')
        cart_total = request.data.get('amount')
        
        if not code:
            return Response({'error': 'Code is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            coupon = Coupon.objects.get(code=code)
        except Coupon.DoesNotExist:
            return Response({'error': 'Invalid coupon code'}, status=status.HTTP_404_NOT_FOUND)
            
        now = timezone.now()
        
        if not coupon.active:
            return Response({'error': 'Coupon is inactive'}, status=status.HTTP_400_BAD_REQUEST)
            
        if now < coupon.valid_from or now > coupon.valid_to:
            return Response({'error': 'Coupon has expired'}, status=status.HTTP_400_BAD_REQUEST)
            
        if coupon.usage_limit > 0 and coupon.used_count >= coupon.usage_limit:
            return Response({'error': 'Coupon usage limit reached'}, status=status.HTTP_400_BAD_REQUEST)
            
        if cart_total is not None:
            try:
                amount = float(cart_total)
                if amount < coupon.min_order_amount:
                    return Response({
                        'error': f'Minimum order amount of {coupon.min_order_amount} required'
                    }, status=status.HTTP_400_BAD_REQUEST)
            except ValueError:
                pass # Ignore invalid amount format
                
        # Check allowed users
        if coupon.allowed_users.exists() and request.user not in coupon.allowed_users.all():
            return Response({'error': 'This coupon is not valid for your account'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Check prior usage
        if Order.objects.filter(user=request.user, coupon=coupon).exclude(status='C').exists():
            return Response({'error': 'You have already used this coupon'}, status=status.HTTP_400_BAD_REQUEST)
            
        serializer = self.get_serializer(coupon)
        return Response({
            'valid': True, 
            'coupon': serializer.data,
            'message': 'Coupon applied successfully'
        })


class PaymentGatewayViewSet(viewsets.ModelViewSet):
    queryset = PaymentGateway.objects.all()
    
    def get_serializer_class(self):
        if self.request.user and self.request.user.is_staff:
            return PaymentGatewaySerializer
        return PaymentGatewayPublicSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'mpesa_callback', 'paystack_webhook']:
            return [permissions.AllowAny()]
        if self.action == 'paystack_verify':
            return [permissions.IsAuthenticated()]
        return [permissions.IsAdminUser()]

    def get_queryset(self):
        if self.request.user and self.request.user.is_staff:
            return PaymentGateway.objects.all()
        return PaymentGateway.objects.filter(is_active=True)

    @action(detail=False, methods=['post'], url_path='mpesa-callback', permission_classes=[permissions.AllowAny])
    def mpesa_callback(self, request):
        """Handle M-Pesa STK Push callbacks"""
        from .payments import mpesa_checkout
        response_data, status_code = mpesa_checkout.process_callback(request.data)
        return Response(response_data, status=status_code)

    @action(detail=False, methods=['get'], url_path='paystack-verify', permission_classes=[permissions.IsAuthenticated])
    def paystack_verify(self, request):
        """Verify Paystack transaction"""
        reference = request.query_params.get('reference')
        if not reference:
            return Response({'error': 'Reference is required'}, status=400)
            
        from .payments import paystack_checkout
        response_data, status_code = paystack_checkout.process_verification(reference)
        return Response(response_data, status=status_code)

    @action(detail=False, methods=['post'], url_path='paystack-webhook', permission_classes=[permissions.AllowAny])
    def paystack_webhook(self, request):
        """Handle Paystack Webhooks"""
        from .payments import paystack_checkout
        response_data, status_code = paystack_checkout.process_webhook(request.body, request.headers)
        return Response(response_data, status=status_code)


class OrderViewSet(viewsets.ModelViewSet):
    """ViewSet for managing orders"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return OrderCreateSerializer
        return OrderSerializer
    
    def get_queryset(self):
        if self.request.user.is_staff:
            queryset = Order.objects.all().order_by("-created_at")
            user_id = self.request.query_params.get("user_id")
            if user_id:
                queryset = queryset.filter(user_id=user_id)
            return queryset
        return Order.objects.filter(user=self.request.user).order_by("-created_at")
    
    def list(self, request, *args, **kwargs):
        """List all orders (for staff) or user's orders"""
        queryset = self.get_queryset()
        serializer = OrderSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)
    
    def retrieve(self, request, *args, **kwargs):
        """Get a single order with all details"""
        instance = self.get_object()
        serializer = OrderSerializer(instance, context={'request': request})
        return Response(serializer.data)
    
    def create(self, request, *args, **kwargs):
        """Create a new order with payment processing"""
        serializer = OrderCreateSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        
        # Send order confirmation email
        from .tasks import send_order_confirmation_email
        send_order_confirmation_email(order.id)

        # Return the created order with full details
        response_serializer = OrderSerializer(order, context={'request': request})
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='update-status')
    def update_status(self, request, pk=None):
        """Allow staff to update order status"""
        if not request.user.is_staff:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
            
        order = self.get_object()
        new_status = request.data.get('status')
        
        if not new_status:
            return Response({'error': 'Status is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        valid_statuses = [choice[0] for choice in Order.STATUS_CHOICES]
        if new_status not in valid_statuses:
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
            
        order.status = new_status
        order.save()
        
        # Send status update email
        from .tasks import send_order_status_update_email
        send_order_status_update_email(order.id)

        # If delivered, we could also send a rating request (or schedule it for later)
        # For now, let's just trigger it immediately for demonstration or if delivered
        if new_status == 'D':
            from .tasks import send_product_rating_request_email
            send_product_rating_request_email(order.id)

        serializer = OrderSerializer(order, context={'request': request})
        return Response(serializer.data)


class CartViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CartSerializer

    def get_queryset(self):
        return Cart.objects.filter(user=self.request.user)

    def list(self, request, *args, **kwargs):
        # Ensure user has a cart
        cart, created = Cart.objects.get_or_create(user=request.user)
        serializer = self.get_serializer(cart)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='add')
    def add_item(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        product_id = request.data.get('product_id')
        variant_id = request.data.get('variant_id')
        quantity = int(request.data.get('quantity', 1))

        if not product_id:
            return Response({'error': 'Product ID is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Check available stock
        if variant_id:
            target = get_object_or_404(ProductVariant, id=variant_id)
        else:
            target = get_object_or_404(Product, id=product_id)

        # Get existing cart item if any
        cart_item = CartItem.objects.filter(cart=cart, product_id=product_id, variant_id=variant_id).first()
        current_cart_qty = cart_item.quantity if cart_item else 0
        new_total_qty = current_cart_qty + quantity

        if new_total_qty > target.stock_quantity:
            return Response(
                {'error': f'Only {target.stock_quantity} items available in stock.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if cart_item:
            cart_item.quantity = new_total_qty
            cart_item.save()
        else:
            serializer = CartItemSerializer(data={
                'product_id': product_id,
                'variant_id': variant_id,
                'quantity': quantity
            })
            serializer.is_valid(raise_exception=True)
            serializer.save(cart=cart)

        return Response(self.get_serializer(cart).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'], url_path='update-quantity')
    def update_quantity(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        product_id = request.data.get('product_id')
        variant_id = request.data.get('variant_id')
        quantity = int(request.data.get('quantity'))

        if quantity is None:
            return Response({'error': 'Quantity is required'}, status=status.HTTP_400_BAD_REQUEST)

        cart_item = CartItem.objects.filter(cart=cart, product_id=product_id, variant_id=variant_id).first()

        if not cart_item:
            return Response({'error': 'Item not found in cart'}, status=status.HTTP_404_NOT_FOUND)

        if quantity <= 0:
            cart_item.delete()
        else:
            # Check available stock
            if variant_id:
                target = get_object_or_404(ProductVariant, id=variant_id)
            else:
                target = get_object_or_404(Product, id=product_id)

            if quantity > target.stock_quantity:
                return Response(
                    {'error': f'Only {target.stock_quantity} items available in stock.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            cart_item.quantity = quantity
            cart_item.save()

        return Response(self.get_serializer(cart).data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='remove')
    def remove_item(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        product_id = request.data.get('product_id')
        variant_id = request.data.get('variant_id')

        deleted_count, _ = CartItem.objects.filter(cart=cart, product_id=product_id, variant_id=variant_id).delete()

        if deleted_count:
            return Response(self.get_serializer(cart).data, status=status.HTTP_200_OK)
        return Response({'message': 'Item not found in cart'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['post'], url_path='clear')
    def clear_cart(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        cart.items.all().delete()
        return Response({'message': 'Cart cleared'}, status=status.HTTP_200_OK)

