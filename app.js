import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.routes.js';
import protectedRoutes from './routes/protected.routes.js';
import moodRoutes from './routes/mood.routes.js';
import activityRoutes from './routes/activity.routes.js';
import profileRoutes from './routes/profile.routes.js';
import moodLogRoutes from './routes/moodLog.routes.js';
import suggestionRoutes from './routes/suggestion.routes.js';
import AdminRoute from './routes/admin.routes.js';
import aiRoute from './routes/ai.routes.js';

dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(cors());
app.use(express.json());

app.use('/', authRoutes);
app.use('/admin', AdminRoute);
app.use('/auth', protectedRoutes);
app.use('/mood', moodRoutes);
app.use('/activity', activityRoutes);
app.use('/profile', profileRoutes);
app.use('/mood-log', moodLogRoutes);
app.use('/ai',aiRoute)
app.use('/suggestion', suggestionRoutes);

export default app;
