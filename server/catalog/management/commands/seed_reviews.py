import random
from django.core.management.base import BaseCommand
from django.utils.text import slugify
from base.models import User
from catalog.models import Product
from reviews.models import Review


class Command(BaseCommand):
    help = 'Seeds ~300 realistic reviews from ~100 global test customers'

    def add_arguments(self, parser):
        parser.add_argument('--clear', action='store_true', help='Clear test reviews and customers first')

    # 100 realistic international names (first, last, country_code for email)
    CUSTOMERS = [
        ("James","Mitchell","us"),("Sophia","Rodriguez","us"),("Liam","Johnson","us"),("Olivia","Williams","us"),
        ("Noah","Brown","us"),("Emma","Davis","us"),("Ethan","Garcia","us"),("Ava","Martinez","us"),
        ("Lucas","Taylor","us"),("Isabella","Anderson","us"),("Emily","Thomas","us"),("Mason","Jackson","us"),
        ("Aiden","White","us"),("Charlotte","Harris","us"),("Benjamin","Martin","us"),
        ("Sakura","Tanaka","jp"),("Yuki","Sato","jp"),("Haruto","Suzuki","jp"),("Aoi","Watanabe","jp"),
        ("Ren","Yamamoto","jp"),
        ("Lukas","Mueller","de"),("Hannah","Schmidt","de"),("Felix","Weber","de"),("Lea","Fischer","de"),
        ("Maximilian","Hartmann","de"),
        ("Pierre","Dupont","fr"),("Camille","Laurent","fr"),("Hugo","Moreau","fr"),("Chloe","Bernard","fr"),
        ("Louis","Petit","fr"),
        ("Marco","Rossi","it"),("Giulia","Bianchi","it"),("Alessandro","Romano","it"),("Francesca","Ricci","it"),
        ("Matteo","Colombo","it"),
        ("Carlos","Fernandez","es"),("Sofia","Lopez","es"),("Diego","Morales","es"),("Lucia","Sanchez","es"),
        ("Pablo","Ramirez","es"),
        ("Oliver","Smith","uk"),("Amelia","Jones","uk"),("George","Taylor","uk"),("Isla","Brown","uk"),
        ("Harry","Wilson","uk"),
        ("Arjun","Sharma","in"),("Priya","Patel","in"),("Vikram","Gupta","in"),("Ananya","Singh","in"),
        ("Rohan","Mehta","in"),
        ("Wei","Zhang","cn"),("Mei","Wang","cn"),("Jun","Li","cn"),("Xiao","Chen","cn"),
        ("Hao","Liu","cn"),
        ("Fatima","Al-Rashid","ae"),("Omar","Hassan","ae"),("Layla","Khalil","ae"),("Ahmed","Nasser","ae"),
        ("Yusuf","Ibrahim","ae"),
        ("Thiago","Santos","br"),("Valentina","Oliveira","br"),("Gabriel","Costa","br"),("Beatriz","Silva","br"),
        ("Rafael","Souza","br"),
        ("Ji-hoon","Kim","kr"),("Soo-yeon","Park","kr"),("Min-jun","Lee","kr"),("Ha-eun","Choi","kr"),
        ("Seo-jun","Jung","kr"),
        ("Kwame","Agyeman","gh"),("Amara","Diallo","sn"),("Chioma","Okafor","ng"),("Tendai","Moyo","zw"),
        ("Naledi","Nkosi","za"),
        ("Mikhail","Ivanov","ru"),("Anastasia","Petrova","ru"),("Dmitri","Volkov","ru"),
        ("Erik","Lindqvist","se"),("Astrid","Johansson","se"),("Lars","Andersen","dk"),("Freya","Nielsen","dk"),
        ("Kenji","Nakamura","jp"),("Hana","Ishikawa","jp"),
        ("Luca","Moretti","it"),("Elena","Giordano","it"),
        ("Chen","Wu","cn"),("Lin","Huang","cn"),
        ("Alejandro","Vega","mx"),("Daniela","Reyes","mx"),("Andres","Torres","co"),("Valentina","Cruz","co"),
        ("Nadia","Kowalski","pl"),("Jan","Nowak","pl"),
        ("Aisha","Mohammed","ke"),("Jabari","Mwangi","ke"),
        ("Tariq","Aziz","pk"),("Zara","Khan","pk"),
        ("Yuto","Hayashi","jp"),("Riko","Fujimoto","jp"),
        ("Sebastian","Muller","at"),("Anna","Huber","at"),
    ]

    # Review templates by sentiment tier
    REVIEWS_5 = [
        "Absolutely stunning quality. This {type} exceeded all my expectations. Worth every penny!",
        "I've been collecting luxury items for years and this is truly exceptional. The craftsmanship is impeccable.",
        "A masterpiece. The attention to detail is remarkable. I couldn't be happier with my purchase.",
        "This is hands down the best {type} I have ever owned. The quality speaks for itself.",
        "Perfection! The {type} arrived beautifully packaged and the quality is outstanding. Already planning my next purchase.",
        "A true work of art. The materials are exquisite and it feels incredibly luxurious.",
        "Exceeded my expectations in every way. The quality is museum-worthy.",
        "I bought this as a gift and the recipient was absolutely thrilled. Stunning piece.",
        "Worth the investment. After months of use, it still looks and feels brand new.",
        "Simply breathtaking. This is what luxury is supposed to feel like.",
        "I've recommended this to all my friends. The quality is unmatched.",
        "From the packaging to the product itself, everything screams premium. Love it!",
        "Bought this after researching for months and I'm so glad I did. Exceptional quality.",
        "The finest {type} I've ever had the pleasure of owning. A true treasure.",
        "This purchase made me a customer for life. Outstanding in every way.",
    ]

    REVIEWS_4 = [
        "Great quality overall. The {type} is well-made and looks beautiful. Minor improvement could be made to packaging.",
        "Very happy with this purchase. The quality is excellent, though delivery took a bit longer than expected.",
        "A beautiful {type} that lives up to the brand's reputation. Slightly pricier than I'd like, but you get what you pay for.",
        "Really impressed with the craftsmanship. The only reason I'm not giving 5 stars is the limited color options.",
        "Lovely quality and comfortable to use. Would buy again, maybe in a different style next time.",
        "Elegant and well-crafted. Exactly what I was looking for, though sizing ran slightly different than expected.",
        "Purchased for a special occasion and it did not disappoint. Beautiful {type} with excellent attention to detail.",
        "Very good quality, as expected from this brand. The {type} has a premium feel throughout.",
        "Happy with my purchase. The materials are clearly high quality. Just wish it came in more variations.",
        "Solid investment piece. It's everything the description promised and then some.",
        "Beautiful design and solid construction. A few minor details could be refined but overall excellent.",
        "The quality speaks for itself. Fast shipping too. Would definitely consider buying from this brand again.",
        "Really nice {type}. My partner loved it. Only wish there were more size options.",
        "Gorgeous craftsmanship. Slightly different shade than pictured but still very satisfied.",
        "Great purchase for the price point. Feels luxurious and looks sophisticated.",
    ]

    REVIEWS_3 = [
        "Decent quality for the price. The {type} looks good but I expected a bit more luxury feel at this price point.",
        "It's fine. Nice enough but nothing that really blew me away. The quality is adequate.",
        "Good {type}, but I've seen similar quality at lower price points. Still, it does the job well.",
        "Average experience. The {type} itself is okay, but customer service could improve.",
        "Not bad, not great. The {type} serves its purpose and looks decent enough.",
    ]

    # Category-specific type names for review templates
    CATEGORY_TYPES = {
        "Men's Grooming": "grooming product",
        "Watches": "timepiece",
        "Fragrances": "fragrance",
        "Cashmere & Knitwear": "piece",
        "Designer Handbags": "bag",
        "Fine Jewelry": "piece of jewelry",
        "Lifestyle & Accessories": "accessory",
    }

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write('Clearing test reviews and customers...')
            Review.objects.filter(user__email__endswith='@luxshop-test.com').delete()
            User.objects.filter(email__endswith='@luxshop-test.com').delete()
            self.stdout.write(self.style.WARNING('Cleared test data.'))

        # 1. Create 100 test customers
        self.stdout.write('Creating test customers...')
        users = []
        for first, last, country in self.CUSTOMERS:
            email = f"{first.lower()}.{last.lower()}@luxshop-test.com"
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'first_name': first,
                    'last_name': last,
                    'is_verified': True,
                    'is_active': True,
                }
            )
            if created:
                user.set_password('TestPass123!')
                user.save()
            users.append(user)
        self.stdout.write(self.style.SUCCESS(f'✓ {len(users)} test customers ready'))

        # 2. Get all products and distribute reviews
        products = list(Product.objects.all())
        if not products:
            self.stdout.write(self.style.ERROR('No products found! Run seed_luxury_products first.'))
            return

        self.stdout.write(f'Distributing reviews across {len(products)} products...')
        review_count = 0
        target_total = 300

        # Assign 3-5 reviews per product to reach ~300+
        reviews_per_product = {}
        for p in products:
            reviews_per_product[p.id] = random.randint(3, 5)

        # Adjust to hit target
        current_total = sum(reviews_per_product.values())
        while current_total < target_total:
            pid = random.choice(products).id
            if reviews_per_product[pid] < 6:
                reviews_per_product[pid] += 1
                current_total += 1

        # Shuffle users for random assignment
        random.shuffle(users)
        user_idx = 0

        for product in products:
            n_reviews = reviews_per_product[product.id]
            product_type = "fly"

            # Generate ratings that average >= 3.5
            # Strategy: mostly 4s and 5s, occasional 3s
            ratings = []
            for _ in range(n_reviews):
                r = random.choices([5, 4, 3], weights=[45, 40, 15])[0]
                ratings.append(r)

            # Ensure average >= 3.5
            while sum(ratings) / len(ratings) < 3.5:
                min_idx = ratings.index(min(ratings))
                ratings[min_idx] = min(ratings[min_idx] + 1, 5)

            for rating in ratings:
                # Pick a user who hasn't reviewed this product
                attempts = 0
                while attempts < len(users):
                    user = users[user_idx % len(users)]
                    user_idx += 1
                    if not Review.objects.filter(user=user, product=product).exists():
                        break
                    attempts += 1
                else:
                    continue  # skip if all users exhausted for this product

                # Pick a review template based on rating
                if rating == 5:
                    comment = random.choice(self.REVIEWS_5).format(type=product_type)
                elif rating == 4:
                    comment = random.choice(self.REVIEWS_4).format(type=product_type)
                else:
                    comment = random.choice(self.REVIEWS_3).format(type=product_type)

                Review.objects.create(
                    user=user,
                    product=product,
                    rating=rating,
                    comment=comment,
                )
                review_count += 1

            avg = sum(ratings) / len(ratings)
            self.stdout.write(f'  ✓ {product.name}: {n_reviews} reviews (avg {avg:.1f}★)')

        self.stdout.write(self.style.SUCCESS(
            f'\n🎉 Done! Created {review_count} reviews from {len(users)} customers across {len(products)} products.'
        ))
