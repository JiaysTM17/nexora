ALTER TABLE "InventoryBalance" ADD CONSTRAINT "inventory_nonnegative" CHECK ("onHand" >= 0 AND "reserved" >= 0 AND "reserved" <= "onHand");
ALTER TABLE "Variant" ADD CONSTRAINT "variant_price_nonnegative" CHECK ("price" >= 0);
ALTER TABLE "CartLine" ADD CONSTRAINT "cart_quantity_positive" CHECK ("quantity" BETWEEN 1 AND 20);
ALTER TABLE "OrderItem" ADD CONSTRAINT "item_amount_valid" CHECK ("quantity" > 0 AND "unitPrice" >= 0 AND "discount" >= 0 AND "discount" <= "quantity" * "unitPrice");
ALTER TABLE "Voucher" ADD CONSTRAINT "voucher_limits_valid" CHECK ("uses" >= 0 AND "uses" <= "maxUses" AND "amount" >= 0 AND "minimum" >= 0);
ALTER TABLE "ShopOrder" ADD CONSTRAINT "shop_order_totals" CHECK ("subtotal" >= 0 AND "discount" BETWEEN 0 AND "subtotal" AND "shipping" >= 0 AND "total" = "subtotal" - "discount" + "shipping");
ALTER TABLE "Shop" ADD CONSTRAINT "shop_fee_range" CHECK ("feeBps" BETWEEN 0 AND 10000);
ALTER TABLE "Review" ADD CONSTRAINT "review_rating_range" CHECK ("rating" BETWEEN 1 AND 5);
ALTER TABLE "ProductTag" ADD CONSTRAINT "tag_position_range" CHECK ("x" BETWEEN 0 AND 1 AND "y" BETWEEN 0 AND 1 AND "mediaPosition" >= 0);
ALTER TABLE "Follow" ADD CONSTRAINT "follow_not_self" CHECK ("followerId" <> "followedId");
ALTER TABLE "Follow" ADD CONSTRAINT "follow_follower_fk" FOREIGN KEY ("followerId") REFERENCES "User"("id");
ALTER TABLE "Follow" ADD CONSTRAINT "follow_followed_fk" FOREIGN KEY ("followedId") REFERENCES "User"("id");
-- Defense in depth: a variant cannot claim a different shop than its product.
ALTER TABLE "Product" ADD CONSTRAINT "product_shop_pair" UNIQUE ("id", "shopId");
ALTER TABLE "Variant" ADD CONSTRAINT "variant_product_shop_fk" FOREIGN KEY ("productId", "shopId") REFERENCES "Product"("id", "shopId");
