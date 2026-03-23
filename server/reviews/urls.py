from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ReviewViewSet,
    AdminDashboardView,
    HeroSectionViewSet,
    NavbarPromoViewSet,
    ContentSectionViewSet,
    ShopByCatalogSectionViewSet,
)

router = DefaultRouter()
router.register(r'hero', HeroSectionViewSet, basename='hero-section')
router.register(r'promo', NavbarPromoViewSet, basename='navbar-promo')
router.register(r'content', ContentSectionViewSet, basename='content-section')
router.register(r'shop-by-catalog', ShopByCatalogSectionViewSet, basename='shop-by-catalog')
router.register(r'product-reviews', ReviewViewSet, basename='review')

urlpatterns = [
    path('dashboard/', AdminDashboardView.as_view(), name='admin-dashboard'),
    path('', include(router.urls)),
]
