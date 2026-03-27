from django.core.mail import get_connection
from django.conf import settings
from .models import EmailConfiguration

def get_email_connection():
    """
    Returns a Django email connection based on the active EmailConfiguration in the DB.
    Falls back to settings.py if no active configuration exists.
    """
    config = EmailConfiguration.objects.filter(is_active=True).first()
    
    if config:
        return get_connection(
            backend=config.email_backend,
            host=config.email_host,
            port=config.email_port,
            username=config.email_host_user,
            password=config.email_host_password,
            use_tls=config.email_use_tls,
            use_ssl=config.email_use_ssl,
        )
    
    # Fallback to default connection
    return get_connection()

def get_default_from_email():
    """
    Returns the default sender email from DB or settings.py.
    """
    config = EmailConfiguration.objects.filter(is_active=True).first()
    if config and config.default_from_email:
        return config.default_from_email
    return getattr(settings, "DEFAULT_FROM_EMAIL", "noreply@example.com")

def get_notify_email():
    """
    Returns the administrative notification email from DB or settings.py.
    """
    config = EmailConfiguration.objects.filter(is_active=True).first()
    if config and config.notify_email:
        return config.notify_email
    return getattr(settings, "NOTIFY_EMAIL", get_default_from_email())
