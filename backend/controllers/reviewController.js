import Review from "../models/Review.js";
import Listing from "../models/Listings.js";

export const createReview = async (req, res) => {
  const { listingId, ngoId, rating, comment } = req.body;

  try {
    // Prevent duplicate reviews by the same NGO for the same listing
    const existing = await Review.findOne({ listingId, ngoId });
    if (existing) {
      return res.status(400).json({ message: "Review already submitted." });
    }

    const review = new Review({
      listingId,
      ngoId,
      rating,
      comment
    });

    await review.save();
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: "Failed to submit review", error: err });
  }

}

export const getReviewsByListing = async (req, res) => {
  try {
    const reviews = await Review.find({ listingId: req.params.listingId })
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching reviews', error: err });
  }
}

export const getReviewsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const listings = await Listing.find({ userId });
    const listingIds = listings.map(listing => listing._id);

    const reviews = await Review.find({ listingId: { $in: listingIds } })
    .populate('listingId')
    .populate('ngoId', 'name');

    res.json(reviews);
  } catch (err) {
    console.error('Error fetching reviews for donor:', err);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
}
