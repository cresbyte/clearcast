from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.db import transaction
from django_filters.rest_framework import DjangoFilterBackend
from .models import FilterGroup, FilterOption, Product, ProductImage
from .serializers import (
    FilterGroupSerializer,
    FilterGroupWriteSerializer,
    FilterOptionSerializer,
    FilterOptionWriteSerializer,
    ProductSerializer,
    ProductWriteSerializer,
    ProductImageSerializer,
    ProductImageWriteSerializer,
)
from .permissions import IsStaffOrReadOnly
from .filters import ProductFilter


class FilterGroupViewSet(viewsets.ModelViewSet):
    """
    ViewSet for FilterGroups.
    """
    queryset = FilterGroup.objects.all()
    serializer_class = FilterGroupSerializer
    permission_classes = [IsStaffOrReadOnly]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "description"]
    ordering_fields = ["name"]
    ordering = ["name"]
    lookup_field = "slug"
    pagination_class = None

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return FilterGroupWriteSerializer
        return FilterGroupSerializer


class FilterOptionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for FilterOptions.
    """
    queryset = FilterOption.objects.select_related('group')
    serializer_class = FilterOptionSerializer
    permission_classes = [IsStaffOrReadOnly]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["group__slug", "group_id"]
    search_fields = ["name"]
    ordering_fields = ["name", "group__name"]
    ordering = ["group__name", "name"]
    lookup_field = "slug"
    pagination_class = None

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return FilterOptionWriteSerializer
        return FilterOptionSerializer


class ProductViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Products with full CRUD operations.
    - List and retrieve are public (only active products for non-staff)
    - Create, update, delete require staff permissions
    """

    queryset = Product.objects.prefetch_related(
        "images", "variants", "filters"
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
        queryset = Product.objects.prefetch_related(
            "images", "variants", "filters"
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
