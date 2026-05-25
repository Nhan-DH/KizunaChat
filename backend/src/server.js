import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './libs/db.js';
import authRoute from './routes/authRoute.js';
import userRoute from './routes/userRoute.js';
import cookieParser from 'cookie-parser';
import { protectedRoute } from './middlewares/authMiddleware.js';
dotenv.config();

const app = express();

const PORT = process.env.PORT || 5001;

//middleware
app.use(express.json());
app.use(cookieParser());

//public routes
app.use('/api/auth', authRoute);

//private routes
app.use(protectedRoute); // middleware xác minh JWT cho tất cả route sau nó
app.use('/api/users', userRoute);



const startServer = async () => {
    try {
        await connectDB();
        console.log('Database connected, starting server...');

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (err) {
        console.error('DB connection failed:', err);
        process.exit(1);
    }
};

startServer();