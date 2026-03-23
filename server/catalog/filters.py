import django_filters
from .models import Product, Category


class NumberInFilter(django_filters.BaseInFilter, django_filters.NumberFilter):
    pass


class ProductFilter(django_filters.FilterSet):
    """
    Filters for the product list endpoint.

    - `category__slug`: filter by one or more exact category slugs
    - `category_root`: filter by one or more root category IDs (comma-separated) 
      and include all of their descendant subcategories
    - `category_id`: filter by one or more specific category IDs (comma-separated)
    """

    # Accept one or more category slugs
    category__slug = django_filters.ModelMultipleChoiceFilter(
        field_name="category__slug",
        to_field_name="slug",
        queryset=Category.objects.all(),
    )

    # Filter by root category ids, including all descendants.
    category_root = NumberInFilter(method="filter_category_root")
    
    # Filter by specific category ids
    category_id = NumberInFilter(field_name="category_id", lookup_expr="in")

    # Optional: Price range filtering
    min_price = django_filters.NumberFilter(field_name="base_price", lookup_expr="gte")
    max_price = django_filters.NumberFilter(field_name="base_price", lookup_expr="lte")

    def filter_category_root(self, queryset, name, value):
        """
        Given one or more Category.ids, return products whose category is any of 
        those categories OR any of their descendant categories.
        """
        if not value:
            return queryset

        ids = set()

        def collect_ids(cat_id):
            if cat_id in ids:
                return
            ids.add(cat_id)
            # Fetch children IDs in one go to be slightly more efficient
            child_ids = Category.objects.filter(parent_id=cat_id).values_list('id', flat=True)
            for child_id in child_ids:
                collect_ids(child_id)

        for root_id in value:
            collect_ids(root_id)

        return queryset.filter(category_id__in=ids)

    class Meta:
        model = Product
        fields = ["category__slug", "category__id", "category_root", "category_id", "is_active"]
