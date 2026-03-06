import { Router } from "express";
import { db } from "../db";
import { cities } from "../../shared/schema";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const allCities = await db.select().from(cities).orderBy(cities.name);
    res.json(allCities);
  } catch (error) {
    console.error("Error fetching cities:", error);
    res.status(500).json({ error: "Failed to fetch cities" });
  }
});

export default router;
