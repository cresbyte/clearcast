"use client";

import React from 'react';
import image from './fishing-fly-convo.webp';

export default function FishingFlyConvo() {
  return (
    <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-[#F9F9F7]">
      <div 
        className="absolute inset-0 z-0 bg-fixed bg-center bg-cover bg-no-repeat"
        style={{ backgroundImage: `url(${image.src})` }}
      >
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="container mx-auto px-4 relative z-10 text-center">
        <h2 className="text-4xl md:text-5xl lg:text-7xl font-serif font-medium text-white italic tracking-tighter leading-tight max-w-7xl mx-auto drop-shadow-sm">
          "A fly is a tool for a conversation with a fish. <br className="hidden md:block" /> Make sure you're speaking the right language."
        </h2>
      </div>

      <div className="absolute bottom-12 right-12 z-10 text-right space-y-1">
        <p className="text-[10px] uppercase tracking-[0.4em] font-black text-secondary">Introducing</p>
        <p className="text-xl md:text-2xl font-serif font-bold text-white tracking-tighter">Clearcast Fly Ltd</p>
      </div>
    </section>
  );
}
