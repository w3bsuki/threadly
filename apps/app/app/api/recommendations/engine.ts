import { database } from '@repo/database';
import type { RecommendationType } from '@repo/database';

interface RecommendationRequest {
  userId: string;
  type: RecommendationType;
  productId?: string | null;
  limit: number;
}

export async function getRecommendations({
  userId,
  type,
  productId,
  limit = 10,
}: RecommendationRequest) {
  switch (type) {
    case 'PERSONALIZED':
      return getPersonalizedRecommendations(userId, limit);
    
    case 'TRENDING':
      return getTrendingProducts(limit);
    
    case 'SIMILAR_ITEMS':
      if (!productId) throw new Error('Product ID required for similar items');
      return getSimilarProducts(productId, limit);
    
    case 'FREQUENTLY_BOUGHT_TOGETHER':
      if (!productId) throw new Error('Product ID required for frequently bought together');
      return getFrequentlyBoughtTogether(productId, limit);
    
    case 'BASED_ON_HISTORY':
      return getHistoryBasedRecommendations(userId, limit);
    
    case 'NEW_FOR_YOU':
      return getNewForYou(userId, limit);
    
    default:
      return getPersonalizedRecommendations(userId, limit);
  }
}

async function getPersonalizedRecommendations(userId: string, limit: number) {
  // Get user interactions
  const interactions = await database.userInteraction.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      product: {
        include: {
          category: true,
        },
      },
    },
  });

  // Extract preferences
  const categoryScores = new Map<string, number>();
  const brandScores = new Map<string, number>();
  const priceRanges: number[] = [];

  interactions.forEach((interaction) => {
    const { product } = interaction;
    const score = interaction.score * getInteractionWeight(interaction.type);

    // Category preferences
    const currentCategoryScore = categoryScores.get(product.categoryId) || 0;
    categoryScores.set(product.categoryId, currentCategoryScore + score);

    // Brand preferences
    if (product.brand) {
      const currentBrandScore = brandScores.get(product.brand) || 0;
      brandScores.set(product.brand, currentBrandScore + score);
    }

    // Price range
    priceRanges.push(Number(product.price));
  });

  // Calculate price range
  const avgPrice = priceRanges.reduce((a, b) => a + b, 0) / priceRanges.length || 100;
  const priceMin = avgPrice * 0.5;
  const priceMax = avgPrice * 1.5;

  // Get top categories and brands
  const topCategories = Array.from(categoryScores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id]) => id);

  const topBrands = Array.from(brandScores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([brand]) => brand);

  // Find recommended products
  const products = await database.product.findMany({
    where: {
      AND: [
        { status: 'AVAILABLE' },
        { sellerId: { not: userId } },
        {
          OR: [
            { categoryId: { in: topCategories } },
            { brand: { in: topBrands } },
          ],
        },
        {
          price: {
            gte: priceMin,
            lte: priceMax,
          },
        },
      ],
    },
    include: {
      images: { take: 1 },
      seller: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          averageRating: true,
        },
      },
      analytics: true,
    },
    orderBy: [
      { views: 'desc' },
      { createdAt: 'desc' },
    ],
    take: limit * 2,
  });

  // Score and sort products
  const scoredProducts = products.map((product) => {
    let score = 0;

    // Category match
    if (topCategories.includes(product.categoryId)) {
      score += categoryScores.get(product.categoryId) || 0;
    }

    // Brand match
    if (product.brand && topBrands.includes(product.brand)) {
      score += brandScores.get(product.brand) || 0;
    }

    // Popularity boost
    score += Math.log(product.views + 1) * 0.1;

    // Seller rating boost
    if (product.seller.averageRating) {
      score += product.seller.averageRating * 0.2;
    }

    return { product, score };
  });

  return scoredProducts
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ product, score }) => ({
      productId: product.id,
      score,
      reason: 'Based on your interests',
    }));
}

async function getTrendingProducts(limit: number) {
  const products = await database.product.findMany({
    where: {
      status: 'AVAILABLE',
      createdAt: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
      },
    },
    include: {
      analytics: true,
    },
    orderBy: [
      { views: 'desc' },
    ],
    take: limit,
  });

  return products.map((product, index) => ({
    productId: product.id,
    score: 1 - index * 0.1,
    reason: 'Trending this week',
  }));
}

async function getSimilarProducts(productId: string, limit: number) {
  // Get the reference product
  const product = await database.product.findUnique({
    where: { id: productId },
    include: { category: true },
  });

  if (!product) return [];

  // Find similar products
  const similar = await database.product.findMany({
    where: {
      AND: [
        { id: { not: productId } },
        { status: 'AVAILABLE' },
        {
          OR: [
            { categoryId: product.categoryId },
            { brand: product.brand },
            {
              price: {
                gte: Number(product.price) * 0.7,
                lte: Number(product.price) * 1.3,
              },
            },
          ],
        },
      ],
    },
    orderBy: { views: 'desc' },
    take: limit,
  });

  return similar.map((p, index) => ({
    productId: p.id,
    score: 1 - index * 0.1,
    reason: 'Similar to items you viewed',
  }));
}

async function getFrequentlyBoughtTogether(productId: string, limit: number) {
  // Find orders that include this product
  const orders = await database.order.findMany({
    where: { productId },
    select: { buyerId: true },
  });

  const buyerIds = orders.map(o => o.buyerId);

  // Find other products bought by these buyers
  const otherOrders = await database.order.findMany({
    where: {
      buyerId: { in: buyerIds },
      productId: { not: productId },
    },
    select: { productId: true },
  });

  // Count frequency
  const productCounts = new Map<string, number>();
  otherOrders.forEach(({ productId }) => {
    productCounts.set(productId, (productCounts.get(productId) || 0) + 1);
  });

  // Sort by frequency
  const sortedProducts = Array.from(productCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);

  return sortedProducts.map(([productId, count], index) => ({
    productId,
    score: count / buyerIds.length,
    reason: 'Frequently bought together',
  }));
}

async function getHistoryBasedRecommendations(userId: string, limit: number) {
  // Get user's purchase history
  const orders = await database.order.findMany({
    where: { buyerId: userId },
    include: {
      Product: {
        include: { category: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  if (orders.length === 0) {
    return getPersonalizedRecommendations(userId, limit);
  }

  // Extract patterns
  const categories = new Set(orders.map(o => o.Product.categoryId));
  const brands = new Set(orders.map(o => o.Product.brand).filter(Boolean));

  // Find similar products
  const products = await database.product.findMany({
    where: {
      AND: [
        { status: 'AVAILABLE' },
        { sellerId: { not: userId } },
        {
          OR: [
            { categoryId: { in: Array.from(categories) } },
            { brand: { in: Array.from(brands) as string[] } },
          ],
        },
      ],
    },
    orderBy: [
      { createdAt: 'desc' },
      { views: 'desc' },
    ],
    take: limit,
  });

  return products.map((product, index) => ({
    productId: product.id,
    score: 1 - index * 0.1,
    reason: 'Based on your purchase history',
  }));
}

async function getNewForYou(userId: string, limit: number) {
  // Get user preferences
  const interactions = await database.userInteraction.findMany({
    where: { userId },
    select: { productId: true },
  });

  const viewedProductIds = new Set(interactions.map(i => i.productId));

  // Find new products user hasn't seen
  const products = await database.product.findMany({
    where: {
      AND: [
        { status: 'AVAILABLE' },
        { id: { notIn: Array.from(viewedProductIds) } },
        { 
          createdAt: { 
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          } 
        },
      ],
    },
    orderBy: [
      { views: 'desc' },
      { createdAt: 'desc' },
    ],
    take: limit,
  });

  return products.map((product, index) => ({
    productId: product.id,
    score: 1 - index * 0.1,
    reason: 'New arrivals you might like',
  }));
}

function getInteractionWeight(type: string): number {
  const weights: Record<string, number> = {
    PURCHASE: 5.0,
    CART_ADD: 3.0,
    FAVORITE: 2.5,
    REVIEW: 2.0,
    SHARE: 1.5,
    VIEW: 1.0,
    SEARCH_CLICK: 0.8,
  };
  return weights[type] || 1.0;
}