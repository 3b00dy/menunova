import type { MenuView } from "@/features/menu/domain/menu-view";

/**
 * Mock menu the public page (and the theme-builder preview) render until the
 * backend ships. Exercises every optional item field so the design and the
 * "omit empty fields cleanly" behavior are verifiable.
 */

const img = (id: string) => `https://images.unsplash.com/${id}?w=400&h=300&fit=crop`;

export const MOCK_MENU_VIEW: MenuView = {
  restaurant: {
    name: "The Corner Table",
    tagline: "Modern fusion cuisine",
    hoursOpen: "11:00 AM",
    hoursClose: "11:00 PM",
    phone: "+1 (555) 018-2245",
    address: "24 Riverside Ave, Portland",
    socials: [
      { type: "instagram", label: "Instagram", href: "#" },
      { type: "tiktok", label: "TikTok", href: "#" },
      { type: "facebook", label: "Facebook", href: "#" },
    ],
  },
  categories: [
    { id: "starters", name: "Starters", imageUrl: img("photo-1541014741259-de529411b96a") },
    { id: "mains", name: "Mains", imageUrl: img("photo-1568901346375-23c9450c58cd") },
    { id: "drinks", name: "Drinks", imageUrl: img("photo-1544145945-f90425340c7e") },
    { id: "desserts", name: "Desserts", imageUrl: img("photo-1551024601-bec78aea704b") },
  ],
  items: [
    // Starters
    {
      id: "truffle-fries",
      categoryId: "starters",
      name: "Truffle Fries",
      price: "$9.00",
      description: "Hand-cut fries, truffle oil, parmesan, chives.",
      imageUrl: img("photo-1573080496219-bb080dd4f877"),
      calories: 480,
      prepMinutes: 10,
      addons: [
        { name: "Extra truffle", price: "+$3.00" },
        { name: "Parmesan", price: "+$1.50" },
      ],
    },
    {
      id: "bruschetta",
      categoryId: "starters",
      name: "Tomato Bruschetta",
      price: "$8.00",
      discountedPrice: "$6.00",
      description: "Toasted sourdough, heirloom tomato, basil, olive oil.",
      imageUrl: img("photo-1572695157366-5e585ab2b69f"),
      calories: 220,
      promoted: true,
    },
    {
      id: "soup",
      categoryId: "starters",
      name: "Soup of the Day",
      price: "$7.00",
      description: "Ask your server — always seasonal.",
      prepMinutes: 5,
      available: false,
    },
    // Mains
    {
      id: "smash-burger",
      categoryId: "mains",
      name: "Smash Burger",
      price: "$14.00",
      description: "Double beef, aged cheddar, house sauce, brioche.",
      imageUrl: img("photo-1568901346375-23c9450c58cd"),
      calories: 780,
      prepMinutes: 15,
      addons: [
        { name: "Bacon", price: "+$2.00" },
        { name: "Extra patty", price: "+$4.00" },
      ],
    },
    {
      id: "salmon",
      categoryId: "mains",
      name: "Grilled Salmon",
      price: "$22.00",
      discountedPrice: "$18.00",
      description: "Atlantic salmon, lemon butter, seasonal greens.",
      imageUrl: img("photo-1467003909585-2f8a72700288"),
      calories: 520,
      prepMinutes: 20,
      promoted: true,
    },
    {
      id: "pizza",
      categoryId: "mains",
      name: "Margherita Pizza",
      price: "$13.00",
      description: "San Marzano, fior di latte, fresh basil.",
      imageUrl: img("photo-1513104890138-7c749659a591"),
      calories: 690,
      prepMinutes: 18,
    },
    // Drinks
    {
      id: "lemonade",
      categoryId: "drinks",
      name: "Fresh Lemonade",
      price: "$5.00",
      description: "Hand-pressed lemons, mint, a touch of honey.",
      imageUrl: img("photo-1621263764928-df1444c5e859"),
      calories: 120,
    },
    {
      id: "latte",
      categoryId: "drinks",
      name: "Iced Latte",
      price: "$4.50",
      description: "Double shot, oat or whole milk.",
      prepMinutes: 4,
    },
    { id: "sparkling", categoryId: "drinks", name: "Sparkling Water", price: "$3.00" },
    // Desserts
    {
      id: "tiramisu",
      categoryId: "desserts",
      name: "Tiramisu",
      price: "$8.00",
      description: "Espresso-soaked ladyfingers, mascarpone, cocoa.",
      imageUrl: img("photo-1571877227200-a0d98ea607e9"),
      calories: 430,
    },
    {
      id: "cheesecake",
      categoryId: "desserts",
      name: "Baked Cheesecake",
      price: "$7.00",
      discountedPrice: "$5.50",
      imageUrl: img("photo-1524351199678-941a58a3df50"),
      prepMinutes: 3,
      promoted: true,
    },
    {
      id: "fruit-bowl",
      categoryId: "desserts",
      name: "Seasonal Fruit Bowl",
      price: "$6.00",
      description: "Whatever's ripe and good this week.",
      imageUrl: img("photo-1490474418585-ba9bad8fd0ea"),
      calories: 150,
      available: true,
    },
  ],
};
