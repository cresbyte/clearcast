from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from .models import Order

def send_order_confirmation_email(order_id):
    """
    Sends a summary of the order when it's paid.
    """
    try:
        order = Order.objects.get(pk=order_id)
        subject = f"Order Confirmation - #{order.id}"
        html_message = render_to_string("order_confirmation.html", {"order": order})
        plain_message = strip_tags(html_message)
        from_email = getattr(settings, "EMAIL_HOST_USER", "noreply@gucci.com")
        
        send_mail(
            subject,
            plain_message,
            from_email,
            [order.email],
            html_message=html_message,
            fail_silently=False,
        )
        return True
    except Order.DoesNotExist:
        return False

def send_order_status_update_email(order_id):
    """
    Sends an email when the order status changes (Shipped, Delivered, Cancelled).
    """
    try:
        order = Order.objects.get(pk=order_id)
        status_display = order.get_status_display()
        subject = f"Order Update - #{order.id}: {status_display}"
        html_message = render_to_string("order_status_update_email.html", {"order": order})
        plain_message = strip_tags(html_message)
        from_email = getattr(settings, "EMAIL_HOST_USER", "noreply@gucci.com")

        send_mail(
            subject,
            plain_message,
            from_email,
            [order.email],
            html_message=html_message,
            fail_silently=False,
        )
        return True
    except Order.DoesNotExist:
        return False

def send_product_rating_request_email(order_id):
    """
    Sends an email asking the user to rate the products they bought.
    """
    try:
        order = Order.objects.get(pk=order_id)
        subject = f"Rate your recent purchase from Gucci - #{order.id}"
        html_message = render_to_string("product_rating_request_email.html", {"order": order})
        plain_message = strip_tags(html_message)
        from_email = getattr(settings, "EMAIL_HOST_USER", "noreply@gucci.com")

        send_mail(
            subject,
            plain_message,
            from_email,
            [order.email],
            html_message=html_message,
            fail_silently=False,
        )
        return True
    except Order.DoesNotExist:
        return False
