import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { v2 as cloudinary } from 'cloudinary';

import dotenv from 'dotenv';
import projectRoutes from './routes/Projects';
import designerRoutes from './routes/Designers';
import uploadRoutes from './routes/Upload';
dotenv.config();



const app = express();


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // your frontend
  credentials: true,
}));
app.use(express.json({ limit: '50mb' })); // for large image uploads

// Test route
app.get('/', (req, res) => {
  res.send('Hudumalink Backend Live 🇰🇪');
});


app.use('/api/projects', projectRoutes);
app.use('/api/designers', designerRoutes);
app.use('/api/upload', uploadRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI!)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});