import listing from "../models/listings.js";

export const createListing = async (req, res) => {
    console.log(req.body);
    try {
        const newListing = new listing(req.body);
        const savedListing = await newListing.save();
        res.status(201).json(savedListing);
    } catch (err) {
        res.status(500).json(err.message);
    }
};

export const deleteListing = async (req, res) => {
    try {
        const deletedListing = await listing.findByIdAndDelete(req.params.id);
        if (!deletedListing) {
            return res.status(404).json({ message: "Listing not found" });
        }
        res.status(200).json({ message: "Listing deleted successfully" });
    } catch (err) {
        res.status(500).json(err);
    }
}

export const getListing = async (req, res) => {
    try {
        const listingData = await listing.findById(req.params.id);
        if (!listingData) {
            return res.status(404).json({ message: "Listing not found" });
        }
        res.status(200).json(listingData);
    } catch (err) {
        res.status(500).json(err);
    }
}

export const getAllListings = async (req, res) => {
    try {
        const listings = await listing.find();
        res.status(200).json(listings);
    } catch (err) {
        res.status(500).json(err);
    }
}

export const updateListing = async (req, res) => {
    try {
        const updatedListing = await listing.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        if (!updatedListing) {
            return res.status(404).json({ message: "Listing not found" });
        }
        res.status(200).json(updatedListing);
    } catch (err) {
        res.status(500).json(err);
    }
}

export const getUserListings = async (req, res) => {
    try {
        const listings = await listing.find({ userId: req.params.id });
        res.status(200).json(listings);
    } catch (err) {
        res.status(500).json(err);
    }
}

