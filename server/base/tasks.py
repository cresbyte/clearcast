from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from django.contrib.auth import get_user_model

User = get_user_model()

def send_welcome_email(user_id):
    """
    Sends a welcome email to a new user.
    """
    try:
        user = User.objects.get(pk=user_id)
        subject = "Welcome to Gucci!"
        html_message = render_to_string("welcome_email.html", {"user": user})
        plain_message = strip_tags(html_message)
        from_email = getattr(settings, "EMAIL_HOST_USER", "noreply@gucci.com")
        
        send_mail(
            subject,
            plain_message,
            from_email,
            [user.email],
            html_message=html_message,
            fail_silently=False,
        )
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
        from_email = getattr(settings, "EMAIL_HOST_USER", "noreply@gucci.com")

        send_mail(
            subject,
            plain_message,
            from_email,
            [user.email],
            html_message=html_message,
            fail_silently=False,
        )
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
        from_email = getattr(settings, "EMAIL_HOST_USER", "noreply@gucci.com")

        send_mail(
            subject,
            plain_message,
            from_email,
            [user.email],
            html_message=html_message,
            fail_silently=False,
        )
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

        recipient_list = [getattr(settings, "SUPPORT_EMAIL", settings.DEFAULT_FROM_EMAIL)]
        
        html_message = render_to_string("contact_notification_email.html", {"contact": contact})
        plain_message = strip_tags(html_message)
        from_email = getattr(settings, "EMAIL_HOST_USER", "noreply@gucci.com")

        send_mail(
            subject,
            plain_message,
            from_email,
            recipient_list,
            html_message=html_message,
            fail_silently=False,
        )
        return True
    except ContactMessage.DoesNotExist:
        return False
