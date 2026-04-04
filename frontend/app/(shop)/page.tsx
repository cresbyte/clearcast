"use client";

import { useContentSections, useHeroSections, useShopByCatalogSections } from '@/api/contentApi';
import { useProducts } from '@/api/productQueries';
import FeaturedFilterSection from '@/components/shop/FeaturedFilterSection';
import FishingFlyConvo from '@/components/shop/FishingFlyConvo';
import ProductCard from '@/components/shop/ProductCard';
import QualityStandards from '@/components/shop/QualityStandards';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import flyTying3 from '../assets/clearcast-collection.webp';
import flyTying2 from '../assets/clearcast-essence.webp';
import flyTying from '../assets/the-material.webp';


const Home = () => {
  const router = useRouter();

  const { data: productsData, isLoading: productsLoading } = useProducts({ sortBy: 'featured' });
  const products = productsData?.results || [];
  const featuredProducts = products.slice(0, 5);

  const { data: heroData } = useHeroSections();
  const { data: sectionsData } = useContentSections();
  const { data: shopByData, isLoading: shopByLoading } = useShopByCatalogSections();

  const heroSections = heroData?.results || heroData || [];
  const contentSections = sectionsData?.results || sectionsData || [];
  const shopBySections = shopByData?.results || shopByData || [];

  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const activeHero = heroSections.length > 0 ? heroSections[activeHeroIndex] : null;

  const activeShopBySection = shopBySections.length > 0 ? shopBySections[0] : null;
  const shopByFilters = activeShopBySection?.filters || [];
  const displayedShopByFilters = shopByFilters.slice(0, 4);

  return (
    <div className="flex flex-col min-h-screen bg-white">

      {/* ══════════════════════════════════════════════════════════════
          1. HERO — full-bleed, left-aligned, directional gradient
      ══════════════════════════════════════════════════════════════ */}
      <section className="relative w-full  min-h-[80vh] sm:min-h-screen flex items-center overflow-hidden bg-[#1a1f1a]">

        <img
          src={activeHero?.image || "https://images.unsplash.com/photo-1516934024742-b461fbc4760a?w=2400&auto=format&fit=crop&q=80"}
          alt={activeHero?.title || "Hero background"}
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/30 to-transparent" />

        <div className="container mx-auto relative z-10 w-full px-8 sm:px-14 lg:px-20 pt-28 sm:pt-36 pb-20">
          <div className={cn(
            "max-w-4xl",
            activeHero?.content_alignment === 'center' && "mx-auto text-center"
          )}>

            {activeHero?.badge_text && (
              <span className="block text-[10px] font-black uppercase tracking-[0.38em] text-secondary mb-4">
                {activeHero.badge_text}
              </span>
            )}

            <h1 className="font-serif font-bold text-white leading-[1.0] tracking-tight mb-5
                           text-[38px] sm:text-[50px] lg:text-[60px]">
              {activeHero?.title || "Tied to a Higher Standard"}
            </h1>

            <p className={cn(
              "text-[14px] sm:text-[15px] text-white/80 leading-relaxed mb-8",
              activeHero?.content_alignment === 'center' ? "max-w-md mx-auto" : "max-w-xl"
            )}>
              {activeHero?.subtitle || "More than flies — our patterns are built with purpose. Every hackle, every wrap, every material chosen with one goal: to catch more fish."}
            </p>

            <div className={cn(
              "flex flex-wrap gap-3",
              activeHero?.content_alignment === 'center' && "justify-center"
            )}>
              <Link href={activeHero?.button_link || "/fly-bars"}>
                <Button className="h-[46px] px-7 text-[10px] font-black uppercase tracking-[0.22em] rounded-sm
                                   bg-secondary text-white hover:bg-secondary/85 transition-colors duration-200 w-full xs:w-auto">
                  {activeHero?.button_text || "Shop our Fly Bar"}
                </Button>
              </Link>

              <Link href={activeHero?.button_link_2 || "/about"}>
                <Button className="h-[46px] px-7 text-[10px] font-black uppercase tracking-[0.22em] rounded-sm
                                   bg-transparent border border-white/55 text-white
                                   hover:bg-white/10 hover:border-white/80 transition-colors duration-200 w-full xs:w-auto">
                  {activeHero?.button_text_2 || "Learn More"}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {heroSections.length > 1 && (
          <div className="absolute right-6 sm:right-10 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2.5">
            {heroSections.map((_: any, idx: number) => (
              <button
                key={idx}
                onClick={() => setActiveHeroIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={cn(
                  "w-[2px] rounded-full transition-all duration-300",
                  activeHeroIndex === idx ? "h-7 bg-secondary" : "h-4 bg-white/30 hover:bg-white/55"
                )}
              />
            ))}
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════════════════════════════
          2. TRUST BAR — 3 columns, white bg, no outer border
      ══════════════════════════════════════════════════════════════ */}
      <section className="bg-white border-b border-border/10">
        <div className="container mx-auto px-8 sm:px-14 lg:px-20 py-12 sm:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border/15">
            {[
              {
                title: "No More Refusals",
                body: "Your fish is looking for the real thing. Our patterns are tied to fool the most discerning trout — realistic profiles, lifelike movement.",
              },
              {
                title: "Built for the Strike",
                body: "Perfectly weighted, perfectly balanced. Every fly lands with precision and drifts with purpose — because getting it right the first time matters.",
              },
              {
                title: "Where it Counts",
                body: "Our flies are matched to local hatches. We stock what works — from opening day dries to late-season nymphs for your specific water.",
              },
            ].map((item, i) => (
              <div key={item.title} className={cn("space-y-2", i === 0 ? "sm:pr-10 py-6 sm:py-0" : i === 1 ? "sm:px-10 py-6 sm:py-0" : "sm:pl-10 py-6 sm:py-0")}>
                <h3 className="text-[13px] font-bold text-foreground">
                  {item.title}
                </h3>
                <p className="text-[12px] text-muted-foreground leading-relaxed">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          3. CURRENT FAVORITES — centered title, 5-col product grid
      ══════════════════════════════════════════════════════════════ */}
      <section className="bg-white py-14 sm:py-20">
        <div className="container mx-auto px-8 sm:px-14 lg:px-20">

          <div className="text-center mb-10">
            <h2 className="text-[22px] sm:text-[26px] font-serif font-bold text-foreground mb-2">
              Current Favorites
            </h2>
            <p className="text-[12px] sm:text-[13px] text-muted-foreground max-w-sm mx-auto leading-relaxed">
              Handpicked by our tiers — the flies that are catching fish right now.
            </p>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="aspect-square bg-muted animate-pulse" />
                  <div className="h-3 w-3/4 bg-muted animate-pulse" />
                  <div className="h-3 w-1/2 bg-muted animate-pulse" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
              {featuredProducts.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="text-center mt-10">
            <Link href="/fly-bars">
              <Button variant="outline"
                className="h-[42px] px-8 text-[10px] font-black uppercase tracking-[0.2em] rounded-sm
                           border-foreground hover:bg-foreground hover:text-white transition-colors duration-200">
                View All Flies
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          4. QUOTE BANNER — full-bleed dark image, centered italic quote
      ══════════════════════════════════════════════════════════════ */}
            <FishingFlyConvo />


      {/* ══════════════════════════════════════════════════════════════
          5. SHOP BY TOP COLLECTION — left heading, 4 landscape cards
      ══════════════════════════════════════════════════════════════ */}
      {activeShopBySection && (
        <section className="bg-white py-14 sm:py-20">
          <div className="container mx-auto px-8 sm:px-14 lg:px-20">

            <div className="mb-7">
              <h2 className="text-[20px] sm:text-[24px] font-serif font-bold text-foreground mb-1.5">
                {activeShopBySection.title || "Shop by Top Collection"}
              </h2>
              <p className="text-[12px] sm:text-[13px] text-muted-foreground leading-relaxed max-w-xl">
                {activeShopBySection.subtitle || "Browse our top collections, curated for every angler and every water."}
                {" "}
                <Link href="/fly-bars" className="underline underline-offset-2 hover:text-secondary transition-colors">
                  Shop all collections.
                </Link>
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
              {shopByLoading ? (
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="aspect-[4/3] bg-muted animate-pulse" />
                    <div className="h-3 w-1/2 bg-muted animate-pulse" />
                  </div>
                ))
              ) : (
                displayedShopByFilters.map((filter: any) => (
                  <div
                    key={filter.id}
                    className="group cursor-pointer"
                    onClick={() => {
                      router.push(filter.slug ? `/fly-bars?filter=${encodeURIComponent(filter.slug)}` : '/fly-bars');
                    }}
                  >
                    <div className="aspect-[4/3] overflow-hidden bg-[#ECEAE4]">
                      {filter.image ? (
                        <img
                          src={filter.image}
                          alt={filter.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-[12px] font-serif text-muted-foreground/60">{filter.name}</span>
                        </div>
                      )}
                    </div>
                    <p className="mt-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-foreground
                                   group-hover:text-secondary transition-colors duration-200">
                      {filter.name}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════
          6. CMS CONTENT SECTIONS
             Layout rules (matched to reference):
      ══════════════════════════════════════════════════════════════ */}
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

          if (!section.image) {
            return (
              <section key={section.id || index} className="py-16 sm:py-24 bg-[#C4D4CE]">
                <div className="container mx-auto px-8 sm:px-14 lg:px-20 text-center max-w-xl">
                  {section.badge_text && (
                    <span className="block text-[10px] font-black uppercase tracking-[0.35em] text-foreground/55 mb-3">
                      {section.badge_text}
                    </span>
                  )}
                  <h2 className="text-[26px] sm:text-[32px] font-serif font-bold text-foreground tracking-tight mb-4">
                    {section.title}
                  </h2>
                  {section.subtitle && (
                    <p className="text-[13px] italic font-serif text-foreground/65 mb-3 leading-relaxed">
                      {section.subtitle}
                    </p>
                  )}
                  <p className="text-[13px] text-foreground/65 leading-relaxed mb-8">
                    {section.description}
                  </p>
                  {section.button_text && (
                    <Link href={section.button_link || "/fly-bars"}>
                      <Button className="h-[44px] px-8 text-[10px] font-black uppercase tracking-[0.22em] rounded-sm
                                         bg-foreground text-white hover:bg-foreground/80 transition-colors duration-200">
                        {section.button_text}
                      </Button>
                    </Link>
                  )}
                </div>
              </section>
            );
          }

          if (index % 3 === 2) {
            return (
              <section key={section.id || index} className="bg-[#1C2B35] py-16 sm:py-20">
                <div className="container mx-auto px-8 sm:px-14 lg:px-20">
                  <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
                    <div className="w-full md:w-1/2 space-y-5 order-2 md:order-1">
                      {section.badge_text && (
                        <span className="block text-[10px] font-black uppercase tracking-[0.35em] text-secondary">
                          {section.badge_text}
                        </span>
                      )}
                      <h2 className="text-[26px] sm:text-[30px] font-serif font-bold text-white tracking-tight leading-snug">
                        {section.title}
                      </h2>
                      {section.subtitle && (
                        <p className="text-[13px] italic font-serif text-white/55 leading-relaxed">{section.subtitle}</p>
                      )}
                      <p className="text-[13px] text-white/65 leading-relaxed">{section.description}</p>
                      {section.button_text && (
                        <Link href={section.button_link || "/fly-bars"}>
                          <Button className="h-[44px] px-7 text-[10px] font-black uppercase tracking-[0.22em] rounded-sm
                                             bg-secondary text-white hover:bg-secondary/80 transition-colors duration-200">
                            {section.button_text}
                          </Button>
                        </Link>
                      )}
                    </div>
                    <div className="w-full md:w-1/2 order-1 md:order-2">
                      <div className="aspect-[4/3] overflow-hidden">
                        <img src={section.image} alt={section.title} className="w-full h-full object-cover" />
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            );
          }

          const isReversed = index % 2 !== 0;
          return (
            <section key={section.id || index} className={cn("py-16 sm:py-24", isReversed ? "bg-[#F5F5F2]" : "bg-white")}>
              <div className="container mx-auto px-8 sm:px-14 lg:px-20">
                <div className={cn("flex flex-col md:flex-row items-center gap-10 md:gap-16", isReversed && "md:flex-row-reverse")}>
                  <div className="w-full md:w-[55%] shrink-0">
                    <div className="aspect-[16/11] overflow-hidden bg-[#ECEAE4]">
                      <img src={section.image} alt={section.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                    </div>
                  </div>
                  <div className="w-full md:w-[45%] space-y-5">
                    {section.badge_text && (
                      <span className="block text-[10px] font-black uppercase tracking-[0.35em] text-secondary">
                        {section.badge_text}
                      </span>
                    )}
                    <h2 className="text-[26px] sm:text-[30px] font-serif font-bold text-foreground tracking-tight leading-snug">
                      {section.title}
                    </h2>
                    {section.subtitle && (
                      <p className="text-[13px] italic font-serif text-muted-foreground leading-relaxed">{section.subtitle}</p>
                    )}
                    <p className="text-[13px] text-muted-foreground leading-relaxed">{section.description}</p>
                    {section.button_text && (
                      <div className="pt-1">
                        <Link href={section.button_link || "/fly-bars"}>
                          <Button className="h-[44px] px-7 text-[10px] font-black uppercase tracking-[0.22em] rounded-sm
                                             bg-secondary text-white hover:bg-secondary/85 transition-colors duration-200">
                            {section.button_text}
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
        <>
          {/* Fallback: Bespoke Bench */}
          <section className="py-16 sm:py-24 bg-[#C4D4CE]">
            <div className="container mx-auto px-8 sm:px-14 lg:px-20 text-center max-w-xl">
              <h2 className="text-[26px] sm:text-[32px] font-serif font-bold text-foreground tracking-tight mb-4">
                The Bespoke Bench
              </h2>
              <p className="text-[13px] text-foreground/65 leading-relaxed mb-8">
                Can't find the fly you're looking for? Our tiers work directly with you to create custom patterns matched exactly to your local hatch, your rod, and your river.
              </p>
              <Link href="/contact">
                <Button className="h-[44px] px-8 text-[10px] font-black uppercase tracking-[0.22em] rounded-sm
                                     bg-foreground text-white hover:bg-foreground/80 transition-colors duration-200">
                  Start Your Custom Order
                </Button>
              </Link>
            </div>
          </section>

          {/* Fallback: Fly Sets dark split */}
          <section className="bg-[#1C2B35] py-16 sm:py-20">
            <div className="container mx-auto px-8 sm:px-14 lg:px-20">
              <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
                <div className="w-full md:w-1/2 space-y-5 order-2 md:order-1">
                  <h2 className="text-[26px] sm:text-[30px] font-serif font-bold text-white tracking-tight leading-snug">
                    Fly Sets (The "Grab &amp; Go" Catalog)
                  </h2>
                  <p className="text-[13px] text-white/65 leading-relaxed">
                    Not sure where to start? Our curated fly sets take the guesswork out of fly selection — each matched to a specific scenario: spring creek, stillwater, streamer fishing, and more.
                  </p>
                  <Link href="/fly-bars">
                    <Button className="h-[44px] px-7 text-[10px] font-black uppercase tracking-[0.22em] rounded-sm
                                       bg-secondary text-white hover:bg-secondary/80 transition-colors duration-200 inline-flex">
                      Shop Sets
                    </Button>
                  </Link>
                </div>
                <div className="w-full md:w-1/2 order-1 md:order-2">
                  <div className="aspect-[4/3] overflow-hidden bg-[#243440]">
                    <img
                      src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&auto=format&fit=crop&q=70"
                      alt="Fly sets"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════
          7. NOTES FROM THE BENCH — 3-col editorial blog cards
      ══════════════════════════════════════════════════════════════ */}
      <section className="bg-white py-14 sm:py-20">
        <div className="container mx-auto px-8 sm:px-14 lg:px-4">
          <h2 className="text-[18px] sm:text-[20px] font-serif font-bold text-foreground mb-7">
            Notes from the Bench
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                img: flyTying,
                title: "Why We Tie with Tungsten & Ribbing Patterns",
                excerpt: "Tungsten beads sink faster and fish deeper — here's why they've become a staple on our bench and why ribbing changes everything.",
              },
              {
                img: flyTying2,
                title: "Matching the Hatch: A Clearcast Guide",
                excerpt: "Understanding what your local fish are feeding on is the difference between a blank day and a memorable one.",
              },
              {
                img: flyTying3,
                title: "Caring for Your Clearcast Collection",
                excerpt: "Flies last longer when cared for properly. Dry them, store them right, and they'll fish perfectly season after season.",
              },
            ].map((post) => (
              <div key={post.title} className="group cursor-pointer">
                <div className="aspect-[16/10] overflow-hidden bg-[#ECEAE4] mb-4">
                  <img
                    src={typeof post.img === 'string' ? post.img : post.img.src}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <h3 className="text-[13px] font-bold text-foreground mb-2 leading-snug
                               group-hover:text-secondary transition-colors duration-200">
                  {post.title}
                </h3>
                <p className="text-[12px] text-muted-foreground leading-relaxed">
                  {post.excerpt}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          8. QUALITY STANDARDS
      ══════════════════════════════════════════════════════════════ */}
      <QualityStandards />


    </div>
  );
};

export default Home;
