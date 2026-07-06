import mongoose from 'mongoose';
import env from './env';
import logger from '../utils/logger';

// ────────────────────────────────────────────────────────────
// Connection Options
// ────────────────────────────────────────────────────────────

const MONGOOSE_OPTIONS: mongoose.ConnectOptions = {
  serverSelectionTimeoutMS: 10000,   // Timeout after 10s if no primary
  socketTimeoutMS: 45000,            // Close idle sockets after 45s
  maxPoolSize: 10,                   // Max connections in pool
  minPoolSize: 2,                    // Keep minimum 2 connections ready
  heartbeatFrequencyMS: 30000,       // Check server health every 30s
  retryWrites: true,
  writeConcern: { w: 'majority' },
};

// ────────────────────────────────────────────────────────────
// Retry Configuration
// ────────────────────────────────────────────────────────────

const MAX_RETRIES = 5;
const RETRY_INTERVAL_MS = 5000;

// ────────────────────────────────────────────────────────────
// Event Listeners
// ────────────────────────────────────────────────────────────

function setupMongooseEventListeners(): void {
  const db = mongoose.connection;

  db.on('connected', () => {
    logger.info(`[DB] MongoDB connected → ${mongoose.connection.host}`);
  });

  db.on('disconnected', () => {
    logger.warn('[DB] MongoDB disconnected. Attempting reconnect...');
  });

  db.on('reconnected', () => {
    logger.info('[DB] MongoDB reconnected successfully.');
  });

  db.on('error', (err: Error) => {
    logger.error(`[DB] MongoDB connection error: ${err.message}`);
  });

  db.on('close', () => {
    logger.info('[DB] MongoDB connection closed.');
  });
}

// ────────────────────────────────────────────────────────────
// Connection Function with Retry Logic
// ────────────────────────────────────────────────────────────

let retryCount = 0;

async function connectDB(): Promise<void> {
  setupMongooseEventListeners();

  const attemptConnection = async (): Promise<void> => {
    try {
      logger.info(`[DB] Connecting to MongoDB... (attempt ${retryCount + 1}/${MAX_RETRIES})`);

      await mongoose.connect(env.MONGODB_URI, MONGOOSE_OPTIONS);

      retryCount = 0; // Reset on success
      logger.info(`[DB] ✅ MongoDB connected successfully in ${env.NODE_ENV} mode.`);
    } catch (error) {
      retryCount++;
      const err = error as Error;

      logger.error(`[DB] ❌ Connection failed: ${err.message}`);

      if (retryCount < MAX_RETRIES) {
        logger.warn(`[DB] Retrying in ${RETRY_INTERVAL_MS / 1000}s... (${retryCount}/${MAX_RETRIES})`);
        await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL_MS));
        return attemptConnection();
      } else {
        logger.error('[DB] Maximum retry attempts reached. Shutting down.');
        process.exit(1);
      }
    }
  };

  await attemptConnection();
}

// ────────────────────────────────────────────────────────────
// Graceful Shutdown
// ────────────────────────────────────────────────────────────

async function disconnectDB(): Promise<void> {
  try {
    await mongoose.connection.close();
    logger.info('[DB] MongoDB connection closed gracefully.');
  } catch (error) {
    const err = error as Error;
    logger.error(`[DB] Error during graceful shutdown: ${err.message}`);
  }
}

export { connectDB, disconnectDB };
export default connectDB;
