
import os
import django
from django.test.client import RequestFactory
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'server.settings')
django.setup()

from catalog.views import ProductViewSet
from rest_framework import status

def verify_shop_api():
    factory = RequestFactory()
    
    # 1. Test Product List (Shop Page)
    print("Testing Shop Product List API...")
    request = factory.get('/api/catalog/products/?page=1&ordering=-created_at')
    view = ProductViewSet.as_view({'get': 'list'})
    response = view(request)
    
    if response.status_code == 200:
        data = response.data
        if 'results' in data and 'count' in data:
            print(f"✅ Product List API works. Count: {data['count']}")
            if len(data['results']) > 0:
                print(f"✅ Sample Product: {data['results'][0]['name']}")
                print(f"✅ Image URL: {data['results'][0]['images'][0]['image_url'] if data['results'][0]['images'] else 'No Image'}")
            else:
                print("⚠️ No products found. Did you seed?")
        else:
             print("❌ API did not return paginated results")
    else:
        print(f"❌ API failed with status {response.status_code}")

    # 2. Test Search
    print("\nTesting Search API...")
    request = factory.get('/api/catalog/products/?search=Phone')
    response = view(request)
    if response.status_code == 200:
        print(f"✅ Search API works. Count: {response.data['count']}")
    else:
         print(f"❌ Search API failed")

if __name__ == "__main__":
    verify_shop_api()
