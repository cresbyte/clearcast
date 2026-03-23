from catalog.models import Product
from rest_framework.test import APIRequestFactory
from catalog.views import ProductViewSet
import json

factory = APIRequestFactory()
request = factory.get('/api/catalog/products/')
view = ProductViewSet.as_view({'get': 'list'})
response = view(request)
response.render()

print(f"Status: {response.status_code}")
data = response.data
print(f"Top level keys: {list(data.keys()) if isinstance(data, dict) else 'Not a dict'}")
if isinstance(data, dict):
    print(f"Count: {data.get('count')}")
    print(f"Results length: {len(data.get('results', []))}")
else:
    print(f"Data length: {len(data)}")
