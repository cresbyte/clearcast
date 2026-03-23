from django.contrib import admin

from wishlists.models import Wishlist, WishlistItem

admin.site.register(Wishlist)
admin.site.register(WishlistItem)
