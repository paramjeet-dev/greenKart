import ngoModel from "../models/NGO.js";
import listingsModel from "../models/Listings.js";

export const createNgo = async (req, res) => {
    try {
        const newNgo = new ngoModel(req.body);
        const savedNgo = await newNgo.save();
        res.status(201).json(savedNgo);
    } catch (err) {
        res.status(500).json(err);
    }
}

export const deleteNgo = async (req, res) => {
    try {
        const deletedNgo = await ngoModel.findByIdAndDelete(req.params.id);
        if (!deletedNgo) {
            return res.status(404).json({ message: "NGO not found" });
        }
        res.status(200).json({ message: "NGO deleted successfully" });
    } catch (err) {
        res.status(500).json(err);
    }
}

export const getNgo = async (req, res) => {
    try {
        const ngoData = await ngoModel.findById(req.params.id);
        if (!ngoData) {
            return res.status(404).json({ message: "NGO not found" });
        }
        res.status(200).json(ngoData);
    } catch (err) {
        res.status(500).json(err);
    }
}

export const getAllNgos = async (req, res) => {
    try {
        const ngos = await ngoModel.find();
        res.status(200).json(ngos);
    } catch (err) {
        res.status(500).json(err);
    }
}

export const getNgoListings = async (req, res) => {
    try {
        const listings = await listingsModel.find({ claimedBy: req.params.id });
        res.status(200).json(listings);
    } catch (err) {
        res.status(500).json(err);
    }
}
