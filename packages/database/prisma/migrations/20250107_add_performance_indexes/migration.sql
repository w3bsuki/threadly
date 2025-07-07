-- Add missing indexes for improved query performance

-- Products table indexes
CREATE INDEX IF NOT EXISTS "idx_products_seller_status" ON "Product"("sellerId", "status");
CREATE INDEX IF NOT EXISTS "idx_products_status_updated" ON "Product"("status", "updatedAt");

-- Orders table indexes  
CREATE INDEX IF NOT EXISTS "idx_orders_buyer_status" ON "Order"("buyerId", "status");
CREATE INDEX IF NOT EXISTS "idx_orders_seller_status" ON "Order"("sellerId", "status");
CREATE INDEX IF NOT EXISTS "idx_orders_buyer_created" ON "Order"("buyerId", "createdAt");

-- Messages table indexes
CREATE INDEX IF NOT EXISTS "idx_messages_conversation_created" ON "Message"("conversationId", "createdAt");

-- Payments table index (for idempotency checks)
CREATE INDEX IF NOT EXISTS "idx_payments_stripe_id" ON "Payment"("stripePaymentId");

-- Full text search indexes for products
CREATE INDEX IF NOT EXISTS "idx_products_search" ON "Product" USING gin(to_tsvector('english', "title" || ' ' || "description" || ' ' || COALESCE("brand", '')));