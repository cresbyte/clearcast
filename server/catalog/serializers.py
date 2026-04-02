from rest_framework import serializers
from django.utils.text import slugify
from .models import FilterGroup, FilterOption, Product, ProductImage, ProductVariant
from django.db.models import ProtectedError

# ============================================================================
# Read-Only Serializers (for GET requests)
# ============================================================================

class FilterOptionSerializer(serializers.ModelSerializer):
    """Read-only serializer for FilterOption"""
    group_name = serializers.CharField(source='group.name', read_only=True)
    group_slug = serializers.CharField(source='group.slug', read_only=True)

    class Meta:
        model = FilterOption
        fields = ['id', 'name', 'slug', 'image', 'group', 'group_name', 'group_slug']


class FilterGroupSerializer(serializers.ModelSerializer):
    """Read-only serializer for FilterGroup with its options"""
    options = FilterOptionSerializer(many=True, read_only=True)

    class Meta:
        model = FilterGroup
        fields = ['id', 'name', 'slug', 'description', 'image', 'options']


class ProductImageSerializer(serializers.ModelSerializer):
    """Read-only serializer for ProductImage"""
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'image_url', 'alt_text', 'is_feature']
    
    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and hasattr(obj.image, 'url'):
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

class ProductVariantSerializer(serializers.ModelSerializer):
    """Read-only serializer for ProductVariant"""
    price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    current_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    name = serializers.CharField(source='size', read_only=True) # Compatibility for frontend

    class Meta:
        model = ProductVariant
        fields = ['id', 'size', 'name', 'sku', 'price_override', 'price', 'current_price', 'stock_quantity']

class ProductSerializer(serializers.ModelSerializer):
    """Read-only serializer for Product listing and retrieval"""
    filters = FilterOptionSerializer(many=True, read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    price = serializers.DecimalField(source='base_price', max_digits=10, decimal_places=2, read_only=True)
    
    # Current price considering discounts
    current_price = serializers.SerializerMethodField()
    has_discount = serializers.SerializerMethodField()
    primary_image = serializers.SerializerMethodField()
    reviews_count = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    price_range = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'filters', 'name', 'slug', 'description', 'details', 
            'base_price', 'price', 'discount_percentage', 'sale_price', 'current_price', 'has_discount',
            'sku', 'metadata', 'is_set', 'stock_quantity', 'is_active', 
            'created_at', 'updated_at', 'images', 'primary_image', 'variants',
            'reviews_count', 'average_rating', 'price_range'
        ]
    
    def get_reviews_count(self, obj):
        return obj.reviews.count()

    def get_average_rating(self, obj):
        from django.db.models import Avg
        avg = obj.reviews.aggregate(Avg('rating'))['rating__avg']
        return round(avg, 1) if avg else 0.0
    
    def get_current_price(self, obj):
        return obj.sale_price if obj.sale_price else obj.base_price
    
    def get_has_discount(self, obj):
        return obj.discount_percentage > 0 if obj.discount_percentage else False
        
    def get_primary_image(self, obj):
        image = obj.images.filter(is_feature=True).first()
        if not image:
            image = obj.images.first()
            
        if image and image.image:
            request = self.context.get('request')
            if request and hasattr(image.image, 'url'):
                return request.build_absolute_uri(image.image.url)
            return image.image.url if hasattr(image.image, 'url') else None
        return None

    def get_price_range(self, obj):
        variants = obj.variants.all()
        if not variants:
            current_price = obj.sale_price if obj.sale_price else obj.base_price
            return {"min": float(current_price), "max": float(current_price)}
        
        prices = [float(v.current_price) for v in variants]
        return {"min": min(prices), "max": max(prices)}

# ============================================================================
# Write Serializers (for POST, PUT, PATCH requests)
# ============================================================================

class FilterGroupWriteSerializer(serializers.ModelSerializer):
    """Writable serializer for FilterGroup"""
    class Meta:
        model = FilterGroup
        fields = ['id', 'name', 'slug', 'description', 'image']
        read_only_fields = ['id']
        extra_kwargs = {'slug': {'required': False, 'allow_blank': True}}

    def validate_slug(self, value):
        if self.instance:
            if FilterGroup.objects.filter(slug=value).exclude(id=self.instance.id).exists():
                raise serializers.ValidationError("A group with this slug already exists.")
        else:
            if FilterGroup.objects.filter(slug=value).exists():
                raise serializers.ValidationError("A group with this slug already exists.")
        return value
    
    def create(self, validated_data):
        if 'slug' not in validated_data or not validated_data['slug']:
            validated_data['slug'] = slugify(validated_data['name'])
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        if 'name' in validated_data and 'slug' not in validated_data:
            validated_data['slug'] = slugify(validated_data['name'])
        return super().update(instance, validated_data)

class FilterOptionWriteSerializer(serializers.ModelSerializer):
    """Writable serializer for FilterOption"""
    class Meta:
        model = FilterOption
        fields = ['id', 'group', 'name', 'slug', 'image']
        read_only_fields = ['id']
        extra_kwargs = {'slug': {'required': False, 'allow_blank': True}}

    def create(self, validated_data):
        if 'slug' not in validated_data or not validated_data['slug']:
            validated_data['slug'] = slugify(validated_data['name'])
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        if 'name' in validated_data and 'slug' not in validated_data:
            validated_data['slug'] = slugify(validated_data['name'])
        return super().update(instance, validated_data)


class ProductImageWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'alt_text', 'is_feature']
        read_only_fields = ['id']


class ProductVariantWriteSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='size', required=False) # Frontend compat

    class Meta:
        model = ProductVariant
        fields = ['id', 'size', 'name', 'sku', 'price_override', 'stock_quantity']
        read_only_fields = ['id']
        extra_kwargs = {
            'sku': {'validators': []}
        }
    
    def validate_sku(self, value):
        if not value:
            return value
        
        instance = self.instance
        root_instance = getattr(self.root, 'instance', None)
        
        queryset = ProductVariant.objects.filter(sku=value)
        
        if instance:
            queryset = queryset.exclude(id=instance.id)
        elif root_instance and isinstance(root_instance, Product):
            queryset = queryset.exclude(product=root_instance)
        
        if queryset.exists():
            raise serializers.ValidationError("A variant with this SKU already exists.")
        return value


class ProductWriteSerializer(serializers.ModelSerializer):
    """Writable serializer for creating/updating products"""
    filter_ids = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False
    )
    images_data = ProductImageWriteSerializer(many=True, required=False, write_only=True)
    variants_data = ProductVariantWriteSerializer(many=True, required=False, write_only=True)
    
    # Include read-only nested data in response
    filters = FilterOptionSerializer(many=True, read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description', 'details', 'base_price', 
            'discount_percentage', 'sale_price',
            'sku', 'metadata', 'is_set', 'stock_quantity', 'is_active',
            'filter_ids', 'filters', 
            'images_data', 'images',
            'variants_data', 'variants',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'sale_price']
        extra_kwargs = {
            'slug': {'required': False, 'allow_blank': True},
            'discount_percentage': {'required': False, 'default': 0},
            'sku': {'validators': []}
        }
    
    def validate_filter_ids(self, value):
        valid_ids = FilterOption.objects.filter(id__in=value).values_list('id', flat=True)
        if len(valid_ids) != len(value):
            raise serializers.ValidationError("One or more filter options do not exist.")
        return value
    
    def validate_sku(self, value):
        if self.instance:
            if Product.objects.filter(sku=value).exclude(id=self.instance.id).exists():
                raise serializers.ValidationError("A product with this SKU already exists.")
        else:
            if Product.objects.filter(sku=value).exists():
                raise serializers.ValidationError("A product with this SKU already exists.")
        return value
    
    def validate_discount_percentage(self, value):
        if value < 0 or value > 100:
            raise serializers.ValidationError("Discount percentage must be between 0 and 100.")
        return value
    
    def create(self, validated_data):
        images_data = validated_data.pop('images_data', [])
        variants_data = validated_data.pop('variants_data', [])
        filter_ids = validated_data.pop('filter_ids', [])
        
        if 'slug' not in validated_data or not validated_data['slug']:
            validated_data['slug'] = slugify(validated_data['name'])
        
        product = Product.objects.create(**validated_data)
        
        if filter_ids:
            product.filters.set(filter_ids)
        
        for image_data in images_data:
            ProductImage.objects.create(product=product, **image_data)
        
        for variant_data in variants_data:
            size = variant_data.pop('size', variant_data.pop('name', '')) # Get size or fallback to name
            ProductVariant.objects.create(product=product, size=size, **variant_data)
        
        return product
    
    def update(self, instance, validated_data):
        images_data = validated_data.pop('images_data', None)
        variants_data = validated_data.pop('variants_data', None)
        filter_ids = validated_data.pop('filter_ids', None)
        
        if 'name' in validated_data and 'slug' not in validated_data:
            validated_data['slug'] = slugify(validated_data['name'])
        
        if filter_ids is not None:
            instance.filters.set(filter_ids)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if images_data is not None:
            keep_image_ids = []
            for img_data in images_data:
                image = ProductImage.objects.create(product=instance, **img_data)
                keep_image_ids.append(image.id)
            instance.images.exclude(id__in=keep_image_ids).delete()
        
        if variants_data is not None:
            keep_variant_ids = []
            for variant_data in variants_data:
                sku = variant_data.get('sku')
                size = variant_data.pop('size', variant_data.pop('name', None))
                
                variant = None
                if sku:
                    variant = instance.variants.filter(sku=sku).first()
                if not variant and size:
                    variant = instance.variants.filter(size=size).first()
                
                if variant:
                    if size:
                        variant.size = size
                    for attr, value in variant_data.items():
                        setattr(variant, attr, value)
                    variant.save()
                    keep_variant_ids.append(variant.id)
                else:
                    new_variant = ProductVariant.objects.create(product=instance, size=size or 'Default', **variant_data)
                    keep_variant_ids.append(new_variant.id)
            
            to_delete = instance.variants.exclude(id__in=keep_variant_ids)
            for v in to_delete:
                try:
                    v.delete()
                except ProtectedError:
                    pass
        
        return instance
