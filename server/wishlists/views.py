from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Wishlist, WishlistItem
from .serializers import WishlistSerializer, WishlistItemSerializer

class WishlistViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = WishlistSerializer

    def get_queryset(self):
        return Wishlist.objects.filter(user=self.request.user)

    def list(self, request, *args, **kwargs):
        # Ensure user has a wishlist
        wishlist, created = Wishlist.objects.get_or_create(user=request.user)
        serializer = self.get_serializer(wishlist)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='add')
    def add_item(self, request):
        wishlist, _ = Wishlist.objects.get_or_create(user=request.user)
        product_id = request.data.get('product_id')
        
        if not product_id:
            return Response({'error': 'Product ID is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Check if item exists
        if WishlistItem.objects.filter(wishlist=wishlist, product_id=product_id).exists():
            return Response({'message': 'Item already in wishlist'}, status=status.HTTP_200_OK)
            
        serializer = WishlistItemSerializer(data={'product_id': product_id})
        serializer.is_valid(raise_exception=True)
        serializer.save(wishlist=wishlist)
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'], url_path='remove')
    def remove_item(self, request):
        wishlist, _ = Wishlist.objects.get_or_create(user=request.user)
        product_id = request.data.get('product_id')
        
        if not product_id:
            return Response({'error': 'Product ID is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        deleted_count, _ = WishlistItem.objects.filter(wishlist=wishlist, product_id=product_id).delete()
        
        if deleted_count:
            return Response({'message': 'Item removed'}, status=status.HTTP_200_OK)
        return Response({'message': 'Item not found in wishlist'}, status=status.HTTP_404_NOT_FOUND)
