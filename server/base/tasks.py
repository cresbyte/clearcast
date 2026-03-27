from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.contrib.auth import get_user_model
from .utils import get_email_connection, get_default_from_email, get_notify_email

User = get_user_model()

def send_welcome_email(user_id):
    """
    Sends a welcome email to a new user.
    """
    try:
        user = User.objects.get(pk=user_id)
        subject = "Welcome to Clearcast!"
        html_message = render_to_string("welcome_email.html", {"user": user})
        plain_message = strip_tags(html_message)
        from_email = get_default_from_email()
        connection = get_email_connection()
        
        try:
            send_mail(
                subject,
                plain_message,
                from_email,
                [user.email],
                html_message=html_message,
                fail_silently=False,
                connection=connection,
            )
        except Exception as e:
            print(f"SMTP Error in welcome email: {e}")
            return False
        return True
    except User.DoesNotExist:
        return False

def send_password_reset_email(user_id, reset_link):
    """
    Sends a password reset link to the user.
    """
    try:
        user = User.objects.get(pk=user_id)
        subject = "Password Reset Request"
        html_message = render_to_string(
            "password_reset_email.html", {"user": user, "reset_link": reset_link}
        )
        plain_message = strip_tags(html_message)
        from_email = get_default_from_email()
        connection = get_email_connection()

        try:
            send_mail(
                subject,
                plain_message,
                from_email,
                [user.email],
                html_message=html_message,
                fail_silently=False,
                connection=connection,
            )
        except Exception as e:
            print(f"SMTP Error in password reset: {e}")
            return False
        return True
    except User.DoesNotExist:
        return False

def send_password_reset_success_email(user_id):
    """
    Sends a confirmation email after a successful password reset.
    """
    try:
        user = User.objects.get(pk=user_id)
        subject = "Password Reset Successful"
        html_message = render_to_string("password_reset_success_email.html", {"user": user})
        plain_message = strip_tags(html_message)
        from_email = get_default_from_email()
        connection = get_email_connection()

        try:
            send_mail(
                subject,
                plain_message,
                from_email,
                [user.email],
                html_message=html_message,
                fail_silently=False,
                connection=connection,
            )
        except Exception as e:
            print(f"SMTP Error in password reset success: {e}")
            return False
        return True
    except User.DoesNotExist:
        return False

def send_contact_notification_email(contact_id):
    """
    Sends a notification email to support when a new contact message is received.
    """
    try:
        from .models import ContactMessage
        contact = ContactMessage.objects.get(pk=contact_id)
        subject = f"New Contact Message: {contact.subject}"

        recipient_list = [get_notify_email()]
        
        html_message = render_to_string("contact_notification_email.html", {"contact": contact})
        plain_message = strip_tags(html_message)
        from_email = get_default_from_email()
        connection = get_email_connection()

        try:
            send_mail(
                subject,
                plain_message,
                from_email,
                recipient_list,
                html_message=html_message,
                fail_silently=False,
                connection=connection,
            )
        except Exception as e:
            print(f"SMTP Error in contact notification: {e}")
            return False
        return True
    except ContactMessage.DoesNotExist:
        return False

def send_custom_order_email(order_id, stage):
    """
    Sends an email to the customer regarding their custom order status.
    """
    try:
        from .models import CustomOrder
        order = CustomOrder.objects.get(pk=order_id)
        
        email = None
        name = order.customer_details.get("name", "Valued Customer")
        if order.customer:
            email = order.customer.email
            if order.customer.first_name:
                name = order.customer.first_name
        else:
            email = order.customer_details.get("email")

        if not email:
            return False

        subject = ""
        template = ""
        
        if stage == "ORDER_CREATED":
            subject = "Your Custom Order has been received - Clearcast Fly Ltd"
            template = "custom_order_created_email.html"
        elif stage == "PAYMENT_RECEIVED":
            subject = "Payment Received for Your Custom Order - Clearcast Fly Ltd"
            template = "custom_order_paid_email.html"
        elif stage == "ORDER_SHIPPED":
            subject = "Your Custom Order has Shipped - Clearcast Fly Ltd"
            template = "custom_order_shipped_email.html"
        elif stage == "ORDER_DELIVERED":
            subject = "Your Custom Order has been Delivered - Clearcast Fly Ltd"
            template = "custom_order_delivered_email.html"
        else:
            return False

        html_message = render_to_string(template, {"order": order, "name": name})
        plain_message = strip_tags(html_message)
        from_email = get_default_from_email()
        connection = get_email_connection()

        try:
            send_mail(
                subject,
                plain_message,
                from_email,
                [email],
                html_message=html_message,
                fail_silently=False,
                connection=connection,
            )
        except Exception as e:
            print(f"SMTP Error in custom order email: {e}")
            return False
        return True
    except CustomOrder.DoesNotExist:
        return False
