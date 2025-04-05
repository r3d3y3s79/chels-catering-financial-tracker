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
  OCR_PRICE_TAG,
  ENHANCED_OCR_SCAN,
  OPTIMIZE_SCAN_PERFORMANCE
} from '../types';

const ingredientReducer = (state, action) => {
  switch (action.type) {
    case GET_INGREDIENTS:
      return {
        ...state,
        ingredients: action.payload,
        loading: false
      };
    case ADD_INGREDIENT:
      return {
        ...state,
        ingredients: [action.payload, ...state.ingredients],
        loading: false
      };
    case UPDATE_INGREDIENT:
      return {
        ...state,
        ingredients: state.ingredients.map(ingredient =>
          ingredient._id === action.payload._id ? action.payload : ingredient
        ),
        loading: false
      };
    case DELETE_INGREDIENT:
      return {
        ...state,
        ingredients: state.ingredients.filter(
          ingredient => ingredient._id !== action.payload
        ),
        loading: false
      };
    case SET_CURRENT_INGREDIENT:
      return {
        ...state,
        current: action.payload
      };
    case CLEAR_CURRENT_INGREDIENT:
      return {
        ...state,
        current: null
      };
    case FILTER_INGREDIENTS:
      return {
        ...state,
        filtered: state.ingredients.filter(ingredient => {
          const regex = new RegExp(`${action.payload}`, 'gi');
          return (
            ingredient.name.match(regex) ||
            (ingredient.category && ingredient.category.match(regex)) ||
            (ingredient.supplier && ingredient.supplier.match(regex))
          );
        })
      };
    case CLEAR_FILTER:
      return {
        ...state,
        filtered: null
      };
    case SCAN_BARCODE:
      return {
        ...state,
        scanResult: action.payload,
        loading: false
      };
    case OCR_PRICE_TAG:
    case ENHANCED_OCR_SCAN:
      return {
        ...state,
        scanResult: action.payload,
        loading: false
      };
    case OPTIMIZE_SCAN_PERFORMANCE:
      return {
        ...state,
        performanceOptimized: true,
        loading: false
      };
    case INGREDIENT_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    default:
      return state;
  }
};

export default ingredientReducer;