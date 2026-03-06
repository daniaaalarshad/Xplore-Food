import { Router } from "express";
import { db } from "../db";
import {
  restaurants,
  menuCategories,
  menuItems,
  restaurantPhotos,
  cities,
} from "../../shared/schema";
import { eq, and, sql, asc } from "drizzle-orm";

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

router.get("/restaurants", authMiddleware, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const myRestaurants = await db
      .select({
        id: restaurants.id,
        name: restaurants.name,
        slug: restaurants.slug,
        description: restaurants.description,
        address: restaurants.address,
        cityId: restaurants.cityId,
        cityName: cities.name,
        cuisineType: restaurants.cuisineType,
        priceRange: restaurants.priceRange,
        averageRating: restaurants.averageRating,
        totalReviews: restaurants.totalReviews,
        isVerified: restaurants.isVerified,
        createdAt: restaurants.createdAt,
      })
      .from(restaurants)
      .leftJoin(cities, eq(restaurants.cityId, cities.id))
      .where(eq(restaurants.ownerId, userId));

    const photosForRestaurants =
      myRestaurants.length > 0
        ? await db
            .select()
            .from(restaurantPhotos)
            .where(
              sql`${restaurantPhotos.restaurantId} IN (${sql.join(
                myRestaurants.map((r) => sql`${r.id}`),
                sql`, `
              )})`
            )
        : [];

    const restaurantsWithPhotos = myRestaurants.map((r) => ({
      ...r,
      photos: photosForRestaurants.filter((p) => p.restaurantId === r.id),
    }));

    res.json(restaurantsWithPhotos);
  } catch (error) {
    console.error("Error fetching dashboard restaurants:", error);
    res.status(500).json({ error: "Failed to fetch restaurants" });
  }
});

router.post("/restaurants", authMiddleware, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const {
      name,
      description,
      address,
      cityId,
      phone,
      email,
      website,
      cuisineType,
      priceRange,
      dietaryOptions,
      operatingHours,
      latitude,
      longitude,
    } = req.body;

    if (!name || !address || !cityId || !cuisineType) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const slug =
      name
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "") +
      "-" +
      Date.now().toString(36);

    const [newRestaurant] = await db
      .insert(restaurants)
      .values({
        name,
        slug,
        description,
        address,
        cityId: parseInt(cityId),
        phone,
        email,
        website,
        cuisineType,
        priceRange: parseInt(priceRange) || 2,
        dietaryOptions: dietaryOptions || [],
        operatingHours: operatingHours || null,
        latitude,
        longitude,
        ownerId: userId,
      })
      .returning();

    res.status(201).json(newRestaurant);
  } catch (error) {
    console.error("Error creating restaurant:", error);
    res.status(500).json({ error: "Failed to create restaurant" });
  }
});

router.put("/restaurants/:id", authMiddleware, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const id = parseInt(req.params.id);

    const [existing] = await db
      .select()
      .from(restaurants)
      .where(eq(restaurants.id, id));

    if (!existing) return res.status(404).json({ error: "Restaurant not found" });
    if (existing.ownerId !== userId) return res.status(403).json({ error: "Forbidden" });

    const {
      name,
      description,
      address,
      cityId,
      phone,
      email,
      website,
      cuisineType,
      priceRange,
      dietaryOptions,
      operatingHours,
      latitude,
      longitude,
    } = req.body;

    const [updated] = await db
      .update(restaurants)
      .set({
        name,
        description,
        address,
        cityId: cityId ? parseInt(cityId) : existing.cityId,
        phone,
        email,
        website,
        cuisineType,
        priceRange: priceRange ? parseInt(priceRange) : existing.priceRange,
        dietaryOptions,
        operatingHours,
        latitude,
        longitude,
        updatedAt: new Date(),
      })
      .where(eq(restaurants.id, id))
      .returning();

    res.json(updated);
  } catch (error) {
    console.error("Error updating restaurant:", error);
    res.status(500).json({ error: "Failed to update restaurant" });
  }
});

router.delete("/restaurants/:id", authMiddleware, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const id = parseInt(req.params.id);

    const [existing] = await db
      .select()
      .from(restaurants)
      .where(eq(restaurants.id, id));

    if (!existing) return res.status(404).json({ error: "Restaurant not found" });
    if (existing.ownerId !== userId) return res.status(403).json({ error: "Forbidden" });

    await db.delete(restaurants).where(eq(restaurants.id, id));
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting restaurant:", error);
    res.status(500).json({ error: "Failed to delete restaurant" });
  }
});

router.get("/restaurants/:id/menu", authMiddleware, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const id = parseInt(req.params.id);

    const [existing] = await db
      .select()
      .from(restaurants)
      .where(eq(restaurants.id, id));

    if (!existing) return res.status(404).json({ error: "Restaurant not found" });
    if (existing.ownerId !== userId) return res.status(403).json({ error: "Forbidden" });

    const categories = await db
      .select()
      .from(menuCategories)
      .where(eq(menuCategories.restaurantId, id))
      .orderBy(asc(menuCategories.sortOrder));

    const categoryIds = categories.map((c) => c.id);
    let items: any[] = [];
    if (categoryIds.length > 0) {
      items = await db
        .select()
        .from(menuItems)
        .where(
          sql`${menuItems.categoryId} IN (${sql.join(
            categoryIds.map((cid) => sql`${cid}`),
            sql`, `
          )})`
        );
    }

    const menu = categories.map((cat) => ({
      ...cat,
      items: items.filter((item) => item.categoryId === cat.id),
    }));

    res.json(menu);
  } catch (error) {
    console.error("Error fetching menu:", error);
    res.status(500).json({ error: "Failed to fetch menu" });
  }
});

router.post("/restaurants/:id/menu-categories", authMiddleware, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const restaurantId = parseInt(req.params.id);

    const [existing] = await db
      .select()
      .from(restaurants)
      .where(eq(restaurants.id, restaurantId));

    if (!existing) return res.status(404).json({ error: "Restaurant not found" });
    if (existing.ownerId !== userId) return res.status(403).json({ error: "Forbidden" });

    const { name, sortOrder } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });

    const [category] = await db
      .insert(menuCategories)
      .values({ restaurantId, name, sortOrder: sortOrder || 0 })
      .returning();

    res.status(201).json(category);
  } catch (error) {
    console.error("Error creating menu category:", error);
    res.status(500).json({ error: "Failed to create menu category" });
  }
});

router.post("/restaurants/:id/menu-items", authMiddleware, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const restaurantId = parseInt(req.params.id);

    const [existing] = await db
      .select()
      .from(restaurants)
      .where(eq(restaurants.id, restaurantId));

    if (!existing) return res.status(404).json({ error: "Restaurant not found" });
    if (existing.ownerId !== userId) return res.status(403).json({ error: "Forbidden" });

    const { categoryId, name, description, price, isVegetarian, isVegan, isGlutenFree } =
      req.body;

    if (!categoryId || !name || !price) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const [category] = await db
      .select()
      .from(menuCategories)
      .where(
        and(
          eq(menuCategories.id, parseInt(categoryId)),
          eq(menuCategories.restaurantId, restaurantId)
        )
      );

    if (!category) {
      return res.status(400).json({ error: "Category does not belong to this restaurant" });
    }

    const [item] = await db
      .insert(menuItems)
      .values({
        categoryId: parseInt(categoryId),
        name,
        description,
        price: price.toString(),
        isVegetarian: isVegetarian || false,
        isVegan: isVegan || false,
        isGlutenFree: isGlutenFree || false,
      })
      .returning();

    res.status(201).json(item);
  } catch (error) {
    console.error("Error creating menu item:", error);
    res.status(500).json({ error: "Failed to create menu item" });
  }
});

router.delete("/menu-categories/:id", authMiddleware, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const categoryId = parseInt(req.params.id);

    const [category] = await db
      .select({ id: menuCategories.id, ownerId: restaurants.ownerId })
      .from(menuCategories)
      .innerJoin(restaurants, eq(menuCategories.restaurantId, restaurants.id))
      .where(eq(menuCategories.id, categoryId));

    if (!category) return res.status(404).json({ error: "Category not found" });
    if (category.ownerId !== userId) return res.status(403).json({ error: "Forbidden" });

    await db.delete(menuCategories).where(eq(menuCategories.id, categoryId));
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting menu category:", error);
    res.status(500).json({ error: "Failed to delete menu category" });
  }
});

router.delete("/menu-items/:id", authMiddleware, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const itemId = parseInt(req.params.id);

    const [item] = await db
      .select({ id: menuItems.id, ownerId: restaurants.ownerId })
      .from(menuItems)
      .innerJoin(menuCategories, eq(menuItems.categoryId, menuCategories.id))
      .innerJoin(restaurants, eq(menuCategories.restaurantId, restaurants.id))
      .where(eq(menuItems.id, itemId));

    if (!item) return res.status(404).json({ error: "Item not found" });
    if (item.ownerId !== userId) return res.status(403).json({ error: "Forbidden" });

    await db.delete(menuItems).where(eq(menuItems.id, itemId));
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting menu item:", error);
    res.status(500).json({ error: "Failed to delete menu item" });
  }
});

router.post("/restaurants/:id/photos", authMiddleware, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const restaurantId = parseInt(req.params.id);

    const [existing] = await db
      .select()
      .from(restaurants)
      .where(eq(restaurants.id, restaurantId));

    if (!existing) return res.status(404).json({ error: "Restaurant not found" });
    if (existing.ownerId !== userId) return res.status(403).json({ error: "Forbidden" });

    const { url, caption, isPrimary } = req.body;
    if (!url) return res.status(400).json({ error: "URL is required" });

    if (isPrimary) {
      await db
        .update(restaurantPhotos)
        .set({ isPrimary: false })
        .where(eq(restaurantPhotos.restaurantId, restaurantId));
    }

    const [photo] = await db
      .insert(restaurantPhotos)
      .values({
        restaurantId,
        url,
        caption,
        isPrimary: isPrimary || false,
        uploadedBy: userId,
      })
      .returning();

    res.status(201).json(photo);
  } catch (error) {
    console.error("Error adding photo:", error);
    res.status(500).json({ error: "Failed to add photo" });
  }
});

export default router;
