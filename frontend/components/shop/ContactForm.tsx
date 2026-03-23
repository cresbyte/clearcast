"use client";

import React, { useState } from 'react';
import { useSendContactMessage } from '@/api/contactApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Mail, Phone, MapPin, Send } from 'lucide-react';

export default function ContactForm() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');

    const sendContactMutation = useSendContactMessage();
    const isSubmitting = sendContactMutation.isPending;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !email || !subject || !message) {
            toast.error("Please fill in all required fields.");
            return;
        }

        const formData = {
            name,
            email,
            phone_number: phone,
            subject,
            message
        };

        sendContactMutation.mutate(formData, {
            onSuccess: () => {
                toast.success("Your message has been sent successfully. We'll get back to you soon!");
                setName('');
                setEmail('');
                setPhone('');
                setSubject('');
                setMessage('');
            },
            onError: (error: any) => {
                const message = error.response?.data?.detail || "Failed to send message. Please try again later.";
                toast.error(message);
            }
        });
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="space-y-8">
                <div>
                    <h2 className="text-3xl font-bold font-serif italic mb-4">Get in Touch</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Have a question about our collections or need assistance with an order?
                        Our dedicated client service team is here to help you.
                    </p>
                </div>

                <div className="space-y-6">
                    <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-none bg-muted flex items-center justify-center shrink-0">
                            <MapPin className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-widest">Our Boutique</h3>
                            <p className="text-muted-foreground text-sm mt-1">
                                123 Fashion Avenue<br />
                                New York, NY 10022
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-none bg-muted flex items-center justify-center shrink-0">
                            <Phone className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-widest">Phone</h3>
                            <p className="text-muted-foreground text-sm mt-1">
                                +1 (212) 555-0198<br />
                                Mon-Fri: 9am - 6pm EST
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-none bg-muted flex items-center justify-center shrink-0">
                            <Mail className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-widest">Email</h3>
                            <p className="text-muted-foreground text-sm mt-1">
                                support@gucci-shop.com<br />
                                concierge@gucci-shop.com
                            </p>
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t">
                    <h3 className="text-sm font-bold uppercase tracking-widest mb-4">Follow Us</h3>
                    <div className="flex gap-4">
                        {['Instagram', 'Twitter', 'Facebook', 'Pinterest'].map((social) => (
                            <a
                                key={social}
                                href="#"
                                className="text-xs font-bold uppercase tracking-tighter hover:underline"
                            >
                                {social}
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            {/* Contact Form */}
            <div className="bg-[#F9F9F7] p-8 md:p-10 border border-border/50">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-[10px] uppercase tracking-widest font-bold">Your Name *</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="John Doe"
                                className="rounded-none bg-white"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-[10px] uppercase tracking-widest font-bold">Email Address *</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="john@example.com"
                                className="rounded-none bg-white"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="phone" className="text-[10px] uppercase tracking-widest font-bold">Phone Number</Label>
                            <Input
                                id="phone"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="+1 (555) 000-0000"
                                className="rounded-none bg-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="subject" className="text-[10px] uppercase tracking-widest font-bold">Subject *</Label>
                            <Input
                                id="subject"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="Order Inquiry"
                                className="rounded-none bg-white"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="message" className="text-[10px] uppercase tracking-widest font-bold">Message *</Label>
                        <Textarea
                            id="message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="How can we help you?"
                            className="min-h-[150px] rounded-none bg-white"
                            required
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-none h-12 text-[10px] uppercase tracking-widest font-bold"
                    >
                        {isSubmitting ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="mr-2 h-4 w-4" />
                        )}
                        Send Message
                    </Button>
                </form>
            </div>
        </div>
    );
}
