import { sql } from "drizzle-orm";
import {
  pgTable,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  decimal,
  jsonb,
  index,
  uniqueIndex,
  serial,
} from "drizzle-orm/pg-core";

export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const cities = pgTable("cities", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  state: varchar("state", { length: 255 }),
  country: varchar("country", { length: 255 }).notNull().default("India"),
  imageUrl: varchar("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const restaurants = pgTable(
  "restaurants",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    description: text("description"),
    address: text("address").notNull(),
    cityId: integer("city_id")
      .notNull()
      .references(() => cities.id),
    latitude: decimal("latitude", { precision: 10, scale: 7 }),
    longitude: decimal("longitude", { precision: 10, scale: 7 }),
    phone: varchar("phone", { length: 20 }),
    email: varchar("email", { length: 255 }),
    website: varchar("website", { length: 500 }),
    cuisineType: varchar("cuisine_type", { length: 100 }).notNull(),
    priceRange: integer("price_range").notNull().default(2),
    dietaryOptions: jsonb("dietary_options").$type<string[]>().default([]),
    operatingHours: jsonb("operating_hours").$type<Record<string, { open: string; close: string; closed?: boolean }>>(),
    ownerId: varchar("owner_id").references(() => users.id),
    isVerified: boolean("is_verified").default(false),
    isFeatured: boolean("is_featured").default(false),
    averageRating: decimal("average_rating", { precision: 3, scale: 2 }).default("0"),
    totalReviews: integer("total_reviews").default(0),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    index("idx_restaurants_city").on(table.cityId),
    index("idx_restaurants_cuisine").on(table.cuisineType),
    index("idx_restaurants_owner").on(table.ownerId),
  ]
);

export const menuCategories = pgTable("menu_categories", {
  id: serial("id").primaryKey(),
  restaurantId: integer("restaurant_id")
    .notNull()
    .references(() => restaurants.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  sortOrder: integer("sort_order").default(0),
});

export const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id")
    .notNull()
    .references(() => menuCategories.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  imageUrl: varchar("image_url"),
  isVegetarian: boolean("is_vegetarian").default(false),
  isVegan: boolean("is_vegan").default(false),
  isGlutenFree: boolean("is_gluten_free").default(false),
  isAvailable: boolean("is_available").default(true),
});

export const restaurantPhotos = pgTable("restaurant_photos", {
  id: serial("id").primaryKey(),
  restaurantId: integer("restaurant_id")
    .notNull()
    .references(() => restaurants.id, { onDelete: "cascade" }),
  url: varchar("url", { length: 500 }).notNull(),
  caption: varchar("caption", { length: 255 }),
  isPrimary: boolean("is_primary").default(false),
  uploadedBy: varchar("uploaded_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reviews = pgTable(
  "reviews",
  {
    id: serial("id").primaryKey(),
    restaurantId: integer("restaurant_id")
      .notNull()
      .references(() => restaurants.id, { onDelete: "cascade" }),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id),
    rating: integer("rating").notNull(),
    comment: text("comment"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    index("idx_reviews_restaurant").on(table.restaurantId),
    uniqueIndex("idx_reviews_user_restaurant").on(table.userId, table.restaurantId),
  ]
);

export const favorites = pgTable(
  "favorites",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id),
    restaurantId: integer("restaurant_id")
      .notNull()
      .references(() => restaurants.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    uniqueIndex("idx_favorites_user_restaurant").on(table.userId, table.restaurantId),
  ]
);

export type User = typeof users.$inferSelect;
export type UpsertUser = typeof users.$inferInsert;
export type City = typeof cities.$inferSelect;
export type Restaurant = typeof restaurants.$inferSelect;
export type InsertRestaurant = typeof restaurants.$inferInsert;
export type MenuCategory = typeof menuCategories.$inferSelect;
export type MenuItem = typeof menuItems.$inferSelect;
export type RestaurantPhoto = typeof restaurantPhotos.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type Favorite = typeof favorites.$inferSelect;
