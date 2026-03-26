from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from base.models import User, Address, ContactMessage


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ["id", "name", "email", "phone_number", "subject", "message", "attachment", "created_at"]
        read_only_fields = ["id", "created_at"]


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = "__all__"


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token["name"] = user.first_name + " " + user.last_name
        token["first_name"] = user.first_name
        token["last_name"] = user.last_name
        token["email"] = user.email
        token["phone_number"] = user.phone_number
        token["is_staff"] = user.is_staff
        token["is_superuser"] = user.is_superuser

        if user.is_superuser:
            token["role"] = "ADMIN"
        elif user.is_staff:
            token["role"] = "STAFF"
        else:
            token["role"] = "CUSTOMER"

        return token


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["first_name", "last_name", "email", "password"]

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"],
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
        )
        return user


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["first_name", "last_name", "email", "phone_number"]




class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    confirm_password = serializers.CharField(required=True)

    def validate(self, attrs):
        if attrs["new_password"] != attrs["confirm_password"]:
            raise serializers.ValidationError(
                {"new_password": "Password fields didn't match."}
            )

        # Validate password complexity
        # We need the user instance for some validators (e.g. UserAttributeSimilarityValidator)
        user = self.context["request"].user
        try:
            validate_password(attrs["new_password"], user=user)
        except Exception as e:
            raise serializers.ValidationError({"new_password": list(e.messages)})

        return attrs


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = "__all__"
        read_only_fields = ["user"]


class AdminCustomerSerializer(serializers.ModelSerializer):
    orders_count = serializers.IntegerField(read_only=True)
    total_spent = serializers.DecimalField(
        max_digits=10, decimal_places=2, read_only=True
    )
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "full_name",
            "phone_number",
            "orders_count",
            "total_spent",
            "is_active",
            "created_at",
        ]

    def get_full_name(self, obj):
        names = [n for n in [obj.first_name, obj.last_name] if n]
        return " ".join(names).strip() or obj.email


class AdminStaffSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()

    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "full_name",
            "phone_number",
            "is_staff",
            "is_superuser",
            "is_active",
            "created_at",
            "role",
            "password",
        ]

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        user = super().create(validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        user = super().update(instance, validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

    def get_full_name(self, obj):
        names = [n for n in [obj.first_name, obj.last_name] if n]
        return " ".join(names).strip() or obj.email

    def get_role(self, obj):
        if obj.is_superuser:
            return "Admin"
        if obj.is_staff:
            return "Staff"
        return "Customer"
