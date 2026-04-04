"use client";

import React from 'react';
import Link from 'next/link';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Footer = () => {
    return (
        <footer className="bg-primary text-white border-t border-white/5 pt-20 pb-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 mb-20">
                    {/* Column 1: Identity */}
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <Link href="/" className="transition-opacity hover:opacity-80 block mb-6">
                                <img
                                    src="/clearcast-logo.webp"
                                    alt="Clearcast Logo"
                                    className="h-10 md:h-12 w-auto object-contain"
                                />
                            </Link>
                        </div>
                        <p className="text-[13px] text-white/60 leading-relaxed max-w-xs italic font-serif">
                            Premium fly-tying patterns and high-caliber gear for serious anglers. Born on the water, built for the hatch.
                        </p>
                        <div className="flex space-x-5 pt-2">
                            <a href="#" className="text-white/40 hover:text-secondary transition-all duration-300"><Facebook className="h-[18px] w-[18px]" /></a>
                            <a href="#" className="text-white/40 hover:text-secondary transition-all duration-300"><Twitter className="h-[18px] w-[18px]" /></a>
                            <a href="#" className="text-white/40 hover:text-secondary transition-all duration-300"><Instagram className="h-[18px] w-[18px]" /></a>
                        </div>
                    </div>

                    {/* Column 2: The Collection */}
                    <div className="lg:pl-8">
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40 mb-10">The Collection</h4>
                        <ul className="space-y-5 text-[13px]">
                            <li><Link href="/" className="text-white/70 hover:text-secondary transition-colors">Home</Link></li>
                            <li><Link href="/fly-sets" className="text-white/70 hover:text-secondary transition-colors">Fly Sets</Link></li>
                            <li><Link href="/fly-bars" className="text-white/70 hover:text-secondary transition-colors">Fly Bars</Link></li>
                            <li><Link href="/about" className="text-white/70 hover:text-secondary transition-colors">Our Story</Link></li>
                        </ul>
                    </div>

                    {/* Column 3: Support & Information */}
                    <div>
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40 mb-10">Assistance</h4>
                        <ul className="space-y-5 text-[13px]">
                            <li><Link href="/contact" className="text-white/70 hover:text-secondary transition-colors">Contact</Link></li>
                            <li><Link href="/faq" className="text-white/70 hover:text-secondary transition-colors">FAQs</Link></li>
                            <li><Link href="/shipping" className="text-white/70 hover:text-secondary transition-colors">Shipping & Returns</Link></li>
                            <li><Link href="/privacy-policy" className="text-white/70 hover:text-secondary transition-colors">Privacy Policy</Link></li>
                        </ul>
                    </div>

                    {/* Column 4: Bespoke & Connect */}
                    <div className="space-y-12">
                        <div className="space-y-6">
                            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40">Custom Orders</h4>
                            <p className="text-[13px] text-white/60 leading-relaxed">
                                If you're seeking something, not in our inventory, let us know! We can talk about ordering any pattern of your choice  - just <a href="mailto:lila@clearcastfly.com" className="text-secondary hover:underline transition-colors font-bold">send an email</a>.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40">Newsletter</h4>
                            <form className="relative group">
                                <input
                                    type="email"
                                    placeholder="Email address"
                                    className="w-full bg-transparent border-b border-white/20 py-2 text-sm outline-none focus:border-secondary transition-colors placeholder:text-white/20 text-white"
                                />
                                <button className="absolute right-0 bottom-2 text-[10px] font-black uppercase tracking-widest text-secondary hover:text-white transition-all">
                                    Join
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-[11px] uppercase tracking-widest text-white/30 font-medium">
                        &copy; {new Date().getFullYear()} Clearcast Fly Ltd. All rights reserved.
                    </p>
                    <div className="flex items-center gap-8">
                        <div className="flex gap-4">
                            {/* Simple payment icons placeholders */}
                            <div className="h-4 w-6 bg-muted opacity-40" />
                            <div className="h-4 w-6 bg-muted opacity-40" />
                            <div className="h-4 w-6 bg-muted opacity-40" />
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
