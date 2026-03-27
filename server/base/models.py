from django.contrib.auth.models import AbstractUser
from django.conf import settings
from django.db import models
from django.contrib.auth.base_user import BaseUserManager


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError("Email must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)
        extra_fields.setdefault("is_verified", True)

        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    username = None
    email = models.EmailField("email address", unique=True)

    is_verified = models.BooleanField(default=False)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)


    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

    def __str__(self):
        return self.email


class Address(models.Model):
    ADDRESS_TYPES = (("B", "Billing"), ("S", "Shipping"))

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    address_type = models.CharField(max_length=1, choices=ADDRESS_TYPES)
    default = models.BooleanField(default=False)

    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    street_line1 = models.CharField(max_length=255)
    street_line2 = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100)
    state_province = models.CharField(max_length=255)
    postal_code = models.CharField(max_length=20)
    country = models.CharField(max_length=55)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class ContactMessage(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField()
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    subject = models.CharField(max_length=255)
    message = models.TextField()
    attachment = models.FileField(upload_to="contact_attachments/", blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message from {self.name} - {self.subject}"


class CustomOrder(models.Model):
    STATUS_CHOICES = (
        ("Pending", "Pending"),
        ("Processing", "Processing"),
        ("Shipped", "Shipped"),
        ("Delivered", "Delivered"),
        ("Canceled", "Canceled"),
    )

    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    customer_details = models.JSONField(help_text="JSON containing name, email, phone, etc.", default=dict)
    items = models.JSONField(help_text="JSON array of ordered items", default=list)
    transaction_details = models.JSONField(help_text="JSON containing payment info, receipts, etc.", blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Pending")
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"CustomOrder #{self.pk} - {self.status}"

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        old_status = None
        old_balance = None

        if not is_new:
            try:
                old_instance = CustomOrder.objects.get(pk=self.pk)
                old_status = old_instance.status
                old_balance = old_instance.balance
            except CustomOrder.DoesNotExist:
                pass

        # Autocreate user if needed
        if not self.customer and self.customer_details:
            email = self.customer_details.get("email")
            if email:
                user = User.objects.filter(email=email).first()
                if not user:
                    user = User.objects.create_user(email=email, password=User.objects.make_random_password())
                    name = self.customer_details.get("name", "")
                    if name:
                        parts = name.split(" ", 1)
                        user.first_name = parts[0]
                        if len(parts) > 1:
                            user.last_name = parts[1]
                        user.save()
                self.customer = user

        super().save(*args, **kwargs)

        # Trigger emails
        from .tasks import send_custom_order_email

        if is_new:
            send_custom_order_email(self.pk, "ORDER_CREATED")
        else:
            if old_status != self.status and self.status in ["Shipped", "Delivered"]:
                stage = "ORDER_SHIPPED" if self.status == "Shipped" else "ORDER_DELIVERED"
                send_custom_order_email(self.pk, stage)
                
            if old_balance is not None and old_balance > 0 and self.balance <= 0:
                send_custom_order_email(self.pk, "PAYMENT_RECEIVED")


class EmailConfiguration(models.Model):
    """
    Stores SMTP and general email configuration.
    Using a singleton-like pattern where the 'active' one is used.
    """
    email_backend = models.CharField(max_length=255, default='django.core.mail.backends.smtp.EmailBackend')
    email_host = models.CharField(max_length=255, default='smtp.example.com')
    email_port = models.IntegerField(default=587)
    email_use_tls = models.BooleanField(default=True)
    email_use_ssl = models.BooleanField(default=False)
    email_host_user = models.CharField(max_length=255, blank=True)
    email_host_password = models.CharField(max_length=255, blank=True)
    default_from_email = models.CharField(max_length=255, default='noreply@example.com')
    notify_email = models.CharField(max_length=255, blank=True, null=True, help_text="Email for administrative notifications")

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if self.is_active:
            # Mark all others as inactive if this one is active
            EmailConfiguration.objects.filter(is_active=True).exclude(pk=self.pk).update(is_active=False)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Email Config ({self.email_host_user}) - {'Active' if self.is_active else 'Inactive'}"
