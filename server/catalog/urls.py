from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'filter-groups', views.FilterGroupViewSet)
router.register(r'filter-options', views.FilterOptionViewSet)
router.register(r'products', views.ProductViewSet)
router.register(r'product-images', views.ProductImageViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
