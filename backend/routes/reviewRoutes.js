import express from "express";
import {
    createReview,
    getReviewsByListing,
    getReviewsByUser
} from "../controllers/reviewController.js";

const router = express.Router();

router.post("/", createReview);
router.get("/:listingId", getReviewsByListing);
router.get("/user/:userId", getReviewsByUser);
export default router;
