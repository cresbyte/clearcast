
import os
import django
from django.conf import settings
from django.test.client import RequestFactory

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'server.settings')
django.setup()

from catalog.models import Product, ProductImage, Category
from catalog.serializers import ProductSerializer

def verify_product_serializer():
    # Ensure we have a category
    category, _ = Category.objects.get_or_create(name="Test Category", slug="test-category")
    
    # Create a product with discount
    product, created = Product.objects.get_or_create(
        name="Test Product",
        defaults={
            'slug': 'test-product',
            'description': 'Test Description',
            'base_price': 100.00,
            'discount_percentage': 20.00, # 20% discount
            'category': category
        }
    )
    if not created:
        product.discount_percentage = 20.00
        product.save()

    # Create an image if not exists
    # We can't easily create a real image file here without more boilerplate, 
    # but we can mock the image field content or create a dummy object
    # For the purpose of serializer URL generation, we just need the field to have a value.
    if not product.images.exists():
        ProductImage.objects.create(product=product, image="products/test.jpg")
    
    # Create a request context
    factory = RequestFactory()
    request = factory.get('/')
    request.build_absolute_uri = lambda url: f"http://testserver{url}"

    # Serialize
    serializer = ProductSerializer(product, context={'request': request})
    data = serializer.data

    print(f"Product: {data['name']}")
    print(f"Base Price: {data['base_price']}")
    print(f"Discount: {data['discount_percentage']}%")
    print(f"Sale Price: {data['sale_price']}")
    
    # Check Verification 1: Discount Calculation
    expected_sale_price = 80.00 # 100 - 20%
    if float(data['sale_price']) == expected_sale_price:
        print("✅ Discount calculation correct in Serializer (via Model save)")
    else:
        print(f"❌ Discount calculation incorrect: Got {data['sale_price']}, expected {expected_sale_price}")

    # Check Verification 2: Absolute Image URL
    if data['images']:
        image_url = data['images'][0]['image_url']
        print(f"Image URL: {image_url}")
        if image_url.startswith("http://testserver"):
             print("✅ Image URL is absolute")
        else:
             print("❌ Image URL is NOT absolute")
    else:
        print("⚠️ No images found on product to test URL")

if __name__ == "__main__":
    verify_product_serializer()
