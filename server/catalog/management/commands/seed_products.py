import random
import requests
from pathlib import Path
from django.core.management.base import BaseCommand
from django.utils.text import slugify
from django.core.files.base import ContentFile
from catalog.models import Category, Product, ProductImage
from decimal import Decimal
from io import BytesIO

class Command(BaseCommand):
    help = 'Seeds the database with realistic products and downloads real images'

    # Real product image URLs from Unsplash (high-quality, free to use)
    PRODUCT_IMAGES = {
        'Electronics': [
            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',  # Headphones
            'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800',  # Smartwatch
            'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800',  # Sunglasses
            'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800',  # Camera
            'https://images.unsplash.com/photo-1511385348-c6ca17cb7e3f?w=800',  # Wireless earbuds
            'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=800',  # Keyboard
            'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800',  # Tablet
            'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800',  # Gaming mouse
        ],
        'Clothing': [
            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',  # Watch
            'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',  # Nike shoes
            'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800',  # White sneakers
            'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',  # T-shirt
            'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800',  # Jacket
            'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800',  # Dress
            'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800',  # Hoodie
            'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=800',  # Backpack
        ],
        'Home': [
            'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=800',  # Desk lamp
            'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',  # Modern sofa
            'https://images.unsplash.com/photo-1615529182904-14819c35db37?w=800',  # Desk chair
            'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',  # Vase
            'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800',  # Throw pillow
            'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800',  # Wall mirror
            'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800',  # Bed frame
            'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800',  # Plant pot
        ],
        'Beauty': [
            'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800',  # Skincare bottles
            'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=800',  # Perfume
            'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800',  # Makeup palette
            'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800',  # Lipstick
            'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800',  # Cosmetics
            'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800',  # Face cream
            'https://images.unsplash.com/photo-1583241800633-e8d5c0e6d4c3?w=800',  # Serum bottle
            'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800',  # Hair care
        ],
        'Sports': [
            'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800',  # Basketball
            'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800',  # Yoga mat
            'https://images.unsplash.com/photo-1584735175315-9d5df23860e6?w=800',  # Dumbbells
            'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800',  # Running shoes
            'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800',  # Gym equipment
            'https://images.unsplash.com/photo-1519505907962-0a6cb0167c73?w=800',  # Bicycle
            'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800',  # Gym bag
            'https://images.unsplash.com/photo-1605296867424-35fc25c9212a?w=800',  # Water bottle
        ],
    }

    PRODUCT_DATA = {
        'Electronics': [
            {
                'name': 'Premium Wireless Headphones',
                'description': 'Experience studio-quality sound with active noise cancellation. These premium headphones feature 30-hour battery life, premium comfort cushions, and crystal-clear audio with deep bass. Perfect for music lovers, commuters, and professionals who demand the best audio experience.',
                'base_price': Decimal('249.99'),
                'metadata': {'battery_life': '30 hours', 'bluetooth': '5.0', 'anc': True, 'warranty': '2 years'}
            },
            {
                'name': 'Smart Fitness Watch',
                'description': 'Track your health and fitness goals with precision. Features include heart rate monitoring, GPS tracking, sleep analysis, and over 100 sport modes. Water-resistant design with 7-day battery life makes it perfect for athletes and health enthusiasts.',
                'base_price': Decimal('199.99'),
                'metadata': {'display': 'AMOLED', 'water_resistance': '5ATM', 'gps': True, 'battery': '7 days'}
            },
            {
                'name': 'Polarized Sports Sunglasses',
                'description': 'High-performance eyewear with UV400 protection and polarized lenses. Lightweight frame design provides maximum comfort during outdoor activities. Perfect for cycling, running, fishing, and driving.',
                'base_price': Decimal('79.99'),
                'metadata': {'uv_protection': 'UV400', 'polarized': True, 'frame': 'TR90'}
            },
            {
                'name': 'Professional DSLR Camera',
                'description': 'Capture stunning moments with 24MP resolution and advanced autofocus system. Features 4K video recording, dual card slots, and weather-sealed body. Ideal for professional photographers and serious hobbyists.',
                'base_price': Decimal('1299.99'),
                'metadata': {'megapixels': 24, 'video': '4K 60fps', 'sensor': 'Full Frame', 'weather_sealed': True}
            },
            {
                'name': 'True Wireless Earbuds Pro',
                'description': 'Premium sound in a compact package. Features adaptive noise cancellation, spatial audio, and premium drivers for rich, balanced sound. Includes wireless charging case with 24-hour total battery life.',
                'base_price': Decimal('179.99'),
                'metadata': {'anc': True, 'spatial_audio': True, 'charging': 'Wireless', 'battery': '6h + 18h'}
            },
        ],
        'Clothing': [
            {
                'name': 'Classic Leather Chronograph Watch',
                'description': 'Timeless elegance meets precision engineering. Featuring a stainless steel case, genuine leather strap, and Swiss-inspired movement. Water-resistant to 50m with luminous hands for low-light visibility.',
                'base_price': Decimal('189.99'),
                'metadata': {'case_diameter': '42mm', 'water_resistance': '50m', 'strap': 'Genuine Leather'}
            },
            {
                'name': 'Athletic Performance Running Shoes',
                'description': 'Engineered for speed and comfort with responsive cushioning and breathable mesh upper. Features advanced traction pattern for all-weather performance and lightweight construction for maximum energy return.',
                'base_price': Decimal('129.99'),
                'metadata': {'cushioning': 'React Foam', 'weight': '8.5 oz', 'drop': '10mm', 'terrain': 'Road'}
            },
            {
                'name': 'Minimalist Leather Sneakers',
                'description': 'Contemporary design meets premium craftsmanship. Full-grain leather upper with cushioned insole provides all-day comfort. Perfect for casual wear or smart-casual occasions.',
                'base_price': Decimal('159.99'),
                'metadata': {'material': 'Full-grain leather', 'lining': 'Breathable textile', 'sole': 'Rubber'}
            },
            {
                'name': 'Premium Cotton Crew Neck T-Shirt',
                'description': 'Essential everyday comfort in premium ring-spun cotton. Pre-shrunk fabric maintains shape wash after wash. Classic fit works perfectly for layering or wearing solo.',
                'base_price': Decimal('29.99'),
                'metadata': {'material': '100% Cotton', 'weight': '180 GSM', 'fit': 'Classic', 'care': 'Machine wash'}
            },
            {
                'name': 'All-Weather Performance Jacket',
                'description': 'Stay dry and comfortable in any condition. Features waterproof-breathable fabric, adjustable hood, and multiple secure pockets. Perfect for hiking, commuting, or everyday wear.',
                'base_price': Decimal('149.99'),
                'metadata': {'waterproof': '10000mm', 'breathability': '10000g/m²', 'insulation': 'Synthetic'}
            },
        ],
        'Home': [
            {
                'name': 'Modern LED Desk Lamp',
                'description': 'Illuminate your workspace with adjustable color temperature and brightness levels. Features USB charging port, touch controls, and energy-efficient LED technology. Sleek aluminum design complements any decor.',
                'base_price': Decimal('59.99'),
                'metadata': {'power': '12W LED', 'color_temp': '3000K-6000K', 'usb_charging': True, 'material': 'Aluminum'}
            },
            {
                'name': 'Contemporary 3-Seater Sofa',
                'description': 'Luxurious comfort with modern aesthetics. Premium upholstery over high-density foam cushions provides exceptional support. Solid hardwood frame ensures lasting durability.',
                'base_price': Decimal('899.99'),
                'metadata': {'dimensions': '84"W x 36"D x 32"H', 'frame': 'Hardwood', 'cushion': 'High-density foam'}
            },
            {
                'name': 'Ergonomic Office Chair',
                'description': 'Superior comfort for long work sessions. Features adjustable lumbar support, breathable mesh back, and multi-function tilt mechanism. Supports up to 300 lbs with smooth-rolling casters.',
                'base_price': Decimal('299.99'),
                'metadata': {'weight_capacity': '300 lbs', 'adjustments': 'Height, armrests, lumbar', 'warranty': '5 years'}
            },
            {
                'name': 'Artisan Ceramic Vase',
                'description': 'Handcrafted ceramic vase with unique reactive glaze finish. Each piece is one-of-a-kind, perfect for fresh flowers or as a standalone decorative accent. Food-safe and water-tight.',
                'base_price': Decimal('49.99'),
                'metadata': {'height': '12 inches', 'material': 'Stoneware', 'finish': 'Reactive glaze', 'handmade': True}
            },
        ],
        'Beauty': [
            {
                'name': 'Hydrating Facial Serum',
                'description': 'Advanced skincare with hyaluronic acid and vitamin C. This lightweight serum deeply hydrates while brightening and evening skin tone. Suitable for all skin types, cruelty-free and paraben-free.',
                'base_price': Decimal('39.99'),
                'metadata': {'volume': '30ml', 'key_ingredients': 'Hyaluronic Acid, Vitamin C', 'cruelty_free': True}
            },
            {
                'name': 'Signature Eau de Parfum',
                'description': 'Sophisticated fragrance with top notes of bergamot and jasmine, heart notes of rose and amber, base notes of vanilla and musk. Long-lasting formula in an elegant bottle.',
                'base_price': Decimal('89.99'),
                'metadata': {'volume': '50ml', 'concentration': 'Eau de Parfum', 'longevity': '8-10 hours'}
            },
            {
                'name': 'Professional Eyeshadow Palette',
                'description': '18 highly pigmented shades in matte, shimmer, and metallic finishes. Blendable formula allows for endless creative looks. Includes mirror and dual-ended applicator.',
                'base_price': Decimal('44.99'),
                'metadata': {'shades': 18, 'finishes': 'Matte, Shimmer, Metallic', 'cruelty_free': True}
            },
        ],
        'Sports': [
            {
                'name': 'Official Size Basketball',
                'description': 'Premium composite leather basketball with superior grip and control. Deep channel design for enhanced ball handling. Official size and weight for serious players.',
                'base_price': Decimal('34.99'),
                'metadata': {'size': 'Official (29.5")', 'material': 'Composite leather', 'indoor_outdoor': 'Both'}
            },
            {
                'name': 'Premium Yoga Mat',
                'description': 'Extra-thick cushioning provides superior joint protection. Non-slip textured surface ensures stability during any pose. Eco-friendly TPE material, free from harmful chemicals.',
                'base_price': Decimal('49.99'),
                'metadata': {'thickness': '6mm', 'material': 'TPE', 'dimensions': '72"L x 24"W', 'eco_friendly': True}
            },
            {
                'name': 'Adjustable Dumbbell Set',
                'description': 'Space-saving design replaces 15 sets of weights. Quick-select dial adjusts weight from 5 to 52.5 lbs. Includes storage tray for compact organization.',
                'base_price': Decimal('349.99'),
                'metadata': {'weight_range': '5-52.5 lbs', 'increments': '2.5 lbs', 'includes': 'Storage tray'}
            },
        ],
    }

    def download_image(self, url, filename):
        """Download image from URL and return ContentFile"""
        try:
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            return ContentFile(response.content, name=filename)
        except Exception as e:
            self.stdout.write(self.style.WARNING(f'Failed to download {url}: {str(e)}'))
            return None

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding database with realistic products...')
        
        # Create categories
        categories = ['Electronics', 'Clothing', 'Home', 'Beauty', 'Sports']
        category_objs = {}
        
        category_descriptions = {
            'Electronics': 'Discover cutting-edge technology and gadgets for modern living.',
            'Clothing': 'Premium fashion and accessories for every style and occasion.',
            'Home': 'Transform your living space with elegant furniture and decor.',
            'Beauty': 'Professional-grade skincare, makeup, and fragrances.',
            'Sports': 'High-performance equipment for athletes and fitness enthusiasts.'
        }
        
        for cat_name in categories:
            cat, created = Category.objects.get_or_create(
                name=cat_name,
                defaults={
                    'slug': slugify(cat_name),
                    'description': category_descriptions[cat_name]
                }
            )
            category_objs[cat_name] = cat
            if created:
                self.stdout.write(f'Created category: {cat_name}')
        
        # Create products with real images
        product_count = 0
        
        for category_name, products in self.PRODUCT_DATA.items():
            category = category_objs[category_name]
            image_urls = self.PRODUCT_IMAGES[category_name]
            
            for idx, product_data in enumerate(products):
                # Generate unique SKU
                sku = f"{category_name[:3].upper()}-{random.randint(10000, 99999)}"
                
                # Random discount
                discount = Decimal(random.choice([0, 0, 0, 10, 15, 20, 25]))
                
                # Create product
                product, created = Product.objects.get_or_create(
                    sku=sku,
                    defaults={
                        'name': product_data['name'],
                        'slug': slugify(product_data['name']),
                        'description': product_data['description'],
                        'base_price': product_data['base_price'],
                        'discount_percentage': discount,
                        'category': category,
                        'stock_quantity': random.randint(5, 150),
                        'metadata': product_data.get('metadata', {})
                    }
                )
                
                if created:
                    # Download and save real image
                    image_url = image_urls[idx % len(image_urls)]
                    filename = f"{slugify(product_data['name'])}.jpg"
                    
                    image_file = self.download_image(image_url, filename)
                    
                    if image_file:
                        ProductImage.objects.create(
                            product=product,
                            image=image_file,
                            alt_text=product_data['name'],
                            is_feature=True
                        )
                        self.stdout.write(self.style.SUCCESS(
                            f'✓ Created: {product_data["name"]} (${product_data["base_price"]})'
                        ))
                        product_count += 1
                    else:
                        self.stdout.write(self.style.WARNING(
                            f'⚠ Created product but image download failed: {product_data["name"]}'
                        ))
        
        self.stdout.write(self.style.SUCCESS(
            f'\n🎉 Successfully seeded {product_count} products with real images!'
        ))
