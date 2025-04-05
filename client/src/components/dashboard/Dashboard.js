import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Divider from '@mui/material/Divider';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ReceiptIcon from '@mui/icons-material/Receipt';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningIcon from '@mui/icons-material/Warning';
import CircularProgress from '@mui/material/CircularProgress';

import AuthContext from '../../context/auth/authContext';
import axios from 'axios';

// Dashboard stats mock data - in a real app, this would come from API calls
const mockDashboardData = {
  totalIngredients: 42,
  totalRecipes: 18,
  totalMenus: 5,
  totalPurchases: 12,
  lowStockIngredients: 3,
  recentPurchases: [
    { id: '1', date: '2023-04-03', supplier: 'Wholesale Foods', totalAmount: 235.42 },
    { id: '2', date: '2023-04-01', supplier: 'Farmers Market', totalAmount: 87.25 }
  ],
  popularMenuItems: [
    { id: '1', name: 'Chicken Parmesan', profitMargin: 32 },
    { id: '2', name: 'Garden Salad', profitMargin: 45 },
    { id: '3', name: 'Tiramisu', profitMargin: 58 }
  ],
  profitOverview: {
    averageMargin: 38.5,
    highestMargin: 58,
    lowestMargin: 22
  }
};

const Dashboard = () => {
  const authContext = useContext(AuthContext);
  const { user, loading } = authContext;
  const navigate = useNavigate();
  
  const [dashboardData, setDashboardData] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    // In a real app, load data from API
    // This is just a mock implementation
    const fetchDashboardData = async () => {
      try {
        // Replace these with actual API calls in production
        // const ingredientsRes = await axios.get('/api/ingredients/count');
        // const recipesRes = await axios.get('/api/recipes/count');
        // etc.
        
        // For now, use mock data
        setTimeout(() => {
          setDashboardData(mockDashboardData);
          setDataLoading(false);
        }, 1000);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setDataLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading || dataLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Welcome, {user?.name || 'User'}
      </Typography>
      
      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              bgcolor: 'primary.light',
              color: 'white'
            }}
          >
            <ShoppingCartIcon fontSize="large" />
            <Typography component="p" variant="h4">
              {dashboardData?.totalIngredients || 0}
            </Typography>
            <Typography variant="body1">Ingredients</Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              bgcolor: 'secondary.light',
              color: 'white'
            }}
          >
            <RestaurantIcon fontSize="large" />
            <Typography component="p" variant="h4">
              {dashboardData?.totalRecipes || 0}
            </Typography>
            <Typography variant="body1">Recipes</Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              bgcolor: 'success.light',
              color: 'white'
            }}
          >
            <MenuBookIcon fontSize="large" />
            <Typography component="p" variant="h4">
              {dashboardData?.totalMenus || 0}
            </Typography>
            <Typography variant="body1">Menus</Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              bgcolor: 'info.light',
              color: 'white'
            }}
          >
            <ReceiptIcon fontSize="large" />
            <Typography component="p" variant="h4">
              {dashboardData?.totalPurchases || 0}
            </Typography>
            <Typography variant="body1">Purchases</Typography>
          </Paper>
        </Grid>
        
        {/* Low Stock Alert */}
        {dashboardData?.lowStockIngredients > 0 && (
          <Grid item xs={12}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                alignItems: 'center',
                bgcolor: 'warning.light',
                color: 'warning.contrastText'
              }}
            >
              <WarningIcon sx={{ mr: 2 }} />
              <Typography variant="h6">
                {dashboardData.lowStockIngredients} ingredients are low in stock
              </Typography>
              <Button 
                variant="contained" 
                color="warning" 
                sx={{ ml: 'auto' }}
                onClick={() => navigate('/ingredients/util/low-stock')}
              >
                View
              </Button>
            </Paper>
          </Grid>
        )}
        
        {/* Profit Overview */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <TrendingUpIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                Profit Overview
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body1">
                    Average Profit Margin: <b>{dashboardData?.profitOverview?.averageMargin || 0}%</b>
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body1">
                    Highest Margin: <b>{dashboardData?.profitOverview?.highestMargin || 0}%</b>
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body1">
                    Lowest Margin: <b>{dashboardData?.profitOverview?.lowestMargin || 0}%</b>
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => navigate('/analysis/profitability')}>
                View Detailed Analysis
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        {/* Popular Menu Items */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <MenuBookIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                Popular Menu Items
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {dashboardData?.popularMenuItems?.map((item, index) => (
                <Box key={item.id} sx={{ mb: 1 }}>
                  <Typography variant="body1">
                    {item.name} - <b>{item.profitMargin}% margin</b>
                  </Typography>
                  {index < dashboardData.popularMenuItems.length - 1 && <Divider sx={{ my: 1 }} />}
                </Box>
              ))}
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => navigate('/menus')}>
                View All Menu Items
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        {/* Recent Purchases */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <ShoppingCartIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                Recent Purchases
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                {dashboardData?.recentPurchases?.map((purchase) => (
                  <Grid item xs={12} key={purchase.id}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="body1">
                        <b>{new Date(purchase.date).toLocaleDateString()}</b> - {purchase.supplier}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total: ${purchase.totalAmount.toFixed(2)}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => navigate('/purchases')}>
                View All Purchases
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
