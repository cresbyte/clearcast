from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .models import Category, Product

class CatalogApiTests(APITestCase):
    def setUp(self):
        self.category = Category.objects.create(name='Electronics', slug='electronics')
        self.product = Product.objects.create(
            category=self.category,
            name='Smartphone',
            slug='smartphone',
            description='A great phone',
            base_price=999.99,
            sku='PHONE123',
            stock_quantity=10
        )

    def test_list_categories(self):
        url = reverse('category-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_list_products(self):
        url = reverse('product-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'Smartphone')

    def test_filter_products_by_category(self):
        # Create another product in a different category
        cat2 = Category.objects.create(name='Clothes', slug='clothes')
        Product.objects.create(
            category=cat2, name='T-Shirt', slug='tshirt', description='Cotton', base_price=10.00, sku='SHIRT1'
        )
        
        url = reverse('product-list') + f'?category__slug={self.category.slug}'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'Smartphone')
