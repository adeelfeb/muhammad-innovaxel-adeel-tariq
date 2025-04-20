import express from 'express';
import path from 'path'; // Import the 'path' module
import { fileURLToPath } from 'url'; // Needed for __dirname in ES Modules
import { redirectToOriginalUrl, renderErrorPage, renderHomePage } from './controllers/url.controller.js';  



// --- These lines are needed to get __dirname in ES Modules ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// --- ---

const app = express();
const router = express.Router();

// --- Middleware ---
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));

// --- View Engine Setup ---
app.set('view engine', 'ejs');  
app.set('views', path.join(__dirname, 'views'));

app.get('/', renderHomePage);
app.get('/error', renderErrorPage);

import urlRouter from './routes/url.routes.js'

// router.get('/:shortCode', redirectToOriginalUrl);

app.use("/api/v1/", urlRouter);


export default app;