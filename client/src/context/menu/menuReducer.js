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

const menuReducer = (state, action) => {
  switch (action.type) {
    case GET_MENUS:
      return {
        ...state,
        menus: action.payload,
        loading: false
      };
    case ADD_MENU:
      return {
        ...state,
        menus: [action.payload, ...state.menus],
        loading: false
      };
    case UPDATE_MENU:
      return {
        ...state,
        menus: state.menus.map(menu =>
          menu._id === action.payload._id ? action.payload : menu
        ),
        loading: false
      };
    case DELETE_MENU:
      return {
        ...state,
        menus: state.menus.filter(
          menu => menu._id !== action.payload
        ),
        loading: false
      };
    case SET_CURRENT_MENU:
      return {
        ...state,
        current: action.payload
      };
    case CLEAR_CURRENT_MENU:
      return {
        ...state,
        current: null
      };
    case ANALYZE_MENU_PROFITABILITY:
      return {
        ...state,
        analysis: action.payload,
        loading: false
      };
    case OCR_MENU:
      return {
        ...state,
        ocrResult: action.payload,
        loading: false
      };
    case EXPORT_MENU_PDF:
      return {
        ...state,
        pdfExport: action.payload,
        loading: false
      };
    case MENU_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    default:
      return state;
  }
};

export default menuReducer;