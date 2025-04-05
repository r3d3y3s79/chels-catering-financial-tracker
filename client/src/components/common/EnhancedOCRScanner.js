import React, { useState, useRef, useContext } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Slider,
  FormControlLabel,
  Switch,
  Divider,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip
} from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import FlashOffIcon from '@mui/icons-material/FlashOff';
import BrightnessAutoIcon from '@mui/icons-material/BrightnessAuto';
import BrightnessLowIcon from '@mui/icons-material/BrightnessLow';
import BrightnessHighIcon from '@mui/icons-material/BrightnessHigh';
import CropFreeIcon from '@mui/icons-material/CropFree';
import Webcam from 'react-webcam';
import axios from 'axios';
import UIContext from '../../context/ui/uiContext';

const EnhancedOCRScanner = ({ onScanComplete, scanType = 'receipt' }) => {
  const uiContext = useContext(UIContext);
  const { beginnerMode } = uiContext;
  
  const webcamRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [flash, setFlash] = useState(false);
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [autoEnhance, setAutoEnhance] = useState(true);
  const [batteryOptimized, setBatteryOptimized] = useState(true);
  const [processingQuality, setProcessingQuality] = useState(75);
  
  // Camera settings
  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: 'environment'
  };
  
  const capture = async () => {
    if (!webcamRef.current) return;
    
    setScanning(true);
    setError(null);
    setScanResult(null);
    
    try {
      // Capture image from webcam
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedImage(imageSrc);
      
      // Convert base64 image to blob for upload
      const base64Data = imageSrc.split(',')[1];
      const blob = await fetch(`data:image/jpeg;base64,${base64Data}`).then(res => res.blob());
      
      // Create form data for upload
      const formData = new FormData();
      formData.append('image', blob, 'capture.jpg');
      
      // Add processing parameters
      formData.append('autoEnhance', autoEnhance);
      formData.append('brightness', brightness);
      formData.append('contrast', contrast);
      formData.append('quality', processingQuality);
      formData.append('batteryOptimized', batteryOptimized);
      
      // Determine endpoint based on scan type
      let endpoint = '';
      switch (scanType) {
        case 'receipt':
          endpoint = '/api/purchases/receipt';
          break;
        case 'menu':
          endpoint = '/api/menus/enhanced-ocr';
          break;
        case 'ingredient':
          endpoint = '/api/ingredients/ocr';
          break;
        default:
          endpoint = '/api/purchases/receipt';
      }
      
      // Send to server for OCR processing
      const response = await axios.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setScanResult(response.data);
      
      // Call the callback with the result
      if (onScanComplete) {
        onScanComplete(response.data);
      }
    } catch (err) {
      console.error('OCR scanning error:', err);
      setError(err.response?.data?.message || 'Error processing image');
    } finally {
      setScanning(false);
    }
  };
  
  const retake = () => {
    setCapturedImage(null);
    setScanResult(null);
    setError(null);
  };
  
  const toggleFlash = () => {
    setFlash(!flash);
    // In a real implementation, this would control the device flash
  };
  
  const toggleBatteryOptimization = () => {
    setBatteryOptimized(!batteryOptimized);
  };
  
  const handleBrightnessChange = (event, newValue) => {
    setBrightness(newValue);
  };
  
  const handleContrastChange = (event, newValue) => {
    setContrast(newValue);
  };
  
  const handleQualityChange = (event, newValue) => {
    setProcessingQuality(newValue);
  };
  
  return (
    <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
      <Typography variant="h5" gutterBottom>
        Enhanced OCR Scanner
      </Typography>
      
      {beginnerMode && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            Position the {scanType === 'receipt' ? 'receipt' : scanType === 'menu' ? 'menu' : 'item'} in good lighting and hold the camera steady. 
            Use the enhancement controls below to improve image quality if needed.
          </Typography>
        </Alert>
      )}
      
      <Box sx={{ position: 'relative', mb: 2 }}>
        {!capturedImage ? (
          <>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              style={{ width: '100%', borderRadius: '8px' }}
            />
            <Box sx={{ 
              position: 'absolute', 
              top: 10, 
              right: 10, 
              backgroundColor: 'rgba(0,0,0,0.5)', 
              borderRadius: '50%',
              p: 0.5
            }}>
              <IconButton onClick={toggleFlash} size="small" sx={{ color: 'white' }}>
                {flash ? <FlashOnIcon /> : <FlashOffIcon />}
              </IconButton>
            </Box>
          </>
        ) : (
          <Box sx={{ position: 'relative' }}>
            <img 
              src={capturedImage} 
              alt="Captured" 
              style={{ width: '100%', borderRadius: '8px' }} 
            />
            {scanning && (
              <Box sx={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: 'rgba(0,0,0,0.3)',
                borderRadius: '8px'
              }}>
                <CircularProgress color="primary" />
              </Box>
            )}
          </Box>
        )}
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {!capturedImage ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={capture} 
            startIcon={<CameraAltIcon />}
            size="large"
          >
            Capture Image
          </Button>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
          <Button 
            variant="outlined" 
            onClick={retake}
            disabled={scanning}
          >
            Retake
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={capture} 
            disabled={scanning}
          >
            {scanning ? <CircularProgress size={24} /> : 'Process Image'}
          </Button>
        </Box>
      )}
      
      <Divider sx={{ mb: 2 }} />
      
      <Typography variant="subtitle1" gutterBottom>
        Image Enhancement Settings
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={autoEnhance}
                onChange={() => setAutoEnhance(!autoEnhance)}
                color="primary"
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <BrightnessAutoIcon sx={{ mr: 1 }} />
                <Typography>Auto-enhance image</Typography>
              </Box>
            }
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Box sx={{ px: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <BrightnessLowIcon sx={{ mr: 1 }} />
              <Typography id="brightness-slider" gutterBottom>
                Brightness
              </Typography>
            </Box>
            <Slider
              value={brightness}
              onChange={handleBrightnessChange}
              aria-labelledby="brightness-slider"
              min={-100}
              max={100}
              disabled={autoEnhance}
            />
          </Box>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Box sx={{ px: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <BrightnessHighIcon sx={{ mr: 1 }} />
              <Typography id="contrast-slider" gutterBottom>
                Contrast
              </Typography>
            </Box>
            <Slider
              value={contrast}
              onChange={handleContrastChange}
              aria-labelledby="contrast-slider"
              min={-100}
              max={100}
              disabled={autoEnhance}
            />
          </Box>
        </Grid>
        
        <Grid item xs={12}>
          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle1" gutterBottom>
            Performance Settings
          </Typography>
        </Grid>
        
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={batteryOptimized}
                onChange={toggleBatteryOptimization}
                color="primary"
              />
            }
            label="Battery optimization mode"
          />
          <Typography variant="body2" color="text.secondary">
            {batteryOptimized 
              ? 'Reduces power consumption but may affect recognition quality' 
              : 'Maximum recognition quality but higher battery usage'}
          </Typography>
        </Grid>
        
        <Grid item xs={12}>
          <Box sx={{ px: 1 }}>
            <Typography id="quality-slider" gutterBottom>
              Processing Quality: {processingQuality}%
            </Typography>
            <Slider
              value={processingQuality}
              onChange={handleQualityChange}
              aria-labelledby="quality-slider"
              min={25}
              max={100}
              step={25}
              marks
              valueLabelDisplay="auto"
            />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ px: 1 }}>
            Higher quality provides better results but uses more processing power
          </Typography>
        </Grid>
      </Grid>
      
      {scanResult && (
        <Box sx={{ mt: 3 }}>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="subtitle1" gutterBottom>
            Scan Results
          </Typography>
          <Card variant="outlined">
            <CardContent>
              {scanType === 'receipt' && scanResult.items && (
                <>
                  <Typography variant="h6" gutterBottom>
                    Detected Items: {scanResult.items.length}
                  </Typography>
                  {scanResult.items.map((item, index) => (
                    <Box key={index} sx={{ mb: 1 }}>
                      <Typography variant="body1">
                        {item.name}: ${item.price.toFixed(2)}
                      </Typography>
                    </Box>
                  ))}
                  {scanResult.total && (
                    <Typography variant="h6" sx={{ mt: 2 }}>
                      Total: ${scanResult.total.toFixed(2)}
                    </Typography>
                  )}
                </>
              )}
              
              {scanType === 'menu' && scanResult.parsedItems && (
                <>
                  <Typography variant="h6" gutterBottom>
                    Detected Menu Items: {scanResult.parsedItems.length}
                  </Typography>
                  {scanResult.parsedItems.map((item, index) => (
                    <Box key={index} sx={{ mb: 1 }}>
                      <Typography variant="body1">
                        {item.name}: ${item.price.toFixed(2)}
                      </Typography>
                      {item.description && (
                        <Typography variant="body2" color="text.secondary">
                          {item.description}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </>
              )}
              
              {scanType === 'ingredient' && scanResult.ingredient && (
                <>
                  <Typography variant="h6" gutterBottom>
                    Detected Ingredient
                  </Typography>
                  <Typography variant="body1">
                    Name: {scanResult.ingredient.name}
                  </Typography>
                  <Typography variant="body1">
                    Price: ${scanResult.ingredient.price.toFixed(2)}
                  </Typography>
                  {scanResult.ingredient.quantity && (
                    <Typography variant="body1">
                      Quantity: {scanResult.ingredient.quantity} {scanResult.ingredient.unit}
                    </Typography>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </Box>
      )}
    </Paper>
  );
};

export default EnhancedOCRScanner;