import express from 'express';
import {
    // renderErrorPage,
    renderHomePage,
    redirectToOriginalUrl
} from '../controllers/url.controller.js';

const router = express.Router();

router.get('/', renderHomePage);
// router.get('/error', renderErrorPage);
router.get('/:shortCode', redirectToOriginalUrl);


export default router;