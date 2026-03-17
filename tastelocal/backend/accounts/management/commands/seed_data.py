"""
Management command to seed the TasteLocal database with comprehensive hypothetical data.
Minimum 20 entries per entity type for full demo experience.
"""
import random
from datetime import date, time, timedelta
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils.text import slugify

User = get_user_model()


class Command(BaseCommand):
    help = 'Seed the TasteLocal database with comprehensive demo data'

    def handle(self, *args, **options):
        self.stdout.write('Seeding TasteLocal database...')
        self.create_users()
        self.create_vendor_profiles()
        self.create_tags()
        self.create_experiences()
        self.create_bookings()
        self.create_reviews()
        self.create_itineraries()
        self.create_blog_data()
        self.create_pages()
        self.stdout.write(self.style.SUCCESS('Database seeded successfully!'))

    def create_users(self):
        """Create admin, vendor, and tourist users."""
        # Admin
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser(
                username='admin', email='admin@tastelocal.sg',
                password='TasteLocal2026!', first_name='System', last_name='Admin',
                role='admin', phone='+65 9000 0001', country='Singapore', city='Singapore'
            )
        self.stdout.write('  Created admin user')

        # Vendors (20+)
        vendor_data = [
            ('tina_morales', 'Tina', 'Morales', 'tina@cafeblossom.sg', '+65 9100 1001', 'Singapore'),
            ('sam_tan', 'Sam', 'Tan', 'sam@hawkerheroes.sg', '+65 9100 1002', 'Singapore'),
            ('nisha_patel', 'Nisha', 'Patel', 'nisha@spiceroute.sg', '+65 9100 1003', 'Singapore'),
            ('miguel_ramos', 'Miguel', 'Ramos', 'miguel@streetbites.sg', '+65 9100 1004', 'Singapore'),
            ('jenny_wong', 'Jenny', 'Wong', 'jenny@dimsumdreams.sg', '+65 9100 1005', 'Singapore'),
            ('raj_kumar', 'Raj', 'Kumar', 'raj@curryhouse.sg', '+65 9100 1006', 'Singapore'),
            ('lisa_chen', 'Lisa', 'Chen', 'lisa@teapavilion.sg', '+65 9100 1007', 'Singapore'),
            ('ahmad_ibrahim', 'Ahmad', 'Ibrahim', 'ahmad@nasilemak.sg', '+65 9100 1008', 'Singapore'),
            ('sophie_lim', 'Sophie', 'Lim', 'sophie@peranakanbites.sg', '+65 9100 1009', 'Singapore'),
            ('david_lee', 'David', 'Lee', 'david@seafoodking.sg', '+65 9100 1010', 'Singapore'),
            ('maria_santos', 'Maria', 'Santos', 'maria@fiestafood.sg', '+65 9100 1011', 'Singapore'),
            ('ken_tanaka', 'Ken', 'Tanaka', 'ken@sakurasushi.sg', '+65 9100 1012', 'Singapore'),
            ('priya_sharma', 'Priya', 'Sharma', 'priya@veganvibes.sg', '+65 9100 1013', 'Singapore'),
            ('tom_baker', 'Tom', 'Baker', 'tom@craftbrew.sg', '+65 9100 1014', 'Singapore'),
            ('mei_lin', 'Mei', 'Lin', 'mei@wokthiswaysg.sg', '+65 9100 1015', 'Singapore'),
            ('hassan_ali', 'Hassan', 'Ali', 'hassan@kebabkings.sg', '+65 9100 1016', 'Singapore'),
            ('yuki_sato', 'Yuki', 'Sato', 'yuki@ramenlove.sg', '+65 9100 1017', 'Singapore'),
            ('grace_ong', 'Grace', 'Ong', 'grace@bakersdelight.sg', '+65 9100 1018', 'Singapore'),
            ('carlos_reyes', 'Carlos', 'Reyes', 'carlos@tacofiesta.sg', '+65 9100 1019', 'Singapore'),
            ('ananya_desai', 'Ananya', 'Desai', 'ananya@chailounge.sg', '+65 9100 1020', 'Singapore'),
            ('james_koh', 'James', 'Koh', 'james@kopitiam.sg', '+65 9100 1021', 'Singapore'),
            ('fatimah_zahra', 'Fatimah', 'Zahra', 'fatimah@sataystreet.sg', '+65 9100 1022', 'Singapore'),
        ]
        for uname, fn, ln, email, phone, country in vendor_data:
            if not User.objects.filter(username=uname).exists():
                User.objects.create_user(
                    username=uname, email=email, password='Vendor2026!',
                    first_name=fn, last_name=ln, role='vendor',
                    phone=phone, country=country, city='Singapore'
                )
        self.stdout.write(f'  Created {len(vendor_data)} vendor users')

        # Tourists (20+)
        tourist_data = [
            ('sam_lee', 'Sam', 'Lee', 'sam.lee@gmail.com', '+1 555 0001', 'United States', 'New York'),
            ('emma_jones', 'Emma', 'Jones', 'emma.j@gmail.com', '+44 7700 0001', 'United Kingdom', 'London'),
            ('yuto_nakamura', 'Yuto', 'Nakamura', 'yuto@yahoo.jp', '+81 90 0001', 'Japan', 'Tokyo'),
            ('anna_schmidt', 'Anna', 'Schmidt', 'anna.s@gmail.com', '+49 170 0001', 'Germany', 'Berlin'),
            ('lucas_martin', 'Lucas', 'Martin', 'lucas.m@gmail.com', '+33 6 0001', 'France', 'Paris'),
            ('olivia_brown', 'Olivia', 'Brown', 'olivia.b@gmail.com', '+61 4 0001', 'Australia', 'Sydney'),
            ('chen_wei', 'Chen', 'Wei', 'chen.w@qq.com', '+86 138 0001', 'China', 'Shanghai'),
            ('sofia_garcia', 'Sofia', 'Garcia', 'sofia.g@gmail.com', '+34 6 0001', 'Spain', 'Madrid'),
            ('park_jimin', 'Jimin', 'Park', 'jimin.p@naver.com', '+82 10 0001', 'South Korea', 'Seoul'),
            ('raj_patel', 'Raj', 'Patel', 'raj.p@gmail.com', '+91 98 0001', 'India', 'Mumbai'),
            ('sarah_wilson', 'Sarah', 'Wilson', 'sarah.w@gmail.com', '+1 555 0002', 'United States', 'LA'),
            ('marco_rossi', 'Marco', 'Rossi', 'marco.r@gmail.com', '+39 3 0001', 'Italy', 'Rome'),
            ('anya_ivanova', 'Anya', 'Ivanova', 'anya.i@gmail.com', '+7 9 0001', 'Russia', 'Moscow'),
            ('mike_thompson', 'Mike', 'Thompson', 'mike.t@gmail.com', '+1 555 0003', 'Canada', 'Toronto'),
            ('lily_nguyen', 'Lily', 'Nguyen', 'lily.n@gmail.com', '+84 9 0001', 'Vietnam', 'Hanoi'),
            ('alex_petrov', 'Alex', 'Petrov', 'alex.p@gmail.com', '+359 8 0001', 'Bulgaria', 'Sofia'),
            ('maya_johnson', 'Maya', 'Johnson', 'maya.j@gmail.com', '+1 555 0004', 'United States', 'Chicago'),
            ('tom_williams', 'Tom', 'Williams', 'tom.w@gmail.com', '+44 7700 0002', 'United Kingdom', 'Manchester'),
            ('isla_campbell', 'Isla', 'Campbell', 'isla.c@gmail.com', '+64 2 0001', 'New Zealand', 'Auckland'),
            ('diego_silva', 'Diego', 'Silva', 'diego.s@gmail.com', '+55 11 0001', 'Brazil', 'Sao Paulo'),
            ('nina_larsen', 'Nina', 'Larsen', 'nina.l@gmail.com', '+47 4 0001', 'Norway', 'Oslo'),
        ]
        for uname, fn, ln, email, phone, country, city in tourist_data:
            if not User.objects.filter(username=uname).exists():
                User.objects.create_user(
                    username=uname, email=email, password='Tourist2026!',
                    first_name=fn, last_name=ln, role='tourist',
                    phone=phone, country=country, city=city
                )
        self.stdout.write(f'  Created {len(tourist_data)} tourist users')

    def create_vendor_profiles(self):
        """Create vendor profiles with Singapore locations."""
        from vendors.models import VendorProfile

        profiles = [
            ('tina_morales', 'Café Blossom', 'A charming café in the heart of Tiong Bahru offering artisanal coffee and traditional kaya toast with a modern twist. Our space is adorned with local art and vintage furniture, creating a warm atmosphere for both locals and tourists.', 'cafe', '78 Guan Chuan Street, Tiong Bahru, Singapore 160078', 1.2847, 103.8310),
            ('sam_tan', 'Hawker Heroes Food Tours', 'Guided walking tours through Singapore\'s most iconic hawker centres. We bring you behind the scenes of legendary hawker stalls, sharing stories of the food, culture, and families that make Singapore\'s hawker scene a UNESCO heritage.', 'hawker', 'Maxwell Food Centre, 1 Kadayanallur St, Singapore 069184', 1.2805, 103.8448),
            ('nisha_patel', 'Spice Route Kitchen', 'An immersive Indian culinary experience in Little India. From grinding fresh spices to mastering the art of perfect naan, our cooking classes take you on a sensory journey through the subcontinent.', 'indian', '48 Serangoon Road, Little India, Singapore 217959', 1.3066, 103.8521),
            ('miguel_ramos', 'Street Bites SG', 'Authentic street food from around Southeast Asia, served from our vibrant food truck at various locations across Singapore. Follow us for the best satay, rojak, and grilled seafood in town.', 'street_food', 'East Coast Lagoon Food Village, Singapore 468966', 1.3031, 103.9300),
            ('jenny_wong', 'Dim Sum Dreams', 'Handcrafted dim sum made fresh daily using recipes passed down through three generations. Join our dim sum making workshop to learn the art of pleating dumplings and steaming bao.', 'chinese', '21 Smith Street, Chinatown, Singapore 058936', 1.2823, 103.8435),
            ('raj_kumar', 'Curry House Singapore', 'Experience the rich flavours of South Indian cuisine in our heritage shophouse restaurant. Our banana leaf meals and dosai are legendary among both locals and visitors.', 'indian', '76 Race Course Road, Singapore 218575', 1.3122, 103.8530),
            ('lisa_chen', 'Tea Pavilion', 'A traditional Chinese tea house offering guided tea ceremonies and tastings. Discover rare oolong, pu-erh, and green teas sourced directly from artisan farms across China and Taiwan.', 'chinese', '11 Neil Road, Chinatown, Singapore 088808', 1.2791, 103.8413),
            ('ahmad_ibrahim', 'Nasi Lemak Royale', 'The king of nasi lemak in Singapore. Our recipe uses premium basmati rice cooked in fresh pandan leaves and coconut cream, served with sambal that has won awards for three consecutive years.', 'malay', 'Adam Road Food Centre, 2 Adam Road, Singapore 289876', 1.3240, 103.8150),
            ('sophie_lim', 'Peranakan Bites', 'Celebrating Peranakan heritage through food. Our cooking classes teach you to prepare classics like ayam buah keluak, kueh pie tee, and ondeh ondeh in a beautiful Katong shophouse.', 'peranakan', '112 East Coast Road, Katong, Singapore 428802', 1.3050, 103.9050),
            ('david_lee', 'Seafood King', 'Fresh seafood straight from the ocean to your plate. Famous for our chilli crab, black pepper crab, and cereal prawns. Waterfront dining at its finest with stunning Marina Bay views.', 'seafood', '1 Fullerton Road, Singapore 049213', 1.2869, 103.8545),
            ('maria_santos', 'Fiesta Food Tours', 'Fun-filled food walking tours covering the diverse culinary neighbourhoods of Singapore. From Kampong Glam to Joo Chiat, taste your way through culture and history.', 'fusion', 'Arab Street, Kampong Glam, Singapore 199724', 1.3022, 103.8598),
            ('ken_tanaka', 'Sakura Sushi Bar', 'Authentic Japanese omakase experience in a intimate setting. Chef Ken trained for 15 years in Tokyo before bringing his craft to Singapore. Only 12 seats for an exclusive dining journey.', 'japanese', '1 Scotts Road, Singapore 228208', 1.3070, 103.8310),
            ('priya_sharma', 'Vegan Vibes Café', 'Plant-based café serving creative vegan versions of Asian favourites. Our laksa, char kway teow, and satay prove that plant-based food can be just as delicious and satisfying.', 'vegetarian', '44 Jalan Sultan, Singapore 198987', 1.3019, 103.8580),
            ('tom_baker', 'CraftBrew & Bites', 'Singapore\'s first food and craft beer pairing experience. Tour our microbrewery, learn about the brewing process, and enjoy curated pairings of local craft beers with Singaporean snacks.', 'western', '7 Emerald Hill Road, Singapore 229289', 1.3010, 103.8390),
            ('mei_lin', 'Wok This Way', 'Interactive wok cooking classes where you learn to master the art of wok hei. From char kway teow to Hokkien mee, discover the secrets behind Singapore\'s most beloved wok dishes.', 'local', 'Block 127 Toa Payoh Lorong 1, Singapore 310127', 1.3325, 103.8499),
            ('hassan_ali', 'Kebab Kings', 'Premium Middle Eastern and Turkish cuisine in the heart of Kampong Glam. Our kebabs are grilled over charcoal, and our hummus and baba ghanoush are made fresh daily from authentic recipes.', 'other', '15 Bussorah Street, Singapore 199436', 1.3025, 103.8590),
            ('yuki_sato', 'Ramen Love', 'Artisanal ramen shop specialising in tonkotsu and shoyu broths simmered for 18 hours. Join our ramen-making workshop to craft your own noodles from scratch.', 'japanese', '5 Keong Saik Road, Singapore 089114', 1.2790, 103.8420),
            ('grace_ong', 'Baker\'s Delight', 'Artisan bakery and patisserie offering baking classes for all levels. Learn to make traditional Singaporean pastries like egg tarts, pineapple tarts, and kueh lapis.', 'bakery', '8 Duxton Hill, Singapore 089591', 1.2780, 103.8410),
            ('carlos_reyes', 'Taco Fiesta SG', 'Bringing authentic Mexican street food to Singapore. Our tacos, burritos, and elotes are made with imported Mexican ingredients and a local twist. Food truck and cooking classes available.', 'other', 'The Grandstand, 200 Turf Club Road, Singapore 287994', 1.3340, 103.7920),
            ('ananya_desai', 'Chai Lounge', 'An oasis of calm serving over 30 varieties of artisan chai, paired with Indian sweets and snacks. Our chai-making masterclass teaches you to blend your own signature chai.', 'cafe', '50 Arab Street, Singapore 199747', 1.3030, 103.8590),
            ('james_koh', 'Heritage Kopitiam', 'Step back in time at our vintage kopitiam experience. We serve traditional Hainanese coffee, soft-boiled eggs, and kaya toast just like how your grandparents enjoyed them.', 'hawker', 'Tiong Bahru Market, 30 Seng Poh Road, Singapore 168898', 1.2841, 103.8320),
            ('fatimah_zahra', 'Satay Street Experience', 'The ultimate satay experience on Boon Tat Street. Watch master grillers at work, learn the art of peanut sauce making, and enjoy unlimited satay with ice-cold drinks.', 'street_food', '18 Boon Tat Street, Singapore 069620', 1.2810, 103.8470),
        ]

        for uname, bname, desc, cuisine, addr, lat, lng in profiles:
            user = User.objects.get(username=uname)
            if not VendorProfile.objects.filter(user=user).exists():
                VendorProfile.objects.create(
                    user=user, business_name=bname, description=desc,
                    cuisine_type=cuisine, address=addr,
                    latitude=lat, longitude=lng,
                    phone=user.phone, email=user.email,
                    opening_hours='Mon-Sun: 10:00 AM - 10:00 PM',
                    is_approved=True,
                    is_featured=random.choice([True, False])
                )
        self.stdout.write(f'  Created {len(profiles)} vendor profiles')

    def create_tags(self):
        """Create experience tags."""
        from experiences.models import Tag
        tags = [
            'Halal', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Family-Friendly',
            'Romantic', 'Budget-Friendly', 'Luxury', 'Spicy', 'Kid-Friendly',
            'Instagram-Worthy', 'Heritage', 'Award-Winning', 'Organic',
            'Farm-to-Table', 'Late Night', 'Breakfast', 'Brunch', 'Seafood',
            'Noodles', 'Rice', 'Dessert', 'Street Food', 'Workshop',
            'Walking Tour', 'Cooking Class', 'Tasting Menu', 'Local Favourite'
        ]
        for tag_name in tags:
            Tag.objects.get_or_create(name=tag_name, slug=slugify(tag_name))
        self.stdout.write(f'  Created {len(tags)} tags')

    def create_experiences(self):
        """Create 20+ food experiences."""
        from experiences.models import FoodExperience, Tag
        from vendors.models import VendorProfile

        vendors = list(VendorProfile.objects.filter(is_approved=True))
        all_tags = list(Tag.objects.all())
        today = date.today()

        experiences = [
            ('Hawker Centre Discovery Walk', 'food_tour', 45, 3.0, 'Join us for an unforgettable 3-hour walk through Maxwell Food Centre and Chinatown Complex. Sample 8 signature dishes from legendary stalls that have been perfecting their craft for decades. Learn the history behind chicken rice, laksa, and char kway teow from a local food expert.'),
            ('Dim Sum Making Masterclass', 'cooking_class', 85, 2.5, 'Learn to make 5 classic dim sum from scratch: har gow, siu mai, char siu bao, egg tart, and cheong fun. All ingredients provided. Take home your creations and recipe booklet. Maximum 8 participants for personalized attention.'),
            ('Little India Spice Trail', 'food_tour', 55, 2.5, 'Explore the vibrant spice shops and food stalls of Little India. Taste freshly ground masala, sample biryani from three different stalls, and enjoy a guided tour of the wet market. Includes drinks and all food tastings.'),
            ('Satay Night Experience', 'tasting_menu', 38, 2.0, 'An evening of unlimited satay on the famous Boon Tat Street. Enjoy chicken, mutton, and beef satay grilled to perfection, paired with house-made peanut sauce and ketupat. Includes two drinks.'),
            ('Peranakan Cooking Immersion', 'cooking_class', 120, 4.0, 'A deep dive into Peranakan cuisine in a heritage Katong shophouse. Cook three iconic dishes: ayam buah keluak, kueh pie tee, and ondeh ondeh. Includes market visit, cooking session, and sit-down meal with wine.'),
            ('Seafood Feast at the Bay', 'fine_dining', 150, 2.5, 'Premium waterfront dining experience featuring Singapore\'s freshest seafood. Six-course meal including chilli crab, black pepper crab, cereal prawns, and mantis shrimp. Stunning Marina Bay views included.'),
            ('Japanese Omakase Journey', 'tasting_menu', 180, 2.0, 'An intimate 12-course omakase experience with Chef Ken. Premium ingredients flown in from Tsukiji Market. Only 12 seats available per session. Includes sake pairing.'),
            ('Vegan Hawker Taste Tour', 'food_tour', 42, 2.5, 'Discover that Singapore\'s hawker scene has amazing plant-based options! Visit 6 stalls serving vegan versions of local classics. From mushroom bak kut teh to jackfruit curry, this tour will surprise you.'),
            ('Craft Beer & Local Bites Pairing', 'tasting_menu', 75, 2.0, 'Tour our microbrewery and enjoy 6 craft beers paired with Singaporean snacks. Learn about the brewing process and how local flavours inspire our beer recipes. Includes brewery souvenir glass.'),
            ('Wok Hei Secrets Workshop', 'workshop', 95, 3.0, 'Master the art of wok hei cooking. Learn to make char kway teow, Hokkien mee, and fried rice with that elusive smoky flavour. Hands-on practice with professional wok stations. All skill levels welcome.'),
            ('Kampong Glam Food & Culture Walk', 'food_tour', 50, 3.0, 'Explore the Sultan Mosque neighbourhood through its food. Sample nasi padang, murtabak, teh tarik, and Turkish ice cream. Learn about Malay and Arab heritage in Singapore.'),
            ('Traditional Ramen Workshop', 'cooking_class', 90, 3.0, 'Make your own ramen from scratch! Learn to prepare tonkotsu broth, hand-pull noodles, and assemble a professional ramen bowl. Includes all ingredients and recipe booklet.'),
            ('Artisan Bakery Class - Local Pastries', 'workshop', 80, 2.5, 'Learn to make three beloved Singaporean pastries: egg tarts, pineapple tarts, and kueh lapis. Perfect for food lovers who want to bring Singapore\'s flavours home.'),
            ('Nasi Lemak Masterclass', 'cooking_class', 65, 2.0, 'Master Singapore\'s national breakfast dish. Learn to cook fragrant coconut rice, sambal, fried chicken, ikan bilis, and all the accompaniments. Enjoy your creation for lunch.'),
            ('Chinatown Heritage Food Trail', 'food_tour', 48, 2.5, 'Walk through the historic streets of Chinatown sampling roast meats, bak kwa, traditional Chinese desserts, and the famous soya bean drink. Includes 8 food stops and historical commentary.'),
            ('Tea Ceremony & Tasting Experience', 'tasting_menu', 60, 1.5, 'A serene journey through Chinese tea culture. Taste 6 premium teas, learn proper brewing techniques, and discover the health benefits of each variety. Includes tea set to take home.'),
            ('Mexican Street Food Fiesta', 'workshop', 70, 2.0, 'Learn to make authentic tacos al pastor, churros, and fresh guacamole. Fun, interactive session with live music and margaritas. A taste of Mexico in Singapore!'),
            ('Chai Blending Masterclass', 'workshop', 45, 1.5, 'Create your own signature chai blend from over 20 spices and tea varieties. Learn about the origins of chai culture and take home your custom blend in beautiful packaging.'),
            ('Heritage Kopi & Toast Experience', 'tasting_menu', 25, 1.0, 'Discover the art of traditional Hainanese coffee brewing. Taste the difference between kopi, kopi-o, kopi-c, and more. Paired with perfect kaya toast and soft-boiled eggs.'),
            ('East Coast Seafood BBQ Night', 'tasting_menu', 55, 2.5, 'Evening beach BBQ featuring fresh prawns, stingray, satay, and otah-otah at East Coast Park. Includes drinks and live music. Perfect for groups and families.'),
            ('Market to Table: Wet Market Tour & Cook', 'cooking_class', 110, 4.0, 'Start at Tekka Market selecting fresh ingredients with our chef guide, then head to our kitchen to cook a complete Singaporean meal. The ultimate farm-to-table experience.'),
            ('Dessert Trail: Sweet Singapore', 'food_tour', 40, 2.0, 'A sweet journey through Singapore\'s best dessert spots. From ice kachang to chendol, kueh to durian pastries. Visit 6 legendary dessert stalls and bakeries.'),
            ('Tiong Bahru Food & Art Walk', 'food_tour', 52, 3.0, 'Explore Singapore\'s hippest neighbourhood. Visit independent cafes, traditional bakeries, and the famous wet market. Includes art mural tour and 6 food tastings.'),
            ('Korean BBQ & Soju Night', 'tasting_menu', 68, 2.0, 'Premium Korean BBQ experience with wagyu beef, marinated pork belly, and all the banchan. Includes 3 rounds of soju and Korean dessert.'),
        ]

        for i, (title, cat, price, dur, desc) in enumerate(experiences):
            vendor = vendors[i % len(vendors)]
            exp, created = FoodExperience.objects.get_or_create(
                title=title,
                defaults={
                    'vendor': vendor,
                    'description': desc,
                    'category': cat,
                    'price': price,
                    'capacity': random.randint(8, 30),
                    'duration_hours': dur,
                    'available_from': today,
                    'available_to': today + timedelta(days=180),
                    'start_time': time(random.choice([9, 10, 11, 14, 17, 18, 19]), 0),
                    'meeting_point': vendor.address,
                    'what_included': 'All food tastings, drinks, and guided commentary included.',
                    'what_to_bring': 'Comfortable walking shoes, water bottle, camera.',
                    'is_active': True,
                    'is_featured': i < 8,
                }
            )
            if created:
                num_tags = random.randint(2, 5)
                exp.tags.set(random.sample(all_tags, min(num_tags, len(all_tags))))
        self.stdout.write(f'  Created {len(experiences)} experiences')

    def create_bookings(self):
        """Create bookings for tourists."""
        from bookings.models import Booking
        from experiences.models import FoodExperience

        tourists = list(User.objects.filter(role='tourist'))
        experiences = list(FoodExperience.objects.filter(is_active=True))
        today = date.today()
        statuses = ['confirmed', 'completed', 'completed', 'completed', 'pending']

        count = 0
        for tourist in tourists[:15]:
            for exp in random.sample(experiences, min(3, len(experiences))):
                bdate = today - timedelta(days=random.randint(-30, 60))
                stat = 'completed' if bdate < today else random.choice(statuses)
                Booking.objects.get_or_create(
                    tourist=tourist,
                    experience=exp,
                    booking_date=bdate,
                    defaults={
                        'num_guests': random.randint(1, 4),
                        'status': stat,
                        'booking_time': time(random.choice([10, 11, 14, 18, 19]), 0),
                    }
                )
                count += 1
        self.stdout.write(f'  Created {count} bookings')

    def create_reviews(self):
        """Create reviews for completed bookings."""
        from bookings.models import Booking
        from reviews.models import Review

        completed_bookings = Booking.objects.filter(status='completed').select_related('tourist', 'experience')

        review_comments = [
            "Absolutely incredible experience! The food was authentic and our guide was so knowledgeable about local food culture.",
            "One of the highlights of our Singapore trip. The flavours were amazing and we learned so much about the local cuisine.",
            "Highly recommend this for any food lover visiting Singapore. Great value for money and the portions were generous.",
            "What a wonderful experience! The host made us feel so welcome and the food was out of this world.",
            "Exceeded all expectations. We got to try dishes we would never have found on our own. Truly a local experience.",
            "Perfect introduction to Singapore's food scene. Our guide was passionate and the food stops were carefully curated.",
            "The cooking class was hands-on and fun. I can now make proper laksa at home! Amazing instructor.",
            "A must-do when in Singapore. The street food stops were all hidden gems that tourists rarely find.",
            "Great experience for the whole family. Kids loved making dumplings and the staff were so patient with them.",
            "Wonderful afternoon spent learning about spices and cooking techniques. The meal we cooked was restaurant-quality!",
            "Such a unique way to explore Singapore's neighborhoods. The food stories really brought the culture alive.",
            "Top-notch experience from start to finish. Professional setup, delicious food, and great company.",
            "I've done food tours in many countries, and this ranks in my top 3. Authentic, immersive, and delicious.",
            "The host's passion for food is contagious! We left feeling inspired and very full. Would definitely return.",
            "Perfect blend of food, history, and culture. We ate so much but every bite was worth it.",
            "An unforgettable experience. The seafood was the freshest I've ever had, and the sunset views were a bonus.",
            "Really well organized tour with plenty of variety. Vegetarian options were excellent too.",
            "The chai blending session was so relaxing and educational. Love my custom blend!",
            "Best money spent during our entire Asia trip. Would come back to Singapore just for this.",
            "Intimate setting, incredible food, and wonderful hospitality. This is what travel is all about.",
        ]

        count = 0
        for booking in completed_bookings:
            if not Review.objects.filter(tourist=booking.tourist, experience=booking.experience).exists():
                Review.objects.create(
                    tourist=booking.tourist,
                    experience=booking.experience,
                    rating=random.choice([4, 4, 4, 5, 5, 5, 5, 3, 5, 4]),
                    title=f"Great {booking.experience.get_category_display()}!",
                    comment=random.choice(review_comments),
                    is_approved=True,
                )
                count += 1
        self.stdout.write(f'  Created {count} reviews')

    def create_itineraries(self):
        """Create sample itineraries."""
        from itineraries.models import Itinerary, ItineraryItem
        from experiences.models import FoodExperience

        tourists = list(User.objects.filter(role='tourist'))[:5]
        experiences = list(FoodExperience.objects.filter(is_active=True))
        today = date.today()

        itinerary_data = [
            ('3-Day Singapore Food Adventure', 'The ultimate Singapore food experience covering hawker centres, fine dining, and cooking classes.'),
            ('Weekend Foodie Getaway', 'A packed weekend hitting all the must-eat spots in Singapore.'),
            ('Chinatown & Little India Trail', 'A cultural food journey through Singapore\'s most vibrant ethnic neighbourhoods.'),
            ('Family Food Fun', 'Kid-friendly food experiences the whole family will enjoy.'),
            ('Romantic Culinary Date', 'Perfect food experiences for couples looking for something special.'),
        ]

        for i, tourist in enumerate(tourists):
            title, desc = itinerary_data[i]
            itin, created = Itinerary.objects.get_or_create(
                tourist=tourist,
                title=title,
                defaults={
                    'description': desc,
                    'start_date': today + timedelta(days=7),
                    'end_date': today + timedelta(days=10),
                    'is_public': True,
                }
            )
            if created:
                selected = random.sample(experiences, min(4, len(experiences)))
                for j, exp in enumerate(selected):
                    ItineraryItem.objects.create(
                        itinerary=itin,
                        experience=exp,
                        day_number=(j // 2) + 1,
                        order=j,
                        notes=f"Don't forget to try the signature dish!",
                        planned_time=time(10 + j * 3, 0),
                    )
        self.stdout.write(f'  Created {len(itinerary_data)} itineraries')

    def create_blog_data(self):
        """Create blog categories and posts."""
        from blog.models import BlogCategory, BlogPost

        categories = [
            ('food-guides', 'Food Guides', 'Comprehensive guides to Singapore\'s food scene'),
            ('recipes', 'Recipes', 'Local recipes to try at home'),
            ('culture', 'Culture & Heritage', 'Food culture and culinary heritage stories'),
            ('events', 'Events & Festivals', 'Upcoming food events and festivals'),
            ('tips', 'Travel Tips', 'Helpful tips for food tourists'),
        ]
        for slug, name, desc in categories:
            BlogCategory.objects.get_or_create(slug=slug, defaults={'name': name, 'description': desc})

        admin = User.objects.get(username='admin')
        cats = {c.slug: c for c in BlogCategory.objects.all()}

        posts = [
            ('Top 10 Hawker Centres You Must Visit in Singapore', 'food-guides', 'Singapore\'s hawker centres are a food lover\'s paradise. From the legendary Maxwell Food Centre to the bustling Chomp Chomp, here are the top 10 hawker centres that every tourist must visit during their stay in Singapore.', 'Discover the 10 best hawker centres in Singapore for an authentic local food experience.'),
            ('The Art of Kaya Toast: A Singapore Heritage', 'culture', 'Kaya toast has been a staple of Singapore\'s breakfast culture for over a century. This humble dish of toasted bread, coconut jam, and butter tells the story of Hainanese immigrants who brought their culinary traditions to Southeast Asia.', 'Learn the rich history behind Singapore\'s beloved kaya toast tradition.'),
            ('5 Must-Try Dishes in Chinatown', 'food-guides', 'Chinatown is home to some of Singapore\'s most iconic dishes. From Tian Tian\'s famous chicken rice to the perfect char siu at Liao Fan, these five dishes represent the heart of Chinese culinary tradition in Singapore.', 'Essential Chinatown dishes every food lover should try.'),
            ('Singapore Food Festival 2026: What to Expect', 'events', 'The annual Singapore Food Festival returns this July with an exciting lineup of pop-up restaurants, cooking demonstrations, heritage food trails, and special menus from top chefs. Here\'s your complete guide to making the most of this culinary celebration.', 'Your complete guide to the Singapore Food Festival 2026.'),
            ('How to Eat Like a Local in Singapore', 'tips', 'Want to dine like a Singaporean? From knowing when to visit hawker centres to understanding the "chope" tissue paper system, here are insider tips that will transform your food experience in Singapore.', 'Insider tips for eating like a true Singaporean local.'),
            ('The Peranakan Kitchen: Where Two Cultures Meet', 'culture', 'Peranakan cuisine is a beautiful fusion of Chinese and Malay cooking traditions. Born from the intermarriage of Chinese traders with local Malay women, this unique culinary heritage produces some of Singapore\'s most complex and flavourful dishes.', 'Explore the rich fusion of Peranakan culinary heritage.'),
            ('Best Vegetarian Food in Singapore', 'food-guides', 'Singapore may be famous for its meat-centric hawker dishes, but the city offers an incredible array of vegetarian and vegan options. From Buddhist temple kitchens to modern plant-based cafés, here\'s where to find the best meat-free meals.', 'A comprehensive guide to vegetarian dining in Singapore.'),
            ('Making Perfect Laksa at Home', 'recipes', 'Laksa is one of Singapore\'s most beloved noodle soups, combining creamy coconut milk with a spicy, aromatic paste. Our step-by-step guide will help you recreate this masterpiece in your own kitchen using accessible ingredients.', 'Step-by-step guide to making authentic Singapore laksa at home.'),
            ('A Guide to Singapore\'s Coffee Culture', 'culture', 'From traditional kopi brewed with a sock filter to third-wave specialty coffee, Singapore\'s coffee scene is as diverse as its food. Discover the fascinating evolution of coffee culture on this tiny island.', 'From kopi to specialty coffee: Singapore\'s diverse coffee culture.'),
            ('Night Markets & Late Night Eats', 'food-guides', 'Some of Singapore\'s best food comes alive after dark. From the Pasar Malam night markets to late-night prata shops and supper spots, discover where to satisfy those midnight cravings.', 'Your guide to the best late-night food spots in Singapore.'),
            ('Indian Food Trail: From Little India to Beyond', 'food-guides', 'Little India is just the beginning. Singapore\'s Indian food scene spans from humble banana leaf restaurants to upscale contemporary Indian dining. Follow our trail to discover the full spectrum of Indian flavours.', 'Explore the diverse Indian food landscape across Singapore.'),
            ('Sustainable Dining in Singapore', 'tips', 'Singapore\'s food scene is embracing sustainability with farm-to-table restaurants, zero-waste eateries, and urban farming initiatives. Here are the best places to enjoy a meal while supporting sustainable practices.', 'Where to find eco-friendly dining options in Singapore.'),
            ('The History of Hainanese Chicken Rice', 'culture', 'Hainanese chicken rice is more than just a dish – it\'s Singapore\'s national treasure. Tracing its origins from Hainan island through the hands of immigrant chefs who adapted it for Singaporean palates, this is the story of how a simple meal became legendary.', 'The fascinating origin story of Singapore\'s national dish.'),
            ('Durian Season: A Beginner\'s Guide', 'tips', 'Love it or hate it, durian is the undisputed King of Fruits in Southeast Asia. If you\'re brave enough to try it, here\'s everything you need to know about picking the perfect durian and where to find the best varieties in Singapore.', 'Everything beginners need to know about durian in Singapore.'),
            ('Street Food Safety Tips for Tourists', 'tips', 'Singapore\'s street food is famously safe thanks to strict government regulations, but here are some additional tips to ensure your hawker centre experience is both delicious and worry-free.', 'Stay safe while enjoying Singapore\'s incredible street food.'),
            ('Upcoming Food Events This Quarter', 'events', 'Mark your calendars! Here are all the food-related events happening in Singapore over the next three months, from pop-up dining experiences to food photography workshops and new restaurant openings.', 'Don\'t miss these upcoming food events in Singapore.'),
            ('Malay Cuisine: A Rich Culinary Tapestry', 'culture', 'Malay cuisine in Singapore reflects centuries of trade, migration, and cultural exchange. From the aromatic nasi lemak to the rich rendang, each dish carries stories of spice traders, royal kitchens, and family traditions.', 'Discover the depth and richness of Malay culinary tradition.'),
            ('Budget Eating Guide: Best Meals Under $5', 'food-guides', 'You don\'t need to break the bank to eat well in Singapore. From $2 economic rice to $4 bak chor mee, here are the best hawker meals that offer incredible value without compromising on taste.', 'The best Singapore meals you can enjoy for under $5.'),
            ('Cooking with Pandan: Singapore\'s Vanilla', 'recipes', 'Pandan leaves are to Southeast Asian cooking what vanilla is to Western baking. Learn about this fragrant leaf and how to use it in both sweet and savoury dishes with our collection of pandan recipes.', 'Learn to cook with Singapore\'s favourite aromatic leaf.'),
            ('Why Singapore\'s Hawker Culture Deserves UNESCO Status', 'culture', 'In 2020, Singapore\'s hawker culture was inscribed on the UNESCO Representative List of Intangible Cultural Heritage. Here\'s why this recognition is so important and what it means for the future of hawker food.', 'Understanding the UNESCO recognition of Singapore\'s hawker heritage.'),
        ]

        for title, cat_slug, content, excerpt in posts:
            slug = slugify(title)[:50]
            BlogPost.objects.get_or_create(
                slug=slug,
                defaults={
                    'author': admin,
                    'category': cats.get(cat_slug),
                    'title': title,
                    'excerpt': excerpt,
                    'content': content,
                    'is_published': True,
                    'is_featured': posts.index((title, cat_slug, content, excerpt)) < 4,
                }
            )
        self.stdout.write(f'  Created {len(posts)} blog posts')

    def create_pages(self):
        """Create static pages."""
        from pages.models import Page

        pages_data = [
            ('About Us', 'about', """TasteLocal is Singapore's premier food tourism platform, connecting travelers with authentic local culinary experiences. Founded by the TasteLocal Tourism Board, our mission is to bridge the gap between tourists seeking genuine food experiences and the passionate local vendors who create them.

Our Vision:
To make Singapore's rich culinary heritage accessible to every visitor, while supporting the small businesses and hawker stalls that make our food scene world-famous.

Our Story:
Singapore's food culture is one of its greatest treasures. From UNESCO-inscribed hawker centres to Michelin-starred restaurants, our tiny island packs an incredible diversity of flavours. Yet, tourists often struggle to navigate this rich landscape. TasteLocal was created to solve this problem – providing a curated, trusted platform where visitors can discover, book, and enjoy authentic food experiences.

What We Offer:
- Curated food experiences vetted by local experts
- Easy online booking with instant confirmation
- Verified reviews from real visitors
- Personalized food itinerary planning
- Interactive map to discover food spots near you
- Support for small, local food vendors

Our Team:
TasteLocal is operated by a dedicated team of food enthusiasts, tourism professionals, and technology experts who are passionate about sharing Singapore's culinary culture with the world.

Contact us at tastelocal2@gmail.com to learn more about partnership opportunities or to share your feedback."""),

            ('Privacy Policy', 'privacy', """Privacy Policy - TasteLocal Platform
Last Updated: March 2026

1. Introduction
TasteLocal ("we," "our," or "us") is committed to protecting the privacy and personal data of our users. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our platform.

2. Information We Collect
Personal Data: When you register, we collect your name, email address, phone number, country of residence, and profile information.
Booking Data: When you make a booking, we collect booking dates, guest numbers, and special requests.
Usage Data: We automatically collect information about your interactions with the platform, including pages visited, search queries, and booking history.
Location Data: With your consent, we collect geolocation data to show nearby food experiences.

3. How We Use Your Information
- To provide and maintain our service
- To process bookings and send confirmations
- To personalize your experience and recommendations
- To communicate with you about updates and promotions
- To analyze usage patterns and improve our platform
- To ensure security and prevent fraud

4. Data Sharing
We share your information only with:
- Vendors you book with (name, contact for booking purposes)
- Service providers who assist our operations
- Legal authorities when required by law

We never sell your personal data to third parties.

5. Data Security
We implement industry-standard security measures including HTTPS encryption, password hashing (bcrypt), CSRF protection, and role-based access control to protect your data.

6. Your Rights
You have the right to:
- Access your personal data
- Correct inaccurate data
- Delete your account and associated data
- Opt out of marketing communications
- Export your data in a portable format

7. Cookies
We use essential cookies for session management and authentication. Analytics cookies help us understand platform usage and are only set with your consent.

8. Contact Us
For privacy concerns, contact our Data Protection Officer at tastelocal2@gmail.com.

9. Changes to This Policy
We may update this policy periodically. Changes will be posted on this page with an updated revision date."""),

            ('Terms of Service', 'terms', """Terms of Service - TasteLocal Platform
Last Updated: March 2026

1. Acceptance of Terms
By accessing or using the TasteLocal platform, you agree to be bound by these Terms of Service. If you do not agree, please do not use our service.

2. Description of Service
TasteLocal is a food tourism platform connecting tourists with local food vendors and experiences in Singapore. We facilitate discovery, booking, and review of culinary experiences.

3. User Accounts
- You must be at least 18 years old to create an account
- You are responsible for maintaining the confidentiality of your account credentials
- You agree to provide accurate and complete information during registration
- One account per person; multiple accounts may be terminated

4. User Types and Responsibilities
Tourist Users: May search, book, review, and create itineraries. Must provide honest reviews based on actual experiences.
Vendor Users: May create business profiles and list experiences. Must provide accurate descriptions, pricing, and availability. Subject to admin approval before listings go live.
Admin Users: Manage platform content, approve vendors, and moderate reviews.

5. Bookings and Cancellations
- Bookings are confirmed upon submission through the platform
- Cancellation policies vary by experience; check individual listings
- Refunds for cancelled bookings are processed within 7-14 business days
- TasteLocal is not liable for vendor cancellations but will assist in resolution

6. Reviews and Content
- Reviews must be based on genuine experiences
- Fraudulent or misleading reviews will be removed
- Users retain ownership of their review content but grant TasteLocal a license to display it
- Vendors may not incentivize or manipulate reviews

7. Intellectual Property
All platform content, design, and branding are owned by TasteLocal. Users may not copy, modify, or distribute platform content without permission.

8. Limitation of Liability
TasteLocal acts as an intermediary platform. We are not responsible for the quality, safety, or legality of vendor services. Users engage with vendors at their own discretion.

9. Governing Law
These terms are governed by the laws of Singapore.

10. Contact
Questions about these terms? Email us at tastelocal2@gmail.com."""),

            ('Contact Us', 'contact', """Get in Touch with TasteLocal

We'd love to hear from you! Whether you have questions about our platform, need help with a booking, or want to partner with us, we're here to help.

General Enquiries:
Email: tastelocal2@gmail.com
Phone: +65 6100 8888
Hours: Monday to Friday, 9:00 AM - 6:00 PM (SGT)

Office Address:
TasteLocal Tourism Board
1 Orchard Road, #10-01
Singapore 238824

For Vendors:
Interested in listing your food experience on TasteLocal? Email us at vendors@tastelocal.sg or fill out the contact form below. Our team will guide you through the registration process.

For Media & Press:
For media enquiries, interview requests, or press resources, please contact press@tastelocal.sg.

Technical Support:
Experiencing issues with the platform? Email support@tastelocal.sg with a description of the problem and we'll respond within 24 hours.

Partnership Opportunities:
Hotels, travel agencies, and tourism boards interested in collaboration can reach us at partners@tastelocal.sg.

Use the contact form on this page to send us a message directly!"""),

            ('Site Map', 'sitemap', """TasteLocal Site Map

Home
├── Discover Experiences
│   ├── Search & Filter
│   ├── Browse by Cuisine
│   ├── Browse by Category
│   ├── Featured Experiences
│   └── Map View
│
├── Vendors
│   ├── Browse Vendors
│   ├── Vendor Profiles
│   └── Become a Vendor
│
├── Blog
│   ├── Food Guides
│   ├── Recipes
│   ├── Culture & Heritage
│   ├── Events & Festivals
│   └── Travel Tips
│
├── My Account
│   ├── Profile Settings
│   ├── My Bookings
│   ├── My Itineraries
│   ├── My Reviews
│   └── Change Password
│
├── Vendor Dashboard (Vendors Only)
│   ├── My Profile
│   ├── My Listings
│   ├── Booking Management
│   └── Analytics
│
├── Admin Dashboard (Admins Only)
│   ├── User Management
│   ├── Vendor Approvals
│   ├── Review Moderation
│   ├── Booking Analytics
│   └── Content Management
│
├── About Us
├── Contact Us
├── Privacy Policy
├── Terms of Service
└── FAQ"""),

            ('FAQ', 'faq', """Frequently Asked Questions

General Questions:

Q: What is TasteLocal?
A: TasteLocal is Singapore's food tourism platform connecting visitors with authentic local food experiences, from hawker centre tours to cooking classes and fine dining adventures.

Q: Is TasteLocal free to use?
A: Browsing and searching is completely free. You only pay when you book an experience, and the price is set by the vendor.

Q: Do I need an account to browse?
A: No, you can browse all experiences without an account. However, you'll need to register to make bookings, leave reviews, or create itineraries.

Booking Questions:

Q: How do I book an experience?
A: Simply find an experience you like, select your preferred date and number of guests, and click "Book Now." You'll receive an email confirmation immediately.

Q: Can I cancel a booking?
A: Yes, you can cancel bookings from your dashboard. Please check the specific cancellation policy for each experience.

Q: Is payment required at the time of booking?
A: Payment arrangements vary by experience. Most experiences accept payment on the day. Online payment integration is coming in Phase 2.

For Vendors:

Q: How do I list my food business?
A: Register as a vendor, create your business profile, and submit it for approval. Once approved, you can start listing experiences.

Q: Is there a commission fee?
A: TasteLocal currently does not charge commission fees. We aim to keep our platform accessible for small businesses.

Q: How long does vendor approval take?
A: Typically within 2-3 business days. We may contact you for additional information during the review process.

Technical Questions:

Q: Which browsers are supported?
A: TasteLocal works best on Chrome, Firefox, Safari, and Edge (latest versions). The platform is fully responsive for mobile devices.

Q: I forgot my password. What do I do?
A: Click "Forgot Password" on the login page and enter your email address. We'll send you a reset link.

Q: How do I update my profile?
A: Log in to your account and navigate to "My Profile" from the dashboard. You can update your information, profile photo, and preferences there.

Still have questions? Contact us at tastelocal2@gmail.com!"""),
        ]

        for title, slug, content in pages_data:
            Page.objects.get_or_create(
                slug=slug,
                defaults={
                    'title': title,
                    'content': content,
                    'is_published': True,
                    'meta_description': f'{title} - TasteLocal Food Tourism Platform'
                }
            )
        self.stdout.write(f'  Created {len(pages_data)} static pages')
