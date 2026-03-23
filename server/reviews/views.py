from rest_framework import viewsets, permissions, status, response, views
from rest_framework.decorators import action
from django.db.models import Exists, OuterRef, Sum, Count
from django.contrib.auth import get_user_model
from .models import (
    Review,
    HeroSection,
    NavbarPromo,
    ContentSection,
    ShopByCatalogSection,
)
from .serializers import (
    ReviewSerializer,
    ReviewCreateSerializer,
    DashboardSerializer,
    HeroSectionSerializer,
    NavbarPromoSerializer,
    ContentSectionSerializer,
    ShopByCatalogSectionSerializer,
)
from orders.models import Order, OrderItem
from catalog.models import Product
from catalog.serializers import ProductSerializer

from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend

User = get_user_model()

class ReviewPagination(PageNumberPagination):
    page_size = 10

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all().order_by('-created_at')
    serializer_class = ReviewSerializer
    pagination_class = ReviewPagination
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['product']

    def get_permissions(self):
        if self.action in ['submit_review', 'pending_reviews']:
            return [permissions.IsAuthenticated()]
        if self.action in ['update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]

    @action(detail=False, methods=['get'])
    def pending_reviews(self, request):
        """
        Returns products from delivered orders that the user hasn't reviewed yet.
        """
        user = request.user
        
        # Get all products from delivered orders
        delivered_order_items = OrderItem.objects.filter(
            order__user=user,
            order__status='D'
        ).values_list('product_id', flat=True).distinct()
        
        # Filter products that don't have a review from this user
        products_to_review = Product.objects.filter(
            id__in=delivered_order_items
        ).exclude(
            reviews__user=user
        )
        
        serializer = ProductSerializer(products_to_review, many=True, context={'request': request})
        return response.Response(serializer.data)

    @action(detail=False, methods=['post'])
    def submit_review(self, request):
        """
        Submit a review for a purchased product.
        """
        serializer = ReviewCreateSerializer(data=request.data)
        if serializer.is_valid():
            product = serializer.validated_data['product']
            user = request.user
            
            # Check if user bought the product and it was delivered
            has_bought = OrderItem.objects.filter(
                order__user=user,
                order__status='D',
                product=product
            ).exists()
            
            if not has_bought:
                return response.Response(
                    {"detail": "You can only review products you have purchased and that have been delivered."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check if user already reviewed the product
            if Review.objects.filter(user=user, product=product).exists():
                return response.Response(
                    {"detail": "You have already reviewed this product."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            serializer.save(user=user)
            return response.Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return response.Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class HeroSectionViewSet(viewsets.ModelViewSet):
    serializer_class = HeroSectionSerializer

    def get_queryset(self):
        qs = HeroSection.objects.all()
        user = self.request.user
        # Public endpoints only see active heroes; admins see all.
        if not (user and user.is_staff):
            qs = qs.filter(is_active=True)
        return qs

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

class NavbarPromoViewSet(viewsets.ModelViewSet):
    serializer_class = NavbarPromoSerializer

    def get_queryset(self):
        qs = NavbarPromo.objects.all()
        user = self.request.user
        if not (user and user.is_staff):
            qs = qs.filter(is_active=True)
        return qs

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

class ContentSectionViewSet(viewsets.ModelViewSet):
    serializer_class = ContentSectionSerializer

    def get_queryset(self):
        qs = ContentSection.objects.all()
        user = self.request.user
        if not (user and user.is_staff):
            qs = qs.filter(is_active=True)
        return qs

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]


class ShopByCatalogSectionViewSet(viewsets.ModelViewSet):
    """
    CRUD for the 'Shop by Catalog' homepage section.
    Public consumers only see active sections; admins see all.
    """
    serializer_class = ShopByCatalogSectionSerializer

    def get_queryset(self):
        qs = ShopByCatalogSection.objects.all().prefetch_related('categories')
        user = self.request.user
        if not (user and user.is_staff):
            qs = qs.filter(is_active=True)
        return qs

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

class AdminDashboardView(views.APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        # 1. Total Revenue (Paid or Delivered orders)
        revenue_data = Order.objects.filter(
            status__in=['A', 'S', 'D'] # Paid, Shipped, Delivered
        ).aggregate(total=Sum('total_amount'))
        total_revenue = revenue_data['total'] or 0
        if total_revenue:
            total_revenue = round(total_revenue, 2)

        # 2. Orders Count
        orders_count = Order.objects.count()

        # 3. Active Products Count
        products_count = Product.objects.filter(is_active=True).count()

        # 4. Active Customers (Users with at least one order)
        # Or just total users? Let's do total users for now as "Active Customers" might be too specific
        # But 'Active Customers' usually implies those who bought something. 
        # Let's count users who are not staff.
        active_customers = User.objects.filter(is_staff=False).count()

        # 5. Recent Orders
        recent_orders_qs = Order.objects.select_related('user').order_by('-created_at')[:5]
        recent_orders_data = []
        for order in recent_orders_qs:
            recent_orders_data.append({
                'id': order.id,
                'order_id': f"ORD-{order.id}", # Frontend might expect string ID
                'customer': order.user.get_full_name() or order.user.email,
                'email': order.user.email,
                'total': order.total_amount,
                'status': order.get_status_display(),
                'status_code': order.status,
                'created_at': order.created_at,
                # Just grabbing the first product name as a summary if needed, or count
                'items_count': order.items.count()
            })

        # 6. Monthly Sales (Last 6 Months)
        from django.db.models.functions import TruncMonth
        from django.utils import timezone
        import datetime

        six_months_ago = timezone.now() - datetime.timedelta(days=180)
        monthly_sales_qs = Order.objects.filter(
            created_at__gte=six_months_ago,
            status__in=['A', 'S', 'D']
        ).annotate(
            month=TruncMonth('created_at')
        ).values('month').annotate(
            total=Sum('total_amount'),
            count=Count('id')
        ).order_by('month')

        monthly_sales_data = []
        for entry in monthly_sales_qs:
            monthly_sales_data.append({
                'name': entry['month'].strftime('%b'), # e.g. "Jan"
                'total': round(entry['total'] or 0, 2),
                'count': entry['count']
            })

        # 7. Pending Orders Count
        pending_orders_count = Order.objects.filter(status='P').count()

        # 8. Average Order Value
        if orders_count > 0:
            avg_order_value = total_revenue / orders_count
        else:
            avg_order_value = 0
        
        # Round it
        avg_order_value = round(avg_order_value, 2)

        data = {
            'total_revenue': total_revenue,
            'orders_count': orders_count,
            'products_count': products_count,
            'active_customers': active_customers,
            'recent_orders': recent_orders_data,
            'monthly_sales': monthly_sales_data,
            'pending_orders_count': pending_orders_count,
            'average_order_value': avg_order_value
        }

        serializer = DashboardSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        
        return response.Response(serializer.data)
