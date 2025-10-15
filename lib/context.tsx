'use client';

// lib/context.tsx
import React, { createContext, useContext, useReducer, useEffect, ReactNode, Dispatch } from 'react';
import { AppState, SearchQuery, UserPreferences } from './types';

type Action =
  | { type: 'SAVE_OPPORTUNITY'; payload: string }
  | { type: 'REMOVE_OPPORTUNITY'; payload: string }
  | { type: 'ADD_RECENT_SEARCH'; payload: SearchQuery }
  | { type: 'SET_PREFERENCES'; payload: Partial<UserPreferences> };

const initialState: AppState = {
  savedOpportunities: [],
  recentSearches: [],
  preferences: { view: 'grid', sort: 'difficulty' }
};

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SAVE_OPPORTUNITY':
      if (state.savedOpportunities.includes(action.payload)) {
        return state;
      }
      return {
        ...state,
        savedOpportunities: [...state.savedOpportunities, action.payload]
      };

    case 'REMOVE_OPPORTUNITY':
      return {
        ...state,
        savedOpportunities: state.savedOpportunities.filter(id => id !== action.payload)
      };

    case 'ADD_RECENT_SEARCH':
      return {
        ...state,
        recentSearches: [action.payload, ...state.recentSearches].slice(0, 5)
      };

    case 'SET_PREFERENCES':
      return {
        ...state,
        preferences: { ...state.preferences, ...action.payload }
      };

    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: Dispatch<Action>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('genai-explorer-state');
      if (saved) {
        const parsedState = JSON.parse(saved);
        dispatch({ type: 'SET_PREFERENCES', payload: parsedState.preferences || {} });
        parsedState.savedOpportunities?.forEach((id: string) => {
          dispatch({ type: 'SAVE_OPPORTUNITY', payload: id });
        });
      }
    } catch (error) {
      console.error('Error loading saved state:', error);
    }
  }, []);

  // Save state to localStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem('genai-explorer-state', JSON.stringify(state));
    } catch (error) {
      console.error('Error saving state:', error);
    }
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppState must be used within AppProvider');
  }
  return context;
}
