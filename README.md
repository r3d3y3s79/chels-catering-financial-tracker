# Chel's Catering Ingredients Financial Tracker

A comprehensive financial tracking application specifically designed for catering services. This application enables users to accurately track ingredient costs, calculate per-serving expenses, analyze menu profitability, optimize pricing strategies, and find the best deals on ingredients across different supermarkets.

## Core Features

### 1. Inventory & Cost Tracking System
- Multi-modal ingredient input (OCR, barcode scanning, manual entry, bulk import)
- Purchase session management
- Itemized receipt generation
- Australian supermarket price integration (Woolworths, Coles, Aldi)

### 2. Ingredient-to-Portion Cost Calculator
- Unit conversion engine
- Granular cost breakdown
- Support for variable portion sizes

### 3. Menu Creation & Analysis
- Menu digitization with OCR support
- Recipe-to-menu linking
- Automatic cost calculation

### 4. Recipe Management & Suggestions
- Comprehensive recipe database
- Intelligent recipe suggestions
- Cost-optimization sorting

### 5. Profitability Analysis
- Financial metrics dashboard
- Pricing strategy tools
- "What-if" scenario modeling

### 6. Supermarket Price Comparison
- Compare ingredient prices across major Australian supermarkets
- Track price histories and trends
- Best deals notifications
- Automated price updates

### 7. Shopping List Management
- Create and manage shopping lists
- Add items from recipes, ingredient database, or product search
- Printable shopping lists organized by supermarket
- Price tracking and budget calculation

## Technical Architecture

This application is built using a modern tech stack:
- Frontend: React with Material UI for responsive design
- Backend: Node.js with Express
- Database: MongoDB for flexible schema design
- Authentication: JWT-based user authentication
- OCR/Image Processing: Tesseract.js for price tag and menu scanning
- Payment Integration: Ready for integration with payment processors (future)

## Installation and Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation Steps
1. Clone the repository
```
git clone https://github.com/yourusername/chels-catering-tracker.git
cd chels-catering-tracker
```

2. Install dependencies
```
npm install
cd client
npm install
cd ..
```

3. Set up environment variables
Create a `.env` file in the root directory with the following variables:
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/chels-catering-tracker
JWT_SECRET=your_jwt_secret_key
```

4. Seed the database with initial data
```
npm run seed
```

5. Start development servers
```
npm run dev:full
```

The application will be available at `http://localhost:3000`

## Features in Detail

### Authentication System
- User registration and login
- Role-based access (admin, manager, staff)
- Secure JWT authentication

### Ingredient Management
- Create, update, delete ingredients
- Track inventory levels
- OCR scanning of price tags
- Barcode scanning for quick lookup
- Price comparison across supermarkets
- Price history tracking

### Recipe Management
- Create and manage recipes
- Automatic cost calculation based on ingredients
- Portion sizing and scaling
- Recipe suggestions based on available ingredients
- Printable recipe cards

### Menu Planning
- Create and manage menus
- Link recipes to menu items
- Calculate costs and suggested pricing
- Menu profitability analysis
- OCR scanning of handwritten menus

### Shopping Lists
- Create shopping lists for specific events or time periods
- Add items from recipes, inventory, or product database
- Compare prices across supermarkets
- Organize by supermarket for efficient shopping
- Printable lists with price estimates

### Profitability Analysis
- Dashboard with key financial metrics
- Cost breakdown by ingredient, recipe, or menu
- Pricing strategy recommendations
- "What-if" scenario modeling
- Export reports for accounting purposes

## Customization for Australian Market
- Australian Dollar (AUD) as default currency
- Integration with major Australian supermarkets:
  - Woolworths
  - Coles
  - Aldi
  - IGA
  - Harris Farm
- Australian GST calculations
- Australian standard portion sizes and measurements

## Project Status
This project is currently in active development with the following phases:
1. ✅ Core infrastructure and authentication
2. ✅ Ingredient management and cost calculation
3. ✅ Recipe management and menu planning
4. ✅ Shopping list and price comparison features
5. 🔄 OCR and barcode scanning functionality (in progress)
6. 📅 Advanced analytics and reporting (planned)
7. 📅 Mobile app development (planned)

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Support
For support, email support@chelscateringtracker.com or open an issue in this repository.
