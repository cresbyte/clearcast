from django.shortcuts import render
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.core.mail import send_mail
from django.conf import settings
from rest_framework import generics, status, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from django.db.models import Count, Sum


from .serializers import (
    MyTokenObtainPairSerializer,
    UserRegistrationSerializer,
    UserProfileUpdateSerializer,
    ChangePasswordSerializer,
    UserSerializer,
    AdminCustomerSerializer,
    AdminStaffSerializer,
    ContactMessageSerializer,
)
from base import serializers, models
from .models import ContactMessage

User = get_user_model()


class ContactMessageViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Contact Messages.
    - Create is public.
    - List, Retrieve, Destroy are staff only.
    """

    queryset = ContactMessage.objects.all().order_by("-created_at")
    serializer_class = ContactMessageSerializer

    def get_permissions(self):
        if self.action == "create":
            return [AllowAny()]
        return [IsAdminUser()]

    def perform_create(self, serializer):
        contact = serializer.save()
        from .tasks import send_contact_notification_email

        send_contact_notification_email(contact.id)


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        user = serializer.save()
        from .tasks import send_welcome_email

        send_welcome_email(user.id)


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


class UserProfileView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserProfileUpdateSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email", "")
        try:
            user = User.objects.get(email=email)
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))

            # In a real app, this URL should point to the frontend
            reset_link = (
                f"http://localhost:3000/auth/reset-password?uid={uid}&token={token}"
            )

            from .tasks import send_password_reset_email

            send_password_reset_email(user.id, reset_link)

            return Response(
                {"message": "Password reset email sent"}, status=status.HTTP_200_OK
            )
        except User.DoesNotExist:
            return Response(
                {"message": "Password reset email sent"}, status=status.HTTP_200_OK
            )


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        uid = request.data.get("uid")
        token = request.data.get("token")
        password = request.data.get("password")

        if not uid or not token or not password:
            return Response(
                {"error": "Missing data"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            uid_decoded = urlsafe_base64_decode(uid).decode()
            user = User.objects.get(pk=uid_decoded)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response(
                {"error": "Invalid link"}, status=status.HTTP_400_BAD_REQUEST
            )

        if default_token_generator.check_token(user, token):
            user.set_password(password)
            user.save()

            from .tasks import send_password_reset_success_email

            send_password_reset_success_email(user.id)

            return Response(
                {"message": "Password reset successful"}, status=status.HTTP_200_OK
            )
        else:
            return Response(
                {"error": "Invalid or expired token"},
                status=status.HTTP_400_BAD_REQUEST,
            )


class ChangePasswordView(generics.UpdateAPIView):
    serializer_class = ChangePasswordSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        self.object = self.get_object()
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            # Check old password
            if not self.object.check_password(serializer.data.get("old_password")):
                return Response(
                    {"old_password": ["Wrong password."]},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # set_password also hashes the password that the user will get
            self.object.set_password(serializer.data.get("new_password"))
            self.object.save()
            return Response(
                {"message": "Password updated successfully"}, status=status.HTTP_200_OK
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AddressListCreateView(generics.ListCreateAPIView):
    serializer_class = serializers.AddressSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        if self.request.user.is_staff:
            user_id = self.request.query_params.get("user_id")
            if user_id:
                return models.Address.objects.filter(user_id=user_id)
            return models.Address.objects.all()
        return models.Address.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        user = self.request.user
        if serializer.validated_data.get("default", False):
            models.Address.objects.filter(user=user, default=True).update(default=False)
        serializer.save(user=user)


class AddressDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = serializers.AddressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return models.Address.objects.filter(user=self.request.user)

    def perform_update(self, serializer):
        user = self.request.user
        if serializer.validated_data.get("default", False):
            models.Address.objects.filter(user=user, default=True).exclude(
                pk=self.get_object().pk
            ).update(default=False)
        serializer.save(user=user)


class AdminUserViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for admin to manage/view customers"""

    queryset = User.objects.all()
    serializer_class = AdminCustomerSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        return (
            User.objects.annotate(
                orders_count=Count("orders"), total_spent=Sum("orders__total_amount")
            )
            .order_by("-created_at")
            .filter(is_staff=False)
        )


class AdminStaffViewSet(viewsets.ModelViewSet):
    """ViewSet for admin to manage/view staff members"""

    queryset = User.objects.filter(is_staff=True).order_by("-created_at")
    serializer_class = AdminStaffSerializer
    permission_classes = [IsAdminUser]
