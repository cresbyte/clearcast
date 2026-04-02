import django_filters
from .models import Product, FilterOption


class NumberInFilter(django_filters.BaseInFilter, django_filters.NumberFilter):
    pass


class ProductFilter(django_filters.FilterSet):
    """
    Filters for the product list endpoint.

    - `filters__slug`: filter by one or more exact filter option slugs
    - `filters__id`: filter by one or more specific filter option IDs (comma-separated)
    """

    # Accept one or more filter option slugs
    filters__slug = django_filters.ModelMultipleChoiceFilter(
        field_name="filters__slug",
        to_field_name="slug",
        queryset=FilterOption.objects.all(),
    )
    
    # Filter by specific filter ids
    filters_id = NumberInFilter(field_name="filters__id", lookup_expr="in")
    
    is_set = django_filters.BooleanFilter()

    # Optional: Price range filtering
    min_price = django_filters.NumberFilter(field_name="base_price", lookup_expr="gte")
    max_price = django_filters.NumberFilter(field_name="base_price", lookup_expr="lte")

    class Meta:
        model = Product
        fields = ["filters__slug", "filters_id", "is_active", "is_set"]
