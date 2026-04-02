from django.core.management.base import BaseCommand
from catalog.models import Product, FilterGroup, FilterOption
from django.db import transaction

class Command(BaseCommand):
    help = 'Migrates product format from filters to boolean field and moves descriptions to details'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('Starting product data migration...'))

        with transaction.atomic():
            # 1. Handle Product Format Filter
            try:
                format_group = FilterGroup.objects.get(name__iexact='Product Format')
                self.stdout.write(f'Found Filter Group: {format_group.name}')
                
                # Identify "Set" options
                set_options = list(format_group.options.filter(name__icontains='Set'))
                set_option_ids = [opt.id for opt in set_options]
                
                if set_options:
                    self.stdout.write(f'Identified "Set" options: {[opt.name for opt in set_options]}')
                    
                    # Update products that have these options
                    products_to_update_set = Product.objects.filter(filters__id__in=set_option_ids).distinct()
                    updated_count = products_to_update_set.update(is_set=True)
                    self.stdout.write(self.style.SUCCESS(f'Updated is_set=True for {updated_count} products.'))
                else:
                    self.stdout.write(self.style.WARNING('No "Set" options found in Product Format group.'))

                # Delete the filter group and its options
                # This will automatically remove ManyToMany relationships
                format_group.delete()
                self.stdout.write(self.style.SUCCESS('Deleted "Product Format" filter group and its options.'))
                
            except FilterGroup.DoesNotExist:
                self.stdout.write(self.style.WARNING('Filter Group "Product Format" not found. Skipping filter migration.'))

            # 2. Move Descriptions
            self.stdout.write('Moving descriptions to details field...')
            products = Product.objects.all()
            moved_count = 0
            for product in products:
                if product.description and not product.details:
                    product.details = product.description
                    product.description = ''
                    product.save()
                    moved_count += 1
                elif product.description and product.details:
                    # If both exist, move description to details (maybe append or just overwrite if it was a mistake?)
                    # The user said "move the content which is rich text to the detailed description"
                    # Usually description being automated was the mistake.
                    # We'll overwrite if details is empty or just move it if it's not.
                    # Decision: If details is already populated, it might be safer to append or leave as is?
                    # But the user says "move all the short description", implies they want it in details.
                    # I'll just set details = description if it's the rich text they want there.
                    product.details = product.description
                    product.description = ''
                    product.save()
                    moved_count += 1
            
            self.stdout.write(self.style.SUCCESS(f'Moved descriptions for {moved_count} products.'))

        self.stdout.write(self.style.SUCCESS('Product data migration complete!'))
