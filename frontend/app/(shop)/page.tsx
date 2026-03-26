"use client";

import { useContentSections, useHeroSections, useShopByCatalogSections } from '@/api/contentApi';
import { useProducts } from '@/api/productQueries';
import ProductCard from '@/components/shop/ProductCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const Home = () => {
  const router = useRouter();

  // Fetch products
  const { data: productsData, isLoading: productsLoading } = useProducts({ sortBy: 'featured' });
  const products = productsData?.results || [];
  const featuredProducts = products.slice(0, 4);

  const { data: heroData } = useHeroSections();
  const { data: sectionsData } = useContentSections();
  const { data: shopByData, isLoading: shopByLoading } = useShopByCatalogSections();

  const heroSections = heroData?.results || heroData || [];
  const contentSections = sectionsData?.results || sectionsData || [];
  const shopBySections = shopByData?.results || shopByData || [];

  // Use first active hero section if available
  const activeHero = heroSections.length > 0 ? heroSections[0] : null;

  // Use first active shop-by-catalog section
  const activeShopBySection = shopBySections.length > 0 ? shopBySections[0] : null;
  const shopByCategories = activeShopBySection?.categories || [];
  const displayedShopByCategories = shopByCategories.slice(0, 4);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Hero Section - Refined & Impactful */}
      <section className="relative h-[85vh] flex items-center justify-center bg-[#F9F9F7] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={activeHero?.image || "https://images.unsplash.com/photo-1516934024742-b461fbc4760a?w=1600&auto=format&fit=crop&q=80"}
            alt={activeHero?.title || "Hero Background"}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-white tracking-tighter leading-[0.9] animate-in fade-in slide-in-from-bottom-8 duration-1000">
              {activeHero?.title || "Master the Drift"}
            </h1>
            <p className="text-lg md:text-xl text-white/90 font-medium max-w-2xl mx-auto tracking-wide animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
              {activeHero?.subtitle || "Premium fly-tying patterns and high-caliber gear for serious anglers."}
            </p>
          </div>
          <div className="pt-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
            <Link href={activeHero?.button_link || "/shop"}>
              <Button size="lg" className="h-14 px-10 text-[11px] font-black uppercase tracking-[0.2em] rounded-none bg-white text-black hover:bg-black hover:text-white transition-all duration-500">
                {activeHero?.button_text || "Shop the Fly Bar"}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Shop by Collection - Horizontal Cards */}
      {activeShopBySection && (
        <section className="py-24 md:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
              <div className="space-y-3">
                <span className="text-[10px] uppercase tracking-[0.3em] font-black text-muted-foreground/60">{activeShopBySection.subtitle || 'Collections'}</span>
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground tracking-tighter">
                  {activeShopBySection.title || 'Curated Essentials'}
                </h2>
              </div>
              <Link href="/shop" className="text-[11px] font-black uppercase tracking-widest border-b border-foreground pb-1 hover:text-primary hover:border-primary transition-all">
                View All Collections
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {shopByLoading ? (
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className="aspect-[3/4] bg-muted animate-pulse" />
                ))
              ) : (
                displayedShopByCategories.map((category: any) => (
                  <div
                    key={category.id}
                    className="group cursor-pointer relative"
                    onClick={() => {
                      if (category.slug) {
                        router.push(`/shop?category=${encodeURIComponent(category.slug)}`);
                      } else {
                        router.push('/shop');
                      }
                    }}
                  >
                    <div className="aspect-[3/4] overflow-hidden bg-[#F5F5F3]">
                      {category.image_url || category.image ? (
                        <img
                          src={category.image_url || category.image}
                          alt={category.name}
                          className="w-full h-full object-cover grayscale-[0.2] transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] uppercase tracking-widest text-muted-foreground/40">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="mt-6 flex justify-between items-center group">
                      <h3 className="text-sm font-bold uppercase tracking-[0.15em] border-b border-transparent group-hover:border-primary transition-all">
                        {category.name}
                      </h3>
                      <span className="text-[11px] font-medium text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">Explore</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      )}

      {/* Featured Selection - Minimal Grid */}
      <section className="py-24 md:py-32 bg-[#F9F9F7]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 space-y-4">
            <span className="text-[10px] uppercase tracking-[0.3em] font-black text-muted-foreground/60">Featured</span>
            <h2 className="text-4xl md:text-6xl font-serif font-bold text-foreground tracking-tighter">Featured Patterns</h2>
            <div className="w-12 h-[1px] bg-primary mx-auto mt-6" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
            {productsLoading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="aspect-[4/5] bg-muted animate-pulse" />
                  <div className="h-4 w-2/3 bg-muted animate-pulse" />
                  <div className="h-4 w-1/3 bg-muted animate-pulse" />
                </div>
              ))
            ) : (
              featuredProducts.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>

          <div className="text-center mt-20">
            <Link href="/shop">
              <Button variant="outline" className="h-12 px-10 text-[10px] font-black uppercase tracking-[0.2em] rounded-none border-foreground hover:bg-foreground hover:text-white transition-all duration-500">
                Shop All Products
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Content Sections - Editorial Layout */}
      {contentSections.length > 0 ? (
        contentSections.map((section: any, index: number) => (
          <section key={section.id || index} className="py-24 md:py-40">
            <div className="container mx-auto px-4 lg:px-12">
              <div className={`flex flex-col items-center gap-16 md:gap-24 ${index % 2 !== 0 ? 'md:flex-row-reverse' : 'md:flex-row'}`}>
                <div className="w-full md:w-3/5">
                  <div className="aspect-[16/10] overflow-hidden bg-[#F5F5F3]">
                    <img
                      src={section.image || "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"}
                      alt={section.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="w-full md:w-2/5 space-y-8 text-center md:text-left">
                  <div className="space-y-4">
                    {section.badge_text && (
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">{section.badge_text}</span>
                    )}
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground leading-tight tracking-tighter">
                      {section.title}
                    </h2>
                    {section.subtitle && (
                      <h3 className="text-lg font-medium text-muted-foreground/80 lowercase italic font-serif tracking-tight">
                        {section.subtitle}
                      </h3>
                    )}
                  </div>
                  <p className="text-[15px] text-muted-foreground/80 leading-loose max-w-sm mx-auto md:mx-0">
                    {section.description}
                  </p>
                  {section.button_text && (
                    <div className="pt-4">
                      <Link href={section.button_link || "#"}>
                        <Button className="h-12 px-10 text-[10px] font-black uppercase tracking-[0.2em] rounded-none transition-all duration-500">
                          {section.button_text}
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        ))
      ) : (
        /* Default Fallback Editorial */
        <section className="py-24 md:py-40">
          <div className="container mx-auto px-4 lg:px-12">
            <div className="flex flex-col md:flex-row items-center gap-16 md:gap-24">
              <div className="w-full md:w-3/5">
                <div className="aspect-[16/10] overflow-hidden bg-[#F5F5F3]">
                  <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3" alt="Editorial" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="w-full md:w-2/5 space-y-8 text-center md:text-left">
                <div className="space-y-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Limited Release</span>
                  <h2 className="text-4xl md:text-6xl font-serif font-bold text-foreground leading-tight tracking-tighter">
                    The Clearcast Collection
                  </h2>
                </div>
                <p className="text-[15px] text-muted-foreground/80 leading-loose max-w-sm mx-auto md:mx-0">
                  An uncompromising approach to craftsmanship. Discover our latest editorial showcasing the intersection of traditional artistry and modern design.
                </p>
                <div className="pt-4">
                  <Button className="h-12 px-10 text-[10px] font-black uppercase tracking-[0.2em] rounded-none transition-all duration-500">Discover More</Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

    </div>
  );
};

export default Home;
