import React, { useReducer } from 'react';
import axios from 'axios';
import MenuContext from './menuContext';
import menuReducer from './menuReducer';
import {
  GET_MENUS,
  ADD_MENU,
  DELETE_MENU,
  UPDATE_MENU,
  MENU_ERROR,
  SET_CURRENT_MENU,
  CLEAR_CURRENT_MENU,
  ANALYZE_MENU_PROFITABILITY,
  OCR_MENU,
  EXPORT_MENU_PDF
} from '../types';

const MenuState = props => {
  const initialState = {
    menus: [],
    current: null,
    analysis: null,
    ocrResult: null,
    pdfExport: null,
    error: null,
    loading: true
  };

  const [state, dispatch] = useReducer(menuReducer, initialState);

  // Get all menus
  const getMenus = async () => {
    try {
      const res = await axios.get('/api/menus');

      dispatch({
        type: GET_MENUS,
        payload: res.data
      });
    } catch (err) {
      dispatch({
        type: MENU_ERROR,
        payload: err.response?.data?.message || 'Error fetching menus'
      });
    }
  };

  // Add menu
  const addMenu = async menu => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    try {
      const res = await axios.post('/api/menus', menu, config);

      dispatch({
        type: ADD_MENU,
        payload: res.data
      });
    } catch (err) {
      dispatch({
        type: MENU_ERROR,
        payload: err.response?.data?.message || 'Error adding menu'
      });
    }
  };

  // Delete menu
  const deleteMenu = async id => {
    try {
      await axios.delete(`/api/menus/${id}`);

      dispatch({
        type: DELETE_MENU,
        payload: id
      });
    } catch (err) {
      dispatch({
        type: MENU_ERROR,
        payload: err.response?.data?.message || 'Error deleting menu'
      });
    }
  };

  // Update menu
  const updateMenu = async menu => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    try {
      const res = await axios.put(`/api/menus/${menu._id}`, menu, config);

      dispatch({
        type: UPDATE_MENU,
        payload: res.data
      });
    } catch (err) {
      dispatch({
        type: MENU_ERROR,
        payload: err.response?.data?.message || 'Error updating menu'
      });
    }
  };

  // Set current menu
  const setCurrentMenu = menu => {
    dispatch({
      type: SET_CURRENT_MENU,
      payload: menu
    });
  };

  // Clear current menu
  const clearCurrentMenu = () => {
    dispatch({ type: CLEAR_CURRENT_MENU });
  };

  // Analyze menu profitability
  const analyzeMenuProfitability = async id => {
    try {
      const res = await axios.get(`/api/menus/${id}/analysis`);

      dispatch({
        type: ANALYZE_MENU_PROFITABILITY,
        payload: res.data
      });
    } catch (err) {
      dispatch({
        type: MENU_ERROR,
        payload: err.response?.data?.message || 'Error analyzing menu profitability'
      });
    }
  };

  // OCR Menu
  const ocrMenu = async formData => {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    };

    try {
      const res = await axios.post('/api/menus/ocr', formData, config);

      dispatch({
        type: OCR_MENU,
        payload: res.data
      });
    } catch (err) {
      dispatch({
        type: MENU_ERROR,
        payload: err.response?.data?.message || 'Error processing menu image'
      });
    }
  };

  // Export menu as PDF
  const exportMenuPdf = async (menuId, options) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        },
        responseType: 'blob'
      };

      const res = await axios.post(`/api/menus/${menuId}/export-pdf`, options, config);
      
      // Create a blob URL and open it in a new tab
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      dispatch({
        type: EXPORT_MENU_PDF,
        payload: { success: true, url }
      });
      
      return url;
    } catch (err) {
      dispatch({
        type: MENU_ERROR,
        payload: err.response?.data?.message || 'Error exporting menu as PDF'
      });
      return null;
    }
  };

  return (
    <MenuContext.Provider
      value={{
        menus: state.menus,
        current: state.current,
        analysis: state.analysis,
        ocrResult: state.ocrResult,
        pdfExport: state.pdfExport,
        error: state.error,
        loading: state.loading,
        getMenus,
        addMenu,
        deleteMenu,
        updateMenu,
        setCurrentMenu,
        clearCurrentMenu,
        analyzeMenuProfitability,
        ocrMenu,
        exportMenuPdf
      }}
    >
      {props.children}
    </MenuContext.Provider>
  );
};

export default MenuState;