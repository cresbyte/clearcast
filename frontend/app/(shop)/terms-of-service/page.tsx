import React from 'react';
import Link from 'next/link';

export const metadata = {
    title: 'Terms of Service | Clearcast Fly Ltd',
    description: 'The terms and conditions for using Clearcast Fly Ltd services and products.',
};

export default function TermsOfServicePage() {
    return (
        <div className="min-h-screen bg-white py-24 md:py-32">
            <div className="container mx-auto px-4 max-w-4xl">
                <header className="mb-16 text-center">
                    <span className="text-[10px] uppercase tracking-[0.3em] font-black text-primary/60">Legal</span>
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground tracking-tighter mt-4">
                        Terms of Service
                    </h1>
                </header>

                <div className="prose prose-sm md:prose-base max-w-none text-muted-foreground/80 leading-relaxed space-y-12">
                    <section className="space-y-4">
                        <h2 className="text-2xl font-serif font-bold text-foreground tracking-tight border-b border-border/30 pb-4 uppercase">
                            Overview
                        </h2>
                        <p>
                            Welcome to Clearcast Fly Ltd! The terms “we”, “us” and “our” refer to Clearcast Fly Ltd. Clearcast Fly Ltd operates this store and website, including all related information, content, features, tools, products and services in order to provide you, the customer, with a curated shopping experience (the “Services”). Clearcast Fly Ltd is powered by Shopify, which enables us to provide the Services to you.
                        </p>
                        <p>
                            The below terms and conditions, together with any policies referenced herein (these “Terms of Service” or “Terms”) describe your rights and responsibilities when you use the Services.
                        </p>
                        <p>
                            Please read these Terms of Service carefully, as they include important information about your legal rights and cover areas such as warranty disclaimers and limitations of liability.
                        </p>
                        <p>
                            By visiting, interacting with or using our Services, you agree to be bound by these Terms of Service and our <Link href="/privacy-policy" className="text-primary font-bold hover:underline">Privacy Policy</Link>. If you do not agree to these Terms of Service or Privacy Policy, you should not use or access our Services.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-serif font-bold text-foreground tracking-tight border-b border-border/30 pb-2 uppercase">
                            SECTION 1 - ACCESS AND ACCOUNT
                        </h2>
                        <p>
                            By agreeing to these Terms of Service, you represent that you are at least the age of majority in your state or province of residence, and you have given us your consent to allow any of your minor dependents to use the Services on devices you own, purchase or manage.
                        </p>
                        <p>
                            To use the Services, including accessing or browsing our online stores or purchasing any of the products or services we offer, you may be asked to provide certain information, such as your email address, billing, payment, and shipping information. You represent and warrant that all the information you provide in our stores is correct, current and complete and that you have all rights necessary to provide this information.
                        </p>
                        <p>
                            You are solely responsible for maintaining the security of your account credentials and for all of your account activity. You may not transfer, sell, assign, or license your account to any other person.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-serif font-bold text-foreground tracking-tight border-b border-border/30 pb-2 uppercase">
                            SECTION 2 - OUR PRODUCTS
                        </h2>
                        <p>
                            We have made every effort to provide an accurate representation of our products and services in our online stores. However, please note that colors or product appearance may differ from how they may appear on your screen due to the type of device you use to access the store and your device settings and configuration.
                        </p>
                        <p>
                            We do not warrant that the appearance or quality of any products or services purchased by you will meet your expectations or be the same as depicted or rendered in our online stores.
                        </p>
                        <p>
                            All descriptions of products are subject to change at any time without notice at our sole discretion. We reserve the right to discontinue any product at any time and may limit the quantities of any products that we offer to any person, geographic region or jurisdiction, on a case-by-case basis.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-serif font-bold text-foreground tracking-tight border-b border-border/30 pb-2 uppercase">
                            SECTION 3 - ORDERS
                        </h2>
                        <p>
                            When you place an order, you are making an offer to purchase. Clearcast Fly Ltd reserves the right to accept or decline your order for any reason at its discretion. Your order is not accepted until Clearcast Fly Ltd confirms acceptance. We must receive and process your payment before your order is accepted. Please review your order carefully before submitting, as Clearcast Fly Ltd may be unable to accommodate cancellation requests after an order is accepted. In the event that we do not accept, make a change to, or cancel an order, we will attempt to notify you by contacting the e‑mail, billing address, and/or phone number provided at the time the order was made.
                        </p>
                        <p>
                            Your purchases are subject to return or exchange solely in accordance with our <Link href="/refund-policy" className="text-primary font-bold hover:underline">Refund Policy</Link>.
                        </p>
                        <p>
                            You represent and warrant that your purchases are for your own personal or household use and not for commercial resale or export.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-serif font-bold text-foreground tracking-tight border-b border-border/30 pb-2 uppercase">
                            SECTION 4 - PRICES AND BILLING
                        </h2>
                        <p>
                            Prices, discounts and promotions are subject to change without notice. The price charged for a product or service will be the price in effect at the time the order is placed and will be set out in your order confirmation email. Unless otherwise expressly stated, posted prices do not include taxes, shipping, handling, customs or import charges.
                        </p>
                        <p>
                            Prices posted in our online stores may be different from prices offered in physical stores or in online or other stores operated by third parties. We may offer, from time to time, promotions on the Services that may affect pricing and that are governed by terms and conditions separate from these Terms. If there is a conflict between the terms for a promotion and these Terms, the promotion terms will govern.
                        </p>
                        <p>
                            You agree to provide current, complete and accurate purchase, payment and account information for all purchases made at our stores. You agree to promptly update your account and other information, including your email address, credit card numbers and expiration dates, so that we can complete your transactions and contact you as needed.
                        </p>
                        <p>
                            You represent and warrant that (i) the credit card information you provide is true, correct, and complete, (ii) you are duly authorized to use such credit card for the purchase, (iii) charges incurred by you will be honored by your credit card company, and (iv) you will pay charges incurred by you at the posted prices, including shipping and handling charges and all applicable taxes, if any.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-serif font-bold text-foreground tracking-tight border-b border-border/30 pb-2 uppercase">
                            SECTION 5 - SHIPPING AND DELIVERY
                        </h2>
                        <p>
                            We are not liable for shipping and delivery delays. All delivery times are estimates only and are not guaranteed. We are not responsible for delays caused by shipping carriers, customs processing, or events outside our control. Once we transfer products to the carrier, title and risk of loss passes to you.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-serif font-bold text-foreground tracking-tight border-b border-border/30 pb-2 uppercase">
                            SECTION 6 - INTELLECTUAL PROPERTY
                        </h2>
                        <p>
                            Our Services, including but not limited to all trademarks, brands, text, displays, images, graphics, product reviews, video, and audio, and the design, selection, and arrangement thereof, are owned by Clearcast Fly Ltd, its affiliates or licensors and are protected by U.S. and foreign patent, copyright and other intellectual property laws.
                        </p>
                        <p>
                            These Terms permit you to use the Services for your personal, non-commercial use only. You must not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any of the material on the Services without our prior written consent. Except as expressly provided herein, nothing in these Terms grants or shall be construed as granting a license or other rights to you under any patent, trademark, copyright, or other intellectual property of Clearcast Fly Ltd, Shopify or any third party. Unauthorized use of the Services may be a violation of federal and state intellectual property laws. All rights not expressly granted herein are reserved by Clearcast Fly Ltd.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-serif font-bold text-foreground tracking-tight border-b border-border/30 pb-2 uppercase">
                            SECTION 7 - OPTIONAL TOOLS
                        </h2>
                        <p>
                            You may be provided with access to customer tools offered by third parties as part of the Services, which we neither monitor nor have any control nor input.
                        </p>
                        <p>
                            You acknowledge and agree that we provide access to such tools “as is” and “as available” without any warranties, representations or conditions of any kind and without any endorsement. We shall have no liability whatsoever arising from or relating to your use of optional third-party tools.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-serif font-bold text-foreground tracking-tight border-b border-border/30 pb-2 uppercase">
                            SECTION 8 - THIRD-PARTY LINKS
                        </h2>
                        <p>
                            The Services may contain materials and hyperlinks to websites provided or operated by third parties (including any embedded third party functionality). We are not responsible for examining or evaluating the content or accuracy of any third-party materials or websites you choose to access. If you decide to leave the Services to access these materials or third party sites, you do so at your own risk.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-serif font-bold text-foreground tracking-tight border-b border-border/30 pb-2 uppercase">
                            SECTION 9 - RELATIONSHIP WITH SHOPIFY
                        </h2>
                        <p>
                            Clearcast Fly Ltd is powered by Shopify, which enables us to provide the Services to you. However, any sales and purchases you make in our Store are made directly with Clearcast Fly Ltd. By using the Services, you acknowledge and agree that Shopify is not responsible for any aspect of any sales between you and Clearcast Fly Ltd, including any injury, damage, or loss resulting from purchased products and services. You hereby expressly release Shopify and its affiliates from all claims, damages, and liabilities arising from or related to your purchases and transactions with Clearcast Fly Ltd.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-serif font-bold text-foreground tracking-tight border-b border-border/30 pb-2 uppercase">
                            SECTION 10 - PRIVACY POLICY
                        </h2>
                        <p>
                            All personal information we collect through the Services is subject to our <Link href="/privacy-policy" className="text-primary font-bold hover:underline">Privacy Policy</Link>, and certain personal information may be subject to Shopify’s Privacy Policy. By using the Services, you acknowledge that you have read these privacy policies.
                        </p>
                        <p>
                            Because the Services are hosted by Shopify, Shopify collects and processes personal information about your access to and use of the Services in order to provide and improve the Services for you. Information you submit to the Services will be transmitted to and shared with Shopify as well as third parties that may be located in other countries than where you reside, in order to provide services to you. Review our <Link href="/privacy-policy" className="text-primary font-bold hover:underline">privacy policy</Link> for more details on how we, Shopify, and our partners use your personal information.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-serif font-bold text-foreground tracking-tight border-b border-border/30 pb-2 uppercase">
                            SECTION 13 - PROHIBITED USES
                        </h2>
                        <p>
                            You may access and use the Services for lawful purposes only. You may not access or use the Services, directly or indirectly: (a) for any unlawful or malicious purpose; (b) to violate any international, federal, provincial or state regulations, rules, laws, or local ordinances; (c) to infringe upon or violate our intellectual property rights or the intellectual property rights of others; (d) to harass, abuse, insult, harm, defame, slander, disparage, intimidate, or harm any of our employees or any other person.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-serif font-bold text-foreground tracking-tight border-b border-border/30 pb-2 uppercase">
                            SECTION 15 - DISCLAIMER OF WARRANTIES
                        </h2>
                        <p>
                            EXCEPT AS EXPRESSLY STATED BY Clearcast Fly Ltd, THE SERVICES AND ALL PRODUCTS OFFERED THROUGH THE SERVICES ARE PROVIDED 'AS IS' AND 'AS AVAILABLE' FOR YOUR USE, WITHOUT ANY REPRESENTATION, WARRANTIES OR CONDITIONS OF ANY KIND.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-serif font-bold text-foreground tracking-tight border-b border-border/30 pb-2 uppercase">
                            SECTION 16 - LIMITATION OF LIABILITY
                        </h2>
                        <p>
                            TO THE FULLEST EXTENT PROVIDED BY LAW, IN NO CASE SHALL Clearcast Fly Ltd, OUR PARTNERS, DIRECTORS, OFFICERS, EMPLOYEES, AFFILIATES, AGENTS, CONTRACTORS, SERVICE PROVIDERS OR LICENSORS BE LIABLE FOR ANY INJURY, LOSS, CLAIM, OR ANY DIRECT, INDIRECT, INCIDENTAL, PUNITIVE, SPECIAL, OR CONSEQUENTIAL DAMAGES OF ANY KIND.
                        </p>
                    </section>

                    <section className="space-y-6 bg-[#F9F9F7] p-8 border border-border/50 not-prose">
                        <h2 className="text-2xl font-serif font-bold text-foreground tracking-tight mb-4 uppercase">
                            SECTION 24 - CONTACT INFORMATION
                        </h2>
                        <p className="text-sm text-muted-foreground/80 leading-relaxed">
                            Questions about the Terms of Service should be sent to us at <a href="mailto:lila@clearcastfly.com" className="text-primary font-bold hover:underline">lila@clearcastfly.com</a> or at:
                        </p>
                        <p className="text-foreground font-serif italic mt-4">
                            Kirangare Farm, Lengenet, Rongai, Nakuru County, Kenya
                        </p>
                    </section>
                </div>

                <footer className="mt-24 pt-12 border-t border-border text-center">
                    <p className="text-xs text-muted-foreground">
                        &copy; {new Date().getFullYear()} Clearcast Fly Ltd. All rights reserved.
                    </p>
                </footer>
            </div>
        </div>
    );
}
