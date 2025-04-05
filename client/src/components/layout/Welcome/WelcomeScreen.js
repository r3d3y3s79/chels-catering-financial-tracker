import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Divider from '@mui/material/Divider';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import SearchIcon from '@mui/icons-material/Search';
import ReceiptIcon from '@mui/icons-material/Receipt';
import BarChartIcon from '@mui/icons-material/BarChart';
import Fade from '@mui/material/Fade';
import { keyframes } from '@mui/system';

// Animation for the logo
const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

const WelcomeScreen = () => {
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(false);
  
  // Show content with animation after a short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Fade in={true} timeout={1000}>
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            animation: `${pulse} 2s ease-in-out infinite`,
            mb: 6 
          }}
        >
          <RestaurantMenuIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
          <Typography variant="h2" component="h1" align="center" gutterBottom>
            Chel's Catering
          </Typography>
          <Typography variant="h4" align="center" color="text.secondary" gutterBottom>
            Ingredients Financial Tracker
          </Typography>
          <Typography variant="h6" align="center" color="text.secondary">
            Managing Your Catering Finances with Precision
          </Typography>
        </Box>
      </Fade>
      
      <Fade in={showContent} timeout={1000}>
        <Paper elevation={3} sx={{ p: 4, mb: 6 }}>
          <Typography variant="h5" gutterBottom>
            Welcome to Australia's Premier Catering Financial Management Tool
          </Typography>
          <Typography variant="body1" paragraph>
            Chel's Catering Ingredients Financial Tracker is designed specifically for catering professionals in Australia. 
            Our comprehensive solution helps you track ingredient costs, manage recipes, compare supermarket prices, 
            and optimize your menu pricing for maximum profitability.
          </Typography>
          <Typography variant="body1" paragraph>
            With built-in integration for Woolworths, Coles, and Aldi, you'll always know where to find the best 
            deals on ingredients. Our powerful cost analysis tools ensure you're pricing your catering services 
            correctly to maintain quality while maximizing your profit margins.
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Button 
              variant="contained" 
              size="large" 
              onClick={() => navigate('/register')}
              sx={{ mx: 1 }}
            >
              Get Started
            </Button>
            <Button 
              variant="outlined" 
              size="large" 
              onClick={() => navigate('/login')}
              sx={{ mx: 1 }}
            >
              Sign In
            </Button>
          </Box>
        </Paper>
      </Fade>
      
      <Fade in={showContent} timeout={1500}>
        <div>
          <Typography variant="h5" align="center" gutterBottom sx={{ mb: 4 }}>
            Key Features
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <ShoppingCartIcon color="primary" sx={{ fontSize: 36, mr: 2 }} />
                    <Typography variant="h6">
                      Ingredient Management
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    Track ingredients with accurate pricing from major Australian supermarkets. Use OCR to scan price 
                    tags and barcodes for quick data entry. Monitor price changes over time to optimize purchasing.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CompareArrowsIcon color="primary" sx={{ fontSize: 36, mr: 2 }} />
                    <Typography variant="h6">
                      Price Comparison
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    Compare prices across Woolworths, Coles, and Aldi to find the best deals. Track price history 
                    and get alerts when prices drop. Generate optimized shopping lists based on where each item is cheapest.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <RestaurantMenuIcon color="primary" sx={{ fontSize: 36, mr: 2 }} />
                    <Typography variant="h6">
                      Recipe & Menu Costing
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    Create and manage recipes with precise ingredient costs. Calculate exact per-serving expenses and 
                    recommended selling prices. Design menus with accurate pricing and profitability analysis.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <BarChartIcon color="primary" sx={{ fontSize: 36, mr: 2 }} />
                    <Typography variant="h6">
                      Profitability Analysis
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    Analyze profitability across recipes and menus. Identify high and low-margin items. Use 
                    "what-if" scenarios to optimize pricing strategies and ingredient substitutions.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <ReceiptIcon color="primary" sx={{ fontSize: 36, mr: 2 }} />
                    <Typography variant="h6">
                      Shopping Lists
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    Create smart shopping lists organized by supermarket. Track total costs and stay within budget. 
                    Print or access lists on your mobile device while shopping. Automatically update inventory when shopping is complete.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <SearchIcon color="primary" sx={{ fontSize: 36, mr: 2 }} />
                    <Typography variant="h6">
                      Smart Search
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    Quickly find ingredients, recipes, and products across all supermarkets. Powerful filtering 
                    options help you find exactly what you need. Save favorites for quick access to frequently used items.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </div>
      </Fade>
      
      <Fade in={showContent} timeout={2000}>
        <Box sx={{ mt: 8, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Ready to optimize your catering business?
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Join thousands of Australian catering professionals using Chel's Catering Ingredients Financial Tracker
          </Typography>
          <Button 
            variant="contained" 
            size="large" 
            onClick={() => navigate('/register')}
            sx={{ mt: 2 }}
          >
            Get Started Now
          </Button>
        </Box>
      </Fade>
    </Container>
  );
};

export default WelcomeScreen;
