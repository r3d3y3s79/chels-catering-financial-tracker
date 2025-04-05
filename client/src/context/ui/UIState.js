import React, { useReducer } from 'react';
import UIContext from './uiContext';
import uiReducer from './uiReducer';
import {
  SET_UI_PREFERENCE,
  TOGGLE_BEGINNER_MODE
} from '../types';

const UIState = props => {
  const initialState = {
    beginnerMode: false,
    preferences: {
      showAdvancedFeatures: true,
      defaultView: 'list',
      theme: 'light',
      compactMode: false,
      showCostsByDefault: true
    }
  };

  const [state, dispatch] = useReducer(uiReducer, initialState);

  // Set a UI preference
  const setPreference = (key, value) => {
    dispatch({
      type: SET_UI_PREFERENCE,
      payload: { key, value }
    });
  };

  // Toggle beginner mode
  const toggleBeginnerMode = () => {
    dispatch({
      type: TOGGLE_BEGINNER_MODE
    });
  };

  return (
    <UIContext.Provider
      value={{
        beginnerMode: state.beginnerMode,
        preferences: state.preferences,
        setPreference,
        toggleBeginnerMode
      }}
    >
      {props.children}
    </UIContext.Provider>
  );
};

export default UIState;