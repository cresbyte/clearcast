from django.db import models
from django.conf import settings
from catalog.models import Product, Category

class Review(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    rating = models.PositiveIntegerField(default=5) # You could enforce 1-5 validation
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'product') # One review per product per user

    def __str__(self):
        return f"Review by {self.user} on {self.product}"

class HeroSection(models.Model):
    title = models.CharField(max_length=255)
    subtitle = models.TextField()
    image = models.ImageField(upload_to='hero/')
    button_text = models.CharField(max_length=50, default="Shop Now")
    button_link = models.CharField(max_length=255, default="/shop")
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.title

class NavbarPromo(models.Model):
    text = models.CharField(max_length=255)
    link = models.CharField(max_length=255, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.text

class ContentSection(models.Model):
    SECTION_TYPES = (
        ('banner', 'Banner Section'),
        ('featured', 'Featured Collection (Dynamic)'),
    )
    title = models.CharField(max_length=255)
    subtitle = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='sections/', blank=True, null=True)
    section_type = models.CharField(max_length=20, choices=SECTION_TYPES, default='banner')
    button_text = models.CharField(max_length=50, blank=True)
    button_link = models.CharField(max_length=255, blank=True)
    badge_text = models.CharField(max_length=50, blank=True) # e.g. "Limited Edition"
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.title


class ShopByCatalogSection(models.Model):
    """
    Configurable section for the homepage that lets admins pick
    specific catalog categories to highlight as "collections".
    """
    title = models.CharField(max_length=255, default="Shop by Collection")
    subtitle = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)
    categories = models.ManyToManyField(
        Category,
        related_name='shop_by_catalog_sections',
        blank=True,
    )

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.title
