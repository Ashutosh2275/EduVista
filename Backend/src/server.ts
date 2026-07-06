import './types/expressRequest';
import app from './app';
import { env, connectDB, disconnectDB, configureCloudinary } from './config';
import { logger } from './utils';
import { CronService } from './services/cron.service';

const cron = new CronService();

// ────────────────────────────────────────────────────────────
// Server Initialization
// ────────────────────────────────────────────────────────────

let server: ReturnType<typeof app.listen>;

async function startServer(): Promise<void> {
  try {
    // 1. Configure Cloudinary integration
    configureCloudinary();

    // 2. Connect to MongoDB Atlas (with built-in retry logic)
    await connectDB();

    // 3. Start Express server
    const PORT = env.PORT;
    server = app.listen(PORT, () => {
      logger.info(`🚀 EduVista Backend Server running on port ${PORT} in ${env.NODE_ENV} mode.`);
      
      // 4. Start background schedulers
      cron.start();
    });
  } catch (error) {
    const err = error as Error;
    logger.error(`❌ Critical error starting server: ${err.message}`);
    process.exit(1);
  }
}

// Start the server
startServer();

// ────────────────────────────────────────────────────────────
// Graceful Shutdown & Unhandled Process Rejections
// ────────────────────────────────────────────────────────────

const gracefulShutdown = async (signal: string): Promise<void> => {
  logger.warn(`⚠️ Received ${signal}. Starting graceful shutdown...`);

  // Stop background cron jobs
  cron.stop();

  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed.');
      await disconnectDB();
      logger.info('👋 Graceful shutdown complete. Exiting process.');
      process.exit(0);
    });

    // Enforce shutdown after 10s timeout
    setTimeout(() => {
      logger.error('Could not close connections in time, forcefully shutting down.');
      process.exit(1);
    }, 10000);
  } else {
    await disconnectDB();
    process.exit(0);
  }
};

// Handle process termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Unhandled Promise Rejections (e.g. database disconnect, unexpected async error)
process.on('unhandledRejection', (reason: Error | unknown) => {
  const message = reason instanceof Error ? reason.message : String(reason);
  const stack = reason instanceof Error ? reason.stack : undefined;

  logger.error(`❌ Unhandled Promise Rejection: ${message}`, { stack });

  // For safety in production, let the process crash and let the process manager (PM2/Kubernetes) restart it
  if (env.NODE_ENV === 'production') {
    gracefulShutdown('unhandledRejection');
  }
});

// Uncaught Exceptions (e.g. synchronous error not caught by middleware)
process.on('uncaughtException', (error: Error) => {
  logger.error(`❌ Uncaught Exception: ${error.message}`, { stack: error.stack });
  gracefulShutdown('uncaughtException');
});
