import React from 'react';
import Link from 'next/link';

const AboutPage = () => {
    return (
        <div className="bg-white">
            {/* Minimalist Hero */}
            <section className="relative h-[60vh] flex items-center justify-center bg-[#F9F9F7] overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src="/angler_in_river_sulfur_hatch_1774511734337.png"
                        alt="Angler in River"
                        className="w-full h-full object-cover grayscale-[0.1]"
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
                        <span className="text-[10px] items-center uppercase tracking-[0.3em] font-black text-primary/60">Born on Water</span>
                        <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground tracking-tighter leading-tight">
                            Clearcast Fly Ltd
                        </h2>
                        <p className="text-[15px] text-muted-foreground/80 leading-loose">
                            Clearcast Fly Ltd didn't start in a boardroom; it started in the middle of a sulfur hatch when the flies in our box just weren't cutting it. We realized that to catch the fish of a lifetime, you need a fly that doesn't just look like a bug, it needs to behave like one. What began as a personal obsession with the perfect drift has grown into a mission to equip fellow anglers with the highest-caliber patterns available.
                        </p>
                        <p className="text-[15px] text-muted-foreground/80 leading-loose">
                            Every fly we craft is born from countless hours on the water, testing, refining, and perfecting. We understand that serious anglers demand more than just aesthetics—they demand performance, durability, and patterns that actually work when it matters most. Our commitment to excellence means we never compromise on materials or technique, ensuring that each pattern in our collection represents the pinnacle of fly-tying craftsmanship and real-world effectiveness.
                        </p>
                    </div>
                    <div className="aspect-[4/5] overflow-hidden bg-[#F5F5F3]">
                        <img
                            src="/fly_fishing_fly_box_1774511527085.png"
                            alt="Fly Tying Craftsmanship"
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
                            <h3 className="text-xl font-serif font-bold tracking-tight text-foreground">The Anatomy of a Better Cast</h3>
                            <div className="w-8 h-[1px] bg-primary" />
                            <p className="text-sm text-muted-foreground/70 leading-relaxed">
                                We believe a fly is only as good as its weakest component. That’s why we obsess over the details that most people never see. From the gauge of the wire to the specific buoyancy of our CDC, every material is chosen for its performance under pressure.
                            </p>
                        </div>
                        <div className="space-y-4 pt-12">
                            <h3 className="text-xl font-serif font-bold tracking-tight text-foreground">A Lifetime Promise</h3>
                            <div className="w-8 h-[1px] bg-primary" />
                            <p className="text-sm italic font-serif text-muted-foreground/70 leading-relaxed">
                                "Every fly must cast true, float perfectly, and catch fish consistently."
                            </p>
                            <p className="text-sm text-muted-foreground/70 leading-relaxed">
                                This isn't just our philosophy; it’s our promise. When you tie on a Clearcast fly, you're tying on two years of rigorous field testing and a lifetime of passion.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-xl font-serif font-bold tracking-tight text-foreground">Field Tested</h3>
                            <div className="w-8 h-[1px] bg-primary" />
                            <p className="text-sm text-muted-foreground/70 leading-relaxed">
                                We don’t just sell flies; we provide the confidence to make that one cast count. Whether you're chasing wild browns in a hidden creek or technical rainbows on a tailwater, our gear is designed to enhance your time on the water.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final Editorial - Large Image & Text Overlay */}
            <section className="py-24 md:py-40 container mx-auto px-4">
                <div className="relative aspect-[21/9] flex items-center justify-center overflow-hidden">
                    <img
                        src="https://images.unsplash.com/photo-1544551763-47a18411c126?w=1600&auto=format&fit=crop&q=80"
                        alt="Serene Lake"
                        className="absolute inset-0 w-full h-full object-cover grayscale-[0.05]"
                    />
                    <div className="absolute inset-0 bg-black/40" />
                    <div className="relative z-10 text-center max-w-2xl px-6 space-y-6">
                        <h2 className="text-3xl md:text-5xl font-serif font-bold text-white tracking-tighter leading-tight">
                            Make your next cast count.
                        </h2>
                        <div className="pt-4">
                            <Link href="/shop" className="text-[11px] font-black uppercase tracking-widest text-white border-b border-white pb-1 hover:text-white/80 hover:border-white/80 transition-all">
                                Explore the Collection
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutPage;