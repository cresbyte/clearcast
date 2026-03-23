from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CartViewSet, OrderViewSet, CouponViewSet, PaymentGatewayViewSet

router = DefaultRouter()
router.register(r'cart', CartViewSet, basename='cart')
router.register(r'discounts', CouponViewSet, basename='coupon')
router.register(r'gateways', PaymentGatewayViewSet, basename='gateway')
router.register(r'', OrderViewSet, basename='order')

urlpatterns = [
    path('', include(router.urls)),
]

