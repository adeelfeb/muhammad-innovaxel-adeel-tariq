import express from 'express';
import {
    createShortUrl,
    getOriginalUrlData,
    updateShortUrl,
    deleteShortUrl,
    getShortUrlStats
} from '../controllers/url.controller.js';

const router = express.Router();



router.post('/shorten', createShortUrl);
router.get('/shorten/:shortCode', getOriginalUrlData);
router.put('/shorten/:shortCode', updateShortUrl);
router.delete('/shorten/:shortCode', deleteShortUrl);
router.get('/shorten/:shortCode/stats', getShortUrlStats);

export default router;