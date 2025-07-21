-- Performance optimization indexes for Phase 5

-- Composite indexes for Order table (dashboard and analytics queries)
CREATE INDEX CONCURRENTLY "idx_orders_seller_status_created_amount" ON "Order"("sellerId", "status", "createdAt", "amount");
CREATE INDEX CONCURRENTLY "idx_orders_buyer_status_created_amount" ON "Order"("buyerId", "status", "createdAt", "amount");

-- Financial transaction indexes for aggregations
CREATE INDEX CONCURRENTLY "idx_financial_transactions_user_type_created" ON "FinancialTransaction"("userId", "type", "createdAt");
CREATE INDEX CONCURRENTLY "idx_financial_transactions_user_created_amount" ON "FinancialTransaction"("userId", "createdAt", "amount");

-- Product analytics and search indexes
CREATE INDEX CONCURRENTLY "idx_products_seller_created_views" ON "Product"("sellerId", "createdAt", "views");
CREATE INDEX CONCURRENTLY "idx_products_category_status_created" ON "Product"("categoryId", "status", "createdAt");

-- Full-text search index for products
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX CONCURRENTLY "idx_products_title_trgm" ON "Product" USING gin ("title" gin_trgm_ops);
CREATE INDEX CONCURRENTLY "idx_products_description_trgm" ON "Product" USING gin ("description" gin_trgm_ops);
CREATE INDEX CONCURRENTLY "idx_products_brand_trgm" ON "Product" USING gin ("brand" gin_trgm_ops);

-- User activity indexes
CREATE INDEX CONCURRENTLY "idx_user_interactions_user_type_created" ON "UserInteraction"("userId", "type", "createdAt");
CREATE INDEX CONCURRENTLY "idx_user_interactions_product_type" ON "UserInteraction"("productId", "type");

-- Review aggregation indexes
CREATE INDEX CONCURRENTLY "idx_reviews_product_rating" ON "Review"("productId", "rating");
CREATE INDEX CONCURRENTLY "idx_reviews_seller_rating_created" ON "Review"("sellerId", "rating", "createdAt");

-- Message and conversation performance
CREATE INDEX CONCURRENTLY "idx_messages_conversation_created" ON "Message"("conversationId", "createdAt");

-- Notification performance
CREATE INDEX CONCURRENTLY "idx_notifications_user_read_created" ON "Notification"("userId", "read", "createdAt");

-- Analytics specific indexes
CREATE INDEX CONCURRENTLY "idx_product_analytics_views_sales" ON "ProductAnalytics"("totalViews", "salesCount");
CREATE INDEX CONCURRENTLY "idx_product_analytics_updated" ON "ProductAnalytics"("updatedAt");

-- Favorite count optimization
CREATE INDEX CONCURRENTLY "idx_favorites_product_created" ON "Favorite"("productId", "createdAt");

-- Category hierarchy optimization
CREATE INDEX CONCURRENTLY "idx_categories_parent_name" ON "Category"("parentId", "name");