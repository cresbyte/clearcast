from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.db import transaction
from django_filters.rest_framework import DjangoFilterBackend
from .models import Category, Product, ProductImage
from .serializers import (
    CategorySerializer,
    CategoryWriteSerializer,
    ProductSerializer,
    ProductWriteSerializer,
    ProductImageSerializer,
    ProductImageWriteSerializer,
)
from .permissions import IsStaffOrReadOnly
from .filters import ProductFilter


class CategoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Categories with full CRUD operations.
    - List and retrieve are public
    - Create, update, delete require staff permissions
    """

    queryset = Category.objects.all()
    serializer_class = CategorySerializer  # Default serializer
    permission_classes = [IsStaffOrReadOnly]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "description"]
    ordering_fields = ["name", "created_at"]
    ordering = ["name"]
    lookup_field = "slug"
    pagination_class = None

    def get_serializer_class(self):
        """Use write serializer for create/update, read serializer otherwise"""
        if self.action in ["create", "update", "partial_update"]:
            return CategoryWriteSerializer
        return CategorySerializer

    def get_serializer_context(self):
        """Add request to serializer context for building absolute URLs"""
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

    def get_queryset(self):
        """Return categories with parent=None for root categories, or all if ?all=true"""
        queryset = Category.objects.all()

        # Filter by parent categories if not requesting all
        show_all = self.request.query_params.get("all", "false").lower() == "true"
        if not show_all and self.action == "list":
            queryset = queryset.filter(parent=None)

        return queryset


class ProductViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Products with full CRUD operations.
    - List and retrieve are public (only active products for non-staff)
    - Create, update, delete require staff permissions
    """

    queryset = Product.objects.select_related("category").prefetch_related(
        "images", "variants"
    )
    serializer_class = ProductSerializer  # Default serializer
    permission_classes = [IsStaffOrReadOnly]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_class = ProductFilter
    search_fields = ["name", "description", "sku"]
    ordering_fields = ["base_price", "created_at", "name"]
    ordering = ["-created_at"]
    lookup_field = "slug"

    def get_queryset(self):
        """
        Return all products for staff users, only active products for others.
        Always prefetch related data for performance.
        """
        queryset = Product.objects.select_related("category").prefetch_related(
            "images", "variants"
        )

        # Show all products to staff, only active to others
        if not (self.request.user and self.request.user.is_staff):
            queryset = queryset.filter(is_active=True)

        return queryset

    def get_serializer_class(self):
        """Use write serializer for create/update, read serializer otherwise"""
        if self.action in ["create", "update", "partial_update"]:
            return ProductWriteSerializer
        return ProductSerializer

    def get_serializer_context(self):
        """Add request to serializer context for building absolute URLs"""
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

    def perform_destroy(self, instance):
        """
        Soft delete: set is_active to False instead of deleting.
        Staff can still hard delete by passing ?hard=true
        """
        hard_delete = self.request.query_params.get("hard", "false").lower() == "true"

        if hard_delete and self.request.user.is_staff:
            instance.delete()
        else:
            instance.is_active = False
            instance.save()

    @action(detail=True, methods=["post"], permission_classes=[IsStaffOrReadOnly])
    def restore(self, request, slug=None):
        """Restore a soft-deleted product"""
        product = self.get_object()
        product.is_active = True
        product.save()
        serializer = self.get_serializer(product)
        return Response(serializer.data)

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[IsStaffOrReadOnly],
        parser_classes=[MultiPartParser, FormParser],
    )
    def upload_images(self, request, slug=None):
        """Upload images for a product"""
        product = self.get_object()

        # Get uploaded files
        files = request.FILES.getlist("images")
        if not files:
            return Response(
                {"error": "No images provided"}, status=status.HTTP_400_BAD_REQUEST
            )

        # Optional: Clear existing images if replace=true
        if request.data.get("replace", "false").lower() == "true":
            product.images.all().delete()

        created_images = []
        with transaction.atomic():
            for index, file in enumerate(files):
                # Get optional metadata
                alt_text = request.data.get(f"alt_text_{index}", product.name)
                is_feature = (
                    request.data.get(f"is_feature_{index}", "false").lower() == "true"
                )

                # If this is marked as feature, unmark others
                if is_feature:
                    product.images.update(is_feature=False)

                # Create image
                image = ProductImage.objects.create(
                    product=product,
                    image=file,
                    alt_text=alt_text,
                    is_feature=is_feature
                    or (index == 0 and product.images.count() == 0),
                )
                created_images.append(image)

        # Serialize and return
        serializer = ProductImageSerializer(
            created_images, many=True, context={"request": request}
        )
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ProductImageViewSet(viewsets.ModelViewSet):
    """
    ViewSet for ProductImages.
    Primarily used for deleting specific images.
    """

    queryset = ProductImage.objects.all()
    serializer_class = ProductImageWriteSerializer
    permission_classes = [IsStaffOrReadOnly]
    http_method_names = ["delete"]
