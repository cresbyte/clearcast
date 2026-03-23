from django.test import TestCase
from catalog.models import Category, Product, ProductVariant
from catalog.serializers import ProductSerializer, ProductVariantSerializer

class ProductVariantPriceTests(TestCase):
    def setUp(self):
        self.category = Category.objects.create(name='Electronics', slug='electronics')
        self.product = Product.objects.create(
            category=self.category,
            name='Smartphone',
            slug='smartphone',
            description='A great phone',
            base_price=1000.00,
            sku='PHONE123',
            stock_quantity=10
        )

    def test_variant_price_default(self):
        """Test that variant uses product base price by default"""
        variant = ProductVariant.objects.create(
            product=self.product,
            name='Base Model',
            sku='BASE-1',
            stock_quantity=5
        )
        self.assertEqual(variant.price, 1000.00)
        self.assertEqual(variant.current_price, 1000.00)

    def test_variant_price_override(self):
        """Test that variant uses price_override if provided"""
        variant = ProductVariant.objects.create(
            product=self.product,
            name='Pro Model',
            sku='PRO-1',
            price_override=1200.00,
            stock_quantity=5
        )
        self.assertEqual(variant.price, 1200.00)
        self.assertEqual(variant.current_price, 1200.00)

    def test_variant_price_with_discount(self):
        """Test that variant price correctly reflects product discount"""
        self.product.discount_percentage = 20
        self.product.save()
        
        variant_default = ProductVariant.objects.create(
            product=self.product,
            name='Base Model',
            sku='BASE-1',
            stock_quantity=5
        )
        variant_override = ProductVariant.objects.create(
            product=self.product,
            name='Pro Model',
            sku='PRO-1',
            price_override=2000.00,
            stock_quantity=5
        )
        
        # Default: 1000 - 20% = 800
        self.assertEqual(variant_default.current_price, 800.00)
        # Override: 2000 - 20% = 1600
        self.assertEqual(variant_override.current_price, 1600.00)

    def test_product_serializer_price_range(self):
        """Test that ProductSerializer returns correct price range"""
        ProductVariant.objects.create(
            product=self.product,
            name='Cheap',
            sku='C-1',
            price_override=500.00,
            stock_quantity=5
        )
        ProductVariant.objects.create(
            product=self.product,
            name='Expensive',
            sku='E-1',
            price_override=1500.00,
            stock_quantity=5
        )
        
        serializer = ProductSerializer(self.product)
        price_range = serializer.data['price_range']
        self.assertEqual(price_range['min'], 500.00)
        self.assertEqual(price_range['max'], 1500.00)
        
        # apply discount
        self.product.discount_percentage = 50
        self.product.save()
        
        serializer = ProductSerializer(self.product)
        price_range = serializer.data['price_range']
        self.assertEqual(price_range['min'], 250.00)
        self.assertEqual(price_range['max'], 750.00)

    def test_update_product_with_existing_variant_sku(self):
        """Test that updating a product with existing variants doesn't fail due to SKU uniqueness"""
        from catalog.serializers import ProductWriteSerializer
        
        variant = ProductVariant.objects.create(
            product=self.product,
            name='Original',
            sku='DUPLICATE-SKU',
            stock_quantity=5
        )
        
        data = {
            'name': 'Updated Smartphone',
            'category_id': self.category.id,
            'sku': 'PHONE123',
            'base_price': 1000.00,
            'variants_data': [
                {
                    'name': 'Updated Original',
                    'sku': 'DUPLICATE-SKU',
                    'stock_quantity': 10
                }
            ]
        }
        
        serializer = ProductWriteSerializer(instance=self.product, data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        serializer.save()
        
        self.assertEqual(self.product.variants.count(), 1)
        self.assertEqual(self.product.variants.first().sku, 'DUPLICATE-SKU')
        self.assertEqual(self.product.name, 'Updated Smartphone')
