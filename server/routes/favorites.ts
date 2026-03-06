import { Router } from "express";
import { db } from "../db";
import { favorites, restaurants, cities } from "../../shared/schema";
import { eq, and } from "drizzle-orm";
import { isAuthenticated } from "./auth";

const router = Router();

router.get("/", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.session.userId;

    const userFavorites = await db
      .select({
        id: favorites.id,
        restaurantId: favorites.restaurantId,
        restaurantName: restaurants.name,
        restaurantSlug: restaurants.slug,
        cuisineType: restaurants.cuisineType,
        priceRange: restaurants.priceRange,
        averageRating: restaurants.averageRating,
        totalReviews: restaurants.totalReviews,
        cityName: cities.name,
        createdAt: favorites.createdAt,
      })
      .from(favorites)
      .leftJoin(restaurants, eq(favorites.restaurantId, restaurants.id))
      .leftJoin(cities, eq(restaurants.cityId, cities.id))
      .where(eq(favorites.userId, userId));

    res.json(userFavorites);
  } catch (error) {
    console.error("Error fetching favorites:", error);
    res.status(500).json({ error: "Failed to fetch favorites" });
  }
});

router.post("/:restaurantId", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.session.userId;
    const restaurantId = parseInt(req.params.restaurantId);

    const [existing] = await db
      .select()
      .from(favorites)
      .where(
        and(eq(favorites.userId, userId), eq(favorites.restaurantId, restaurantId))
      );

    if (existing) {
      await db.delete(favorites).where(eq(favorites.id, existing.id));
      return res.json({ favorited: false });
    }

    await db.insert(favorites).values({ userId, restaurantId });
    res.json({ favorited: true });
  } catch (error) {
    console.error("Error toggling favorite:", error);
    res.status(500).json({ error: "Failed to toggle favorite" });
  }
});

router.get("/check/:restaurantId", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.session.userId;
    const restaurantId = parseInt(req.params.restaurantId);

    const [existing] = await db
      .select()
      .from(favorites)
      .where(
        and(eq(favorites.userId, userId), eq(favorites.restaurantId, restaurantId))
      );

    res.json({ favorited: !!existing });
  } catch (error) {
    res.json({ favorited: false });
  }
});

export default router;
