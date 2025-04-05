import React, { useState, useEffect, useContext, createContext } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  CircularProgress,
  Chip,
  IconButton,
  Collapse,
  Badge
} from '@mui/material';
import SyncIcon from '@mui/icons-material/Sync';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningIcon from '@mui/icons-material/Warning';
import UIContext from '../../context/ui/uiContext';

// Create context for offline functionality
export const OfflineContext = createContext();

const OfflineManager = () => {
  const uiContext = useContext(UIContext);
  const { beginnerMode } = uiContext;
  
  const [offlineMode, setOfflineMode] = useState(false);
  const [pendingChanges, setPendingChanges] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [syncError, setSyncError] = useState(null);
  const [expanded, setExpanded] = useState(false);
  
  // Check if localStorage is available
  const isLocalStorageAvailable = () => {
    try {
      const testKey = '__test__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      console.error('localStorage is not available:', e);
      return false;
    }
  };

  // Check connection status
  useEffect(() => {
    const checkConnection = () => {
      const isOnline = navigator.onLine;
      setOfflineMode(!isOnline);
      
      if (!isOnline) {
        // Load any pending changes from localStorage
        loadPendingChanges();
      } else if (pendingChanges.length > 0) {
        // Auto-sync when coming back online
        syncChanges();
      }
    };
    
    // Initial check
    checkConnection();
    
    // Set up event listeners for online/offline status
    window.addEventListener('online', checkConnection);
    window.addEventListener('offline', checkConnection);
    
    // Clean up
    return () => {
      window.removeEventListener('online', checkConnection);
      window.removeEventListener('offline', checkConnection);
    };
  }, []);
  
  // Load pending changes from localStorage
  const loadPendingChanges = () => {
    if (!isLocalStorageAvailable()) {
      console.warn('localStorage is not available, offline functionality will be limited');
      return;
    }
    
    try {
      const storedChanges = localStorage.getItem('pendingChanges');
      if (storedChanges) {
        setPendingChanges(JSON.parse(storedChanges));
      } else {
        setPendingChanges([]);
      }
      
      const lastSync = localStorage.getItem('lastSyncTime');
      if (lastSync) {
        setLastSyncTime(new Date(parseInt(lastSync)));
      }
    } catch (error) {
      console.error('Error loading pending changes:', error);
      setSyncError('Failed to load pending changes. Local storage may be corrupted.');
    }
  };
  
  // Sync changes with the server
  const syncChanges = async () => {
    if (pendingChanges.length === 0) return;
    if (!navigator.onLine) {
      setSyncError('Cannot sync while offline. Please check your internet connection.');
      return;
    }
    if (!isLocalStorageAvailable()) {
      setSyncError('Local storage is not available. Cannot sync changes.');
      return;
    }
    
    setSyncing(true);
    setSyncError(null);
    
    try {
      // Here you would normally make API calls to sync each change
      // For now, we'll simulate it with a delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Process each pending change in order
      for (const change of pendingChanges) {
        // Here you would make the actual API call based on change.type
        // e.g., if (change.type === 'create') { api.createEntity(change.data); }
        console.log(`Syncing change: ${change.type} - ${change.entityName || 'unnamed'}`);
      }
      
      // Clear pending changes after successful sync
      setPendingChanges([]);
      localStorage.removeItem('pendingChanges');
      
      const now = new Date();
      setLastSyncTime(now);
      localStorage.setItem('lastSyncTime', now.getTime().toString());
    } catch (error) {
      console.error('Sync error:', error);
      setSyncError('Failed to sync changes. Please try again.');
    } finally {
      setSyncing(false);
    }
  };
  
  // Add a change to the pending queue
  const addPendingChange = (change) => {
    try {
      const updatedChanges = [...pendingChanges, { ...change, timestamp: Date.now() }];
      setPendingChanges(updatedChanges);
      localStorage.setItem('pendingChanges', JSON.stringify(updatedChanges));
      return true;
    } catch (error) {
      console.error('Error adding pending change:', error);
      return false;
    }
  };
  
  // Remove a pending change
  const removePendingChange = (index) => {
    try {
      const updatedChanges = pendingChanges.filter((_, i) => i !== index);
      setPendingChanges(updatedChanges);
      localStorage.setItem('pendingChanges', JSON.stringify(updatedChanges));
      return true;
    } catch (error) {
      console.error('Error removing pending change:', error);
      return false;
    }
  };
  
  // Toggle expanded view
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  
  return (
    <OfflineContext.Provider value={{ 
      offlineMode, 
      pendingChanges, 
      addPendingChange, 
      removePendingChange, 
      syncChanges, 
      lastSyncTime,
      syncing
    }}>
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {offlineMode ? (
            <CloudOffIcon color="warning" sx={{ mr: 1 }} />
          ) : (
            <CloudDoneIcon color="success" sx={{ mr: 1 }} />
          )}
          <Typography variant="h5">
            Offline Manager
          </Typography>
        </Box>
        <Badge badgeContent={pendingChanges.length} color="error" invisible={pendingChanges.length === 0}>
          <IconButton onClick={toggleExpanded}>
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Badge>
      </Box>
      
      <Collapse in={expanded}>
        {beginnerMode && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              The Offline Manager allows you to continue working when your internet connection is unavailable. 
              Changes made offline will be synchronized when you reconnect.
            </Typography>
          </Alert>
        )}
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" gutterBottom>
            Status: <Chip 
              label={offlineMode ? 'Offline' : 'Online'} 
              color={offlineMode ? 'warning' : 'success'} 
              size="small" 
              icon={offlineMode ? <CloudOffIcon /> : <CloudDoneIcon />}
            />
          </Typography>
          
          {lastSyncTime && (
            <Typography variant="body2" color="text.secondary">
              Last synchronized: {lastSyncTime.toLocaleString()}
            </Typography>
          )}
        </Box>
        
        {pendingChanges.length > 0 && (
          <>
            <Typography variant="subtitle1" gutterBottom>
              Pending Changes ({pendingChanges.length})
            </Typography>
            <List dense>
              {pendingChanges.map((change, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <Divider component="li" />}
                  <ListItem
                    secondaryAction={
                      <IconButton edge="end" aria-label="delete" onClick={() => removePendingChange(index)}>
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <ListItemIcon>
                      {change.type === 'create' && <CloudOffIcon color="primary" />}
                      {change.type === 'update' && <CloudOffIcon color="secondary" />}
                      {change.type === 'delete' && <CloudOffIcon color="error" />}
                    </ListItemIcon>
                    <ListItemText
                      primary={change.entityName || 'Unnamed entity'}
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="text.primary">
                            {change.type.charAt(0).toUpperCase() + change.type.slice(1)}
                          </Typography>
                          {change.description && ` — ${change.description}`}
                          <Typography variant="caption" display="block" color="text.secondary">
                            {new Date(change.timestamp).toLocaleString()}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
            
            {syncError && (
              <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                {syncError}
              </Alert>
            )}
            
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={syncing ? <CircularProgress size={20} color="inherit" /> : <SyncIcon />}
                onClick={syncChanges}
                disabled={syncing || offlineMode || pendingChanges.length === 0}
              >
                {syncing ? 'Syncing...' : 'Sync Changes'}
              </Button>
            </Box>
          </>
        )}
        
        {pendingChanges.length === 0 && (
          <Box sx={{ py: 2, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No pending changes to synchronize.
            </Typography>
          </Box>
        )}
        
        {/* Menu Generation Section */}
        <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="subtitle1" gutterBottom>
            Menu Generation
          </Typography>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            You can generate printable menus even when offline. Changes will be synchronized when you reconnect.
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
            <Button 
              variant="outlined" 
              color="primary"
              disabled={offlineMode && pendingChanges.length > 5}
              fullWidth
              onClick={() => {
                // Add a pending change for menu generation without costs
                const menuChange = {
                  type: 'create',
                  entityName: 'Menu Export',
                  description: 'Generated menu without costs',
                  timestamp: Date.now()
                };
                addPendingChange(menuChange);
                // Here you would normally generate the menu
                // For now, just log it
                console.log('Generating menu without costs');
              }}
            >
              Generate Menu (No Costs)
            </Button>
            
            <Button 
              variant="outlined" 
              color="secondary"
              disabled={offlineMode && pendingChanges.length > 5}
              fullWidth
              onClick={() => {
                // Add a pending change for menu generation with costs
                const menuChange = {
                  type: 'create',
                  entityName: 'Menu Export',
                  description: 'Generated menu with costs',
                  timestamp: Date.now()
                };
                addPendingChange(menuChange);
                // Here you would normally generate the menu
                // For now, just log it
                console.log('Generating menu with costs');
              }}
            >
              Generate Menu (With Costs)
            </Button>
          </Box>
          
          {offlineMode && pendingChanges.length > 5 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <WarningIcon sx={{ mr: 1 }} />
                <Typography variant="body2">
                  Too many pending changes to generate menus offline. Please sync your changes when online.
                </Typography>
              </Box>
            </Alert>
          )}
        </Box>
      </Collapse>
    </Paper>
    </OfflineContext.Provider>
  );
};

export default OfflineManager;