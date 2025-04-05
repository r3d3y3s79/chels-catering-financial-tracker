import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Chip from '@mui/material/Chip';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import StoreIcon from '@mui/icons-material/Store';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Timeline from '@mui/material/Timeline';
import TimelineItem from '@mui/material/TimelineItem';
import TimelineSeparator from '@mui/material/TimelineSeparator';
import TimelineConnector from '@mui/material/TimelineConnector';
import TimelineContent from '@mui/material/TimelineContent';
import TimelineDot from '@mui/material/TimelineDot';
import TimelineOppositeContent from '@mui/material/TimelineOppositeContent';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';

import AlertContext from '../../context/alert/alertContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const IngredientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const alertContext = useContext(AlertContext);
  const { setAlert } = alertContext;
  
  const [ingredient, setIngredient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [supermarkets, setSupermarkets] = useState([]);
  const [supermarketsLoading, setSupermarketsLoading] = useState(true);
  const [recipesUsingIngredient, setRecipesUsingIngredient] = useState([]);
  const [recipesLoading, setRecipesLoading] = useState(true);
  const [priceHistory, setPriceHistory] = useState([]);
  const [priceHistoryLoading, setPriceHistoryLoading] = useState(false);
  const [selectedSupermarketId, setSelectedSupermarketId] = useState(null);
  
  // Function to get supermarket name by ID
  const getSupermarketName = (supermarketId) => {
    if (!supermarkets || supermarkets.length === 0) return 'Unknown';
    
    const supermarket = supermarkets.find(s => s._id === supermarketId);
    return supermarket ? supermarket.name : 'Unknown';
  };
  
  // Load ingredient details and supermarkets
  useEffect(() => {
    const getSupermarkets = async () => {
      try {
        const res = await axios.get('/api/supermarkets');
        setSupermarkets(res.data);
        setSupermarketsLoading(false);
      } catch (err) {
        console.error('Error fetching supermarkets:', err);
        setSupermarketsLoading(false);
      }
    };
    
    const getIngredient = async () => {
      try {
        const res = await axios.get(`/api/ingredients/${id}`);
        setIngredient(res.data);
        setLoading(false);
        
        // Set the selected supermarket to the preferred supermarket if it exists
        if (res.data.preferredSupermarket) {
          setSelectedSupermarketId(res.data.preferredSupermarket);
        } else if (res.data.prices && res.data.prices.length > 0) {
          // Otherwise, select the first supermarket with a price
          setSelectedSupermarketId(res.data.prices[0].supermarket);
        }
      } catch (err) {
        console.error('Error fetching ingredient:', err);
        setAlert('Failed to load ingredient details', 'error');
        setLoading(false);
        navigate('/ingredients');
      }
    };
    
    getSupermarkets();
    getIngredient();
  }, [id, navigate, setAlert]);
  
  // Load recipes that use this ingredient
  useEffect(() => {
    const getRecipes = async () => {
      try {
        // In a real app, this would be an actual API endpoint
        // For now, we'll simulate the response
        // const res = await axios.get(`/api/recipes/by-ingredient/${id}`);
        
        // Mock data for demonstration
        setTimeout(() => {
          setRecipesUsingIngredient([
            { _id: '1', name: 'Chocolate Cake', costPerServing: 2.45 },
            { _id: '2', name: 'Vanilla Pudding', costPerServing: 1.20 },
            { _id: '3', name: 'Mixed Berry Smoothie', costPerServing: 3.15 }
          ]);
          setRecipesLoading(false);
        }, 800);
      } catch (err) {
        console.error('Error fetching recipes:', err);
        setRecipesLoading(false);
      }
    };
    
    if (!loading && ingredient) {
      getRecipes();
    }
  }, [id, loading, ingredient]);
  
  // Load price history when a supermarket is selected
  useEffect(() => {
    const getPriceHistory = async () => {
      if (!selectedSupermarketId) return;
      
      setPriceHistoryLoading(true);
      
      try {
        // In a real app, fetch from an API
        // const res = await axios.get(`/api/supermarkets/${selectedSupermarketId}/price-history/${id}`);
        // setPriceHistory(res.data);
        
        // For now, use mock data based on current prices
        const mockHistory = [];
        const today = new Date();
        
        // Generate 10 history points going back in time
        for (let i = 0; i < 10; i++) {
          const date = new Date(today);
          date.setDate(date.getDate() - i * 7); // Go back by weeks
          
          // Random price fluctuation within 20% of current price
          const basePrice = ingredient.prices.find(p => 
            p.supermarket === selectedSupermarketId
          )?.price || ingredient.purchasePrice;
          
          const randomFactor = 0.8 + (Math.random() * 0.4); // Between 0.8 and 1.2
          const price = (basePrice * randomFactor).toFixed(2);
          
          mockHistory.push({
            date: date.toISOString(),
            price: parseFloat(price),
            supermarket: selectedSupermarketId
          });
        }
        
        setPriceHistory(mockHistory.sort((a, b) => new Date(a.date) - new Date(b.date)));
        setPriceHistoryLoading(false);
      } catch (err) {
        console.error('Error fetching price history:', err);
        setPriceHistoryLoading(false);
      }
    };
    
    if (ingredient && selectedSupermarketId) {
      getPriceHistory();
    }
  }, [id, selectedSupermarketId, ingredient]);
  
  // Handle ingredient deletion
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this ingredient? This cannot be undone.')) {
      try {
        await axios.delete(`/api/ingredients/${id}`);
        setAlert('Ingredient deleted successfully', 'success');
        navigate('/ingredients');
      } catch (err) {
        console.error('Error deleting ingredient:', err);
        setAlert('Failed to delete ingredient', 'error');
      }
    }
  };
  
  // Get current price from selected supermarket or default price
  const getCurrentPrice = () => {
    if (!ingredient) return 0;
    
    if (selectedSupermarketId) {
      const supermarketPrice = ingredient.prices.find(p => 
        p.supermarket === selectedSupermarketId
      );
      
      return supermarketPrice ? supermarketPrice.price : ingredient.purchasePrice;
    }
    
    return ingredient.purchasePrice;
  };

  // Format price data for the chart
  const getPriceChartData = () => {
    return priceHistory.map(item => ({
      date: new Date(item.date).toLocaleDateString('en-AU', { day: '2-digit', month: 'short' }),
      price: item.price
    }));
  };

  // Get price change indicators
  const getPriceChangeInfo = () => {
    if (!priceHistory || priceHistory.length < 2) return { change: 0, percent: 0, increasing: false };
    
    const oldest = priceHistory[0].price;
    const newest = priceHistory[priceHistory.length - 1].price;
    const change = (newest - oldest).toFixed(2);
    const percent = ((newest - oldest) / oldest * 100).toFixed(1);
    
    return {
      change,
      percent,
      increasing: newest > oldest
    };
  };
  
  if (loading || supermarketsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  const priceChangeInfo = getPriceChangeInfo();
  const currentPrice = getCurrentPrice();
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate('/ingredients')}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h5" sx={{ flexGrow: 1 }}>
            {ingredient.name}
          </Typography>
          <Button 
            variant="outlined" 
            startIcon={<EditIcon />}
            component={Link}
            to={`/ingredients/edit/${id}`}
            sx={{ mr: 1 }}
          >
            Edit
          </Button>
          <Button 
            variant="outlined" 
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDelete}
          >
            Delete
          </Button>
        </Box>
        
        <Grid container spacing={3}>
          {/* Ingredient Information */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Basic Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" color="text.secondary">
                    Category
                  </Typography>
                  <Typography variant="body1">
                    {ingredient.category.charAt(0).toUpperCase() + ingredient.category.slice(1)}
                  </Typography>
                </Box>
                
                {ingredient.description && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" color="text.secondary">
                      Description
                    </Typography>
                    <Typography variant="body1">
                      {ingredient.description}
                    </Typography>
                  </Box>
                )}
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" color="text.secondary">
                    Status
                  </Typography>
                  <Chip 
                    label={ingredient.inStock ? 'In Stock' : 'Out of Stock'}
                    color={ingredient.inStock ? 'success' : 'error'}
                    sx={{ mt: 0.5 }}
                  />
                </Box>
                
                {ingredient.supplier && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" color="text.secondary">
                      Supplier
                    </Typography>
                    <Typography variant="body1">
                      {ingredient.supplier}
                    </Typography>
                  </Box>
                )}
                
                {ingredient.tags && ingredient.tags.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" color="text.secondary">
                      Tags
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                      {ingredient.tags.map((tag) => (
                        <Chip key={tag} label={tag} size="small" />
                      ))}
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          {/* Cost Information */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Cost Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" color="text.secondary">
                    Default Purchase Price
                  </Typography>
                  <Typography variant="body1">
                    ${ingredient.purchasePrice.toFixed(2)} {ingredient.currency} per {ingredient.purchaseUnit}
                  </Typography>
                </Box>

                {ingredient.preferredSupermarket && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" color="text.secondary">
                      Preferred Supermarket
                    </Typography>
                    <Typography variant="body1">
                      {getSupermarketName(ingredient.preferredSupermarket)}
                    </Typography>
                  </Box>
                )}
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" color="text.secondary">
                    Recipe Unit
                  </Typography>
                  <Typography variant="body1">
                    {ingredient.recipeUnit}
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" color="text.secondary">
                    Conversion Ratio
                  </Typography>
                  <Typography variant="body1">
                    1 {ingredient.purchaseUnit} = {ingredient.conversionRatio} {ingredient.recipeUnit}
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" color="text.secondary">
                    Cost per Recipe Unit
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    ${(currentPrice / ingredient.conversionRatio).toFixed(4)} per {ingredient.recipeUnit}
                  </Typography>
                </Box>
                
                {ingredient.wastagePercentage > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" color="text.secondary">
                      Wastage Percentage
                    </Typography>
                    <Typography variant="body1">
                      {ingredient.wastagePercentage}%
                    </Typography>
                  </Box>
                )}
                
                {ingredient.stockQuantity > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" color="text.secondary">
                      Stock Quantity
                    </Typography>
                    <Typography variant="body1">
                      {ingredient.stockQuantity} {ingredient.purchaseUnit}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          {/* Supermarket Price Comparison */}
          {ingredient.prices && ingredient.prices.length > 0 && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <StoreIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">
                      Supermarket Price Comparison
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  
                  <TableContainer component={Paper} sx={{ mb: 3 }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Supermarket</TableCell>
                          <TableCell>Price (AUD)</TableCell>
                          <TableCell>Last Updated</TableCell>
                          <TableCell>Cost per {ingredient.recipeUnit}</TableCell>
                          <TableCell>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {ingredient.prices.map((price) => (
                          <TableRow 
                            key={price.supermarket}
                            sx={{ 
                              bgcolor: price.supermarket === selectedSupermarketId ? 'action.selected' : 'inherit'
                            }}
                          >
                            <TableCell>{getSupermarketName(price.supermarket)}</TableCell>
                            <TableCell>${Number(price.price).toFixed(2)}</TableCell>
                            <TableCell>
                              {price.priceDate ? new Date(price.priceDate).toLocaleDateString() : 'N/A'}
                            </TableCell>
                            <TableCell>
                              ${(price.price / ingredient.conversionRatio).toFixed(4)}
                            </TableCell>
                            <TableCell>
                              <Button 
                                size="small" 
                                variant={price.supermarket === selectedSupermarketId ? "contained" : "outlined"}
                                onClick={() => setSelectedSupermarketId(price.supermarket)}
                              >
                                {price.supermarket === selectedSupermarketId ? 'Selected' : 'Show History'}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  
                  {/* Price History Chart */}
                  {selectedSupermarketId && (
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Price History for {getSupermarketName(selectedSupermarketId)}
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      
                      {priceHistoryLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                          <CircularProgress />
                        </Box>
                      ) : priceHistory.length > 0 ? (
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={8}>
                            <ResponsiveContainer width="100%" height={300}>
                              <LineChart data={getPriceChartData()}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis 
                                  domain={['auto', 'auto']}
                                  tickFormatter={(value) => `$${value}`}
                                />
                                <Tooltip formatter={(value) => [`$${value}`, 'Price']} />
                                <Legend />
                                <Line 
                                  type="monotone" 
                                  dataKey="price" 
                                  stroke="#4caf50" 
                                  activeDot={{ r: 8 }} 
                                  name={`Price (${ingredient.currency})`}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <Card>
                              <CardContent>
                                <Typography variant="h6" gutterBottom>
                                  Price Trend
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                  {priceChangeInfo.increasing ? (
                                    <TrendingUpIcon color="error" sx={{ mr: 1 }} />
                                  ) : (
                                    <TrendingDownIcon color="success" sx={{ mr: 1 }} />
                                  )}
                                  <Typography variant="body1">
                                    {priceChangeInfo.change > 0 ? '+' : ''}
                                    ${priceChangeInfo.change} ({priceChangeInfo.change > 0 ? '+' : ''}
                                    {priceChangeInfo.percent}%)
                                  </Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary">
                                  {priceChangeInfo.increasing 
                                    ? 'Prices are trending upward. Consider stocking up soon.' 
                                    : 'Prices are stable or decreasing. Good time to buy.'}
                                </Typography>
                              </CardContent>
                            </Card>
                            
                            <Timeline sx={{ mt: 2 }}>
                              {priceHistory.slice(0, 3).map((item, index) => (
                                <TimelineItem key={index}>
                                  <TimelineOppositeContent sx={{ flex: 0.2 }}>
                                    {new Date(item.date).toLocaleDateString('en-AU', { 
                                      day: '2-digit', 
                                      month: 'short' 
                                    })}
                                  </TimelineOppositeContent>
                                  <TimelineSeparator>
                                    <TimelineDot color="primary">
                                      <LocalOfferIcon />
                                    </TimelineDot>
                                    {index < 2 && <TimelineConnector />}
                                  </TimelineSeparator>
                                  <TimelineContent>
                                    ${item.price.toFixed(2)}
                                  </TimelineContent>
                                </TimelineItem>
                              ))}
                            </Timeline>
                          </Grid>
                        </Grid>
                      ) : (
                        <Typography variant="body1" color="text.secondary">
                          No price history available for this supermarket.
                        </Typography>
                      )}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          )}
          
          {/* Recipes Using This Ingredient */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <RestaurantIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    Recipes Using This Ingredient
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                {recipesLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                  </Box>
                ) : recipesUsingIngredient.length === 0 ? (
                  <Typography variant="body1" color="text.secondary">
                    This ingredient is not used in any recipes yet.
                  </Typography>
                ) : (
                  <List>
                    {recipesUsingIngredient.map((recipe) => (
                      <ListItem
                        key={recipe._id}
                        component={Link}
                        to={`/recipes/${recipe._id}`}
                        sx={{ 
                          border: '1px solid', 
                          borderColor: 'divider',
                          borderRadius: 1,
                          mb: 1,
                          '&:hover': {
                            bgcolor: 'action.hover',
                            textDecoration: 'none'
                          }
                        }}
                      >
                        <ListItemText 
                          primary={recipe.name} 
                          secondary={
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <AttachMoneyIcon fontSize="small" />
                              <Typography variant="body2">
                                Cost per serving: ${recipe.costPerServing.toFixed(2)} AUD
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          {/* Notes Section */}
          {ingredient.notes && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Notes
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body1">
                    {ingredient.notes}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </Paper>
    </Container>
  );
};

export default IngredientDetail;
