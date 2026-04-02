from django.contrib import admin

from catalog.models import FilterGroup, FilterOption, Product, ProductImage, ProductVariant

admin.site.register(FilterGroup)
admin.site.register(FilterOption)
admin.site.register(Product)
admin.site.register(ProductImage)
admin.site.register(ProductVariant)
