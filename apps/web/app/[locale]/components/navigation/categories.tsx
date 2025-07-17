export const CATEGORIES = [
  { 
    name: "Women", 
    href: "/women", 
    icon: "👗",
    subcategories: [
      { name: "Dresses", href: "/women/dresses", icon: "👗", popular: true },
      { name: "Tops", href: "/women/tops", icon: "👚", popular: true },
      { name: "Bottoms", href: "/women/bottoms", icon: "👖", popular: true },
      { name: "Jackets", href: "/women/jackets", icon: "🧥" },
      { name: "Shoes", href: "/women/shoes", icon: "👠", popular: true },
      { name: "Bags", href: "/women/bags", icon: "👜" },
      { name: "Swimwear", href: "/women/swimwear", icon: "👙" },
      { name: "Lingerie", href: "/women/lingerie", icon: "👙" },
      { name: "Accessories", href: "/women/accessories", icon: "💍" },
      { name: "Activewear", href: "/women/activewear", icon: "🏃‍♀️" },
    ]
  },
  { 
    name: "Men", 
    href: "/men", 
    icon: "👔",
    subcategories: [
      { name: "Shirts", href: "/men/shirts", icon: "👔", popular: true },
      { name: "T-shirts", href: "/men/tshirts", icon: "👕", popular: true },
      { name: "Pants", href: "/men/pants", icon: "👖", popular: true },
      { name: "Jackets", href: "/men/jackets", icon: "🧥" },
      { name: "Shoes", href: "/men/shoes", icon: "👟", popular: true },
      { name: "Accessories", href: "/men/accessories", icon: "⌚" },
      { name: "Suits", href: "/men/suits", icon: "🤵" },
      { name: "Shorts", href: "/men/shorts", icon: "🩳" },
      { name: "Activewear", href: "/men/activewear", icon: "🏃‍♂️" },
      { name: "Underwear", href: "/men/underwear", icon: "🩲" },
    ]
  },
  { 
    name: "Kids", 
    href: "/kids", 
    icon: "👶",
    subcategories: [
      { name: "Boys", href: "/kids/boys", icon: "👦", popular: true },
      { name: "Girls", href: "/kids/girls", icon: "👧", popular: true },
      { name: "Baby", href: "/kids/baby", icon: "👶", popular: true },
      { name: "Shoes", href: "/kids/shoes", icon: "👟" },
      { name: "Toys", href: "/kids/toys", icon: "🧸" },
      { name: "School", href: "/kids/school", icon: "🎒" },
    ]
  },
  { 
    name: "Unisex", 
    href: "/unisex", 
    icon: "👕",
    subcategories: [
      { name: "T-shirts", href: "/unisex/tshirts", icon: "👕" },
      { name: "Hoodies", href: "/unisex/hoodies", icon: "🧥" },
      { name: "Accessories", href: "/unisex/accessories", icon: "👓" },
      { name: "Bags", href: "/unisex/bags", icon: "🎒" },
    ]
  },
  { 
    name: "Designer", 
    href: "/designer", 
    icon: "👑",
    subcategories: [
      { name: "Luxury", href: "/designer/luxury", icon: "💎" },
      { name: "Streetwear", href: "/designer/streetwear", icon: "🧢" },
      { name: "Handbags", href: "/designer/handbags", icon: "👜" },
      { name: "Shoes", href: "/designer/shoes", icon: "👠" },
    ]
  },
  { 
    name: "Vintage", 
    href: "/vintage", 
    icon: "📿",
    subcategories: [
      { name: "80s", href: "/vintage/80s", icon: "🕺" },
      { name: "90s", href: "/vintage/90s", icon: "📼" },
      { name: "Y2K", href: "/vintage/y2k", icon: "💿" },
      { name: "Retro", href: "/vintage/retro", icon: "🎭" },
    ]
  },
] as const;

export type Category = typeof CATEGORIES[number];
export type CategoryName = Category['name'];
export type SubCategory = Category['subcategories'][number];