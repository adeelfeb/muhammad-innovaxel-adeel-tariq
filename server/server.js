import connectDB from './config/db.js';
import app from './app.js';
import config from './config/conf.js';


const startServer = async () => {
    try {
        await connectDB();
        const PORT = config.port;

        const server = app.listen(PORT, () => {
            console.log(`⚙️ Server is running in ${config.env} mode at: http://localhost:${PORT}/`);
        })
    } catch (error) {
        console.error("❌ Fatal error during server startup:", error);
        process.exit(1);
    }
};

startServer();