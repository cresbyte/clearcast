import ProductForm from "@/components/admin/ProductForm";
import RouteGuard from "@/components/RouteGuard";

export default function EditProductPage() {
    return (
        <RouteGuard requireAdmin>
            <ProductForm />
        </RouteGuard>
    );
}
