from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)

router = DefaultRouter()
router.register(r"admin/customers", views.AdminUserViewSet, basename="admin-users")
router.register(r"admin/staff", views.AdminStaffViewSet, basename="admin-staff")
router.register(r"contact-messages", views.ContactMessageViewSet, basename="contact-messages")
router.register(r"admin/custom-orders", views.CustomOrderViewSet, basename="admin-custom-orders")

urlpatterns = [
    path('login/', views.MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('register/', views.RegisterView.as_view(), name='register'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('password-reset/', views.PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('password-reset-confirm/', views.PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('profile/', views.UserProfileView.as_view(), name='user_profile'),
    path('change-password/', views.ChangePasswordView.as_view(), name='change_password'),
    path('addresses/', views.AddressListCreateView.as_view(), name='address_list_create'),
    path('addresses/<int:pk>/', views.AddressDetailView.as_view(), name='address_detail'),
    path('', include(router.urls)),
]
