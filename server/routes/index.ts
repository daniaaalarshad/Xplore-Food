import { Router } from "express";
import citiesRouter from "./cities";
import restaurantsRouter from "./restaurants";
import reviewsRouter from "./reviews";
import favoritesRouter from "./favorites";
import dashboardRouter from "./dashboard";
import authRouter from "./auth";

const router = Router();

router.use("/auth", authRouter);
router.use("/cities", citiesRouter);
router.use("/restaurants", restaurantsRouter);
router.use("/reviews", reviewsRouter);
router.use("/favorites", favoritesRouter);
router.use("/dashboard", dashboardRouter);

export default router;
