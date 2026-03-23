from django.db import models
from django.utils.text import slugify

class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True, help_text="Used for the URL")
    parent = models.ForeignKey(
        'self', on_delete=models.CASCADE, null=True, blank=True, related_name='children'
    )
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='categories/%Y/%m/%d/', null=True, blank=True)

    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name

class Product(models.Model):
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='products')
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    details = models.TextField(blank=True, null=True)
    
    # Use Decimal for money! Never float.
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Discount fields
    discount_percentage = models.DecimalField(
        max_digits=5, decimal_places=2, 
        default=0, 
        help_text="Discount percentage (0-100)"
    )
    sale_price = models.DecimalField(
        max_digits=10, decimal_places=2, 
        null=True, blank=True,
        help_text="Calculated sale price after discount"
    )
    
    sku = models.CharField(max_length=50, unique=True, verbose_name="Stock Keeping Unit")
    
    # JSONField allows you to store specific specs (e.g., 'hook_size' for flies) 
    # without needing a thousand different tables.
    metadata = models.JSONField(default=dict, blank=True)
    
    stock_quantity = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        """Auto-calculate sale_price based on discount_percentage"""
        if self.discount_percentage and self.discount_percentage > 0:
            discount_amount = (self.base_price * self.discount_percentage) / 100
            self.sale_price = self.base_price - discount_amount
        else:
            self.sale_price = None
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name





class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='products/%Y/%m/%d/')
    alt_text = models.CharField(max_length=255, blank=True)
    is_feature = models.BooleanField(default=False) # The main photo


class ProductVariant(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    name = models.CharField(max_length=255) # e.g. "XL / Red"
    sku = models.CharField(max_length=50, unique=True, blank=True, null=True)
    price_override = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    stock_quantity = models.PositiveIntegerField(default=0)
    
    @property
    def price(self):
        """Return price_override if set, otherwise product.base_price"""
        return self.price_override if self.price_override is not None else self.product.base_price

    @property
    def current_price(self):
        """Return price after applying product discount"""
        base = self.price
        if self.product.discount_percentage and self.product.discount_percentage > 0:
            discount_amount = (base * self.product.discount_percentage) / 100
            return base - discount_amount
        return base

    def save(self, *args, **kwargs):
        """Autogenerate SKU if empty"""
        if not self.sku and self.product.sku:
            # Generate SKU: PRODUCTSKU-OPTION1-OPTION2
            variant_slug = slugify(self.name).upper()
            self.sku = f"{self.product.sku}-{variant_slug}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.product.name} - {self.name}"
