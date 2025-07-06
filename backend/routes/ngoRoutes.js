import express from 'express';

import {
    createNgo,
    getAllNgos,
    deleteNgo,
    getNgoListings,
    } from '../controllers/ngoController.js';

const router = express.Router();

router.post('/create', createNgo);
router.get('/', getAllNgos);
router.delete('/:id', deleteNgo);
router.get('/listings/:id', getNgoListings);

export default router;
