from rest_framework import serializers
from .models import (
    Review,
    HeroSection,
    NavbarPromo,
    ContentSection,
    ShopByCatalogSection,
)
from catalog.models import FilterOption
from catalog.serializers import ProductSerializer, FilterOptionSerializer
from base.serializers import UserSerializer

class ReviewSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    product_details = ProductSerializer(source='product', read_only=True)
    
    class Meta:
        model = Review
        fields = [
            'id', 'user', 'user_details', 'product', 'product_details', 
            'rating', 'comment', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

class ReviewCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['product', 'rating', 'comment']

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value

class HeroSectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = HeroSection
        fields = '__all__'

class NavbarPromoSerializer(serializers.ModelSerializer):
    class Meta:
        model = NavbarPromo
        fields = '__all__'

class ContentSectionSerializer(serializers.ModelSerializer):
    featured_filter_details = FilterOptionSerializer(source='featured_filter', read_only=True)
    
    class Meta:
        model = ContentSection
        fields = [
            'id', 'title', 'subtitle', 'description', 'image', 'section_type',
            'button_text', 'button_link', 'badge_text', 'featured_filter',
            'featured_filter_details', 'is_active', 'order'
        ]


class ShopByCatalogSectionSerializer(serializers.ModelSerializer):
    """
    Serializer for the 'Shop by Catalog' homepage section.
    - `filters` is read-only, fully expanded filter options data.
    - `filter_ids` is write-only, used to set the M2M relation.
    """
    filters = FilterOptionSerializer(many=True, read_only=True)
    filter_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        write_only=True,
        source='filters',
        queryset=FilterOption.objects.all(),
    )

    class Meta:
        model = ShopByCatalogSection
        fields = [
            'id',
            'title',
            'subtitle',
            'description',
            'is_active',
            'order',
            'filters',
            'filter_ids',
        ]

class DashboardSerializer(serializers.Serializer):
    total_revenue = serializers.DecimalField(max_digits=20, decimal_places=2)
    orders_count = serializers.IntegerField()
    products_count = serializers.IntegerField()
    active_customers = serializers.IntegerField()
    recent_orders = serializers.ListField(child=serializers.DictField())
    monthly_sales = serializers.ListField(child=serializers.DictField())
    pending_orders_count = serializers.IntegerField()
    average_order_value = serializers.DecimalField(max_digits=12, decimal_places=2)
