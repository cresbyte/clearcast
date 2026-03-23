import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function NotFound() {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />

            <main className="flex-grow flex flex-col items-center justify-center px-4 py-32 text-center">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
                    404 - Page Not Found
                </h1>
                <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
                    The page you are looking for does not exist or has been moved.
                </p>
                <Link
                    href="/shop"
                    className="inline-flex items-center justify-center px-8 py-3 bg-primary text-primary-foreground font-medium transition-all hover:opacity-90 active:scale-95"
                >
                    Continue Shopping
                </Link>
            </main>

            <Footer />
        </div>
    );
}
