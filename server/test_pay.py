import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from orders.models import PaymentGateway
from base.models import Address
from catalog.models import Product

User = get_user_model()
user = User.objects.first()

if not user:
    print("No user found")
    exit()

address = Address.objects.filter(user=user).first()
if not address:
    print("No address found")
    exit()

product = Product.objects.first()

if not product:
    print("No product found")
    exit()

print(f"Using User: {user.email}, Address: {address.id}, Product: {product.id}")

from rest_framework.test import APIRequestFactory
from orders.views import OrderViewSet
from orders.serializers import OrderCreateSerializer

factory = APIRequestFactory()

# Mock request
request = factory.post('/api/orders/')
request.user = user

data = {
    'address_id': address.id,
    'payment_method': 'paystack',
    'items': [{'product_id': product.id, 'quantity': 1}]
}

serializer = OrderCreateSerializer(data=data, context={'request': request})
if serializer.is_valid():
    try:
        order = serializer.save()
        print(f"Order created successfully: {order.id}, Status: {order.status}")
        print(f"Paystack Access Code: {getattr(order, 'paystack_access_code', 'MISSING')}")
        print(f"Paystack Public Key: {getattr(order, 'paystack_public_key', 'MISSING')}")
        print(f"Is Paystack Inline: {getattr(order, 'is_paystack_inline', 'MISSING')}")
    except Exception as e:
        print(f"Error saving: {e}")
else:
    print(f"Serializer errors: {serializer.errors}")

