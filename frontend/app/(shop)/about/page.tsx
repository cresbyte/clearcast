import Link from "next/link";
import aboutImg3 from "./about-us-3.webp";
import anatomyImg from "./anatomy-of-cast.png";
import bornWaterImg from "./born-on-water.png";

const AboutPage = () => {
  return (
    <div className="bg-white">
      {/* Minimalist Hero */}
      <section className="pt-32 pb-16 md:pt-48 md:pb-24 flex items-center justify-center bg-[#f2f8fc]">
        <div className="text-center px-4">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-[#05314a] tracking-tighter leading-none animate-in fade-in slide-in-from-bottom-8 duration-1000">
            Our Story
          </h1>
        </div>
      </section>

      {/* Editorial Content - The Narrative */}
      <section className="bg-[#f2f8fc] w-full">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image Side (Left) */}
          <div className="relative min-h-[400px] md:min-h-[500px]">
            <img
              src={bornWaterImg.src}
              alt="Fly fishing on a calm river"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>

          {/* Text Side (Right) */}
          <div className="flex flex-col justify-center px-10 md:px-16 lg:px-24 py-16 md:py-24 space-y-6">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-[#05314a] tracking-tight">
              Born on Water
            </h2>
            <p className="text-[14px] sm:text-[15px] text-[#05314a]/90 leading-relaxed font-medium">
              ClearCast Fly didn't start in a boardroom; it started in the
              middle of a sulfur hatch when the flies in our box just weren't
              cutting it. We realized that to catch the fish of a lifetime, you
              need a fly that doesn't just look like a bug, it needs to behave
              like one. What began as a personal obsession with the perfect
              drift has grown into a mission to equip fellow anglers with the
              highest-caliber patterns available.
            </p>
            <p className="text-[14px] sm:text-[15px] text-[#05314a]/90 leading-relaxed font-medium">
              Every fly we craft is born from countless hours on the water,
              testing, refining, and perfecting. We understand that serious
              anglers demand more than just aesthetics—they demand performance,
              durability, and patterns that actually work when it matters most.
              Our commitment to excellence means we never compromise on
              materials or technique, ensuring that each pattern in our
              collection represents the pinnacle of fly-tying craftsmanship and
              real-world effectiveness.
            </p>
          </div>
        </div>
      </section>

      {/* Anatomy of a Better Cast Section */}
      <section className="bg-[#D3E32C] py-20 px-4 md:px-0">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 md:pr-12">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-[#05314a] tracking-tight">
                The Anatomy of a Better Cast
              </h2>
              <p className="text-[15px] sm:text-[16px] text-[#05314a]/90 leading-relaxed font-medium">
                We believe a fly is only as good as its weakest component.
                That's why we obsess over the details that most people never
                see. From the gauge of the wire to the specific buoyancy of our
                CDC, every material is chosen for its performance under
                pressure.
              </p>
              <p className="text-[15px] sm:text-[16px] text-[#05314a]/90 leading-relaxed">
                "Every fly must cast true, float perfectly, and catch fish
                consistently."
              </p>
              <p className="text-[15px] sm:text-[16px] text-[#05314a]/90 leading-relaxed font-medium">
                This isn't just our philosophy; it's our promise. When you tie
                on a ClearCast fly, you're tying on two years of rigorous field
                testing and a lifetime of passion.
              </p>
            </div>
            <div className="relative aspect-[4/3] w-full">
              <img
                src={anatomyImg.src}
                alt="Fishing rods by the water at sunset"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Final Editorial - Large Image & Text Overlay */}
      <section className="py-24 md:py-40 container mx-auto  ">
        <div className="relative aspect-[21/9] flex items-center justify-center overflow-hidden rounded-sm">
          <img
            src={aboutImg3.src}
            alt="Serene Lake"
            className="absolute inset-0 w-full h-full object-cover grayscale-[0.05] "
          />
          <div className="absolute inset-0 bg-[#05314a]/70 mix-blend-multiply" />
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative z-10 text-center px-8 sm:px-12 max-w-6xl mx-auto space-y-8">
            <h2 className="text-3xl md:text-5xl lg:text-4xl font-serif font-bold text-white tracking-tighter leading-tight drop-shadow-md">
              We don’t just sell flies; we provide the confidence to make that
              one cast count. Whether you are chasing wild browns in a hidden
              creek or technical rainbows on a tailwater, our gear is designed
              to enhance your time on the water.
            </h2>
            <div className="pt-6">
              <Link
                href="/fly-bars"
                className="text-[11px] font-black uppercase tracking-widest text-white border-b border-white pb-1 hover:text-white/80 hover:border-white/80 transition-all drop-shadow-sm"
              >
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
