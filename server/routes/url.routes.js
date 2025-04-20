import express from 'express';
import {
    renderHomePage,
    renderErrorPage
} from '../controllers/url.controller.js';

const router = express.Router();

// testing the routes
router.get('/', renderHomePage);
router.get('/error', renderErrorPage);


router.post('/shorten', renderHomePage);
router.get('/shorten/:shortCode', renderHomePage);
router.put('/shorten/:shortCode', renderHomePage);
router.delete('/shorten/:shortCode', renderHomePage);
router.get('/shorten/:shortCode/stats', renderHomePage);

export default router;