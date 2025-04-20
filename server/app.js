import express from 'express';
import path from 'path'; // Import the 'path' module
import { fileURLToPath } from 'url'; // Needed for __dirname in ES Modules

// --- These lines are needed to get __dirname in ES Modules ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// --- ---

const app = express();

// --- Middleware ---
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));

// --- View Engine Setup ---
app.set('view engine', 'ejs');  
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'URL Shortener API is running!',
    });
});

import urlRouter from './routes/url.routes.js'

app.use("/api/v1/", urlRouter);


export default app;