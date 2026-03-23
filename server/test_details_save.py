import os
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "server.settings")
django.setup()

from catalog.models import Product
from catalog.serializers import ProductWriteSerializer

p = Product.objects.first()
print(f"Before: {p.details}")
serializer = ProductWriteSerializer(p, data={'name': p.name, 'description': p.description, 'details': '<h2>Test details HTML</h2>', 'base_price': p.base_price, 'sku': p.sku, 'category_id': p.category_id}, partial=True)
if serializer.is_valid():
    p = serializer.save()
    print(f"After: {p.details}")
else:
    print(serializer.errors)

