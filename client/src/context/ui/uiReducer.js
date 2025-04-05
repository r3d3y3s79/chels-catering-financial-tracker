import {
  SET_UI_PREFERENCE,
  TOGGLE_BEGINNER_MODE
} from '../types';

const uiReducer = (state, action) => {
  switch (action.type) {
    case SET_UI_PREFERENCE:
      return {
        ...state,
        preferences: {
          ...state.preferences,
          [action.payload.key]: action.payload.value
        }
      };
    case TOGGLE_BEGINNER_MODE:
      return {
        ...state,
        beginnerMode: !state.beginnerMode
      };
    default:
      return state;
  }
};

export default uiReducer;