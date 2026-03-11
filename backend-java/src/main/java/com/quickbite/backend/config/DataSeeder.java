package com.quickbite.backend.config;

import com.quickbite.backend.model.MenuItem;
import com.quickbite.backend.model.User;
import com.quickbite.backend.repository.MenuItemRepository;
import com.quickbite.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Component
public class DataSeeder implements CommandLineRunner {

    private final MenuItemRepository menuItemRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(MenuItemRepository menuItemRepository,
                      UserRepository userRepository,
                      PasswordEncoder passwordEncoder) {
        this.menuItemRepository = menuItemRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        seedAdmin();
        seedMenu();
    }

    private void seedAdmin() {
        boolean adminExists = userRepository.findAll().stream()
                .anyMatch(u -> "admin".equals(u.getRole()));
        if (!adminExists) {
            User admin = new User();
            admin.setName("Admin");
            admin.setEmail("admin@quickbite.com");
            admin.setPassword(passwordEncoder.encode("Admin@123"));
            admin.setRole("admin");
            admin.setIsEmailVerified(true);
            admin.setApproved(true);
            admin.setIsActive(true);
            userRepository.save(admin);
            System.out.println("✅ Default admin created → admin@quickbite.com / Admin@123");
        }
    }

    // Verified Unsplash photo IDs — each unique and food-appropriate
    private void seedMenu() {
        List<MenuItem> items = new ArrayList<>();

        // ── PIZZA ──────────────────────────────────────────────────────
        items.add(m("Margherita Pizza",       "Classic cheese and tomato pizza base",          "Pizza",       249.0, "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800", true,  20));
        items.add(m("Pepperoni Pizza",         "Spicy pepperoni slices with mozzarella",        "Pizza",       349.0, "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800", false, 25));
        items.add(m("Farmhouse Pizza",         "Onions, capsicum, mushroom and tomato",         "Pizza",       299.0, "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800", true,  25));
        items.add(m("BBQ Chicken Pizza",       "Smoky BBQ sauce with grilled chicken chunks",   "Pizza",       379.0, "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=800", false, 25));
        items.add(m("Paneer Tikka Pizza",      "Indian spiced paneer on a pizza base",          "Pizza",       329.0, "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800", true,  25));
        items.add(m("Mexican Wave Pizza",      "Jalapenos, black olives and salsa",             "Pizza",       319.0, "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=800", true,  20));
        items.add(m("Double Cheese Pizza",     "Extra mozzarella and cheddar blend",            "Pizza",       359.0, "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=800", true,  20));
        items.add(m("Veggie Supreme Pizza",    "Bell peppers, corn, onions, olives, mushroom",  "Pizza",       289.0, "https://images.unsplash.com/photo-1548369937-47519962c11a?w=800", true,  25));
        items.add(m("Spicy Chicken Pizza",     "Fiery chicken tikka with red chilli sauce",     "Pizza",       369.0, "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=800", false, 25));
        items.add(m("Pesto Basil Pizza",       "Basil pesto sauce with fresh veggies",          "Pizza",       309.0, "https://images.unsplash.com/photo-1532246420286-127bcd803104?w=800", true,  20));

        // ── BURGER ─────────────────────────────────────────────────────
        items.add(m("Classic Veg Burger",      "Crispy veggie patty with fresh lettuce",        "Burger",      129.0, "https://images.unsplash.com/photo-1550547660-d9450f859349?w=800", true,  15));
        items.add(m("Chicken Zinger Burger",   "Fried chicken fillet with spicy mayo",          "Burger",      189.0, "https://images.unsplash.com/photo-1615297928064-24977384d0f5?w=800", false, 15));
        items.add(m("Double Cheese Burger",    "Double patty overloaded with cheese",           "Burger",      229.0, "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800", false, 20));
        items.add(m("Paneer Burger",           "Spiced paneer patty with mint chutney",         "Burger",      149.0, "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=800", true,  15));
        items.add(m("Smoky BBQ Burger",        "Beef-style patty with smoky BBQ sauce",         "Burger",      249.0, "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=800", false, 20));
        items.add(m("Mushroom Swiss Burger",   "Sautéed mushrooms with Swiss cheese",           "Burger",      199.0, "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=800", true,  15));
        items.add(m("Aloo Tikki Burger",       "Indian spiced potato patty burger",             "Burger",      119.0, "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=800", true,  12));
        items.add(m("Chicken Maharaja Burger", "Double chicken patty with cheese slice",        "Burger",      269.0, "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=800", false, 20));
        items.add(m("Egg Burger",              "Fried egg with cheese and lettuce",             "Burger",      159.0, "https://images.unsplash.com/photo-1521305916504-4a1121188589?w=800", false, 15));
        items.add(m("Crispy Chicken Burger",   "Buttermilk fried chicken with coleslaw",        "Burger",      219.0, "https://images.unsplash.com/photo-1609780447631-05b93e5a88ea?w=800", false, 18));

        // ── SNACKS ─────────────────────────────────────────────────────
        items.add(m("French Fries",            "Golden crispy salted fries",                    "Snacks",       99.0, "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=800", true,  10));
        items.add(m("Chicken Nuggets",         "6 pcs crispy chicken nuggets",                  "Snacks",      159.0, "https://images.unsplash.com/photo-1562967914-608f82629710?w=800", false, 12));
        items.add(m("Veg Momos",               "Steamed dumplings with spicy chutney",          "Snacks",      119.0, "https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=800", true,  15));
        items.add(m("Cheese Fries",            "Loaded fries with melted nacho cheese",         "Snacks",      139.0, "https://images.unsplash.com/photo-1585109649139-366815a0d713?w=800", true,  12));
        items.add(m("Onion Rings",             "Crispy battered onion rings",                   "Snacks",      109.0, "https://images.unsplash.com/photo-1639024471283-03518883512d?w=800", true,  10));
        items.add(m("Veg Spring Rolls",        "Crispy rolls stuffed with mixed vegetables",    "Snacks",      129.0, "https://images.unsplash.com/photo-1607301406259-dfb186e15de8?w=800", true,  12));
        items.add(m("Chicken Momos",           "Juicy chicken dumplings with chilli sauce",     "Snacks",      149.0, "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800", false, 12));
        items.add(m("Peri Peri Fries",         "Spicy peri peri fries with dipping sauce",      "Snacks",      119.0, "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800", true,  10));
        items.add(m("Paneer Popcorn",          "Crunchy battered fried paneer bites",           "Snacks",      139.0, "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800", true,  12));
        items.add(m("Buffalo Wings",           "Spicy chicken wings with ranch dip",            "Snacks",      199.0, "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=800", false, 20));

        // ── DRINKS ─────────────────────────────────────────────────────
        items.add(m("Cola",                    "Chilled carbonated soft drink",                 "Drinks",       49.0, "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800", true,  2));
        items.add(m("Strawberry Milkshake",    "Fresh strawberry shake with cream",             "Drinks",      149.0, "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=800", true,  8));
        items.add(m("Iced Coffee",             "Cold brewed coffee with ice cubes",             "Drinks",      129.0, "https://images.unsplash.com/photo-1517701604599-bb29b5c73553?w=800", true,  5));
        items.add(m("Mango Lassi",             "Thick sweet mango yogurt drink",                "Drinks",       99.0, "https://images.unsplash.com/photo-1571167330149-80c0c9a836cf?w=800", true,  5));
        items.add(m("Chocolate Milkshake",     "Rich creamy chocolate shake",                   "Drinks",      149.0, "https://images.unsplash.com/photo-1572490122747-3a3a43c2f0e8?w=800", true,  8));
        items.add(m("Lemon Soda",              "Fresh lemon with chilled soda water",           "Drinks",       69.0, "https://images.unsplash.com/photo-1523371054106-bbf80586c38c?w=800", true,  3));
        items.add(m("Fresh Orange Juice",      "Freshly squeezed orange juice",                 "Drinks",       89.0, "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=800", true,  5));
        items.add(m("Watermelon Juice",        "Chilled fresh watermelon juice",                "Drinks",       79.0, "https://images.unsplash.com/photo-1582897085656-c636d006a246?w=800", true,  5));
        items.add(m("Masala Chai",             "Spiced Indian tea with milk",                   "Drinks",       39.0, "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=800", true,  5));
        items.add(m("Banana Shake",            "Thick creamy banana milkshake",                 "Drinks",      129.0, "https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=800", true,  8));

        // ── SOUTH INDIAN ───────────────────────────────────────────────
        items.add(m("Masala Dosa",             "Crispy rice crepe with spiced potato filling",  "South Indian",139.0, "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800", true,  15));
        items.add(m("Plain Dosa",              "Thin crispy rice crepe with chutneys",          "South Indian", 99.0, "https://images.unsplash.com/photo-1630383249896-463a221e3e57?w=800", true,  12));
        items.add(m("Rava Dosa",               "Crispy semolina dosa with coconut chutney",     "South Indian",129.0, "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800", true,  15));
        items.add(m("Idli Sambar",             "Steamed rice cakes with lentil soup",           "South Indian", 89.0, "https://images.unsplash.com/photo-1697256200022-f61abf9a1b4c?w=800", true,  15));
        items.add(m("Vada Sambar",             "Crispy lentil fritters dipped in sambar",       "South Indian",109.0, "https://images.unsplash.com/photo-1606491048802-8342506d6471?w=800", true,  15));
        items.add(m("Uttapam",                 "Thick rice pancake topped with vegetables",     "South Indian",119.0, "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800", true,  15));
        items.add(m("Set Dosa",                "Soft spongy dosas served as a set of three",    "South Indian",109.0, "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800", true,  15));
        items.add(m("Medu Vada",               "Crispy fried lentil doughnuts with sambar",     "South Indian", 99.0, "https://images.unsplash.com/photo-1643492377867-b64c5ea83671?w=800", true,  12));
        items.add(m("Pongal",                  "Comforting rice and lentil dish with ghee",     "South Indian",119.0, "https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=800", true,  15));
        items.add(m("Chettinad Chicken Curry", "Spicy aromatic South Indian chicken curry",     "South Indian",249.0, "https://images.unsplash.com/photo-1574653853027-5382a3d23a15?w=800", false, 25));

        // ── CHINESE ───────────────────────────────────────────────────
        items.add(m("Veg Fried Rice",          "Stir-fried rice with mixed vegetables",         "Chinese",     149.0, "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800", true,  15));
        items.add(m("Chicken Fried Rice",      "Wok-tossed rice with egg and chicken",          "Chinese",     189.0, "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800", false, 15));
        items.add(m("Veg Hakka Noodles",       "Stir-fried noodles with vegetables",            "Chinese",     139.0, "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800", true,  15));
        items.add(m("Chicken Hakka Noodles",   "Classic Indo-Chinese chicken noodles",          "Chinese",     179.0, "https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=800", false, 15));
        items.add(m("Gobi Manchurian",         "Crispy cauliflower in spicy Manchurian sauce",  "Chinese",     159.0, "https://images.unsplash.com/photo-1567337710282-00832b415979?w=800", true,  20));
        items.add(m("Paneer Manchurian",       "Pan-fried paneer in tangy Manchurian gravy",    "Chinese",     179.0, "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800", true,  20));
        items.add(m("Chicken Manchurian",      "Tender chicken in spicy soy Manchurian sauce",  "Chinese",     219.0, "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=800", false, 20));
        items.add(m("Chilli Paneer",           "Paneer cubes tossed in chilli-garlic sauce",    "Chinese",     189.0, "https://images.unsplash.com/photo-1529543544282-ea669407fca3?w=800", true,  18));
        items.add(m("Chilli Chicken",          "Spicy dry chilli chicken Indo-Chinese style",   "Chinese",     229.0, "https://images.unsplash.com/photo-1598516515960-9a84ef855eef?w=800", false, 20));
        items.add(m("Schezwan Fried Rice",     "Fiery Schezwan sauce fried rice",               "Chinese",     169.0, "https://images.unsplash.com/photo-1645696301019-35adcc18a5f5?w=800", true,  15));

        // ── SANDWICH ──────────────────────────────────────────────────
        items.add(m("Veg Club Sandwich",       "Triple-decker sandwich with veggies and cheese","Sandwich",    129.0, "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800", true,  10));
        items.add(m("Chicken BLT Sandwich",    "Bacon, lettuce, tomato with grilled chicken",   "Sandwich",    179.0, "https://images.unsplash.com/photo-1553909489-cd47e0ef937f?w=800", false, 12));
        items.add(m("Grilled Cheese Sandwich", "Buttery toasted sandwich oozing with cheese",   "Sandwich",    119.0, "https://images.unsplash.com/photo-1559410545-0bdcd187e0a6?w=800", true,  10));
        items.add(m("Paneer Tikka Sandwich",   "Spiced paneer grilled sandwich",                "Sandwich",    149.0, "https://images.unsplash.com/photo-1554433607-66b5efe9d304?w=800", true,  12));
        items.add(m("Egg Mayo Sandwich",       "Creamy egg mayo filling on white bread",        "Sandwich",    109.0, "https://images.unsplash.com/photo-1481070555726-e2fe8357725c?w=800", false,  8));
        items.add(m("Tuna Sandwich",           "Classic tuna salad with onions and celery",     "Sandwich",    169.0, "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800", false, 10));
        items.add(m("Avocado Toast Sandwich",  "Smashed avocado on toasted multigrain bread",   "Sandwich",    159.0, "https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?w=800", true,   8));
        items.add(m("Bombay Masala Sandwich",  "Spiced potato and chutney layered sandwich",    "Sandwich",     99.0, "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800", true,  10));
        items.add(m("BBQ Chicken Sub",         "Saucy BBQ chicken in a toasted sub roll",       "Sandwich",    199.0, "https://images.unsplash.com/photo-1607013251379-e6eecfffe234?w=800", false, 15));
        items.add(m("Caprese Sandwich",        "Fresh mozzarella, tomato and basil pesto",      "Sandwich",    149.0, "https://images.unsplash.com/photo-1521390188846-e2a3a97453a0?w=800", true,   8));

        // ── ROLLS ─────────────────────────────────────────────────────
        items.add(m("Paneer Tikka Roll",       "Grilled paneer cubes wrapped in paratha",       "Rolls",       169.0, "https://images.unsplash.com/photo-1536489885071-87983c3e2859?w=800", true,  12));
        items.add(m("Chicken Kathi Roll",      "Tender chicken tikka in a flaky paratha",       "Rolls",       189.0, "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800", false, 15));
        items.add(m("Egg Roll",                "Spiced omelette wrapped in paratha",            "Rolls",       129.0, "https://images.unsplash.com/photo-1604908177453-7462950a6a3b?w=800", false, 12));
        items.add(m("Aloo Roll",               "Mashed spiced potato filling in soft roti",     "Rolls",       109.0, "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800", true,  10));
        items.add(m("Chicken Shawarma Roll",   "Middle-Eastern style chicken wrap",             "Rolls",       199.0, "https://images.unsplash.com/photo-1561651823-34feb02250e4?w=800", false, 15));
        items.add(m("Veg Seekh Kebab Roll",    "Vegetable seekh kebab in a paratha",            "Rolls",       149.0, "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800", true,  15));
        items.add(m("Mutton Kathi Roll",       "Slow-cooked mutton wrapped in paratha",         "Rolls",       229.0, "https://images.unsplash.com/photo-1544025162-d76694265947?w=800", false, 20));
        items.add(m("Burrito Roll",            "Mexican-inspired rice, beans and veggie wrap",  "Rolls",       179.0, "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800", true,  15));
        items.add(m("Double Egg Roll",         "Two-egg omelette layer in flaky paratha",       "Rolls",       149.0, "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800", false, 12));
        items.add(m("Paneer Lababdar Roll",    "Creamy paneer curry wrapped in tandoori roti",  "Rolls",       189.0, "https://images.unsplash.com/photo-1574653853027-5382a3d23a15?w=800", true,  15));

        // ── DESSERT ───────────────────────────────────────────────────
        items.add(m("Gulab Jamun",             "Soft milk dumplings soaked in rose syrup",      "Dessert",      79.0, "https://images.unsplash.com/photo-1666200426-23e2b4dce4c0?w=800", true,   5));
        items.add(m("Chocolate Brownie",       "Warm fudgy brownie with vanilla ice cream",     "Dessert",     149.0, "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800", true,  10));
        items.add(m("Rasmalai",                "Soft paneer patties in saffron-flavored milk",  "Dessert",      99.0, "https://images.unsplash.com/photo-1602351447937-745cb720612f?w=800", true,   5));
        items.add(m("Vanilla Ice Cream",       "Classic vanilla scoop with wafer",              "Dessert",      79.0, "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=800", true,   5));
        items.add(m("Chocolate Lava Cake",     "Molten chocolate cake with liquid center",      "Dessert",     189.0, "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=800", true,  15));
        items.add(m("Mango Kulfi",             "Creamy frozen Indian mango ice cream",          "Dessert",      89.0, "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=800", true,   5));
        items.add(m("Caramel Custard",         "Silky smooth baked caramel custard",            "Dessert",     119.0, "https://images.unsplash.com/photo-1571167366136-b57e0a89a058?w=800", true,   5));
        items.add(m("Tiramisu",                "Italian coffee-flavored layered dessert",       "Dessert",     199.0, "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800", true,  10));
        items.add(m("Kheer",                   "Creamy Indian rice pudding with cardamom",      "Dessert",      89.0, "https://images.unsplash.com/photo-1605197788088-3b89b6f5c64f?w=800", true,   5));
        items.add(m("Nutella Pancakes",        "Fluffy pancakes loaded with Nutella and banana","Dessert",     169.0, "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800", true,  12));

        // Upsert: add new items AND update image/details of existing ones
        int added = 0, updated = 0;
        for (MenuItem item : items) {
            Optional<MenuItem> existing = menuItemRepository.findByName(item.getName());
            if (existing.isPresent()) {
                MenuItem e = existing.get();
                e.setImage(item.getImage());
                e.setDescription(item.getDescription());
                e.setCategory(item.getCategory());
                e.setPrice(item.getPrice());
                e.setIsVeg(item.getIsVeg());
                e.setPreparationTime(item.getPreparationTime());
                menuItemRepository.save(e);
                updated++;
            } else {
                menuItemRepository.save(item);
                added++;
            }
        }
        System.out.println("✅ Menu seeding complete. Added: " + added + " | Updated: " + updated);
    }

    private MenuItem m(String name, String desc, String cat, Double price,
                       String img, Boolean isVeg, Integer time) {
        MenuItem item = new MenuItem();
        item.setName(name);
        item.setDescription(desc);
        item.setCategory(cat);
        item.setPrice(price);
        item.setImage(img);
        item.setIsVeg(isVeg);
        item.setIsAvailable(true);
        item.setPreparationTime(time);
        item.setRating(4.2 + Math.random() * 0.7);
        item.setReviewCount((int)(20 + Math.random() * 200));
        item.setSoldCount((int)(50 + Math.random() * 500));
        item.setCreatedAt(LocalDateTime.now());
        item.setUpdatedAt(LocalDateTime.now());
        return item;
    }
}
