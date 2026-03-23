from django.contrib import admin

from orders.models import Coupon, Order, Transaction, OrderItem, Cart, CartItem, PaymentGateway

admin.site.register(Coupon)
admin.site.register(Order)
admin.site.register(Transaction)
admin.site.register(OrderItem)
admin.site.register(Cart)
admin.site.register(CartItem)
