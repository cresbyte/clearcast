import React from 'react';

export const metadata = {
    title: 'Frequently Asked Questions | Clearcast Fly Ltd',
    description: 'Find answers to common questions about our fly patterns, shipping, and return policies.',
};

const faqs = [
    {
        question: "What is the return policy?",
        answer: "Our goal is for every customer to be totally satisfied with their purchase. If this isn't the case, let us know and we'll do our best to work with you to make it right."
    },
    {
        question: "Are any purchases final sale?",
        answer: "We are unable to accept returns on certain items. These will be carefully marked before purchase."
    },
    {
        question: "Where are your products manufactured?",
        answer: "Our products are manufactured both locally and globally. We carefully select our manufacturing partners to ensure our products are high quality and a fair value."
    },
    {
        question: "How much does shipping cost?",
        answer: "Shipping is calculated based on your location and the items in your order. You will always know the shipping price before you purchase."
    },
    {
        question: "What materials do you use at the vice?",
        answer: "We don't believe in 'filler' materials. Every fly is built on high-carbon, chemically sharpened hooks (primarily Hanak and Ahrex) to ensure your hook-set stays buried. We exclusively use Whiting Farms hackle for superior floatability and premium UV-reflective dubbings to catch that extra bit of light in deep water."
    },
    {
        question: "How long until these hit my fly box?",
        answer: "We know you have a trip coming up. In-stock flies from the Fly Bar typically ship within 72 hours via tracked mail. For Custom Orders, please allow a 2-3 weeks lead time; quality bench-work can’t be rushed, and we want to ensure every wrap is perfect before they leave the bench."
    },
    {
        question: "I’m not sure what to buy for my local river. Can you help?",
        answer: "Absolutely. If you’re staring at a hatch you don't recognize, shoot us a message on WhatsApp or email with a photo of the bug or your general location. We’ll help you 'Match the Hatch' with a selection from our current inventory so you aren't wasting casts."
    },
    {
        question: "How many takes will these flies survive?",
        answer: "Our flies aren't 'one-and-done.' We double-whip finish and use reinforced threading on all our nymphs and streamers. To maximize the life of your dries, we recommend using a high-quality desiccant shake and avoiding forceps on the hackle. Built to be fished, not just admired."
    }
];

export default function FaqPage() {
    return (
        <div className="min-h-screen bg-white py-24 md:py-32">
            <div className="container mx-auto px-4 max-w-3xl">
                <header className="mb-16 text-center">
                    <span className="text-[10px] uppercase tracking-[0.3em] font-black text-primary/60">Support</span>
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground tracking-tighter mt-4">
                        Frequently Asked Questions
                    </h1>
                </header>

                <div className="space-y-12">
                    {faqs.map((faq, index) => (
                        <div key={index} className="space-y-4">
                            <h3 className="text-lg font-serif font-bold text-foreground">
                                {faq.question}
                            </h3>
                            <p className="text-sm text-muted-foreground/80 leading-relaxed max-w-2xl">
                                {faq.answer}
                            </p>
                            {index !== faqs.length - 1 && <div className="w-12 h-[1px] bg-border mt-8" />}
                        </div>
                    ))}
                </div>

                <footer className="mt-24 pt-12 border-t border-border text-center">
                    <p className="text-xs text-muted-foreground">
                        Still have questions? Reach out to us via email or WhatsApp.
                    </p>
                </footer>
            </div>
        </div>
    );
}