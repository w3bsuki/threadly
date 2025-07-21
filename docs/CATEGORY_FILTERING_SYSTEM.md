# Automatic Category & Filtering System

## Overview

Threadly's category and filtering system works automatically without any manual intervention. Once a seller assigns a category to a product, it's instantly filterable and searchable in the marketplace.

## Database Schema

### Category Structure
```prisma
model Category {
  id       String  @id @default(cuid())
  name     String  @unique  // "Women's Clothing"
  slug     String  @unique  // "womens-clothing"
  parentId String?          // For subcategories
  imageUrl String?          // Category banner image
  
  // Relations
  parent   Category?  @relation("CategoryHierarchy")
  children Category[] @relation("CategoryHierarchy")
  products Product[]
}
```

### Product-Category Link
```prisma
model Product {
  id         String @id
  categoryId String           // Links to Category
  category   Category         // Automatic join
  // ... other fields
}
```

## How Categories Work

### 1. Category Hierarchy
```
Fashion
├── Women's
│   ├── Dresses
│   ├── Tops & Blouses
│   ├── Bottoms
│   └── Outerwear
├── Men's
│   ├── Shirts
│   ├── Pants
│   ├── Jackets
│   └── Suits
└── Accessories
    ├── Bags
    ├── Shoes
    └── Jewelry
```

### 2. Product Assignment
When a seller creates a product:
```typescript
// User selects from dropdown
<CategorySelector
  value={field.value}           // categoryId
  onValueChange={field.onChange} // Updates form
/>

// Saved to database
product.categoryId = "clh123..."  // Women's Dresses ID
```

### 3. Automatic Filtering

#### In Web App (Server-Side)
```typescript
// /apps/web/app/[locale]/products/components/products-content.tsx

// User clicks "Women's Clothing"
if (searchParams.category) {
  where.category = {
    OR: [
      { name: { contains: searchParams.category, mode: 'insensitive' } },
      { slug: { contains: searchParams.category, mode: 'insensitive' } }
    ]
  };
}

// Database query automatically filters
const products = await database.product.findMany({
  where,  // Includes category filter
  include: { category: true }
});
```

#### Via API
```typescript
// /apps/web/app/api/products/route.ts

// GET /api/products?category=Women
if (params.category) {
  where.OR = [
    { category: { name: { equals: params.category } } },
    { category: { parent: { name: { equals: params.category } } } }
  ];
}
```

## Filtering Features

### 1. Category Filtering
```typescript
// Single category
?category=Dresses

// Parent category (shows all children)
?category=Women  // Shows all women's products

// Database handles automatically:
WHERE category.name ILIKE '%Women%'
   OR category.parent.name ILIKE '%Women%'
```

### 2. Price Range Filtering
```typescript
// URL params
?minPrice=10&maxPrice=100

// Automatic query
where.price = {
  gte: 10,  // Greater than or equal
  lte: 100  // Less than or equal
}
```

### 3. Condition Filtering
```typescript
// URL param
?condition=VERY_GOOD

// Automatic query
where.condition = 'VERY_GOOD'

// Available conditions:
- NEW_WITH_TAGS
- NEW_WITHOUT_TAGS
- VERY_GOOD
- GOOD
- SATISFACTORY
```

### 4. Combined Filters
```typescript
// User selects multiple filters
?category=Women&minPrice=20&maxPrice=100&condition=NEW_WITH_TAGS

// Builds complex query automatically:
{
  AND: [
    { status: 'AVAILABLE' },
    { category: { name: { contains: 'Women' } } },
    { price: { gte: 20, lte: 100 } },
    { condition: 'NEW_WITH_TAGS' }
  ]
}
```

## Search Functionality

### Text Search
```typescript
// Search across multiple fields
if (searchParams.search) {
  where.OR = [
    { title: { contains: search, mode: 'insensitive' } },
    { brand: { contains: search, mode: 'insensitive' } },
    { description: { contains: search, mode: 'insensitive' } },
    { category: { name: { contains: search, mode: 'insensitive' } } }
  ];
}
```

### Sorting Options
```typescript
// User selects sort option
switch (sortBy) {
  case 'price-low':
    orderBy = { price: 'asc' };
    break;
  case 'price-high':
    orderBy = { price: 'desc' };
    break;
  case 'popular':
    orderBy = [
      { favorites: { _count: 'desc' } },
      { views: 'desc' }
    ];
    break;
  case 'newest':
  default:
    orderBy = { createdAt: 'desc' };
}
```

## UI Components

### Desktop Filters (Sidebar)
```typescript
<CollapsibleFilters 
  categories={categories}      // From database
  currentFilters={searchParams} // Active filters
  dictionary={dictionary}       // i18n
/>
```

### Mobile Filters (Sheet)
```typescript
<ProductFiltersMobile 
  categories={categories}
  currentFilters={searchParams}
  dictionary={dictionary}
/>
```

### Quick Filters (Pills)
```typescript
<QuickFilters 
  activeFilters={{
    category: "Women",
    condition: "NEW_WITH_TAGS",
    priceRange: "$20-$100"
  }}
/>
```

## Performance Optimizations

### 1. Database Indexes
```prisma
@@index([categoryId])        // Fast category lookups
@@index([status])           // Fast AVAILABLE filtering
@@index([createdAt])        // Fast sorting
@@index([price])            // Fast price filtering
@@index([status, categoryId, createdAt]) // Combined
```

### 2. Efficient Queries
```typescript
// Include only needed relations
include: {
  category: {
    select: { id: true, name: true, slug: true }
  },
  images: {
    take: 1,  // Only first image for grid
    orderBy: { displayOrder: 'asc' }
  }
}
```

### 3. Pagination
```typescript
const ITEMS_PER_PAGE = 12;
const skip = (page - 1) * ITEMS_PER_PAGE;

const products = await database.product.findMany({
  skip,
  take: ITEMS_PER_PAGE
});
```

## Why This System Works

### 1. **No Manual Categorization**
- Seller picks category once
- System handles all filtering automatically
- No admin intervention needed

### 2. **Flexible Filtering**
- Multiple filters can combine
- Case-insensitive matching
- Partial text search

### 3. **Real-time Updates**
- New products appear instantly
- Filter changes reflect immediately
- No cache invalidation needed

### 4. **Scalable**
- Database indexes optimize queries
- Pagination prevents overload
- Efficient relation loading

## Example User Flow

1. **Seller Lists a Dress**
   - Selects: Women's → Dresses
   - Sets: Price $50, Condition: NEW_WITH_TAGS
   - Submits form

2. **Product Saves**
   ```json
   {
     "categoryId": "clh123...",
     "price": 50,
     "condition": "NEW_WITH_TAGS",
     "status": "AVAILABLE"
   }
   ```

3. **Buyer Browses**
   - Clicks: Women's Clothing
   - Sets: Price $0-$100
   - Sets: Condition: New with tags
   
4. **System Queries**
   ```sql
   SELECT * FROM products
   WHERE status = 'AVAILABLE'
   AND category_id IN (women_categories)
   AND price BETWEEN 0 AND 100
   AND condition = 'NEW_WITH_TAGS'
   ```

5. **Dress Appears!**
   - No delay
   - No manual approval
   - Automatic categorization

This automatic system makes Threadly a true self-service C2C marketplace!