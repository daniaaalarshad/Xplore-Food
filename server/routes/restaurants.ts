import { Router } from "express";
import { db } from "../db";
import {
  restaurants,
  menuCategories,
  menuItems,
  restaurantPhotos,
  reviews,
  users,
  cities,
} from "../../shared/schema";
import { eq, and, ilike, sql, desc, asc } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const {
      city,
      cuisine,
      priceRange,
      search,
      dietary,
      sortBy,
      page = "1",
      limit = "12",
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    let conditions: any[] = [];

    if (city) {
      conditions.push(eq(restaurants.cityId, parseInt(city as string)));
    }
    if (cuisine) {
      conditions.push(eq(restaurants.cuisineType, cuisine as string));
    }
    if (priceRange) {
      conditions.push(eq(restaurants.priceRange, parseInt(priceRange as string)));
    }
    if (search) {
      conditions.push(
        sql`(${restaurants.name} ILIKE ${"%" + search + "%"} OR ${restaurants.description} ILIKE ${"%" + search + "%"})`
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [restaurantList, countResult] = await Promise.all([
      db
        .select({
          id: restaurants.id,
          name: restaurants.name,
          slug: restaurants.slug,
          description: restaurants.description,
          address: restaurants.address,
          cityId: restaurants.cityId,
          cityName: cities.name,
          phone: restaurants.phone,
          cuisineType: restaurants.cuisineType,
          priceRange: restaurants.priceRange,
          dietaryOptions: restaurants.dietaryOptions,
          averageRating: restaurants.averageRating,
          totalReviews: restaurants.totalReviews,
          isFeatured: restaurants.isFeatured,
          isVerified: restaurants.isVerified,
          createdAt: restaurants.createdAt,
        })
        .from(restaurants)
        .leftJoin(cities, eq(restaurants.cityId, cities.id))
        .where(whereClause)
        .orderBy(desc(restaurants.isFeatured), desc(restaurants.averageRating))
        .limit(limitNum)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(restaurants)
        .where(whereClause),
    ]);

    const photosForRestaurants = restaurantList.length > 0
      ? await db
          .select()
          .from(restaurantPhotos)
          .where(
            sql`${restaurantPhotos.restaurantId} IN (${sql.join(
              restaurantList.map((r) => sql`${r.id}`),
              sql`, `
            )})`
          )
      : [];

    const restaurantsWithPhotos = restaurantList.map((r) => ({
      ...r,
      photos: photosForRestaurants.filter((p) => p.restaurantId === r.id),
    }));

    res.json({
      restaurants: restaurantsWithPhotos,
      total: Number(countResult[0]?.count || 0),
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(Number(countResult[0]?.count || 0) / limitNum),
    });
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    res.status(500).json({ error: "Failed to fetch restaurants" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const [restaurant] = await db
      .select({
        id: restaurants.id,
        name: restaurants.name,
        slug: restaurants.slug,
        description: restaurants.description,
        address: restaurants.address,
        cityId: restaurants.cityId,
        cityName: cities.name,
        latitude: restaurants.latitude,
        longitude: restaurants.longitude,
        phone: restaurants.phone,
        email: restaurants.email,
        website: restaurants.website,
        cuisineType: restaurants.cuisineType,
        priceRange: restaurants.priceRange,
        dietaryOptions: restaurants.dietaryOptions,
        operatingHours: restaurants.operatingHours,
        ownerId: restaurants.ownerId,
        isVerified: restaurants.isVerified,
        isFeatured: restaurants.isFeatured,
        averageRating: restaurants.averageRating,
        totalReviews: restaurants.totalReviews,
        createdAt: restaurants.createdAt,
      })
      .from(restaurants)
      .leftJoin(cities, eq(restaurants.cityId, cities.id))
      .where(eq(restaurants.id, id));

    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    const [photos, categories, restaurantReviews] = await Promise.all([
      db
        .select()
        .from(restaurantPhotos)
        .where(eq(restaurantPhotos.restaurantId, id)),
      db
        .select()
        .from(menuCategories)
        .where(eq(menuCategories.restaurantId, id))
        .orderBy(asc(menuCategories.sortOrder)),
      db
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
        .where(eq(reviews.restaurantId, id))
        .orderBy(desc(reviews.createdAt)),
    ]);

    const categoryIds = categories.map((c) => c.id);
    let items: any[] = [];
    if (categoryIds.length > 0) {
      items = await db
        .select()
        .from(menuItems)
        .where(
          sql`${menuItems.categoryId} IN (${sql.join(
            categoryIds.map((id) => sql`${id}`),
            sql`, `
          )})`
        );
    }

    const menu = categories.map((cat) => ({
      ...cat,
      items: items.filter((item) => item.categoryId === cat.id),
    }));

    res.json({
      ...restaurant,
      photos,
      menu,
      reviews: restaurantReviews,
    });
  } catch (error) {
    console.error("Error fetching restaurant:", error);
    res.status(500).json({ error: "Failed to fetch restaurant" });
  }
});

export default router;
