import csv
import os
import requests
import time
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.utils.text import slugify
from django.core.files.base import ContentFile
from catalog.models import FilterGroup, FilterOption, Product, ProductImage, ProductVariant

class Command(BaseCommand):
    help = 'Wipes existing products and imports from CSV'

    def add_arguments(self, parser):
        parser.add_argument('--limit', type=int, help='Limit number of products to import', default=None)

    def handle(self, *args, **options):
        # 1. Cleanup
        self.stdout.write(self.style.WARNING('🔥 Deleting existing products, images, and variants...'))
        ProductVariant.objects.all().delete()
        ProductImage.objects.all().delete()
        Product.objects.all().delete()

        csv_path = '/home/luka/Desktop/clearcast/server/products_export_1 .csv'
        if not os.path.exists(csv_path):
            self.stdout.write(self.style.ERROR(f'CSV file not found: {csv_path}'))
            return

        # 2. Setup Filter Groups
        self.stdout.write('Preparing Filter Groups...')
        groups = {
            'fly_type': FilterGroup.objects.get_or_create(name='Fly Type', defaults={'slug': 'fly-type'})[0],
            'season': FilterGroup.objects.get_or_create(name='Season', defaults={'slug': 'season'})[0],
            'species': FilterGroup.objects.get_or_create(name='Species', defaults={'slug': 'species'})[0],
        }

        # 3. Read CSV
        products_dict = {}
        with open(csv_path, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                handle = row['Handle']
                if not handle:
                    continue
                
                if handle not in products_dict:
                    products_dict[handle] = {
                        'title': row['Title'],
                        'description': '', # Now descriptions are empty by default
                        'details': row['Body (HTML)'], # Rich text content goes to details
                        'price': row['Variant Price'],
                        'sku': row['Variant SKU'],
                        'fly_type': row.get('Fly Type (product.metafields.custom.fly_type)'),
                        'product_format': row.get('Product Format (product.metafields.custom.product_format)'),
                        'season': row.get('Season (product.metafields.custom.season)'),
                        'species': row.get('Spicies (product.metafields.custom.spicies)'),
                        'images': []
                    }
                
                img_src = row['Image Src']
                if img_src and img_src not in products_dict[handle]['images']:
                    products_dict[handle]['images'].append(img_src)

        # 4. Import Products
        limit = options['limit']
        count = 0
        
        self.stdout.write(self.style.SUCCESS(f'🚀 Starting import of {len(products_dict)} products...'))
        
        for handle, data in products_dict.items():
            if limit and count >= limit:
                break
            
            try:
                # Check if it's a "Set" based on product_format string
                is_set_val = False
                if data['product_format'] and 'set' in data['product_format'].lower():
                    is_set_val = True

                product = Product.objects.create(
                    name=data['title'],
                    slug=handle,
                    description=data['description'],
                    details=data['details'],
                    base_price=Decimal(data['price']) if data['price'] else Decimal('0.00'),
                    sku=data['sku'] or f"SKU-{slugify(handle).upper()}",
                    stock_quantity=100, # Default stock
                    is_set=is_set_val,
                    is_active=True
                )

                # Set Filters
                filter_options = []
                
                # Helper for multi-value filters
                def add_opts(group_key, value_str):
                    if not value_str: return
                    vals = [v.strip() for v in value_str.replace('\n', ',').split(',') if v.strip()]
                    group = groups[group_key]
                    for v in vals:
                        opt, _ = FilterOption.objects.get_or_create(
                            group=group, 
                            name=v, 
                            defaults={'slug': slugify(v)}
                        )
                        filter_options.append(opt)

                add_opts('fly_type', data['fly_type'])
                add_opts('season', data['season'])
                add_opts('species', data['species'])
                
                product.filters.set(filter_options)

                # Download and save images
                for i, img_url in enumerate(data['images']):
                    try:
                        self.stdout.write(f'  Downloading image: {img_url}')
                        response = requests.get(img_url, timeout=10)
                        if response.status_code == 200:
                            # Extract filename from URL
                            filename = os.path.basename(img_url.split('?')[0])
                            if not filename:
                                filename = f"{handle}_{i}.jpg"
                            
                            img_file = ContentFile(response.content, name=filename)
                            ProductImage.objects.create(
                                product=product,
                                image=img_file,
                                is_feature=(i == 0)
                            )
                        else:
                            self.stdout.write(self.style.WARNING(f'  Failed to download image: {img_url} (Status: {response.status_code})'))
                    except Exception as e:
                        self.stdout.write(self.style.ERROR(f'  Error downloading image {img_url}: {e}'))

                # Create Variants (Sizes: 10, 12, 13, 14, 16, 18)
                sizes = ['10', '12', '13', '14', '16', '18']
                for size in sizes:
                    ProductVariant.objects.create(
                        product=product,
                        size=size,
                        stock_quantity=50
                    )

                count += 1
                self.stdout.write(self.style.SUCCESS(f'✅ Imported ({count}/{len(products_dict)}): {product.name}'))

            except Exception as e:
                self.stdout.write(self.style.ERROR(f'❌ Failed to import product {handle}: {e}'))

        self.stdout.write(self.style.SUCCESS(f'\n🎉 Import complete! Total products imported: {count}'))
