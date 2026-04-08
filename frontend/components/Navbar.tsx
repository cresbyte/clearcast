"use client";

import { useNavbarPromos } from "@/api/contentApi";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import useCartStore from "@/hooks/useCartStore";
import useUIStore from "@/hooks/useUIStore";
import useWishlistStore from "@/hooks/useWishlistStore";
import { cn } from "@/lib/utils";
import {
  Heart,
  LogOut,
  Menu,
  Package,
  Search,
  Settings,
  ShieldUser,
  ShoppingCart,
  User,
  X
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, logout } = useAuth();

  const cartItemCount = useCartStore((state) => state.items.length);
  const wishlistCount = useWishlistStore((state) => state.getCount());
  const setUISearchQuery = useUIStore((state) => state.setSearchQuery);

  const { data: promosData } = useNavbarPromos();
  const promos = promosData?.results || promosData || [];
  const activePromo = promos.length > 0 ? promos[0] : null;

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Handle scroll to hide/show top bar
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 10);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close search on escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsSearchOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  // Check if current path is active
  const isActive = (path: string) => pathname === path;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setUISearchQuery(searchQuery);
      router.push("/fly-bars");
      setIsSearchOpen(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setUISearchQuery("");
  };

  const isHome = pathname === "/";
  const showTransparent = isHome && !isScrolled && !isMenuOpen && !isSearchOpen;

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
      showTransparent
        ? "bg-transparent border-transparent"
        : "bg-primary border-b border-white/10 shadow-lg shadow-black/10"
    )}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Bar - Elegant & Minimal */}
        {activePromo && (
          <div
            className={cn(
              "hidden lg:block border-b transition-all duration-500 ease-in-out overflow-hidden",
              showTransparent ? "border-white/10" : "border-border/30",
              isScrolled ? "h-0 opacity-0" : "h-9 opacity-100"
            )}
          >
            <div className={cn(
              "flex items-center justify-center h-full text-[10px] uppercase tracking-[0.2em] font-medium",
              showTransparent ? "text-white/70" : "text-white/80"
            )}>
              {activePromo.link ? (
                <Link
                  href={activePromo.link}
                  className={cn("transition-colors", showTransparent ? "hover:text-white" : "hover:text-secondary")}
                >
                  {activePromo.text}
                </Link>
              ) : (
                <span>{activePromo.text}</span>
              )}
            </div>
          </div>
        )}

        

        {/* Main Navigation */}
        <div className="flex h-14 md:h-16 items-center justify-between gap-8 text-foreground transition-colors">
          {/* Logo - Centered alignment feel */}
          <div className="flex-shrink-0">
            <Link
              href="/"
              className={cn(
                "flex items-center transition-opacity hover:opacity-80",
                showTransparent || !showTransparent ? "text-white" : "text-foreground"
              )}
            >
              <img
                src="/clearcast-logo.webp"
                alt="Clearcast Logo"
                className="h-8 md:h-10 w-auto object-contain"
              />
            </Link>
          </div>

          {/* Desktop Navigation - Centered links */}
          <div className="hidden lg:flex lg:items-center lg:space-x-8">
            {!isSearchOpen && (
              <>
                {[
                  { name: "HOME", path: "/" },
                  { name: "FLY SET", path: "/fly-sets" },
                  { name: "FLY BARS", path: "/fly-bars" },
                  { name: "ABOUT", path: "/about" },
                  { name: "CONTACT", path: "/contact" },
                ].map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={cn(
                      "text-[11px] font-bold tracking-[0.2em] transition-colors",
                      isActive(item.path)
                        ? (showTransparent ? "text-white underlining decoration-secondary decoration-2 underline-offset-8" : "text-secondary")
                        : (showTransparent ? "text-white/60 hover:text-white" : "text-white/70 hover:text-white")
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
              </>
            )}
          </div>

          {/* Icons & Search Section */}
          <div className="flex items-center justify-end flex-1 lg:flex-none space-x-2 md:space-x-4">
            {/* Inline Search Bar - Unified Desktop/Mobile */}
            <div
              className={cn(
                "flex items-center transition-all duration-700 ease-in-out border overflow-hidden h-8 md:h-9",
                isSearchOpen
                  ? "flex-1 md:w-80 border-white/20 px-3 ml-4 bg-white/10"
                  : "w-9 md:w-10 px-0 justify-center cursor-pointer border-transparent",
                !isSearchOpen && showTransparent ? "bg-white/10 hover:bg-white/20" : (!isSearchOpen && "bg-white/10 hover:bg-white/20")
              )}
              onClick={() => !isSearchOpen && setIsSearchOpen(true)}
            >
              <Search
                className={cn(
                  "h-[18px] w-[18px] shrink-0 transition-colors",
                  isSearchOpen
                    ? "text-secondary"
                    : (showTransparent ? "text-white" : "text-white/80 hover:text-white")
                )}
              />
              {isSearchOpen && (
                <form
                  onSubmit={handleSearch}
                  className="flex-1 flex items-center h-full ml-3"
                >
                  <input
                    autoFocus
                    type="text"
                    placeholder="SEARCH OUR COLLECTION"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-[10px] font-black tracking-[0.2em] placeholder:text-white/30 text-white"
                  />
                  <div className="flex items-center gap-2 pr-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (searchQuery) clearSearch();
                        else setIsSearchOpen(false);
                      }}
                      className="hover:opacity-50 transition-opacity p-1"
                      title={searchQuery ? "Clear search" : "Close search"}
                    >
                      <X className="h-3 w-3 text-muted-foreground/60" />
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Other Icons */}
            <div className="flex items-center space-x-1 md:space-x-2">
            {user.is_staff && (
              <Link
                href="/admin"
                className={cn(
                  "flex items-center h-8 px-2 transition-colors shrink-0",
                  showTransparent ? "text-white/80 hover:text-white" : "text-white/80 hover:text-white"
                )}
              >
               <ShieldUser className="h-[18px] w-[18px]" />
              </Link>
            )}
              {!isSearchOpen &&
                (user ? (
                  <div className="hidden lg:block">
                    <DropdownMenu>
                      <DropdownMenuTrigger className={cn(
                        "flex items-center h-8 px-2 gap-1 transition-colors outline-none shrink-0",
                        showTransparent ? "text-white/80 hover:text-white" : "text-white/80 hover:text-white"
                      )}>
                        <User className="h-[18px] w-[18px]" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-56 rounded-none mt-2 shadow-xl border-border/50"
                      >
                        <div className="p-4 border-b border-border/50">
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                            Account
                          </p>
                          <p className="text-sm font-medium mt-1 truncate">
                            {user?.email}
                          </p>
                        </div>
                        {[
                          { label: "Profile", path: "/profile", icon: User },
                          { label: "Orders", path: "/profile/orders", icon: Package },
                          { label: "Wishlist", path: "/profile/wishlist", icon: Heart, count: wishlistCount },
                          { label: "Settings", path: "/profile/settings", icon: Settings },
                        ].map((item) => (
                          <DropdownMenuItem key={item.path}>
                            <Link
                              href={item.path}
                              className="flex items-center w-full cursor-pointer py-2.5 px-4 outline-none focus:bg-muted"
                            >
                              <item.icon className="h-4 w-4 mr-3 opacity-60" />
                              <span className="text-xs font-semibold uppercase tracking-wider">
                                {item.label}
                              </span>
                              {item.count > 0 && (
                                <span className="ml-auto bg-primary text-primary-foreground text-[9px] font-black px-1.5 py-0.5" style={{ borderRadius: 0 }}>
                                  {item.count}
                                </span>
                              )}
                            </Link>
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="flex items-center cursor-pointer text-destructive focus:text-destructive py-2.5 px-4">
                          <LogOut className="h-4 w-4 mr-3" />
                          <span className="text-xs font-semibold uppercase tracking-wider">Log Out</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ) : (
                  <Link href="/auth/login" className={cn(
                    "flex items-center h-8 px-2 transition-colors",
                    showTransparent ? "text-white/80 hover:text-white" : "text-white/80 hover:text-white"
                  )}>
                    <User className="h-[18px] w-[18px]" />
                  </Link>
                ))}

              {/* Cart */}
              <Link
                href="/cart"
                className={cn(
                  "relative h-8 px-2 flex items-center transition-colors shrink-0",
                  showTransparent ? "text-white/80 hover:text-white" : "text-white/80 hover:text-white"
                )}
              >
                <ShoppingCart className="h-[18px] w-[18px]" />
                {cartItemCount > 0 && (
                  <span className="absolute top-1 -right-0.5 bg-secondary text-white text-[9px] font-black min-w-[16px] h-4 flex items-center justify-center px-1" style={{ borderRadius: "50%" }}>
                    {cartItemCount}
                  </span>
                )}
              </Link>

              {/* Mobile Menu */}
              {!isSearchOpen && (
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className={cn(
                    "p-2 lg:hidden transition-colors",
                    showTransparent ? "text-white" : "text-white"
                  )}
                >
                  {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-white lg:hidden transition-transform duration-500",
          isMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="h-full flex flex-col pt-20 px-8">
          <div className="space-y-6">
            <Link
              href="/"
              onClick={() => setIsMenuOpen(false)}
              className="block text-3xl font-serif font-bold"
            >
              Home
            </Link>
            <Link
              href="/fly-sets"
              onClick={() => setIsMenuOpen(false)}
              className="block text-3xl font-serif font-bold"
            >
              Fly Set
            </Link>
            <Link
              href="/fly-bars"
              onClick={() => setIsMenuOpen(false)}
              className="block text-3xl font-serif font-bold"
            >
              Fly Bars
            </Link>
            <Link
              href="/about"
              onClick={() => setIsMenuOpen(false)}
              className="block text-3xl font-serif font-bold"
            >
              About
            </Link>
            <Link
              href="/contact"
              onClick={() => setIsMenuOpen(false)}
              className="block text-3xl font-serif font-bold"
            >
              Contact
            </Link>
          </div>

          <div className="mt-auto pb-12 space-y-4">
            <div className="border-t border-border pt-8 space-y-4">
              <Link
                href="/profile"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-4 text-sm font-bold uppercase tracking-widest"
              >
                <User className="h-5 w-5" /> Account
              </Link>
              <Link
                href="/profile/wishlist"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-4 text-sm font-bold uppercase tracking-widest"
              >
                <Heart className="h-5 w-5" /> Wishlist
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="flex items-center gap-4 text-sm font-bold uppercase tracking-widest text-destructive"
              >
                <LogOut className="h-5 w-5" /> Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
