import { Router } from "express";
import { db } from "../db";
import { reviews, restaurants, users } from "../../shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";

const router = Router();

function getAuthMiddleware() {
  try {
    const { isAuthenticated } = require("../replit_integrations/auth");
    return isAuthenticated;
  } catch {
    return (_req: any, res: any) => res.status(401).json({ error: "Auth not available" });
  }
}

const authMiddleware = getAuthMiddleware();

router.get("/:restaurantId", async (req, res) => {
  try {
    const restaurantId = parseInt(req.params.restaurantId);

    const restaurantReviews = await db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        comment: reviews.comment,
        createdAt: reviews.createdAt,
        userId: reviews.userId,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.restaurantId, restaurantId))
      .orderBy(desc(reviews.createdAt));

    res.json(restaurantReviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

router.post("/:restaurantId", authMiddleware, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const restaurantId = parseInt(req.params.restaurantId);
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    const [existingReview] = await db
      .select()
      .from(reviews)
      .where(and(eq(reviews.restaurantId, restaurantId), eq(reviews.userId, userId)));

    if (existingReview) {
      return res.status(400).json({ error: "You have already reviewed this restaurant" });
    }

    const [review] = await db
      .insert(reviews)
      .values({
        restaurantId,
        userId,
        rating,
        comment,
      })
      .returning();

    const avgResult = await db
      .select({
        avg: sql<string>`ROUND(AVG(${reviews.rating}), 2)`,
        count: sql<number>`COUNT(*)`,
      })
      .from(reviews)
      .where(eq(reviews.restaurantId, restaurantId));

    await db
      .update(restaurants)
      .set({
        averageRating: avgResult[0].avg || "0",
        totalReviews: Number(avgResult[0].count) || 0,
      })
      .where(eq(restaurants.id, restaurantId));

    res.status(201).json(review);
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({ error: "Failed to create review" });
  }
});

export default router;
