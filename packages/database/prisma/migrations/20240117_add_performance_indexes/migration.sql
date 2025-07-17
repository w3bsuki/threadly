-- Add indexes for common query patterns to improve performance

-- Product queries
CREATE INDEX idx_products_seller_id ON "Product"("sellerId");
CREATE INDEX idx_products_status ON "Product"("status");
CREATE INDEX idx_products_created_at ON "Product"("createdAt" DESC);
CREATE INDEX idx_products_seller_status ON "Product"("sellerId", "status");

-- Order queries
CREATE INDEX idx_orders_buyer_id ON "Order"("buyerId");
CREATE INDEX idx_orders_seller_id ON "Order"("sellerId");
CREATE INDEX idx_orders_status ON "Order"("status");
CREATE INDEX idx_orders_created_at ON "Order"("createdAt" DESC);
CREATE INDEX idx_orders_buyer_status ON "Order"("buyerId", "status");
CREATE INDEX idx_orders_seller_status ON "Order"("sellerId", "status");

-- Follow queries
CREATE INDEX idx_follows_follower_id ON "Follow"("followerId");
CREATE INDEX idx_follows_following_id ON "Follow"("followingId");

-- Favorite queries
CREATE INDEX idx_favorites_user_id ON "Favorite"("userId");
CREATE INDEX idx_favorites_product_id ON "Favorite"("productId");

-- Review queries
CREATE INDEX idx_reviews_reviewer_id ON "Review"("reviewerId");
CREATE INDEX idx_reviews_reviewed_id ON "Review"("reviewedId");
CREATE INDEX idx_reviews_product_id ON "Review"("productId");

-- Message queries
CREATE INDEX idx_messages_conversation_id ON "Message"("conversationId");
CREATE INDEX idx_messages_sender_id ON "Message"("senderId");

-- Category queries
CREATE INDEX idx_categories_parent_id ON "Category"("parentId");
CREATE INDEX idx_categories_slug ON "Category"("slug");