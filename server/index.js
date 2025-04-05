require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth.routes');
const ingredientRoutes = require('./routes/ingredient.routes');
const recipeRoutes = require('./routes/recipe.routes');
const menuRoutes = require('./routes/menu.routes');
const purchaseRoutes = require('./routes/purchase.routes');
const supermarketRoutes = require('./routes/supermarket.routes');
const supermarketProductRoutes = require('./routes/supermarketProduct.routes');
const shoppingListRoutes = require('./routes/shoppingList.routes');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/catering-cost-management', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/ingredients', ingredientRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/supermarkets', supermarketRoutes);
app.use('/api/supermarket-products', supermarketProductRoutes);
app.use('/api/shopping-lists', shoppingListRoutes);

// Set up directory for file uploads if it doesn't exist
const fs = require('fs');
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve uploads directory as static
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Serve static assets if in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('client/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client', 'build', 'index.html'));
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
