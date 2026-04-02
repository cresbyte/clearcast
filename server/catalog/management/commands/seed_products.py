import random
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.utils.text import slugify
from catalog.models import FilterGroup, FilterOption, Product, ProductImage, ProductVariant

class Command(BaseCommand):
    help = 'Seeds the database with fishing fly products and filter groups'

    def handle(self, *args, **kwargs):
        self.stdout.write('Deleting old data...')
        Product.objects.all().delete()
        FilterGroup.objects.all().delete()

        self.stdout.write('Creating Filter Groups and Options...')
        
        # 1. Species Group
        species_group = FilterGroup.objects.create(name='Species', slug='species')
        species_options = {
            'Trout': FilterOption.objects.create(group=species_group, name='Trout', slug='trout', image='filters/options/trout.png'),
            'Bass': FilterOption.objects.create(group=species_group, name='Bass', slug='bass', image='filters/options/bass.png'),
            'Salmon': FilterOption.objects.create(group=species_group, name='Salmon', slug='salmon', image='filters/options/salmon.png'),
            'Steelhead': FilterOption.objects.create(group=species_group, name='Steelhead', slug='steelhead'),
        }

        # 2. Season Group
        season_group = FilterGroup.objects.create(name='Season', slug='season')
        season_options = {
            'Spring': FilterOption.objects.create(group=season_group, name='Spring', slug='spring'),
            'Summer': FilterOption.objects.create(group=season_group, name='Summer', slug='summer'),
            'Autumn': FilterOption.objects.create(group=season_group, name='Autumn', slug='autumn'),
            'Winter': FilterOption.objects.create(group=season_group, name='Winter', slug='winter'),
        }

        # 3. Water Type
        water_group = FilterGroup.objects.create(name='Water Type', slug='water-type')
        water_options = {
            'Stillwater': FilterOption.objects.create(group=water_group, name='Stillwater', slug='stillwater'),
            'River': FilterOption.objects.create(group=water_group, name='River', slug='river'),
            'Saltwater': FilterOption.objects.create(group=water_group, name='Saltwater', slug='saltwater'),
        }

        # 4. Dry Fly category (Option under a new group Technique)
        technique_group = FilterGroup.objects.create(name='Technique', slug='technique')
        dry_fly_option = FilterOption.objects.create(group=technique_group, name='Dry Flies', slug='dry-flies', image='filters/options/dryflies.png')

        self.stdout.write('Creating Fishing Fly Products...')

        flies_data = [
            {
                'name': 'Royal Wulff',
                'description': 'A classic dry fly that attracts a wide variety of trout. Excellent visibility and buoyancy.',
                'base_price': Decimal('2.50'),
                'filters': [species_options['Trout'], season_options['Summer'], water_options['River'], dry_fly_option],
                'sku': 'RW-001',
                'sizes': ['Size 12', 'Size 14', 'Size 16']
            },
            {
                'name': 'Woolly Bugger',
                'description': 'The most versatile sub-surface fly. Effective for bass, trout, and even salmon.',
                'base_price': Decimal('3.25'),
                'filters': [species_options['Trout'], species_options['Bass'], species_options['Salmon'], water_options['Stillwater'], water_options['River']],
                'sku': 'WB-002',
                'sizes': ['Size 6', 'Size 8', 'Size 10']
            },
            {
                'name': 'Copper John',
                'description': 'A high-speed sinking nymph that trout find irresistible in fast water.',
                'base_price': Decimal('2.75'),
                'filters': [species_options['Trout'], season_options['Spring'], water_options['River']],
                'sku': 'CJ-003',
                'sizes': ['Size 14', 'Size 16', 'Size 18']
            },
            {
                'name': 'Elk Hair Caddis',
                'description': 'The go-to autumn dry fly for river trout.',
                'base_price': Decimal('2.25'),
                'filters': [species_options['Trout'], season_options['Autumn'], water_options['River'], dry_fly_option],
                'sku': 'EH-004',
                'sizes': ['Size 12', 'Size 14']
            },
            {
                'name': 'Bass Popper',
                'description': 'Surface-shattering action for aggressive bass and panfish.',
                'base_price': Decimal('5.50'),
                'filters': [species_options['Bass'], season_options['Summer'], water_options['Stillwater']],
                'sku': 'BP-005',
                'sizes': ['Size 2', 'Size 4']
            },
            {
                'name': 'Intruder',
                'description': 'Large, flashy patterns designed specifically for salmon and winter steelhead.',
                'base_price': Decimal('12.00'),
                'filters': [species_options['Salmon'], species_options['Steelhead'], season_options['Winter']],
                'sku': 'IT-006',
                'sizes': ['Large', 'Medium']
            }
        ]

        for fly in flies_data:
            product = Product.objects.create(
                name=fly['name'],
                slug=slugify(fly['name']),
                description=fly['description'],
                base_price=fly['base_price'],
                sku=fly['sku'],
                stock_quantity=random.randint(50, 500)
            )
            # Add Many-to-Many filters
            product.filters.set(fly['filters'])
            
            # Create variants (Sizes only)
            for size in fly['sizes']:
                ProductVariant.objects.create(
                    product=product,
                    size=size,
                    stock_quantity=random.randint(10, 100)
                )

            self.stdout.write(f'Created: {product.name}')

        # 5. Create default homepage sections
        from reviews.models import ShopByCatalogSection, ContentSection, HeroSection
        ShopByCatalogSection.objects.all().delete()
        ContentSection.objects.all().delete()
        HeroSection.objects.all().delete()

        # 5.0 Hero Section (Impactful Entry)
        HeroSection.objects.create(
            title="The Art of the Drift",
            subtitle="Explore our artisanal collection of hand-tied patterns, engineered for the perfect presentation and maximum impact on the water.",
            image="https://images.unsplash.com/photo-1534329532729-bb894b92c89d?q=80&w=2600&auto=format&fit=crop", 
            button_text="Shop the Fly Bar",
            button_link="/shop",
            button_text_2="Our Philosophy",
            button_link_2="/about",
            content_alignment='left',
            order=0,
            is_active=True
        )

        # 5.1 Shop by Catalog (Filter Grid)
        featured_catalog = ShopByCatalogSection.objects.create(
            title="Shop by Species & Technique",
            subtitle="Explore our curated collections of premium fishing flies.",
            order=1,
            is_active=True
        )
        featured_catalog.filters.set([
            species_options['Trout'],
            species_options['Bass'],
            species_options['Salmon'],
            dry_fly_option
        ])

        # 5.2 Dynamic Featured Filter Sections (Product Grids)
        ContentSection.objects.create(
            title="Summer Selection",
            subtitle="The brightest patterns for long days on the water.",
            description="Our summer collection features high-buoyancy dry flies and aggressive surface patterns perfectly suited for peak season activity.",
            section_type='featured',
            featured_filter=season_options['Summer'],
            badge_text="Summer Peak",
            button_text="Shop Summer Collection",
            button_link=f"/shop?filter={season_options['Summer'].slug}",
            order=2,
            is_active=True
        )

        ContentSection.objects.create(
            title="Prime Trout Patterns",
            subtitle="Hand-tied essentials for every river angler.",
            description="From technical nymphs to classic dries, these Trout-focused patterns are the backbone of any serious fly box.",
            section_type='featured',
            featured_filter=species_options['Trout'],
            badge_text="Angler's Choice",
            button_text="View Trout Fly Bar",
            button_link=f"/shop?filter={species_options['Trout'].slug}",
            order=3,
            is_active=True
        )

        # 5.3 Standard Banner Section
        ContentSection.objects.create(
            title="Artisanal Craftsmanship",
            subtitle="Traditional methods, modern materials.",
            description="Every fly in our collection is hand-tied by master tiers using only the finest ethically sourced feathers and high-carbon hooks.",
            section_type='banner',
            badge_text="Our Philosophy",
            button_text="Our Story",
            button_link="/about",
            order=4,
            is_active=True
        )

        self.stdout.write(self.style.SUCCESS('\n🎉 Successfully seeded fishing flies, filters, and dynamic homepage sections!'))
