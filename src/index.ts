import app from './app';
import { connectDB } from './config/db';

const PORT = process.env.PORT || 3000;

// Connect to MongoDB first, then start Express listener
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`🚀 Authentication server running on port: ${PORT}`);
    console.log(`🏥 Health check path: http://localhost:${PORT}/api/health`);
    console.log(`🔐 Authentication API: http://localhost:${PORT}/api/auth`);
    console.log(`=========================================`);
  });
});
