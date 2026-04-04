"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function ShopLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const pathname = usePathname();
    const isHome = pathname === "/";
    const isCheckout = pathname === "/checkout";

    return (
        <>
 <Navbar />

            <main className={cn(
                "flex-grow min-h-screen",
                !isHome && "pt-14 md:pt-16"
            )}>
                {children}
            </main>
            {!isCheckout && <Footer />}
        </>
    );
}
