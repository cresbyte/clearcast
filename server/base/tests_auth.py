from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from django.core import mail
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator

User = get_user_model()

class AuthTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(email='test@example.com', password='oldpassword', first_name='TestUser')

    def test_login(self):
        url = reverse('token_obtain_pair')
        data = {'email': 'test@example.com', 'password': 'oldpassword'}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        
        # Verify custom claim
        import jwt
        decoded = jwt.decode(response.data['access'], options={"verify_signature": False})
        self.assertEqual(decoded.get('name'), 'TestUser')

    def test_password_reset_flow(self):
        # 1. Request Password Reset
        url_request = reverse('password_reset_request')
        response = self.client.post(url_request, {'email': 'test@example.com'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check that email was sent
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('http://localhost:3000/reset-password/', mail.outbox[0].body)
        # Check for HTML content
        self.assertTrue(mail.outbox[0].alternatives) 
        self.assertIn('text/html', mail.outbox[0].alternatives[0][1])
        
        # 2. Confirm Password Reset
        # We need to generate the token manually as we can't easily parse it from the email body in this test without regex, 
        # but we know how it's generated.
        uid = urlsafe_base64_encode(force_bytes(self.user.pk))
        token = default_token_generator.make_token(self.user)
        
        url_confirm = reverse('password_reset_confirm')
        new_password = 'newpassword123'
        response_confirm = self.client.post(url_confirm, {'uid': uid, 'token': token, 'password': new_password})
        self.assertEqual(response_confirm.status_code, status.HTTP_200_OK)
        
        # 3. Login with new password
        url_login = reverse('token_obtain_pair')
        response_login = self.client.post(url_login, {'email': 'test@example.com', 'password': new_password})
        self.assertEqual(response_login.status_code, status.HTTP_200_OK)

    def test_registration(self):
        url = reverse('register')
        data = {
            'first_name': 'New',
            'last_name': 'User',
            'email': 'newuser@example.com',
            'password': 'newpassword123'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verify user exists
        self.assertTrue(User.objects.filter(email='newuser@example.com').exists())
        
        # Verify we can login
        url_login = reverse('token_obtain_pair')
        response_login = self.client.post(url_login, {'email': 'newuser@example.com', 'password': 'newpassword123'})
        self.assertEqual(response_login.status_code, status.HTTP_200_OK)
        # Verify custom claim 'name' is correct
        import jwt
        decoded = jwt.decode(response_login.data['access'], options={"verify_signature": False})
        self.assertEqual(decoded.get('name'), 'New')
