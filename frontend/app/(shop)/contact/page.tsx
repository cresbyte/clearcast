import ContactForm from '@/components/shop/ContactForm';

export const metadata = {
    title: 'Contact Us | Clearcast Fly Ltd',
    description: 'Get in touch with our team for any inquiries or assistance.',
};

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="bg-[#F9F9F7] py-20 border-b">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold font-serif italic mb-6">Contact Us</h1>
                    <div className="h-1 w-20 bg-primary mx-auto mb-8"></div>
                    <p className="max-w-2xl mx-auto text-muted-foreground text-lg leading-relaxed">
                        We are at your full disposal for any request. Please feel free to reach out
                        using the form below or through our direct contact information.
                    </p>
                </div>
            </section>

            {/* Form Section */}
            <section className="py-20">
                <div className="container mx-auto px-4 max-w-6xl">
                    <ContactForm />
                </div>
            </section>

            {/* FAQ Pre-footer */}
            <section className="bg-muted/30 py-16 border-t border-b">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-2xl font-bold font-serif italic mb-8">Frequently Asked Questions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="p-6">
                            <h3 className="text-sm font-bold uppercase tracking-widest mb-3">Shipping & Delivery</h3>
                            <p className="text-xs text-muted-foreground italic">Find information on tracking, delivery times, and international shipping.</p>
                        </div>
                        <div className="p-6">
                            <h3 className="text-sm font-bold uppercase tracking-widest mb-3">Returns & Exchanges</h3>
                            <p className="text-xs text-muted-foreground italic">Learn about our simple and elegant return process within 30 days.</p>
                        </div>
                        <div className="p-6">
                            <h3 className="text-sm font-bold uppercase tracking-widest mb-3">Product Care</h3>
                            <p className="text-xs text-muted-foreground italic">Discover how to maintain the quality and longevity of your Clearcast flies.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}