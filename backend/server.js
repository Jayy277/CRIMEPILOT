const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables FIRST
dotenv.config();

// MySQL sync via Sequelize (replaces MongoDB connectDB)
const { syncDatabase } = require('./models/index');

const auditLogger = require('./middleware/logMiddleware');

// Route imports
const authRoutes         = require('./routes/authRoutes');
const adminRoutes        = require('./routes/adminRoutes');
const crimeRoutes        = require('./routes/crimeRoutes');
const suspectRoutes      = require('./routes/suspectRoutes');
const victimRoutes       = require('./routes/victimRoutes');
const evidenceRoutes     = require('./routes/evidenceRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const dashboardRoutes    = require('./routes/dashboardRoutes');

const { getCategorySections } = require('./controllers/adminController');
const { protect } = require('./middleware/authMiddleware');

const app = express();

// Standard middleware
app.use(cors());
app.use(express.json());

// Custom Audit Log middleware
app.use(auditLogger);

// Static uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount API Routes
app.use('/api/auth',          authRoutes);
app.use('/api/admin',         adminRoutes);
app.use('/api/crimes',        crimeRoutes);
app.use('/api/suspects',      suspectRoutes);
app.use('/api/victims',       victimRoutes);
app.use('/api/evidence',      evidenceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard',     dashboardRoutes);

app.get('/api/crime-categories/:id/sections', protect, getCategorySections);

// Healthcheck
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to CrimePilot AI Backend (MySQL)',
    status: 'Running',
    version: '2.0.0',
    database: 'MySQL (Sequelize)',
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

// Connect MySQL and sync tables BEFORE starting server
syncDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT} [MySQL mode]`);
  });
});
