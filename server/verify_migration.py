from catalog.models import Product, FilterGroup
import sys

def verify():
    print("Verifying migration results...")
    
    # 1. Check FilterGroup
    pg_exists = FilterGroup.objects.filter(name__iexact='Product Format').exists()
    if pg_exists:
        print("❌ ERROR: 'Product Format' filter group still exists!")
    else:
        print("✅ SUCCESS: 'Product Format' filter group deleted.")

    # 2. Check is_set products
    set_count = Product.objects.filter(is_set=True).count()
    print(f"INFO: Products with is_set=True: {set_count}")
    if set_count > 0:
        print("✅ SUCCESS: Found products with is_set=True.")
    else:
        print("❌ WARNING: No products found with is_set=True. (Was this expected?)")

    # 3. Check descriptions and details
    total_products = Product.objects.count()
    empty_desc_count = Product.objects.filter(description='').count()
    has_details_count = Product.objects.exclude(details='').exclude(details__isnull=True).count()
    
    print(f"INFO: Total products: {total_products}")
    print(f"INFO: Products with empty description: {empty_desc_count}")
    print(f"INFO: Products with non-empty details: {has_details_count}")

    if empty_desc_count > 0 and has_details_count > 0:
        print("✅ SUCCESS: Descriptions were moved to details.")
    else:
        print("❌ ERROR: Descriptions or details counts look wrong.")

    # Show one example
    example = Product.objects.exclude(details='').first()
    if example:
        print(f"\nExample Product: {example.name}")
        print(f"Description (should be empty): '{example.description}'")
        print(f"Details (first 50 chars): '{example.details[:50]}...'")
        print(f"Is Set: {example.is_set}")

if __name__ == "__main__":
    import django
    import os
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'server.settings')
    django.setup()
    verify()
