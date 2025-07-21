-- Database Integrity Migration Script
-- Adds CHECK constraints for data validation
-- Run after Prisma schema changes are applied

BEGIN;

-- Add CHECK constraints for positive prices
ALTER TABLE "Product" 
ADD CONSTRAINT "Product_price_positive" 
CHECK (price > 0);

ALTER TABLE "Order" 
ADD CONSTRAINT "Order_amount_positive" 
CHECK (amount > 0);

ALTER TABLE "Payment" 
ADD CONSTRAINT "Payment_amount_positive" 
CHECK (amount > 0);

-- Add CHECK constraint for valid ratings (1-5 stars)
ALTER TABLE "Review" 
ADD CONSTRAINT "Review_rating_valid" 
CHECK (rating >= 1 AND rating <= 5);

-- Add CHECK constraint for positive view counts
ALTER TABLE "Product" 
ADD CONSTRAINT "Product_views_positive" 
CHECK (views >= 0);

-- Add CHECK constraint for positive sales/purchase counts
ALTER TABLE "User" 
ADD CONSTRAINT "User_totalSales_positive" 
CHECK ("totalSales" >= 0);

ALTER TABLE "User" 
ADD CONSTRAINT "User_totalPurchases_positive" 
CHECK ("totalPurchases" >= 0);

-- Add CHECK constraint for valid average rating (0.0-5.0)
ALTER TABLE "User" 
ADD CONSTRAINT "User_averageRating_valid" 
CHECK ("averageRating" IS NULL OR ("averageRating" >= 0.0 AND "averageRating" <= 5.0));

-- Add CHECK constraint for positive result counts
ALTER TABLE "SearchHistory" 
ADD CONSTRAINT "SearchHistory_resultCount_positive" 
CHECK ("resultCount" >= 0);

-- Add CHECK constraint for valid display order (non-negative)
ALTER TABLE "ProductImage" 
ADD CONSTRAINT "ProductImage_displayOrder_valid" 
CHECK ("displayOrder" >= 0);

COMMIT;