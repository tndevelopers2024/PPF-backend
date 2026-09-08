import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import connectDB from './src/config/db.js';

import path from 'path';
import authRoutes from './src/routes/authRoutes.js';
import vehicleRoutes from './src/routes/vehicleRoutes.js';
import patternRoutes from './src/routes/patternRoutes.js';
import jobRoutes from './src/routes/jobRoutes.js';
import uploadRoutes from './src/routes/uploadRoutes.js';
import plotterRoutes from './src/routes/plotterRoutes.js';
import garageRoutes from './src/routes/garageRoutes.js';
import settingsRoutes from './src/routes/settingsRoutes.js';

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/patterns', patternRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/plotters', plotterRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/garage', garageRoutes);
app.use('/api/settings', settingsRoutes);

const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

app.get('/', (req, res) => {
  res.send('PPF Cutting Platform API is running');
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
