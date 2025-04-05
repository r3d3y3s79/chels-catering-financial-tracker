import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import Chip from '@mui/material/Chip';

import AuthContext from '../../context/auth/authContext';
import AlertContext from '../../context/alert/alertContext';

const Ingredients = () => {
  const authContext = useContext(AuthContext);
  const alertContext = useContext(AlertContext);
  const { setAlert } = alertContext;

  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredIngredients, setFilteredIngredients] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Load all ingredients
  useEffect(() => {
    const getIngredients = async () => {
      try {
        const res = await axios.get('/api/ingredients');
        setIngredients(res.data);
        setFilteredIngredients(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching ingredients:', err);
        setAlert('Failed to load ingredients', 'error');
        setLoading(false);
      }
    };

    const getCategories = async () => {
      try {
        const res = await axios.get('/api/ingredients/util/categories');
        setCategories(res.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    getIngredients();
    getCategories();
  }, [setAlert]);

  // Filter ingredients based on search term and category
  useEffect(() => {
    let results = ingredients;
    
    // Filter by search term
    if (searchTerm) {
      results = results.filter(ingredient => 
        ingredient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ingredient.description && ingredient.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (ingredient.supplier && ingredient.supplier.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Filter by category
    if (selectedCategory !== 'all') {
      results = results.filter(ingredient => ingredient.category === selectedCategory);
    }
    
    setFilteredIngredients(results);
  }, [ingredients, searchTerm, selectedCategory]);

  // Handle ingredient deletion
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this ingredient?')) {
      try {
        await axios.delete(`/api/ingredients/${id}`);
        setIngredients(ingredients.filter(ingredient => ingredient._id !== id));
        setAlert('Ingredient deleted successfully', 'success');
      } catch (err) {
        console.error('Error deleting ingredient:', err);
        setAlert('Failed to delete ingredient', 'error');
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Ingredients</Typography>
        <Box>
          <Button 
            component={Link}
            to="/ingredients/camera"
            variant="outlined" 
            startIcon={<PhotoCameraIcon />}
            sx={{ mr: 1 }}
          >
            Scan Price
          </Button>
          <Button 
            component={Link}
            to="/ingredients/barcode"
            variant="outlined" 
            startIcon={<QrCodeScannerIcon />}
            sx={{ mr: 1 }}
          >
            Scan Barcode
          </Button>
          <Button 
            component={Link}
            to="/ingredients/import"
            variant="outlined" 
            startIcon={<FileUploadIcon />}
            sx={{ mr: 1 }}
          >
            Import
          </Button>
          <Button 
            component={Link}
            to="/ingredients/new"
            variant="contained" 
            startIcon={<AddIcon />}
          >
            Add Ingredient
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Search Ingredients"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip 
              label="All" 
              onClick={() => setSelectedCategory('all')}
              color={selectedCategory === 'all' ? 'primary' : 'default'}
            />
            {categories.map(category => (
              <Chip 
                key={category}
                label={category.charAt(0).toUpperCase() + category.slice(1)}
                onClick={() => setSelectedCategory(category)}
                color={selectedCategory === category ? 'primary' : 'default'}
              />
            ))}
          </Box>
        </Grid>
      </Grid>

      {filteredIngredients.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 5 }}>
            <Typography variant="h6">No ingredients found</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {searchTerm || selectedCategory !== 'all' ? 
                'Try adjusting your search or filter criteria' : 
                'Start by adding your first ingredient'}
            </Typography>
            <Button 
              component={Link}
              to="/ingredients/new"
              variant="contained" 
              startIcon={<AddIcon />}
            >
              Add Ingredient
            </Button>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Purchase Price</TableCell>
                <TableCell>Purchase Unit</TableCell>
                <TableCell>Recipe Unit</TableCell>
                <TableCell>Cost per Recipe Unit</TableCell>
                <TableCell>In Stock</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredIngredients.map(ingredient => (
                <TableRow key={ingredient._id}>
                  <TableCell component="th" scope="row">
                    <Link to={`/ingredients/${ingredient._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <Box sx={{ fontWeight: 'bold', '&:hover': { textDecoration: 'underline' } }}>
                        {ingredient.name}
                      </Box>
                    </Link>
                  </TableCell>
                  <TableCell>
                    {ingredient.category.charAt(0).toUpperCase() + ingredient.category.slice(1)}
                  </TableCell>
                  <TableCell>${ingredient.purchasePrice.toFixed(2)}</TableCell>
                  <TableCell>{ingredient.purchaseUnit}</TableCell>
                  <TableCell>{ingredient.recipeUnit}</TableCell>
                  <TableCell>
                    ${(ingredient.purchasePrice / ingredient.conversionRatio).toFixed(4)}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={ingredient.inStock ? 'In Stock' : 'Out of Stock'}
                      color={ingredient.inStock ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      component={Link} 
                      to={`/ingredients/edit/${ingredient._id}`}
                      color="primary"
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleDelete(ingredient._id)}
                      color="error"
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default Ingredients;
