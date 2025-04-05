import React, { useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Button,
  Box,
  Typography,
  FormControlLabel,
  Switch,
  Paper,
  CircularProgress,
  Divider,
  Alert,
  Card,
  CardContent,
  Grid,
  Checkbox,
  FormGroup
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import PrintIcon from '@mui/icons-material/Print';
import MenuContext from '../../context/menu/menuContext';
import UIContext from '../../context/ui/uiContext';
import axios from 'axios';

const MenuPdfExport = ({ menu }) => {
  const menuContext = useContext(MenuContext);
  const uiContext = useContext(UIContext);
  const { beginnerMode } = uiContext;
  
  const [showCosts, setShowCosts] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  
  // Initialize selectedItems with all menu items checked
  React.useEffect(() => {
    if (menu && menu.items) {
      setSelectedItems(menu.items.map(item => item._id));
    }
  }, [menu]);

  const handleToggleCosts = () => {
    setShowCosts(!showCosts);
  };

  const handleItemToggle = (itemId) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  const handleSelectAll = () => {
    if (menu && menu.items) {
      if (selectedItems.length === menu.items.length) {
        setSelectedItems([]);
      } else {
        setSelectedItems(menu.items.map(item => item._id));
      }
    }
  };

  const exportToPdf = async () => {
    if (!menu) return;
    
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const filteredItems = menu.items.filter(item => 
        selectedItems.includes(item._id)
      );
      
      const exportData = {
        menuId: menu._id,
        showCosts,
        items: filteredItems.map(item => item._id)
      };
      
      const res = await axios.post('/api/menus/export-pdf', exportData, {
        responseType: 'blob'
      });
      
      // Create a blob URL and open it in a new tab
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Failed to generate PDF. Please try again.');
      console.error('PDF generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!menu) return <CircularProgress />;

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
      <Typography variant="h5" gutterBottom>
        Export Menu as PDF
      </Typography>
      <Divider sx={{ mb: 2 }} />
      
      {beginnerMode && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Create a printable version of your menu. You can choose to include or exclude cost information.
        </Alert>
      )}
      
      <Box sx={{ mb: 3 }}>
        <FormControlLabel
          control={
            <Switch
              checked={showCosts}
              onChange={handleToggleCosts}
              color="primary"
            />
          }
          label="Include cost information"
        />
        <Typography variant="body2" color="text.secondary">
          {showCosts 
            ? 'Costs will be visible in the exported PDF (for your reference)' 
            : 'Costs will be hidden in the exported PDF (suitable for customers)'}
        </Typography>
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Select menu items to include:
        </Typography>
        <FormControlLabel
          control={
            <Checkbox
              checked={selectedItems.length === menu.items.length}
              indeterminate={selectedItems.length > 0 && selectedItems.length < menu.items.length}
              onChange={handleSelectAll}
            />
          }
          label="Select All"
        />
        <FormGroup>
          <Grid container spacing={2}>
            {menu.items.map(item => (
              <Grid item xs={12} sm={6} md={4} key={item._id}>
                <Card variant="outlined">
                  <CardContent>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedItems.includes(item._id)}
                          onChange={() => handleItemToggle(item._id)}
                        />
                      }
                      label={
                        <>
                          <Typography variant="subtitle2">{item.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Price: ${item.price.toFixed(2)}
                            {showCosts && ` | Cost: $${item.cost.toFixed(2)}`}
                          </Typography>
                        </>
                      }
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </FormGroup>
      </Box>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>PDF generated successfully!</Alert>}
      
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<PictureAsPdfIcon />}
          onClick={exportToPdf}
          disabled={loading || selectedItems.length === 0}
        >
          {loading ? <CircularProgress size={24} /> : 'Export as PDF'}
        </Button>
        <Button
          variant="outlined"
          startIcon={<PrintIcon />}
          onClick={() => window.print()}
          disabled={loading}
        >
          Print directly
        </Button>
      </Box>
    </Paper>
  );
};

export default MenuPdfExport;