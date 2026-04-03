"use client";

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

const standards = [
  {
    question: "What materials do you use at the vice?",
    answer: "We don't believe in \"filler\" materials. Every fly is built on high-carbon, chemically sharpened hooks (primarily Hanak and Ahrex) to ensure your hook-set stays buried. We exclusively use Whiting Farms hackle for superior floatability and premium UV-reflective dubbings to catch that extra bit of light in deep water."
  },
  {
    question: "How long until these hit my fly box?",
    answer: "We know you have a trip coming up. In-stock flies from the Fly Bar typically ship within 72 hours via tracked mail. For Custom Orders, please allow a 2-3 weeks lead time; quality bench-work can’t be rushed, and we want to ensure every wrap is perfect before they leave the bench."
  },
  {
    question: "I’m not sure what to buy for my local river. Can you help?",
    answer: "Absolutely. If you’re staring at a hatch you don't recognize, shoot us a message on WhatsApp or email with a photo of the bug or your general location. We’ll help you \"Match the Hatch\" with a selection from our current inventory so you aren't wasting casts."
  },
  {
    question: "How many takes will these flies survive?",
    answer: "Our flies aren't \"one-and-done.\" We double-whip finish and use reinforced threading on all our nymphs and streamers. To maximize the life of your dries, we recommend using a high-quality desiccant shake and avoiding forceps on the hackle. Built to be fished, not just admired."
  }
];

export default function QualityStandards() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-24 md:py-32 bg-white">
      <div className="container mx-auto px-4 max-w-8xl">
        <div className="text-center mb-16 space-y-4">
          <span className="text-[10px] uppercase tracking-[0.4em] font-black text-secondary">Our Commitment</span>
          <h2 className="text-4xl md:text-6xl font-serif font-bold text-foreground tracking-tighter italic">
            The Quality Standards
          </h2>
          <div className="w-12 h-[1px] bg-secondary mx-auto mt-6" />
        </div>

        <div className="space-y-4">
          {standards.map((item, idx) => (
            <div 
              key={idx} 
              className={cn(
                "border border-border/50 transition-all duration-500",
                openIndex === idx ? "bg-[#F9F9F7] border-secondary/20" : "hover:border-secondary/20"
              )}
            >
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full flex items-center justify-between p-6 md:p-8 text-left group"
              >
                <span className={cn(
                  "text-base md:text-lg font-serif font-bold tracking-tight transition-colors duration-300",
                  openIndex === idx ? "text-secondary" : "group-hover:text-secondary"
                )}>
                  {item.question}
                </span>
                <ChevronDown className={cn(
                  "h-5 w-5 shrink-0 transition-transform duration-500 text-muted-foreground/40",
                  openIndex === idx && "rotate-180 text-secondary"
                )} />
              </button>
              
              <div className={cn(
                "overflow-hidden transition-all duration-500 ease-in-out px-6 md:px-8",
                openIndex === idx ? "max-h-[500px] pb-8 opacity-100" : "max-h-0 opacity-0"
              )}>
                <p className="text-[15px] text-muted-foreground/80 leading-loose max-w-6xl font-sans">
                  {item.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
