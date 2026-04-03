"use client";

import { useContentSections, useHeroSections, useShopByCatalogSections } from '@/api/contentApi';
import { useProducts } from '@/api/productQueries';
import ProductCard from '@/components/shop/ProductCard';
import FeaturedFilterSection from '@/components/shop/FeaturedFilterSection';
import QualityStandards from '@/components/shop/QualityStandards';
import FishingFlyConvo from '@/components/shop/FishingFlyConvo';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

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

  // Hero Slider State
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const activeHero = heroSections.length > 0 ? heroSections[activeHeroIndex] : null;

  // Use first active shop-by-catalog section
  const activeShopBySection = shopBySections.length > 0 ? shopBySections[0] : null;
  const shopByFilters = activeShopBySection?.filters || [];
  const displayedShopByFilters = shopByFilters.slice(0, 4);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Hero Section - Refined & Impactful */}
      <section className="relative min-h-screen flex items-center bg-[#F9F9F7] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={activeHero?.image || "https://images.unsplash.com/photo-1516934024742-b461fbc4760a?w=2600&auto=format&fit=crop&q=80"}
            alt={activeHero?.title || "Hero Background"}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/45" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full max-w-8xl">
          <div className={cn(
            "space-y-12 animate-in fade-in duration-1000",
            activeHero?.content_alignment === 'left' ? 'text-left' : 'text-center max-w-5xl mx-auto'
          )}>
            <div className="space-y-6">
              <span className="text-[10px] uppercase tracking-[0.4em] font-black text-secondary animate-in fade-in slide-in-from-bottom-4 duration-700">
                {activeHero?.badge_text || "Spring Collection 2026"}
              </span>
              <h1 className="text-6xl md:text-8xl lg:text-[100px] font-serif font-bold text-white tracking-tighter leading-[0.82] slide-in-from-bottom-12 transition-all">
                {activeHero?.title || "Master the Drift"}
              </h1>
              <p className={cn(
                "text-lg md:text-xl text-white/90 font-medium tracking-wide slide-in-from-bottom-8 delay-200 transition-all",
                activeHero?.content_alignment === 'left' ? 'max-w-2xl' : 'max-w-2xl mx-auto'
              )}>
                {activeHero?.subtitle || "Premium fly-tying patterns and high-caliber gear for serious anglers."}
              </p>
            </div>

            <div className={cn(
              "flex flex-col sm:flex-row gap-5 pt-8 slide-in-from-bottom-8 delay-500 transition-all",
              activeHero?.content_alignment === 'left' ? "justify-start" : "justify-center"
            )}>
              <Link href={activeHero?.button_link || "/shop"}>
                <Button size="lg" className="h-16 px-12 text-[11px] font-black uppercase tracking-[0.3em] rounded-none bg-secondary text-white hover:bg-white hover:text-secondary transition-all duration-500 shadow-2xl shadow-secondary/20 group">
                  {activeHero?.button_text || "Explore Series"}
                  <span className="ml-2 transition-transform duration-500 group-hover:translate-x-2">→</span>
                </Button>
              </Link>

              {activeHero?.button_text_2 && (
                <Link href={activeHero?.button_link_2 || "/about"}>
                  <Button size="lg" className="h-16 px-12 text-[11px] font-black uppercase tracking-[0.3em] rounded-none border-white text-white hover:bg-white hover:text-primary transition-all duration-500 shadow-2xl backdrop-blur-md">
                    {activeHero?.button_text_2}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {heroSections.length > 1 && (
          <div className="absolute top-1/2 -translate-y-1/2 right-12 z-20 flex flex-col gap-4">
            {heroSections.map((_: any, idx: number) => (
              <button
                key={idx}
                onClick={() => setActiveHeroIndex(idx)}
                className={cn(
                  "w-1 h-8 transition-all duration-500",
                  activeHeroIndex === idx ? "bg-secondary" : "bg-white/20 hover:bg-white/40"
                )}
              />
            ))}
          </div>
        )}
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
              <Link href="/fly-bars" className="text-[11px] font-black uppercase tracking-widest border-b border-foreground pb-1 hover:text-secondary hover:border-secondary transition-all">
                View All Collections
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {shopByLoading ? (
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className="aspect-[3/4] bg-muted animate-pulse" />
                ))
              ) : (
                displayedShopByFilters.map((filter: any) => (
                  <div
                    key={filter.id}
                    className="group cursor-pointer relative"
                    onClick={() => {
                      if (filter.slug) {
                        router.push(`/fly-bars?filter=${encodeURIComponent(filter.slug)}`);
                      } else {
                        router.push('/fly-bars');
                      }
                    }}
                  >
                    <div className="aspect-[3/4] overflow-hidden bg-[#F5F5F3] relative border border-border/10">
                      {filter.image ? (
                        <img
                          src={filter.image}
                          alt={filter.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center p-8 text-center opacity-40">
                          <h3 className="text-2xl font-serif font-bold text-muted-foreground/80">
                            {filter.name}
                          </h3>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors" />
                    </div>
                    <div className="mt-6 flex justify-between items-center group">
                      <h3 className="text-sm font-bold uppercase tracking-[0.15em] border-b border-transparent group-hover:border-secondary transition-all">
                        {filter.name}
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
            <div className="w-12 h-[1px] bg-secondary mx-auto mt-6" />
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
            <Link href="/fly-bars">
              <Button variant="outline" className="h-12 px-10 text-[10px] font-black uppercase tracking-[0.2em] rounded-none border-foreground hover:bg-foreground hover:text-white transition-all duration-500">
                Shop All Products
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Content Sections - Editorial & Featured Collections */}
      {contentSections.length > 0 ? (
        contentSections.map((section: any, index: number) => {
          if (section.section_type === 'featured' && section.featured_filter_details) {
            return (
              <FeaturedFilterSection
                key={section.id || index}
                title={section.title}
                subtitle={section.subtitle}
                description={section.description}
                filterSlug={section.featured_filter_details.slug}
                filterName={section.featured_filter_details.name}
                badgeText={section.badge_text}
                buttonText={section.button_text}
                buttonLink={section.button_link}
                index={index}
              />
            );
          }

          return (
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
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary">{section.badge_text}</span>
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
                        <Link href="/shop">
                            <Button className="h-16 px-12 text-[11px] font-black uppercase tracking-[0.3em] rounded-none bg-secondary text-white hover:bg-secondary/90 transition-all duration-500">
                                Secure Your Patterns
                            </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          );
        })
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
                    <span className="text-[10px] uppercase tracking-[0.4em] font-black text-secondary">Our Legacy</span>
                    <h2 className="text-4xl md:text-6xl font-serif font-black tracking-tighter leading-tight text-foreground group-hover:tracking-tight transition-all duration-700">
                        Crafting the <br /> <span className="italic font-normal">ultimate</span> connection.
                    </h2>
                    <p className="text-muted-foreground/60 text-lg font-serif italic max-w-md leading-relaxed">
                        Every pattern is a result of years on the water, observing the hatch and perfecting the drift. We don't just tie flies; we build precision instruments.
                    </p>
                    <div className="pt-8">
                        <Button variant="outline" className="h-14 px-10 text-[11px] font-black uppercase tracking-[0.3em] rounded-none border-secondary text-secondary hover:bg-secondary hover:text-white transition-all duration-500">
                            The Clearcast Story
                        </Button>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Quality Standards - FAQ Section */}
      <QualityStandards />

      {/* Fishing Fly Conversation Section */}
      <FishingFlyConvo />

    </div>
  );
};

export default Home;
