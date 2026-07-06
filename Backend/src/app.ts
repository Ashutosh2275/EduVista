import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import { requestLogger, errorMiddleware, notFoundHandler } from './middleware';
import { corsOptions, globalLimiter } from './config';
import routes from './routes';

const app = express();

// ────────────────────────────────────────────────────────────
// Security & Hardening Middleware
// ────────────────────────────────────────────────────────────

// 1. Helmet for secure HTTP headers
app.use(helmet());

// 2. CORS configuration with credentials support
app.use(cors(corsOptions));

// 3. Prevent NoSQL Injection attacks
app.use(mongoSanitize());

// 4. Rate limiting to prevent Brute-Force/DDoS
app.use(globalLimiter);

// ────────────────────────────────────────────────────────────
// Request Parsing & Optimization
// ────────────────────────────────────────────────────────────

// 5. Gzip compression for faster response times
app.use(compression());

// 6. JSON body parser with size limit to prevent payload attacks
app.use(express.json({ limit: '10kb' }));

// 7. URL-encoded parser
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 8. Cookie parser (needed for HttpOnly Refresh Tokens)
app.use(cookieParser());

// ────────────────────────────────────────────────────────────
// Custom Logging & Diagnostics
// ────────────────────────────────────────────────────────────

// 9. Structured Request/Response Logging
app.use(requestLogger);

// ────────────────────────────────────────────────────────────
// API Routes
// ────────────────────────────────────────────────────────────

// Health check endpoint (for load balancers & monitoring)
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'up',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
  });
});

// API version 1 entry point
app.use('/api/v1', routes);

// ────────────────────────────────────────────────────────────
// Error Handling Chain
// ────────────────────────────────────────────────────────────

// 10. Catch-all 404 Route handler
app.use(notFoundHandler);

// 11. Centralized global error handling middleware
app.use(errorMiddleware);

export default app;
