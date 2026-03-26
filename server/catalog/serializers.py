from rest_framework import serializers
from django.utils.text import slugify
from .models import Category, Product, ProductImage, ProductVariant

# ============================================================================
# Read-Only Serializers (for GET requests)
# ============================================================================

class CategorySerializer(serializers.ModelSerializer):
    """Read-only serializer for Category listing and retrieval"""
    children = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'parent', 'children', 'image', 'image_url']
    
    def get_children(self, obj):
        if obj.children.exists():
            return CategorySerializer(obj.children.all(), many=True, context=self.context).data
        return []

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and hasattr(obj.image, 'url'):
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

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

    class Meta:
        model = ProductVariant
        fields = ['id', 'name', 'sku', 'price_override', 'price', 'current_price', 'stock_quantity']

class ProductSerializer(serializers.ModelSerializer):
    """Read-only serializer for Product listing and retrieval"""
    category = CategorySerializer(read_only=True)
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
            'id', 'category', 'name', 'slug', 'description', 'details', 
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
        """Return sale_price if available, otherwise base_price"""
        return obj.sale_price if obj.sale_price else obj.base_price
    
    def get_has_discount(self, obj):
        """Check if product has an active discount"""
        return obj.discount_percentage > 0 if obj.discount_percentage else False
        
    def get_primary_image(self, obj):
        """Return URL of the primary image (feature=True or first one)"""
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
        """Return the min and max price of variants, or the product price if no variants"""
        variants = obj.variants.all()
        if not variants:
            current_price = obj.sale_price if obj.sale_price else obj.base_price
            return {"min": float(current_price), "max": float(current_price)}
        
        prices = [float(v.current_price) for v in variants]
        return {"min": min(prices), "max": max(prices)}

# ============================================================================
# Write Serializers (for POST, PUT, PATCH requests)
# ============================================================================

class CategoryWriteSerializer(serializers.ModelSerializer):
    """Writable serializer for creating/updating categories"""
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'parent', 'image']
        read_only_fields = ['id']
        extra_kwargs = {
            'slug': {'required': False, 'allow_blank': True}
        }
    
    def _get_category_depth(self, obj):
        """Calculate the current depth of a category (1-based)"""
        depth = 1
        curr = obj.parent
        while curr:
            depth += 1
            curr = curr.parent
        return depth

    def _get_max_subtree_depth(self, obj):
        """Calculate the max depth of the subtree starting from obj"""
        max_d = 1
        for child in obj.children.all():
            max_d = max(max_d, 1 + self._get_max_subtree_depth(child))
        return max_d

    def validate_parent(self, value):
        """Ensure the category structure does not exceed 3 levels total"""
        if value:
            # 1. Check parent depth
            parent_depth = self._get_category_depth(value)
            
            # 2. Check subtree depth (of the category being moved/created)
            subtree_depth = 1
            if self.instance:
                subtree_depth = self._get_max_subtree_depth(self.instance)
            
            if parent_depth + subtree_depth > 3:
                raise serializers.ValidationError(
                    f"Maximum category depth exceeded. Total depth would be {parent_depth + subtree_depth}, "
                    "but only 3 levels are allowed (Root -> Sub -> Sub-sub)."
                )
        return value

    def validate_slug(self, value):
        """Ensure slug is unique"""
        instance = self.instance
        if instance:
            # If updating, check if slug is unique among other categories
            if Category.objects.filter(slug=value).exclude(id=instance.id).exists():
                raise serializers.ValidationError("A category with this slug already exists.")
        else:
            # If creating, check if slug is unique
            if Category.objects.filter(slug=value).exists():
                raise serializers.ValidationError("A category with this slug already exists.")
        return value
    
    def create(self, validated_data):
        # Auto-generate slug if not provided
        if 'slug' not in validated_data or not validated_data['slug']:
            validated_data['slug'] = slugify(validated_data['name'])
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        # Auto-generate slug if name changed and slug not provided
        if 'name' in validated_data and 'slug' not in validated_data:
            validated_data['slug'] = slugify(validated_data['name'])
        return super().update(instance, validated_data)

class ProductImageWriteSerializer(serializers.ModelSerializer):
    """Writable serializer for product images"""
    
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'alt_text', 'is_feature']
        read_only_fields = ['id']

class ProductVariantWriteSerializer(serializers.ModelSerializer):
    """Writable serializer for product variants"""
    
    class Meta:
        model = ProductVariant
        fields = ['id', 'name', 'sku', 'price_override', 'stock_quantity']
        read_only_fields = ['id']
        extra_kwargs = {
            'sku': {'validators': []}
        }
    
    def validate_sku(self, value):
        """Ensure variant SKU is unique if provided"""
        if not value:
            return value
        
        instance = self.instance
        # Check if we are updating a Product (nested via ProductWriteSerializer)
        root_instance = getattr(self.root, 'instance', None)
        
        queryset = ProductVariant.objects.filter(sku=value)
        
        if instance:
            # Updating individual variant directly
            queryset = queryset.exclude(id=instance.id)
        elif root_instance and isinstance(root_instance, Product):
            # Updating product (variants are usually replaced)
            # Allow SKU if it either doesn't exist OR belongs to the product being updated
            queryset = queryset.exclude(product=root_instance)
        
        if queryset.exists():
            raise serializers.ValidationError("A variant with this SKU already exists.")
        return value

from django.db.models import ProtectedError

class ProductWriteSerializer(serializers.ModelSerializer):
    """Writable serializer for creating/updating products"""
    category_id = serializers.IntegerField(write_only=True)
    images_data = ProductImageWriteSerializer(many=True, required=False, write_only=True)
    variants_data = ProductVariantWriteSerializer(many=True, required=False, write_only=True)
    
    # Include read-only nested data in response
    category = CategorySerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description', 'details', 'base_price', 
            'discount_percentage', 'sale_price',
            'sku', 'metadata', 'is_set', 'stock_quantity', 'is_active',
            'category_id', 'category', 
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
    
    def validate_category_id(self, value):
        """Ensure category exists"""
        if not Category.objects.filter(id=value).exists():
            raise serializers.ValidationError("Category does not exist.")
        return value
    
    def validate_sku(self, value):
        """Ensure product SKU is unique"""
        instance = self.instance
        if instance:
            if Product.objects.filter(sku=value).exclude(id=instance.id).exists():
                raise serializers.ValidationError("A product with this SKU already exists.")
        else:
            if Product.objects.filter(sku=value).exists():
                raise serializers.ValidationError("A product with this SKU already exists.")
        return value
    
    def validate_discount_percentage(self, value):
        """Ensure discount percentage is between 0 and 100"""
        if value < 0 or value > 100:
            raise serializers.ValidationError("Discount percentage must be between 0 and 100.")
        return value
    
    def create(self, validated_data):
        # Extract nested data
        images_data = validated_data.pop('images_data', [])
        variants_data = validated_data.pop('variants_data', [])
        category_id = validated_data.pop('category_id')
        
        # Auto-generate slug if not provided
        if 'slug' not in validated_data or not validated_data['slug']:
            validated_data['slug'] = slugify(validated_data['name'])
        
        # Set category
        validated_data['category_id'] = category_id
        
        # Create product
        product = Product.objects.create(**validated_data)
        
        # Create images
        for image_data in images_data:
            ProductImage.objects.create(product=product, **image_data)
        
        # Create variants
        for variant_data in variants_data:
            ProductVariant.objects.create(product=product, **variant_data)
        
        return product
    
    def update(self, instance, validated_data):
        # Extract nested data
        images_data = validated_data.pop('images_data', None)
        variants_data = validated_data.pop('variants_data', None)
        category_id = validated_data.pop('category_id', None)
        
        # Auto-generate slug if name changed and slug not provided
        if 'name' in validated_data and 'slug' not in validated_data:
            validated_data['slug'] = slugify(validated_data['name'])
        
        # Update category if provided
        if category_id is not None:
            validated_data['category_id'] = category_id
        
        # Update product fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update images if provided (smart update)
        if images_data is not None:
            keep_image_ids = []
            for img_data in images_data:
                # Note: images from admin are often re-uploaded, but we can try to match by name/is_feature
                # This is less critical than variants but good for stability.
                image = ProductImage.objects.create(product=instance, **img_data)
                keep_image_ids.append(image.id)
            
            # Delete old images that weren't just created
            instance.images.exclude(id__in=keep_image_ids).delete()
        
        # Update variants if provided (smart update to avoid ProtectedError)
        if variants_data is not None:
            keep_variant_ids = []
            for variant_data in variants_data:
                sku = variant_data.get('sku')
                name = variant_data.get('name')
                
                variant = None
                if sku:
                    variant = instance.variants.filter(sku=sku).first()
                if not variant and name:
                    variant = instance.variants.filter(name=name).first()
                
                if variant:
                    for attr, value in variant_data.items():
                        setattr(variant, attr, value)
                    variant.save()
                    keep_variant_ids.append(variant.id)
                else:
                    new_variant = ProductVariant.objects.create(product=instance, **variant_data)
                    keep_variant_ids.append(new_variant.id)
            
            # Delete old variants that weren't in the update list
            to_delete = instance.variants.exclude(id__in=keep_variant_ids)
            for v in to_delete:
                try:
                    v.delete()
                except ProtectedError:
                    # Keep it if it's protected (referenced in an order)
                    pass
        
        return instance
