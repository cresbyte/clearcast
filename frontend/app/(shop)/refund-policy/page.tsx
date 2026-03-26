import React from 'react';

export const metadata = {
    title: 'Refund Policy | Clearcast Fly Ltd',
    description: 'Our 30-day return policy and instructions on how to request a return or refund.',
};

export default function RefundPolicyPage() {
    return (
        <div className="min-h-screen bg-white py-24 md:py-32">
            <div className="container mx-auto px-4 max-w-3xl">
                <header className="mb-16 text-center">
                    <span className="text-[10px] uppercase tracking-[0.3em] font-black text-primary/60">Support</span>
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground tracking-tighter mt-4">
                        Refund Policy
                    </h1>
                </header>

                <div className="prose prose-sm md:prose-base max-w-none text-muted-foreground/80 leading-relaxed space-y-12">
                    <section className="space-y-4">
                        <p>
                            We have a 30-day return policy, which means you have 30 days after receiving your item to request a return.
                        </p>
                        <p>
                            To be eligible for a return, your item must be in the same condition that you received it, unworn or unused, with tags, and in its original packaging. You’ll also need the receipt or proof of purchase.
                        </p>
                        <p>
                            To start a return, you can contact us at <a href="mailto:lila@clearcastfly.com" className="text-primary font-bold hover:underline">lila@clearcastfly.com</a>. Please note that returns will need to be sent to the following address:
                        </p>
                        <div className="bg-[#F9F9F7] p-6 border border-border/50 not-prose">
                            <p className="font-serif italic text-foreground">
                                Kirangare Farm, Lengenet, Rongai, Nakuru County, Kenya
                            </p>
                        </div>
                        <p>
                            If your return is accepted, we’ll send you a return shipping label, as well as instructions on how and where to send your package. Items sent back to us without first requesting a return will not be accepted.
                        </p>
                        <p>
                            You can always contact us for any return question at <a href="mailto:lila@clearcastfly.com" className="text-primary font-bold hover:underline">lila@clearcastfly.com</a>.
                        </p>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-serif font-bold text-foreground tracking-tight border-b border-border/30 pb-4">
                            Damages and issues
                        </h2>
                        <p>
                            Please inspect your order upon reception and contact us immediately if the item is defective, damaged or if you receive the wrong item, so that we can evaluate the issue and make it right.
                        </p>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-serif font-bold text-foreground tracking-tight border-b border-border/30 pb-4">
                            Exceptions / non-returnable items
                        </h2>
                        <p>
                            Certain types of items cannot be returned, like perishable goods (such as food, flowers, or plants), custom products (such as special orders or personalized items), and personal care goods (such as beauty products). We also do not accept returns for hazardous materials, flammable liquids, or gases. Please get in touch if you have questions or concerns about your specific item.
                        </p>
                        <p>
                            Unfortunately, we cannot accept returns on sale items or gift cards.
                        </p>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-serif font-bold text-foreground tracking-tight border-b border-border/30 pb-4">
                            Exchanges
                        </h2>
                        <p>
                            The fastest way to ensure you get what you want is to return the item you have, and once the return is accepted, make a separate purchase for the new item.
                        </p>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-serif font-bold text-foreground tracking-tight border-b border-border/30 pb-4">
                            European Union 14 day cooling off period
                        </h2>
                        <p>
                            Notwithstanding the above, if the merchandise is being shipped into the European Union, you have the right to cancel or return your order within 14 days, for any reason and without a justification. As above, your item must be in the same condition that you received it, unworn or unused, with tags, and in its original packaging. You’ll also need the receipt or proof of purchase.
                        </p>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-serif font-bold text-foreground tracking-tight border-b border-border/30 pb-4">
                            Refunds
                        </h2>
                        <p>
                            We will notify you once we’ve received and inspected your return, and let you know if the refund was approved or not. If approved, you’ll be automatically refunded on your original payment method within 10 business days. Please remember it can take some time for your bank or credit card company to process and post the refund too.
                        </p>
                        <p>
                            If more than 15 business days have passed since we’ve approved your return, please contact us at <a href="mailto:lila@clearcastfly.com" className="text-primary font-bold hover:underline">lila@clearcastfly.com</a>
                        </p>
                    </section>
                </div>

                <footer className="mt-24 pt-12 border-t border-border text-center">
                    <p className="text-xs text-muted-foreground">
                        Questions? Reach out to us at lila@clearcastfly.com
                    </p>
                </footer>
            </div>
        </div>
    );
}
