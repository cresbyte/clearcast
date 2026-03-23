import json
import random
import requests
from pathlib import Path
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.utils.text import slugify
from django.core.files.base import ContentFile
from catalog.models import Category, Product, ProductImage, ProductVariant


class Command(BaseCommand):
    help = 'Seeds the database with 100 luxury products for presentation'

    def add_arguments(self, parser):
        parser.add_argument('--clear', action='store_true', help='Clear existing data first')

    def download_image(self, url, filename):
        """Download image from URL and return ContentFile"""
        headers = {
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
        }
        try:
            response = requests.get(url, timeout=15, headers=headers, allow_redirects=True)
            response.raise_for_status()
            content_type = response.headers.get('content-type', '')
            if 'image' not in content_type and len(response.content) < 1000:
                raise ValueError(f'Not an image: {content_type}')
            return ContentFile(response.content, name=filename)
        except Exception as e:
            self.stdout.write(self.style.WARNING(f'  ⚠ Image failed: {e}'))
            return None

    def create_categories(self):
        """Create the category hierarchy and return a flat dict of all categories"""
        hierarchy = {
            "Men's Grooming": {
                'desc': 'Premium grooming essentials for the modern gentleman.',
                'children': {
                    'Hair Care': 'Professional-grade hair styling and treatment products.',
                    'Body Care': 'Luxurious body wash, conditioners, and grooming essentials.',
                }
            },
            'Watches': {
                'desc': 'Exceptional timepieces from artisan watchmakers and luxury houses.',
                'children': {
                    'Artistic Watches': 'Unique, design-forward watches that are wearable works of art.',
                    'Luxury Watches': 'High-end timepieces from prestigious fashion houses.',
                }
            },
            'Fragrances': {
                'desc': 'Exquisite colognes and perfumes from the world\'s finest perfumers.',
                'children': {
                    "Men's Cologne": 'Sophisticated scents crafted from the rarest ingredients.',
                }
            },
            'Cashmere & Knitwear': {
                'desc': 'The finest cashmere and knitwear from heritage luxury brands.',
                'children': {
                    'Sweaters & Wraps': 'Sumptuous cashmere sweaters, wraps, and layering pieces.',
                    'Scarves & Accessories': 'Cashmere scarves, beanies, socks, and cold-weather accessories.',
                    'Home Textiles': 'Luxurious throws, blankets, and home comfort pieces.',
                }
            },
            'Designer Handbags': {
                'desc': 'Iconic handbags from the world\'s most coveted fashion houses.',
                'children': {
                    'Tote Bags': 'Spacious and elegant tote bags for everyday luxury.',
                    'Shoulder Bags': 'Classic shoulder bags with signature designer details.',
                    'Travel Bags': 'Premium leather bags for the discerning traveller.',
                }
            },
            'Fine Jewelry': {
                'desc': 'Handcrafted jewelry featuring precious metals and gemstones.',
                'children': {
                    'Rings': 'Statement rings featuring diamonds, gemstones, and precious metals.',
                    'Pendants & Necklaces': 'Elegant pendants and chains in gold and platinum.',
                    'Bracelets': 'Luxury bracelets from tennis to chain link styles.',
                    'Earrings & Cufflinks': 'Refined earrings and cufflinks for formal occasions.',
                }
            },
            'Lifestyle & Accessories': {
                'desc': 'Curated luxury accessories for the refined gentleman.',
                'children': {
                    'Shoes': 'Handcrafted luxury footwear in premium leathers and suedes.',
                    'Outerwear': 'Impeccably tailored jackets and coats.',
                    'Small Leather Goods': 'Wallets, card holders, and passport cases in fine leather.',
                    'Belts & Ties': 'Premium leather belts and silk ties.',
                    'Travel & Comfort': 'Luxury travel accessories and loungewear.',
                }
            },
        }

        cats = {}
        for parent_name, data in hierarchy.items():
            parent, _ = Category.objects.get_or_create(
                slug=slugify(parent_name),
                defaults={'name': parent_name, 'description': data['desc']}
            )
            cats[parent_name] = parent
            for child_name, child_desc in data['children'].items():
                child, _ = Category.objects.get_or_create(
                    slug=slugify(child_name),
                    defaults={'name': child_name, 'description': child_desc, 'parent': parent}
                )
                cats[child_name] = child
        
        self.stdout.write(self.style.SUCCESS(f'✓ Created {len(cats)} categories'))
        return cats

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write('Clearing existing catalog data...')
            ProductImage.objects.all().delete()
            ProductVariant.objects.all().delete()
            Product.objects.all().delete()
            Category.objects.all().delete()
            self.stdout.write(self.style.WARNING('Cleared all catalog data.'))

        # 1. Create categories
        cats = self.create_categories()

        # 2. Load product data from JSON
        data_path = Path(__file__).parent / 'luxury_products_data.json'
        with open(data_path, 'r') as f:
            products_data = json.load(f)

        # 3. Seed products
        created_count = 0
        skipped_count = 0

        for i, p in enumerate(products_data, 1):
            sku = p['sku']
            if Product.objects.filter(sku=sku).exists():
                skipped_count += 1
                continue

            category = cats.get(p['subcategory']) or cats.get(p['category'])
            if not category:
                self.stdout.write(self.style.WARNING(f'  ⚠ No category for: {p["name"]}'))
                continue

            product = Product.objects.create(
                name=p['name'],
                slug=slugify(p['name']),
                description=p['description'],
                details=p.get('details', ''),
                base_price=Decimal(p['price']),
                discount_percentage=Decimal(str(p.get('discount', 0))),
                sku=sku,
                category=category,
                stock_quantity=random.randint(5, 50),
                metadata=p.get('metadata', {}),
                is_active=True,
            )

            # Download image
            img_url = p.get('image_url', '')
            if img_url:
                filename = f"{slugify(p['name'])}.jpg"
                img_file = self.download_image(img_url, filename)
                if img_file:
                    ProductImage.objects.create(
                        product=product, image=img_file,
                        alt_text=p['name'], is_feature=True
                    )

            # Create variants
            for v in p.get('variants', []):
                ProductVariant.objects.create(
                    product=product,
                    name=v['name'],
                    price_override=Decimal(v['price']) if v.get('price') else None,
                    stock_quantity=random.randint(3, 20),
                )

            created_count += 1
            self.stdout.write(f'  [{i}/100] ✓ {p["name"]} (${p["price"]})')

        self.stdout.write(self.style.SUCCESS(
            f'\n🎉 Done! Created {created_count} products, skipped {skipped_count} existing.'
        ))
