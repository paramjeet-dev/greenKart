import express from 'express';
import {
  createListing,
  deleteListing,
  getAllListings,
  getListing,
  updateListing,
  getUserListings
} from '../controllers/listingController.js';

const router = express.Router();

router.post('/create', createListing);
router.get('/', getAllListings);
router.get('/user/:id', getUserListings);
router.get('/:id', getListing);
router.put('/:id', updateListing);
router.delete('/:id', deleteListing);

export default router;
