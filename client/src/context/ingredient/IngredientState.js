import React, { useReducer } from 'react';
import axios from 'axios';
import IngredientContext from './ingredientContext';
import ingredientReducer from './ingredientReducer';
import {
  GET_INGREDIENTS,
  ADD_INGREDIENT,
  DELETE_INGREDIENT,
  UPDATE_INGREDIENT,
  INGREDIENT_ERROR,
  SET_CURRENT_INGREDIENT,
  CLEAR_CURRENT_INGREDIENT,
  FILTER_INGREDIENTS,
  CLEAR_FILTER,
  SCAN_BARCODE,
  OCR_PRICE_TAG
} from '../types';

const IngredientState = props => {
  const initialState = {
    ingredients: [],
    current: null,
    filtered: null,
    error: null,
    loading: true,
    scanResult: null
  };

  const [state, dispatch] = useReducer(ingredientReducer, initialState);

  // Get Ingredients
  const getIngredients = async () => {
    try {
      const res = await axios.get('/api/ingredients');

      dispatch({
        type: GET_INGREDIENTS,
        payload: res.data
      });
    } catch (err) {
      dispatch({
        type: INGREDIENT_ERROR,
        payload: err.response.data.message
      });
    }
  };

  // Add Ingredient
  const addIngredient = async ingredient => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    try {
      const res = await axios.post('/api/ingredients', ingredient, config);

      dispatch({
        type: ADD_INGREDIENT,
        payload: res.data
      });
    } catch (err) {
      dispatch({
        type: INGREDIENT_ERROR,
        payload: err.response.data.message
      });
    }
  };

  // Delete Ingredient
  const deleteIngredient = async id => {
    try {
      await axios.delete(`/api/ingredients/${id}`);

      dispatch({
        type: DELETE_INGREDIENT,
        payload: id
      });
    } catch (err) {
      dispatch({
        type: INGREDIENT_ERROR,
        payload: err.response.data.message
      });
    }
  };

  // Update Ingredient
  const updateIngredient = async ingredient => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    try {
      const res = await axios.put(
        `/api/ingredients/${ingredient._id}`,
        ingredient,
        config
      );

      dispatch({
        type: UPDATE_INGREDIENT,
        payload: res.data
      });
    } catch (err) {
      dispatch({
        type: INGREDIENT_ERROR,
        payload: err.response.data.message
      });
    }
  };

  // Set Current Ingredient
  const setCurrentIngredient = ingredient => {
    dispatch({
      type: SET_CURRENT_INGREDIENT,
      payload: ingredient
    });
  };

  // Clear Current Ingredient
  const clearCurrentIngredient = () => {
    dispatch({ type: CLEAR_CURRENT_INGREDIENT });
  };

  // Filter Ingredients
  const filterIngredients = text => {
    dispatch({
      type: FILTER_INGREDIENTS,
      payload: text
    });
  };

  // Clear Filter
  const clearFilter = () => {
    dispatch({ type: CLEAR_FILTER });
  };

  // OCR Price Tag
  const ocrPriceTag = async formData => {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    };

    try {
      const res = await axios.post('/api/ingredients/ocr', formData, config);

      dispatch({
        type: OCR_PRICE_TAG,
        payload: res.data
      });

      return res.data;
    } catch (err) {
      dispatch({
        type: INGREDIENT_ERROR,
        payload: err.response.data.message
      });
    }
  };

  // Scan Barcode
  const scanBarcode = async barcode => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    try {
      const res = await axios.post('/api/ingredients/barcode', { barcode }, config);

      dispatch({
        type: SCAN_BARCODE,
        payload: res.data
      });

      return res.data;
    } catch (err) {
      dispatch({
        type: INGREDIENT_ERROR,
        payload: err.response.data.message
      });
    }
  };

  return (
    <IngredientContext.Provider
      value={{
        ingredients: state.ingredients,
        current: state.current,
        filtered: state.filtered,
        error: state.error,
        loading: state.loading,
        scanResult: state.scanResult,
        getIngredients,
        addIngredient,
        deleteIngredient,
        updateIngredient,
        setCurrentIngredient,
        clearCurrentIngredient,
        filterIngredients,
        clearFilter,
        ocrPriceTag,
        scanBarcode
      }}
    >
      {props.children}
    </IngredientContext.Provider>
  );
};

export default IngredientState;