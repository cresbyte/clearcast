#!/usr/bin/env python3
"""Generate luxury_products_data.json with all 100 products."""
import json, os

products = []

IMG = {
    'grooming': [
        'https://images.unsplash.com/photo-1585751119414-ef2636f8aede?w=800&q=80',
        'https://images.unsplash.com/photo-1621607512214-68297480165e?w=800&q=80',
        'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&q=80',
        'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800&q=80',
        'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=800&q=80',
    ],
    'watch': [
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
        'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&q=80',
        'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=800&q=80',
        'https://images.unsplash.com/photo-1539874754764-5a96559165b0?w=800&q=80',
        'https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=800&q=80',
        'https://images.unsplash.com/photo-1609587312208-cea54be969e7?w=800&q=80',
    ],
    'frag': [
        'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80',
        'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800&q=80',
        'https://images.unsplash.com/photo-1594035910387-fea081ce5b57?w=800&q=80',
        'https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=800&q=80',
        'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80',
    ],
    'cashmere': [
        'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80',
        'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80',
        'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800&q=80',
        'https://images.unsplash.com/photo-1609803384069-19f3b07c6596?w=800&q=80',
        'https://images.unsplash.com/photo-1544441893-675973e31985?w=800&q=80',
    ],
    'handbag': [
        'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80',
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80',
        'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80',
        'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800&q=80',
        'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=800&q=80',
        'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800&q=80',
    ],
    'jewelry': [
        'https://images.unsplash.com/photo-1515562141589-67f0d706a5c0?w=800&q=80',
        'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&q=80',
        'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80',
        'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=800&q=80',
        'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80',
        'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80',
    ],
    'lifestyle': [
        'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800&q=80',
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80',
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
        'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800&q=80',
        'https://images.unsplash.com/photo-1589756823695-278bc923e1d3?w=800&q=80',
    ],
}

def img(cat, idx):
    urls = IMG[cat]
    return urls[idx % len(urls)]

def mk(num, name, price, sku_pfx, cat, subcat, desc, brand, meta, img_cat, discount=0, variants=None):
    products.append({
        'num': num, 'name': name, 'price': price,
        'sku': f'{sku_pfx}-{num:03d}',
        'category': cat, 'subcategory': subcat,
        'description': desc,
        'details': f'<h3>About {name}</h3><p>{desc}</p><h3>Brand</h3><p>{brand}</p>',
        'image_url': img(img_cat, num),
        'metadata': {**meta, 'brand': brand},
        'discount': discount,
        'variants': variants or []
    })

# ===== I. MEN'S GROOMING (1-10) =====
mk(1,'Clay Pomade','25.00','TGG',"Men's Grooming",'Hair Care','High hold, matte finish pomade crafted from natural clay and beeswax. Provides a firm yet flexible hold for classic styles without stiffness or residue.','True Grit Grooming',{'hold':'High','finish':'Matte','weight':'4 oz'},'grooming')
mk(2,'Bamboo Beard Comb','25.00','TGG',"Men's Grooming",'Body Care','Handcrafted sustainable bamboo comb with fine and coarse teeth for versatile beard grooming. Anti-static design distributes natural oils evenly.','True Grit Grooming',{'material':'Bamboo','type':'Comb'},'grooming')
mk(3,'Big Cat Sea Salt Spray','25.00','TGG',"Men's Grooming",'Hair Care','Adds volume and beachy texture with natural sea salt minerals. Creates effortless, tousled waves for a laid-back look without crunchiness.','True Grit Grooming',{'hold':'Light','finish':'Natural','volume':'8 oz'},'grooming')
mk(4,'Original Pomade','20.00','TGG',"Men's Grooming",'Hair Care','Classic medium-hold pomade with refined shine, perfect for slicked-back styles, side parts, and pompadours. Premium ingredients for clean, all-day hold.','True Grit Grooming',{'hold':'Medium','finish':'Shine','weight':'4 oz'},'grooming')
mk(5,'Deadwood Hair & Body Wash','25.00','TGG',"Men's Grooming",'Body Care','Two-in-one pine-scented wash that cleanses hair and body with a refreshing forest fragrance. Sulfate-free, paraben-free.','True Grit Grooming',{'scent':'Pine Blend','volume':'12 oz'},'grooming')
mk(6,'Deadwood Deep Conditioner','25.00','TGG',"Men's Grooming",'Hair Care','Pine-scented deep conditioning treatment enriched with argan oil and keratin. Restores moisture and strength to damaged hair.','True Grit Grooming',{'scent':'Pine Blend','volume':'8 oz'},'grooming')
mk(7,'Lawless Deep Conditioner','25.00','TGG',"Men's Grooming",'Hair Care','Invigorating peppermint-scented conditioner delivering intense hydration with a cooling scalp sensation. Repairs dry, brittle hair.','True Grit Grooming',{'scent':'Peppermint','volume':'8 oz'},'grooming')
mk(8,'Lawless Hair & Body Wash','25.00','TGG',"Men's Grooming",'Body Care','Energizing peppermint-blend wash for hair and body. Sulfate-free formula gently cleanses while maintaining natural moisture balance.','True Grit Grooming',{'scent':'Peppermint','volume':'12 oz'},'grooming')
mk(9,'Steadfast Hair & Body Wash','25.00','TGG',"Men's Grooming",'Body Care','Bright citrus-scented dual-purpose wash for an invigorating start. Natural ingredients cleanse without stripping essential oils.','True Grit Grooming',{'scent':'Citrus Blend','volume':'12 oz'},'grooming')
mk(10,'Steadfast Deep Conditioner','25.00','TGG',"Men's Grooming",'Hair Care','Citrus-infused deep conditioner nourishing hair from root to tip. Packed with vitamin E and natural oils for healthy, shiny hair.','True Grit Grooming',{'scent':'Citrus Blend','volume':'8 oz'},'grooming')

# ===== II. WATCHES (11-23) =====
mk(11,'A Perfectly Useless Afternoon','295.00','MJW','Watches','Artistic Watches','Whimsical timepiece featuring an illustrated figure lounging poolside as the hours drift by. Swiss quartz movement in 37mm stainless steel.','Mr Jones Watches',{'case_size':'37mm','movement':'Swiss Quartz','water_resistance':'3 ATM'},'watch')
mk(12,'Beam Me Up','295.00','MJW','Watches','Artistic Watches','Playful alien-abduction themed watch where a tiny UFO beam tells the time. Swiss quartz movement with mineral crystal.','Mr Jones Watches',{'case_size':'37mm','movement':'Swiss Quartz'},'watch')
mk(13,'The Accurate','245.00','MJW','Watches','Artistic Watches','Minimalist watch featuring a skull motif — a memento mori reminding the wearer of life\'s fleeting nature. Japanese quartz movement.','Mr Jones Watches',{'case_size':'37mm','movement':'Japanese Quartz'},'watch',discount=15)
mk(14,'Monster Melter 3000','295.00','MJW','Watches','Artistic Watches','Vibrant, psychedelic monster artwork adorns this bold timepiece. The monster\'s tongue sweeps the minutes. Limited edition Swiss quartz.','Mr Jones Watches',{'case_size':'37mm','movement':'Swiss Quartz'},'watch')
mk(15,'Feline Fine','295.00','MJW','Watches','Artistic Watches','Elegant cat-themed watch where a feline\'s tail sweeps the seconds. Hand-painted dial with Swiss quartz movement.','Mr Jones Watches',{'case_size':'37mm','movement':'Swiss Quartz'},'watch')
mk(16,'Ricochet','425.00','MJW','Watches','Artistic Watches','Mesmerizing mechanical watch with layered cut-out shapes. Complex dial reveals different patterns as hands rotate. Automatic movement with exhibition caseback.','Mr Jones Watches',{'case_size':'40mm','movement':'Automatic','power_reserve':'40 hours'},'watch',variants=[{'name':'Leather Strap','price':None},{'name':'Metal Bracelet','price':'455.00'}])
mk(17,'A Perfectly Useless Morning','295.00','MJW','Watches','Artistic Watches','The morning companion to the afternoon edition, featuring a sunrise scene. Swiss quartz in polished stainless steel.','Mr Jones Watches',{'case_size':'37mm','movement':'Swiss Quartz'},'watch',discount=15)
mk(18,'Continuum','395.00','MJW','Watches','Artistic Watches','Abstract visualization of time flowing like water across the dial. Hours melt into one another. Automatic Swiss movement.','Mr Jones Watches',{'case_size':'40mm','movement':'Automatic'},'watch')
mk(19,'Number Cruncher','395.00','MJW','Watches','Artistic Watches','A playful monster devours the numbers as hours pass. Incredible detail in the hand-painted dial. Automatic movement, 40-hour reserve.','Mr Jones Watches',{'case_size':'40mm','movement':'Automatic','power_reserve':'40 hours'},'watch')
mk(20,'The Ascendent','425.00','MJW','Watches','Artistic Watches','Adventure-inspired watch with a mountain climber scaling toward the hour markers. Automatic movement with sapphire crystal.','Mr Jones Watches',{'case_size':'40mm','movement':'Automatic','crystal':'Sapphire'},'watch')
mk(21,'Gucci 25H Watch 36mm','2390.00','GUC','Watches','Luxury Watches','Ultra-slim timepiece with architectural dial inspired by modern design. Swiss quartz movement in a sleek 36mm case. Water-resistant to 50m.','Gucci',{'case_size':'36mm','movement':'Swiss Quartz','crystal':'Sapphire','water_resistance':'50m'},'watch')
mk(22,'Gucci 25H Watch 40mm','3950.00','GUC','Watches','Luxury Watches','Bold 40mm version of Gucci\'s 25H line with commanding wrist presence. Premium Swiss movement, sapphire crystal. Water-resistant to 50m.','Gucci',{'case_size':'40mm','movement':'Swiss Quartz','crystal':'Sapphire','water_resistance':'50m'},'watch')
mk(23,'Gucci Interlocking Watch 41mm','2600.00','GUC','Watches','Luxury Watches','Features the iconic interlocking G logo on the dial in 41mm case. Swiss-made quartz with sapphire crystal and steel bracelet.','Gucci',{'case_size':'41mm','movement':'Swiss Quartz','crystal':'Sapphire'},'watch')

# ===== III. FRAGRANCES (24-33) =====
frag_data = [
    (24,'Wild Vetiver','380.00','Woody floral fragrance blending wild vetiver with bergamot and geranium. Raw beauty meets refinement in a long-lasting scent for evening.','Woody Floral'),
    (25,'Aventus','495.00','The legendary Creed fragrance defining modern masculinity since 2010. Pineapple, birch, and oakmoss create an unmistakable signature.','Dry Woods, Citrus & Fruity'),
    (26,'Oud Zarian','470.00','Rich, opulent blend of rare oud wood, saffron, and amber. Intensely warm, transporting you to ancient spice routes with exceptional longevity.','Woody, Ambery, Spicy'),
    (27,'Absolu Aventus','450.00','Deeper, more intense reinterpretation of Aventus. Rich blackcurrant and green apple over Haitian vetiver and oak. Limited edition.','Dry Woods'),
    (28,'Green Irish Tweed','360.00','Aromatic fougere capturing the Irish countryside. Lemon verbena and violet leaves over Florentine iris and ambergris. Timeless since 1985.','Aromatic Fougere, Green'),
    (29,'Silver Mountain Water','360.00','Inspired by sparkling Swiss Alpine streams. Crisp bergamot, green tea, and white musk. Clean and refreshing for everyday sophistication.','Citrus, Fruity, Woody'),
    (30,'Millesime Imperial','360.00','Marine-citrus masterpiece evoking Mediterranean coastlines. Sea salt and iris meet lemon in this fresh, regal composition.','Citrus, Marine, Woody'),
    (31,'Aventus Cologne','380.00','Lighter, citrus-forward Aventus variation. Ginger, mandarin, and green apple create a bright, energetic, versatile scent.','Woody Fresh, Citrus'),
    (32,'Viking','380.00','Bold and daring, inspired by Norse explorers. Pink pepper and bergamot over rose and patchouli. Commanding.','Aromatic Fougere, Spicy'),
    (33,'Royal Oud','415.00','Definitive oud fragrance blending Gaiac wood with pink pepper and lemon. Smoky and regal. A masterpiece of restraint and power.','Woody, Spicy, Smoky'),
]
for n,nm,pr,de,pf in frag_data:
    s50=str(round(float(pr)*0.65,2)); s75=str(round(float(pr)*0.85,2))
    mk(n,nm,pr,'CRD','Fragrances',"Men's Cologne",de,'Creed',{'concentration':'Eau de Parfum','profile':pf,'origin':'France'},'frag',discount=10 if n in [27,30] else 0,variants=[{'name':'50ml','price':s50},{'name':'75ml','price':s75},{'name':'100ml','price':None}])

# ===== IV. CASHMERE & KNITWEAR (34-43) =====
mk(34,'Roadster Cashmere Sweater','1850.00','LRP','Cashmere & Knitwear','Sweaters & Wraps','Iconic cashmere sweater from finest Mongolian cashmere. Refined silhouette with ribbed cuffs and hem for timeless sophistication.','Loro Piana',{'material':'100% Cashmere','origin':'Italy'},'cashmere',variants=[{'name':'Navy','price':None},{'name':'Charcoal','price':None},{'name':'Ivory','price':None}])
mk(35,'Karlie Wrap','195.00','NKC','Cashmere & Knitwear','Sweaters & Wraps','Versatile cashmere wrap styled as shawl, scarf, or blanket. Lightweight yet warm for effortless layering.','Naked Cashmere',{'material':'100% Cashmere'},'cashmere',discount=20,variants=[{'name':'Black','price':None},{'name':'Camel','price':None}])
mk(36,'Cashmere Travel Set','350.00','NKC','Cashmere & Knitwear','Scarves & Accessories','Complete luxury travel set: cashmere blanket, eye mask, and socks. First-class comfort on every journey.','Naked Cashmere',{'includes':'Blanket, Eye Mask, Socks','material':'100% Cashmere'},'cashmere')
mk(37,'Cable Dog Sweater','95.00','NKC','Cashmere & Knitwear','Sweaters & Wraps','Classic cable knit cashmere sweater for your elegant companion. Luxury extends to every family member.','Naked Cashmere',{'material':'100% Cashmere','type':'Pet Apparel'},'cashmere')
mk(38,'Fletcher Cashmere Throw Blanket','450.00','NKC','Cashmere & Knitwear','Home Textiles','Ultra-soft throw blanket bringing hotel-suite luxury home. Generously sized for sofa or bed.','Naked Cashmere',{'material':'100% Cashmere','dimensions':'50x70 in'},'cashmere',discount=15)
mk(39,'Cashmere Beanie & Scarf Set','225.00','NKC','Cashmere & Knitwear','Scarves & Accessories','Matched beanie and scarf set in premium cashmere. Soft ribbed knit with relaxed, modern fit.','Naked Cashmere',{'material':'100% Cashmere'},'cashmere',variants=[{'name':'Charcoal','price':None},{'name':'Navy','price':None},{'name':'Oatmeal','price':None}])
mk(40,'Classic Cashmere Scarf','550.00','LRP','Cashmere & Knitwear','Scarves & Accessories','Timeless Loro Piana scarf from finest cashmere. The hallmark of quiet luxury in refined colours.','Loro Piana',{'material':'100% Cashmere','origin':'Italy'},'cashmere')
mk(41,'Vicuna Scarf','2500.00','LRP','Cashmere & Knitwear','Scarves & Accessories','The ultimate luxury scarf from rare vicuna fiber. Softer and warmer than cashmere, each piece is a treasure.','Loro Piana',{'material':'100% Vicuna','origin':'Italy/Peru'},'cashmere')
mk(42,'Cashmere Beanie','450.00','LRP','Cashmere & Knitwear','Scarves & Accessories','Warm beanie from Loro Piana baby cashmere. Understated elegance with ribbed turn-up design.','Loro Piana',{'material':'Baby Cashmere','origin':'Italy'},'cashmere')
mk(43,'Cashmere Socks Set','150.00','LRP','Cashmere & Knitwear','Scarves & Accessories','Set of three luxurious cashmere socks in neutral tones. The ultimate everyday indulgence.','Loro Piana',{'material':'Cashmere Blend','quantity':3},'cashmere')

# ===== V. DESIGNER HANDBAGS (44-61) =====
mk(44,'Gucci Giglio Large Tote Bag','2350.00','GUC','Designer Handbags','Tote Bags','Spacious tote with iconic Giglio floral print. Premium leather with gold-tone hardware and suede lining. Made in Italy.','Gucci',{'material':'Leather','hardware':'Gold-tone'},'handbag')
mk(45,'Bamboo Tote Large Bag','4450.00','GUC','Designer Handbags','Tote Bags','Signature bamboo handle bag defining Gucci since 1947. Handcrafted in Florence from finest leather.','Gucci',{'material':'Leather','handle':'Bamboo','origin':'Italy'},'handbag')
mk(46,'Jackie 1961 Small Shoulder Bag','2950.00','GUC','Designer Handbags','Shoulder Bags','Timeless icon reimagined with signature piston closure. Named after Jackie Kennedy — understated American glamour.','Gucci',{'material':'Leather','closure':'Piston'},'handbag')
mk(47,'Horsebit 1955 Shoulder Bag','3250.00','GUC','Designer Handbags','Shoulder Bags','Signature horsebit detail from Gucci\'s equestrian heritage. Structured silhouette in premium leather.','Gucci',{'material':'Leather','hardware':'Horsebit'},'handbag')
mk(48,'GG Marmont Small Shoulder Bag','2550.00','GUC','Designer Handbags','Shoulder Bags','Chevron leather with iconic double G hardware. Matelasse finish with antique gold chain strap.','Gucci',{'material':'Matelasse Leather','hardware':'Double G'},'handbag',discount=10)
mk(49,'Dionysus Small Shoulder Bag','2950.00','GUC','Designer Handbags','Shoulder Bags','Striking tiger head closure with hand-painted edges and sliding chain strap. Versatile styling.','Gucci',{'material':'Leather','closure':'Tiger Head'},'handbag')
mk(50,'Ophidia GG Small Shoulder Bag','1980.00','GUC','Designer Handbags','Shoulder Bags','GG Supreme canvas with green-red-green web stripe. Heritage design from Gucci\'s archive.','Gucci',{'material':'GG Supreme Canvas','detail':'Web Stripe'},'handbag')
mk(51,'Gucci Bamboo 1947 Small Bag','4200.00','GUC','Designer Handbags','Shoulder Bags','Iconic bamboo handle first created in 1947. Each handle handcrafted through heating and bending natural bamboo.','Gucci',{'material':'Leather','handle':'Bamboo'},'handbag')
mk(52,'Jackie 1961 Medium Shoulder Bag','3500.00','GUC','Designer Handbags','Shoulder Bags','Larger Jackie with signature piston closure. Spacious interior with multiple compartments.','Gucci',{'material':'Leather','closure':'Piston','size':'Medium'},'handbag')
mk(53,'Horsebit 1955 Small Shoulder Bag','2850.00','GUC','Designer Handbags','Shoulder Bags','Compact Horsebit 1955 with heritage hardware. Perfect proportions for day-to-evening versatility.','Gucci',{'material':'Leather','hardware':'Horsebit','size':'Small'},'handbag')
mk(54,'GG Marmont Medium Shoulder Bag','2950.00','GUC','Designer Handbags','Shoulder Bags','Spacious matelasse shoulder bag with double G logo. Generous interior with antique gold chain.','Gucci',{'material':'Matelasse Leather','hardware':'Double G','size':'Medium'},'handbag')
mk(55,'Dionysus Medium Shoulder Bag','3200.00','GUC','Designer Handbags','Shoulder Bags','Medium Dionysus with tiger head spur closure. A wearable work of art.','Gucci',{'material':'Leather','closure':'Tiger Head','size':'Medium'},'handbag')
mk(56,'Ophidia GG Medium Tote Bag','1750.00','GUC','Designer Handbags','Tote Bags','GG Supreme tote with generous proportions. Web stripe and double G honor Gucci\'s rich archive.','Gucci',{'material':'GG Supreme Canvas','size':'Medium'},'handbag',discount=10)
mk(57,'Gucci Diana Small Tote Bag','3300.00','GUC','Designer Handbags','Tote Bags','Bamboo handles with removable neon leather bands. Contemporary reinterpretation of archival design.','Gucci',{'material':'Leather','handle':'Bamboo','detail':'Neon Bands'},'handbag')
mk(58,'Gucci Blondie Shoulder Bag','3100.00','GUC','Designer Handbags','Shoulder Bags','Retro-inspired with oversized round interlocking G from 1970s archive. Soft, slouchy silhouette.','Gucci',{'material':'Leather','hardware':'Round IG'},'handbag')
mk(59,'Gucci Attache Small Shoulder Bag','2980.00','GUC','Designer Handbags','Shoulder Bags','Crescent-shaped bag with distinctive G-shaped clasp hook. Clean lines, architectural form.','Gucci',{'material':'Leather','closure':'G-Hook'},'handbag')
mk(60,'Gucci Aphrodite Small Shoulder Bag','1980.00','GUC','Designer Handbags','Shoulder Bags','Soft leather with double G hardware on flowing silhouette. Named after the goddess of beauty.','Gucci',{'material':'Soft Leather','hardware':'Double G'},'handbag',discount=15)
mk(61,'Leather Travel Bag','4500.00','LRP','Designer Handbags','Travel Bags','Spacious weekend bag from finest full-grain leather. Italian craftsmanship with brass hardware.','Loro Piana',{'material':'Full-Grain Leather','hardware':'Brass','origin':'Italy'},'handbag')

# ===== VI. FINE JEWELRY (62-81) =====
mk(62,'14K Yellow Gold Black Diamond Dog Tag','5040.00','EFY','Fine Jewelry','Pendants & Necklaces','Bold dog tag pendant with 1.36 TCW black diamonds in 14K yellow gold. Bridges streetwear and fine jewelry.','Effy Jewelry',{'metal':'14K Yellow Gold','stones':'Black Diamonds 1.36 TCW'},'jewelry')
mk(63,'Black Diamond Pave Panther Link Bracelet','7035.00','EFY','Fine Jewelry','Bracelets','Panther link bracelet with 3+ carat black diamond pave. Bold masculine design with secure clasp.','Effy Jewelry',{'metal':'14K Yellow Gold','stones':'Black Diamonds 3+ TCW'},'jewelry')
mk(64,'14K Yellow Gold Black Diamond Anchor Pendant','3777.00','EFY','Fine Jewelry','Pendants & Necklaces','Nautical anchor pendant with black diamond accents. A symbol of strength in meticulous detail.','Effy Jewelry',{'metal':'14K Yellow Gold','stones':'Black Diamonds'},'jewelry')
mk(65,'Black Diamond Anchor Chain Bracelet','4830.00','EFY','Fine Jewelry','Bracelets','Anchor chain bracelet with pave-set black diamonds. Heavy, substantial 14K gold links.','Effy Jewelry',{'metal':'14K Yellow Gold','stones':'Black Diamonds'},'jewelry',discount=10)
mk(66,'Brasillica Diamond and Emerald Ring','5810.00','EFY','Fine Jewelry','Rings','Vibrant natural emerald surrounded by brilliant-cut diamonds. Celebrating the lush beauty of Brazil.','Effy Jewelry',{'metal':'14K Yellow Gold','center_stone':'Emerald','accent':'Diamonds'},'jewelry',variants=[{'name':'Size 9','price':None},{'name':'Size 10','price':None},{'name':'Size 11','price':None}])
mk(67,'14K Yellow Gold Tanzanite and Diamond Ring','11696.00','EFY','Fine Jewelry','Rings','Large, vivid tanzanite crowned by diamonds. The rare blue-violet stone: 1000x rarer than diamonds.','Effy Jewelry',{'metal':'14K Yellow Gold','center_stone':'Tanzanite'},'jewelry',variants=[{'name':'Size 9','price':None},{'name':'Size 10','price':None},{'name':'Size 11','price':None}])
mk(68,'Sterling Silver Citrine and Diamond Ring','735.00','EFY','Fine Jewelry','Rings','Warm citrine center stone with diamond accents in sterling silver. Accessible fine jewelry with presence.','Effy Jewelry',{'metal':'Sterling Silver','center_stone':'Citrine'},'jewelry',discount=20,variants=[{'name':'Size 8','price':None},{'name':'Size 9','price':None},{'name':'Size 10','price':None}])
mk(69,'18K Two Tone Paraiba and Diamond Ring','25550.00','EFY','Fine Jewelry','Rings','GIA-certified Paraiba tourmaline in 18K two-tone gold with diamond halo. One of the world\'s rarest gems.','Effy Jewelry',{'metal':'18K Two-Tone Gold','center_stone':'Paraiba Tourmaline (GIA)'},'jewelry',variants=[{'name':'Size 9','price':None},{'name':'Size 10','price':None}])
mk(70,'14K Yellow Gold Diamond Cluster Ring','6297.00','EFY','Fine Jewelry','Rings','Brilliant diamond cluster in 14K gold creating a dazzling sunburst effect. Maximum sparkle from every angle.','Effy Jewelry',{'metal':'14K Yellow Gold','stones':'Diamond Cluster'},'jewelry',variants=[{'name':'Size 9','price':None},{'name':'Size 10','price':None},{'name':'Size 11','price':None}])
mk(71,'Blue and White Diamond Ships Wheel Ring','4690.00','EFY','Fine Jewelry','Rings','Nautical ship\'s wheel in blue and white diamonds. Statement piece for the maritime enthusiast.','Effy Jewelry',{'metal':'14K Gold','stones':'Blue & White Diamonds'},'jewelry',variants=[{'name':'Size 9','price':None},{'name':'Size 10','price':None}])
mk(72,'14K Yellow Gold Black Diamond Signet Ring','5317.00','EFY','Fine Jewelry','Rings','Classic signet ring with black diamond pave surface. Modern heirloom bridging tradition and avant-garde.','Effy Jewelry',{'metal':'14K Yellow Gold','stones':'Black Diamonds'},'jewelry',variants=[{'name':'Size 9','price':None},{'name':'Size 10','price':None},{'name':'Size 11','price':None}])
mk(73,'14K White Gold Diamond Band','3500.00','EFY','Fine Jewelry','Rings','Sleek band with channel-set brilliant diamonds. Minimalist elegance for wedding band or statement.','Effy Jewelry',{'metal':'14K White Gold','stones':'Channel-Set Diamonds'},'jewelry',variants=[{'name':'Size 8','price':None},{'name':'Size 9','price':None},{'name':'Size 10','price':None},{'name':'Size 11','price':None}])
mk(74,'14K Yellow Gold Lion Head Ring','4200.00','EFY','Fine Jewelry','Rings','Powerful lion head with diamond eyes and full mane. Symbol of courage in solid 14K gold.','Effy Jewelry',{'metal':'14K Yellow Gold','stones':'Diamond Eyes'},'jewelry',variants=[{'name':'Size 9','price':None},{'name':'Size 10','price':None},{'name':'Size 11','price':None}])
mk(75,'14K Rose Gold Diamond Cross Pendant','2800.00','EFY','Fine Jewelry','Pendants & Necklaces','Masculine rose gold cross with brilliant-cut diamonds. Faith meets luxury in warm rose gold.','Effy Jewelry',{'metal':'14K Rose Gold','stones':'Diamonds'},'jewelry')
mk(76,'14K White Gold Sapphire and Diamond Cufflinks','3900.00','EFY','Fine Jewelry','Earrings & Cufflinks','Blue sapphires surrounded by diamond halos. The finishing touch for formal ensembles.','Effy Jewelry',{'metal':'14K White Gold','stones':'Sapphires & Diamonds'},'jewelry')
mk(77,'14K Yellow Gold Onyx and Diamond Ring','2400.00','EFY','Fine Jewelry','Rings','Black onyx center with sparkling diamond border. Art Deco-inspired timeless sophistication.','Effy Jewelry',{'metal':'14K Yellow Gold','center_stone':'Onyx'},'jewelry',discount=15,variants=[{'name':'Size 9','price':None},{'name':'Size 10','price':None},{'name':'Size 11','price':None}])
mk(78,'14K White Gold Black Diamond Stud Earrings','1500.00','EFY','Fine Jewelry','Earrings & Cufflinks','Elegant black diamond studs in polished white gold. Bold yet refined for any occasion.','Effy Jewelry',{'metal':'14K White Gold','stones':'Black Diamonds'},'jewelry')
mk(79,'14K Yellow Gold Diamond Tennis Bracelet','8500.00','EFY','Fine Jewelry','Bracelets','Continuous row of brilliant diamonds in 14K gold. 5+ carats in a flexible, comfortable setting.','Effy Jewelry',{'metal':'14K Yellow Gold','stones':'Diamonds 5+ TCW'},'jewelry')
mk(80,'14K White Gold Diamond Cross Ring','3200.00','EFY','Fine Jewelry','Rings','Diamond-encrusted cross design in white gold. Faith rendered in precious materials.','Effy Jewelry',{'metal':'14K White Gold','stones':'Diamonds'},'jewelry',variants=[{'name':'Size 9','price':None},{'name':'Size 10','price':None},{'name':'Size 11','price':None}])
mk(81,'14K Yellow Gold Diamond Eagle Pendant','4500.00','EFY','Fine Jewelry','Pendants & Necklaces','Majestic eagle pendant with diamond-encrusted wings. Freedom and strength in 14K gold.','Effy Jewelry',{'metal':'14K Yellow Gold','stones':'Diamonds'},'jewelry')

# ===== VII. LIFESTYLE & ACCESSORIES (82-100) =====
mk(82,'Andre Shirt 45x45 Foulard','305.00','LRP','Lifestyle & Accessories','Belts & Ties','Elegant silk foulard with refined geometric print. Versatile as pocket square, neck scarf, or bag accessory.','Loro Piana',{'material':'100% Silk','dimensions':'45x45 cm','origin':'Italy'},'lifestyle')
mk(83,'Sloop Beanie','605.00','LRP','Lifestyle & Accessories','Travel & Comfort','Sumptuous beanie from exclusive Wish wool. Double-layered knit provides exceptional warmth without bulk.','Loro Piana',{'material':'Wish Wool','origin':'Italy'},'lifestyle')
mk(84,'Mayfair Belt','905.00','LRP','Lifestyle & Accessories','Belts & Ties','Classic leather belt with brushed palladium buckle. Full-grain leather develops beautiful patina.','Loro Piana',{'material':'Full-Grain Leather','buckle':'Palladium','origin':'Italy'},'lifestyle')
mk(85,'Open Walk Shoes','1050.00','LRP','Lifestyle & Accessories','Shoes','Signature suede ankle boots with Walk rubber sole. Bridges casual and smart dressing.','Loro Piana',{'material':'Suede','sole':'Walk Rubber','origin':'Italy'},'lifestyle',variants=[{'name':'EU 40','price':None},{'name':'EU 42','price':None},{'name':'EU 43','price':None},{'name':'EU 44','price':None}])
mk(86,'Summer Walk Shoes','950.00','LRP','Lifestyle & Accessories','Shoes','Classic suede loafers for polished style. Pebble rubber sole with unlined interior for warm weather.','Loro Piana',{'material':'Suede','sole':'Pebble Rubber','origin':'Italy'},'lifestyle',discount=10,variants=[{'name':'EU 40','price':None},{'name':'EU 42','price':None},{'name':'EU 43','price':None},{'name':'EU 44','price':None}])
mk(87,'Horsey Jacket','3200.00','LRP','Lifestyle & Accessories','Outerwear','Storm System cashmere jacket for rain and wind resistance. Elegant for city, durable for countryside.','Loro Piana',{'material':'Storm System Cashmere','origin':'Italy'},'lifestyle')
mk(88,'Traveller Jacket','2800.00','LRP','Lifestyle & Accessories','Outerwear','Versatile wind-resistant wool blend jacket. Packable design makes it the ideal travel companion.','Loro Piana',{'material':'Wool Blend','feature':'Packable','origin':'Italy'},'lifestyle')
mk(89,'Cashmere Scarf','550.00','LRP','Lifestyle & Accessories','Travel & Comfort','Ultra-soft cashmere scarf in generous size. The pinnacle of cold-weather elegance.','Loro Piana',{'material':'100% Cashmere','origin':'Italy'},'lifestyle')
mk(90,'Leather Card Holder','425.00','LRP','Lifestyle & Accessories','Small Leather Goods','Minimalist smooth calf leather card holder with four slots and central pocket. Understated luxury.','Loro Piana',{'material':'Calf Leather','slots':4,'origin':'Italy'},'lifestyle')
mk(91,'Remi Eye Mask','65.00','NKC','Lifestyle & Accessories','Travel & Comfort','Pure cashmere eye mask with silk lining. Adjustable strap with cotton drawstring pouch.','Naked Cashmere',{'material':'Cashmere/Silk','includes':'Travel Pouch'},'lifestyle')
mk(92,'Tabitha Cashmere Tote Bag','295.00','NKC','Lifestyle & Accessories','Travel & Comfort','Structured tote entirely from cashmere. Unique alternative to leather with surprising durability.','Naked Cashmere',{'material':'100% Cashmere'},'lifestyle')
mk(93,'Cashmere Socks','55.00','NKC','Lifestyle & Accessories','Travel & Comfort','Premium cashmere everyday socks. Hidden indulgence transforming daily routine into luxury.','Naked Cashmere',{'material':'Cashmere Blend'},'lifestyle')
mk(94,'Cashmere Gloves','75.00','NKC','Lifestyle & Accessories','Travel & Comfort','Warm cashmere gloves with touchscreen-compatible fingertips. Modern functionality meets luxury.','Naked Cashmere',{'material':'100% Cashmere','feature':'Touchscreen'},'lifestyle',variants=[{'name':'S/M','price':None},{'name':'M/L','price':None}])
mk(95,'Silk and Cashmere Tie','250.00','LRP','Lifestyle & Accessories','Belts & Ties','Refined tie in luxurious silk-cashmere blend. Perfect finishing touch for business or formal.','Loro Piana',{'material':'Silk/Cashmere','width':'8 cm','origin':'Italy'},'lifestyle')
mk(96,'Leather Wallet','650.00','LRP','Lifestyle & Accessories','Small Leather Goods','Classic bifold in full-grain calfskin. Multiple card slots, bill compartments, hand-painted edges.','Loro Piana',{'material':'Full-Grain Calfskin','type':'Bifold','origin':'Italy'},'lifestyle')
mk(97,'Suede Belt','750.00','LRP','Lifestyle & Accessories','Belts & Ties','Elegant suede belt with polished palladium buckle. Pairs perfectly with casual and tailored looks.','Loro Piana',{'material':'Suede','buckle':'Palladium','origin':'Italy'},'lifestyle')
mk(98,'Cashmere Eye Mask','125.00','LRP','Lifestyle & Accessories','Travel & Comfort','Soft cashmere eye mask for restful travel. Contoured design with leather travel case.','Loro Piana',{'material':'Cashmere','includes':'Leather Case','origin':'Italy'},'lifestyle')
mk(99,'Leather Passport Holder','350.00','LRP','Lifestyle & Accessories','Small Leather Goods','Burnished calf leather passport holder with card slots. Hand-stitched with embossed logo.','Loro Piana',{'material':'Calf Leather','origin':'Italy'},'lifestyle')
mk(100,'Shearling Mule Slippers','150.00','NKC','Lifestyle & Accessories','Shoes','Shearling-lined suede slippers with memory foam insole. Indoor-outdoor versatility.','Naked Cashmere',{'material':'Suede/Shearling','insole':'Memory Foam'},'lifestyle',variants=[{'name':'S (7-8)','price':None},{'name':'M (9-10)','price':None},{'name':'L (11-12)','price':None}])

products.sort(key=lambda x: x['num'])
outpath = '/home/luka/Projects/gucci/server/catalog/management/commands/luxury_products_data.json'
with open(outpath, 'w') as f:
    json.dump(products, f, indent=2)
print(f'Wrote {len(products)} products to {outpath}')
