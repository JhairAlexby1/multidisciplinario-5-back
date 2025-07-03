import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

export const createApp = () => {
    const app = express();

    // Middlewares
    app.use(cors({
        origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
        credentials: true,
        methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());

    // Health check endpoint
    app.get('/health', (req, res) => {
        res.status(200).json({
            status: 'OK',
            message: 'Server is running',
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        });
    });

    // Mock routes for testing
    app.post('/usuarios/login', (req, res) => {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        
        if (!email.includes('@')) {
            return res.status(400).json({ error: 'Invalid email format' });
        }
        
        // Mock successful login
        res.status(200).json({ message: 'Login successful', token: 'mock-token' });
    });

    app.post('/usuarios/register', (req, res) => {
        const { email, password, name } = req.body;
        
        if (!email || !password || !name) {
            return res.status(400).json({ error: 'Email, password and name are required' });
        }
        
        if (!email.includes('@')) {
            return res.status(400).json({ error: 'Invalid email format' });
        }
        
        res.status(201).json({ message: 'User registered successfully', id: 'mock-id' });
    });

    app.get('/usuarios/all', (req, res) => {
        res.status(401).json({ error: 'Unauthorized' });
    });

    app.post('/usuarios/logout', (req, res) => {
        res.status(200).json({ message: 'Logout successful' });
    });

    app.get('/sensores', (req, res) => {
        res.status(200).json({ sensors: [] });
    });

    return app;
};