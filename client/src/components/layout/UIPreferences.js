import React, { useContext, useState } from 'react';
import {
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Paper,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Tooltip,
  Alert,
  Grid
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SettingsIcon from '@mui/icons-material/Settings';
import UIContext from '../../context/ui/uiContext';

const UIPreferences = () => {
  const uiContext = useContext(UIContext);
  const { beginnerMode, preferences, setPreference, toggleBeginnerMode } = uiContext;
  
  const [showHelp, setShowHelp] = useState(false);
  
  const handleThemeChange = (e) => {
    setPreference('theme', e.target.value);
  };
  
  const handleDefaultViewChange = (e) => {
    setPreference('defaultView', e.target.value);
  };
  
  const handleToggleCompactMode = () => {
    setPreference('compactMode', !preferences.compactMode);
  };
  
  const handleToggleShowCosts = () => {
    setPreference('showCostsByDefault', !preferences.showCostsByDefault);
  };
  
  const handleToggleAdvancedFeatures = () => {
    setPreference('showAdvancedFeatures', !preferences.showAdvancedFeatures);
  };
  
  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <SettingsIcon sx={{ mr: 1 }} />
        <Typography variant="h5">User Interface Preferences</Typography>
      </Box>
      <Divider sx={{ mb: 3 }} />
      
      {showHelp && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2" gutterBottom>
            <strong>Beginner Mode:</strong> Simplifies the interface and provides more guidance.
          </Typography>
          <Typography variant="body2" gutterBottom>
            <strong>Theme:</strong> Choose between light and dark color schemes.
          </Typography>
          <Typography variant="body2" gutterBottom>
            <strong>Default View:</strong> Set your preferred initial view for listings.
          </Typography>
          <Typography variant="body2" gutterBottom>
            <strong>Compact Mode:</strong> Reduces spacing to show more content on screen.
          </Typography>
          <Typography variant="body2">
            <strong>Show Costs by Default:</strong> Automatically display cost information in menus and recipes.
          </Typography>
        </Alert>
      )}
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={beginnerMode}
                  onChange={toggleBeginnerMode}
                  color="primary"
                />
              }
              label="Beginner Mode"
            />
            <Tooltip title="Toggle help information">
              <Button 
                variant="text" 
                size="small" 
                onClick={() => setShowHelp(!showHelp)}
                startIcon={<HelpOutlineIcon />}
              >
                Help
              </Button>
            </Tooltip>
          </Box>
          <Typography variant="body2" color="text.secondary">
            {beginnerMode 
              ? 'Simplified interface with additional guidance' 
              : 'Advanced interface with all features enabled'}
          </Typography>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel id="theme-select-label">Theme</InputLabel>
            <Select
              labelId="theme-select-label"
              id="theme-select"
              value={preferences.theme}
              label="Theme"
              onChange={handleThemeChange}
            >
              <MenuItem value="light">Light</MenuItem>
              <MenuItem value="dark">Dark</MenuItem>
              <MenuItem value="system">System Default</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel id="view-select-label">Default View</InputLabel>
            <Select
              labelId="view-select-label"
              id="view-select"
              value={preferences.defaultView}
              label="Default View"
              onChange={handleDefaultViewChange}
            >
              <MenuItem value="list">List View</MenuItem>
              <MenuItem value="grid">Grid View</MenuItem>
              <MenuItem value="table">Table View</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <FormControlLabel
            control={
              <Switch
                checked={preferences.compactMode}
                onChange={handleToggleCompactMode}
                color="primary"
              />
            }
            label="Compact Mode"
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <FormControlLabel
            control={
              <Switch
                checked={preferences.showCostsByDefault}
                onChange={handleToggleShowCosts}
                color="primary"
              />
            }
            label="Show Costs by Default"
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <FormControlLabel
            control={
              <Switch
                checked={preferences.showAdvancedFeatures}
                onChange={handleToggleAdvancedFeatures}
                color="primary"
              />
            }
            label="Show Advanced Features"
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default UIPreferences;