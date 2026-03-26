"use client";

import React from 'react';
import Link from 'next/link';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Footer = () => {
    return (
        <footer className="bg-white border-t border-border/40 pt-20 pb-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 mb-20">
                    {/* Brand & About */}
                    <div className="space-y-6">
                        <Link href="/" className="text-2xl font-serif font-bold tracking-tighter text-foreground">
                            Clearcast
                        </Link>
                        <p className="text-[13px] text-muted-foreground/80 leading-relaxed max-w-xs">
                            Premium fly-tying patterns and high-caliber gear for serious anglers. Born on the water, built for the hatch.
                        </p>
                        <div className="flex space-x-5 pt-2">
                            <a href="#" className="text-muted-foreground hover:text-foreground transition-all duration-300"><Facebook className="h-[18px] w-[18px]" /></a>
                            <a href="#" className="text-muted-foreground hover:text-foreground transition-all duration-300"><Twitter className="h-[18px] w-[18px]" /></a>
                            <a href="#" className="text-muted-foreground hover:text-foreground transition-all duration-300"><Instagram className="h-[18px] w-[18px]" /></a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="lg:pl-8">
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground mb-8">Collection</h4>
                        <ul className="space-y-4 text-[13px]">
                            <li><Link href="/shop" className="text-muted-foreground hover:text-primary transition-colors">All Products</Link></li>
                            <li><Link href="/shop?category=new" className="text-muted-foreground hover:text-primary transition-colors">New Arrivals</Link></li>
                            <li><Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">Our Story</Link></li>
                            <li><Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link></li>
                        </ul>
                    </div>

                    {/* Customer Service */}
                    <div>
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground mb-8">Support</h4>
                        <ul className="space-y-4 text-[13px]">
                            <li><Link href="/faq" className="text-muted-foreground hover:text-primary transition-colors">FAQs</Link></li>
                            <li><Link href="/shipping" className="text-muted-foreground hover:text-primary transition-colors">Shipping & Returns</Link></li>
                            <li><Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div className="space-y-6">
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground mb-8">Newsletter</h4>
                        <p className="text-[13px] text-muted-foreground/80 leading-relaxed">
                            Subscribe to receive exclusive collection updates and early access.
                        </p>
                        <form className="relative group">
                            <input
                                type="email"
                                placeholder="Email address"
                                className="w-full bg-transparent border-b border-border py-2 text-sm outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/40"
                            />
                            <button className="absolute right-0 bottom-2 text-[10px] font-black uppercase tracking-widest text-primary hover:opacity-50 transition-all">
                                Join
                            </button>
                        </form>
                    </div>
                </div>

                <div className="border-t border-border/30 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-[11px] uppercase tracking-widest text-muted-foreground/60 font-medium">
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
