import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Layout Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Dashboard from './components/dashboard/Dashboard';
import WelcomeScreen from './components/layout/Welcome/WelcomeScreen';

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import PrivateRoute from './components/routing/PrivateRoute';

// Ingredient Components
import Ingredients from './components/ingredients/Ingredients';
import IngredientForm from './components/ingredients/IngredientForm';
import IngredientDetail from './components/ingredients/IngredientDetail';
import IngredientCamera from './components/ingredients/IngredientCamera';
import IngredientBarcode from './components/ingredients/IngredientBarcode';
import IngredientImport from './components/ingredients/IngredientImport';

// Recipe Components
import Recipes from './components/recipes/Recipes';
import RecipeForm from './components/recipes/RecipeForm';
import RecipeDetail from './components/recipes/RecipeDetail';

// Menu Components
import Menus from './components/menus/Menus';
import MenuForm from './components/menus/MenuForm';
import MenuDetail from './components/menus/MenuDetail';
import MenuCamera from './components/menus/MenuCamera';

// Purchase Components
import Purchases from './components/purchases/Purchases';
import PurchaseForm from './components/purchases/PurchaseForm';
import PurchaseDetail from './components/purchases/PurchaseDetail';
import PurchaseCamera from './components/purchases/PurchaseCamera';

// Analysis Components
import ProfitabilityDashboard from './components/analysis/ProfitabilityDashboard';
import CostBreakdown from './components/analysis/CostBreakdown';
import PricingStrategy from './components/analysis/PricingStrategy';

// Search and Shopping Components
import IngredientSearch from './components/search/IngredientSearch';
import PriceComparison from './components/search/PriceComparison';
import ShoppingLists from './components/shopping/ShoppingLists';
import ShoppingListDetail from './components/shopping/ShoppingListDetail';
import NewShoppingList from './components/shopping/NewShoppingList';

// Context
import AuthState from './context/auth/AuthState';
import AlertState from './context/alert/AlertState';

const theme = createTheme({
  palette: {
    primary: {
      main: '#4caf50', // Green - representing food/catering
    },
    secondary: {
      main: '#ff9800', // Orange - complementary to green
    },
    error: {
      main: '#f44336', // Red for sales and alerts
    },
    success: {
      main: '#2e7d32', // Darker green for success states
    },
    background: {
      default: '#f8f9fa', // Light grey background for better contrast
    }
  },
  typography: {
    fontFamily: [
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif'
    ].join(','),
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

function App() {
  return (
    <AuthState>
      <AlertState>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router>
            <div className="App">
              <Navbar />
              <div className="container">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<WelcomeScreen />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  
                  {/* Dashboard */}
                  <Route path="/dashboard" element={<PrivateRoute component={Dashboard} />} />
                  
                  {/* Ingredients */}
                  <Route path="/ingredients" element={<PrivateRoute component={Ingredients} />} />
                  <Route path="/ingredients/new" element={<PrivateRoute component={IngredientForm} />} />
                  <Route path="/ingredients/edit/:id" element={<PrivateRoute component={IngredientForm} />} />
                  <Route path="/ingredients/:id" element={<PrivateRoute component={IngredientDetail} />} />
                  <Route path="/ingredients/camera" element={<PrivateRoute component={IngredientCamera} />} />
                  <Route path="/ingredients/barcode" element={<PrivateRoute component={IngredientBarcode} />} />
                  <Route path="/ingredients/import" element={<PrivateRoute component={IngredientImport} />} />
                  
                  {/* Recipes */}
                  <Route path="/recipes" element={<PrivateRoute component={Recipes} />} />
                  <Route path="/recipes/new" element={<PrivateRoute component={RecipeForm} />} />
                  <Route path="/recipes/edit/:id" element={<PrivateRoute component={RecipeForm} />} />
                  <Route path="/recipes/:id" element={<PrivateRoute component={RecipeDetail} />} />
                  
                  {/* Menus */}
                  <Route path="/menus" element={<PrivateRoute component={Menus} />} />
                  <Route path="/menus/new" element={<PrivateRoute component={MenuForm} />} />
                  <Route path="/menus/edit/:id" element={<PrivateRoute component={MenuForm} />} />
                  <Route path="/menus/:id" element={<PrivateRoute component={MenuDetail} />} />
                  <Route path="/menus/camera" element={<PrivateRoute component={MenuCamera} />} />
                  
                  {/* Purchases */}
                  <Route path="/purchases" element={<PrivateRoute component={Purchases} />} />
                  <Route path="/purchases/new" element={<PrivateRoute component={PurchaseForm} />} />
                  <Route path="/purchases/edit/:id" element={<PrivateRoute component={PurchaseForm} />} />
                  <Route path="/purchases/:id" element={<PrivateRoute component={PurchaseDetail} />} />
                  <Route path="/purchases/camera" element={<PrivateRoute component={PurchaseCamera} />} />
                  
                  {/* Analysis */}
                  <Route path="/analysis/profitability" element={<PrivateRoute component={ProfitabilityDashboard} />} />
                  <Route path="/analysis/costs" element={<PrivateRoute component={CostBreakdown} />} />
                  <Route path="/analysis/pricing" element={<PrivateRoute component={PricingStrategy} />} />
                  
                  {/* Search */}
                  <Route path="/search" element={<PrivateRoute component={IngredientSearch} />} />
                  <Route path="/search/price-comparison" element={<PrivateRoute component={PriceComparison} />} />
                  
                  {/* Shopping Lists */}
                  <Route path="/shopping/lists" element={<PrivateRoute component={ShoppingLists} />} />
                  <Route path="/shopping/lists/new" element={<PrivateRoute component={NewShoppingList} />} />
                  <Route path="/shopping/lists/:id" element={<PrivateRoute component={ShoppingListDetail} />} />
                </Routes>
              </div>
              <Footer />
            </div>
          </Router>
        </ThemeProvider>
      </AlertState>
    </AuthState>
  );
}

export default App;