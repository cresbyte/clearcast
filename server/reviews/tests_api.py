from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from catalog.models import Product, Category
from orders.models import Order, OrderItem
from reviews.models import Review
from django.urls import reverse

User = get_user_model()

class ReviewAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(email='test@example.com', password='password123', first_name='Test', last_name='User')
        self.client.force_authenticate(user=self.user)
        
        self.category = Category.objects.create(name='Electronics', slug='electronics')
        self.product = Product.objects.create(
            name='Smartphone',
            slug='smartphone',
            sku='PHONE123',
            category=self.category,
            base_price=500.00,
            stock_quantity=10
        )
        
        # Another user's product for testing
        self.other_user = User.objects.create_user(email='other@example.com', password='password123')
        self.other_product = Product.objects.create(
            name='Laptop',
            slug='laptop',
            sku='LAPTOP456',
            category=self.category,
            base_price=1000.00,
            stock_quantity=5
        )

    def test_pending_reviews_only_delivered(self):
        # Create a non-delivered order
        order_pending = Order.objects.create(user=self.user, total_amount=500.00, status='P')
        OrderItem.objects.create(order=order_pending, product=self.product, price=500.00, quantity=1)
        
        url = reverse('review-pending-reviews')
        response = self.client.get(url)
        self.assertEqual(len(response.data), 0)
        
        # Change order to Delivered
        order_pending.status = 'D'
        order_pending.save()
        
        response = self.client.get(url)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], self.product.id)

    def test_submit_review_for_purchased_product(self):
        # Create a delivered order
        order = Order.objects.create(user=self.user, total_amount=500.00, status='D')
        OrderItem.objects.create(order=order, product=self.product, price=500.00, quantity=1)
        
        url = reverse('review-submit-review')
        data = {
            'product': self.product.id,
            'rating': 5,
            'comment': 'Great product!'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Review.objects.filter(user=self.user, product=self.product).exists())
        
        # Verify it's no longer in pending
        pending_url = reverse('review-pending-reviews')
        pending_response = self.client.get(pending_url)
        self.assertEqual(len(pending_response.data), 0)

    def test_cannot_review_unpurchased_product(self):
        url = reverse('review-submit-review')
        data = {
            'product': self.other_product.id,
            'rating': 4,
            'comment': 'I did not buy this'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('You can only review products you have purchased', response.data['detail'])

    def test_cannot_review_twice(self):
        # Create a delivered order
        order = Order.objects.create(user=self.user, total_amount=500.00, status='D')
        OrderItem.objects.create(order=order, product=self.product, price=500.00, quantity=1)
        
        # First review
        Review.objects.create(user=self.user, product=self.product, rating=5, comment='Nice')
        
        # Second review attempt
        url = reverse('review-submit-review')
        data = {
            'product': self.product.id,
            'rating': 1,
            'comment': 'Trying again'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('You have already reviewed this product', response.data['detail'])

    def test_review_filtering_by_product(self):
        # Create reviews for multiple products
        Review.objects.create(user=self.user, product=self.product, rating=5, comment='Good')
        Review.objects.create(user=self.other_user, product=self.other_product, rating=4, comment='Okay')
        
        url = reverse('review-list')
        response = self.client.get(f"{url}?product={self.product.id}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Check if pagination is returned
        self.assertIn('results', response.data)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['product'], self.product.id)

    def test_product_statistics(self):
        # Create reviews
        Review.objects.create(user=self.user, product=self.product, rating=5, comment='Excellent')
        Review.objects.create(user=self.other_user, product=self.product, rating=3, comment='Average')
        
        url = reverse('product-detail', kwargs={'pk': self.product.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['reviews_count'], 2)
        self.assertEqual(float(response.data['average_rating']), 4.0)
