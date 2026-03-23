import React from 'react';
import Link from 'next/link';

const AboutPage = () => {
    return (
        <div className="bg-white">
            {/* Minimalist Hero */}
            <section className="relative h-[60vh] flex items-center justify-center bg-[#F9F9F7] overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e12?w=1600&auto=format&fit=crop&q=80"
                        alt="Our Atelier"
                        className="w-full h-full object-cover grayscale-[0.3]"
                    />
                    <div className="absolute inset-0 bg-black/20" />
                </div>
                <div className="relative z-10 text-center px-4">
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-white tracking-tighter leading-none animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        Our Story
                    </h1>
                </div>
            </section>

            {/* Editorial Content - The Narrative */}
            <section className="py-24 md:py-32 container mx-auto px-4 max-w-5xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-center">
                    <div className="space-y-8">
                        <span className="text-[10px] items-center uppercase tracking-[0.3em] font-black text-primary/60">Established 1994</span>
                        <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground tracking-tighter leading-tight">
                            Crafting elegance for the modern individual.
                        </h2>
                        <p className="text-[15px] text-muted-foreground/80 leading-loose">
                            Founded on the principles of timeless design and uncompromising quality, Gucci has evolved from a small boutique into a beacon of modern luxury. Our journey is defined by a relentless pursuit of perfection, merging traditional craftsmanship with contemporary vision.
                        </p>
                    </div>
                    <div className="aspect-[4/5] overflow-hidden bg-[#F5F5F3]">
                        <img
                            src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&auto=format&fit=crop&q=80"
                            alt="Designer at work"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
            </section>

            {/* Philosophy - Minimalist Grid */}
            <section className="py-24 md:py-32 bg-[#F9F9F7]">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-20 max-w-6xl mx-auto">
                        <div className="space-y-4">
                            <h3 className="text-xl font-serif font-bold tracking-tight text-foreground">Artisanal Excellence</h3>
                            <div className="w-8 h-[1px] bg-primary" />
                            <p className="text-sm text-muted-foreground/70 leading-relaxed">
                                Every piece in our collection is meticulously crafted by master artisans, ensuring that the legacy of quality is preserved in every stitch.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-xl font-serif font-bold tracking-tight text-foreground">Sustainable Vision</h3>
                            <div className="w-8 h-[1px] bg-primary" />
                            <p className="text-sm text-muted-foreground/70 leading-relaxed">
                                We are committed to ethical sourcing and sustainable practices, believing that true luxury should never come at the cost of our environment.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-xl font-serif font-bold tracking-tight text-foreground">Timeless Design</h3>
                            <div className="w-8 h-[1px] bg-primary" />
                            <p className="text-sm text-muted-foreground/70 leading-relaxed">
                                Our aesthetic transcends seasons. We create enduring silhouettes that remain as relevant tomorrow as they are today.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final Editorial - Large Image & Text Overlay */}
            <section className="py-24 md:py-40 container mx-auto px-4">
                <div className="relative aspect-[21/9] flex items-center justify-center overflow-hidden">
                    <img
                        src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&auto=format&fit=crop&q=80"
                        alt="Collection Preview"
                        className="absolute inset-0 w-full h-full object-cover grayscale-[0.2]"
                    />
                    <div className="absolute inset-0 bg-black/40" />
                    <div className="relative z-10 text-center max-w-2xl px-6 space-y-6">
                        <h2 className="text-3xl md:text-5xl font-serif font-bold text-white tracking-tighter leading-tight">
                            Discover the collection that defines a generation.
                        </h2>
                        <div className="pt-4">
                            <Link href="/shop" className="text-[11px] font-black uppercase tracking-widest text-white border-b border-white pb-1 hover:text-white/80 hover:border-white/80 transition-all">
                                Explore Now
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutPage;