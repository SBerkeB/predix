'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { initSocket, emitVoteUpdate, emitPredictionCreated, onVoteUpdated, onPredictionAdded, offVoteUpdated, offPredictionAdded } from '../../lib/socket';

// X-inspired color palette based on the PXA logo
export const colors = {
  // Primary brand colors
  primary: {
    cyan: '#00D4FF',
    purple: '#8B5CF6',
    gradient: 'linear-gradient(135deg, #00D4FF 0%, #8B5CF6 100%)',
  },
  // Background colors
  background: {
    primary: '#0F172A', // Dark navy blue
    secondary: '#1E293B',
    tertiary: '#334155',
    card: '#1E293B',
    modal: 'rgba(15, 23, 42, 0.95)',
  },
  // Text colors
  text: {
    primary: '#F8FAFC',
    secondary: '#CBD5E1',
    muted: '#64748B',
    accent: '#00D4FF',
  },
  // Status colors
  status: {
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
  },
  // Interactive colors
  interactive: {
    hover: 'rgba(0, 212, 255, 0.1)',
    active: 'rgba(0, 212, 255, 0.2)',
    border: '#334155',
    borderHover: '#00D4FF',
  }
};

// Helper functions for localStorage
const saveUserVotesToStorage = (userVotes) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('predix_user_votes', JSON.stringify(userVotes));
  }
};

const loadUserVotesFromStorage = () => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('predix_user_votes');
    return stored ? JSON.parse(stored) : {};
  }
  return {};
};

// Initial state
const initialState = {
  // Data
  predictions: [],
  categories: ['Technology', 'Sports', 'Politics', 'Entertainment', 'Science', 'Business'],
  // UI state
  isAddPredictionModalOpen: false,
  selectedPrediction: null,
  userVotes: {}, // Track which predictions the user has voted on: { predictionId: 'yes' | 'no' }
  loading: false,
  error: null,
};

// Action types
const actionTypes = {
  SET_PREDICTIONS: 'SET_PREDICTIONS',
  ADD_PREDICTION: 'ADD_PREDICTION',
  UPDATE_PREDICTION: 'UPDATE_PREDICTION',
  DELETE_PREDICTION: 'DELETE_PREDICTION',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  TOGGLE_ADD_PREDICTION_MODAL: 'TOGGLE_ADD_PREDICTION_MODAL',
  SET_SELECTED_PREDICTION: 'SET_SELECTED_PREDICTION',
  VOTE_ON_PREDICTION: 'VOTE_ON_PREDICTION',
  SET_USER_VOTE: 'SET_USER_VOTE',
};

// Reducer function
function appReducer(state, action) {
  switch (action.type) {
    case actionTypes.SET_PREDICTIONS:
      return { ...state, predictions: action.payload, loading: false };
    
    case actionTypes.ADD_PREDICTION:
      return { 
        ...state, 
        predictions: [...state.predictions, action.payload]
        // Remove automatic modal closing - let the component handle it
      };
    
    case actionTypes.UPDATE_PREDICTION:
      return {
        ...state,
        predictions: state.predictions.map(prediction => 
          prediction.id === action.payload.id ? action.payload : prediction
        )
      };
    
    case actionTypes.DELETE_PREDICTION:
      return {
        ...state,
        predictions: state.predictions.filter(prediction => prediction.id !== action.payload)
      };
    
    case actionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case actionTypes.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    
    case actionTypes.TOGGLE_ADD_PREDICTION_MODAL:
      return { 
        ...state, 
        isAddPredictionModalOpen: !state.isAddPredictionModalOpen 
      };
    
    case actionTypes.SET_SELECTED_PREDICTION:
      return { ...state, selectedPrediction: action.payload };
    
    case actionTypes.VOTE_ON_PREDICTION:
      return {
        ...state,
        predictions: state.predictions.map(prediction => {
          if (prediction.id === action.payload.predictionId) {
            const updatedVotes = { ...prediction.votes };
            updatedVotes[action.payload.voteType] += 1;
            
            // Calculate total votes based on prediction type
            let totalVotes;
            if (updatedVotes.player1 !== undefined && updatedVotes.player2 !== undefined) {
              // Player vs Player prediction
              totalVotes = updatedVotes.player1 + updatedVotes.player2;
            } else {
              // Yes/No prediction
              totalVotes = updatedVotes.yes + updatedVotes.no;
            }
            
            return { 
              ...prediction, 
              votes: updatedVotes,
              totalVotes: totalVotes
            };
          }
          return prediction;
        })
      };
    
    case actionTypes.SET_USER_VOTE:
      // Handle both single vote and bulk vote loading
      let newUserVotes;
      if (action.payload.userVotes) {
        // Bulk loading from localStorage
        newUserVotes = action.payload.userVotes;
      } else {
        // Single vote
        newUserVotes = {
          ...state.userVotes,
          [action.payload.predictionId]: action.payload.voteType
        };
      }
      
      // Only save to localStorage for single votes (not bulk loading)
      if (!action.payload.userVotes) {
        saveUserVotesToStorage(newUserVotes);
      }
      
      return {
        ...state,
        userVotes: newUserVotes
      };
    
    default:
      return state;
  }
}

// Create context
const AppContext = createContext();

// Context provider component
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Initialize Socket.IO and set up event listeners
  useEffect(() => {
    const socket = initSocket();

    // Listen for vote updates from other clients
    const handleVoteUpdate = (updatedPrediction) => {
      dispatch({ type: actionTypes.UPDATE_PREDICTION, payload: updatedPrediction });
    };

    // Listen for new predictions from other clients
    const handlePredictionAdded = (newPrediction) => {
      dispatch({ type: actionTypes.ADD_PREDICTION, payload: newPrediction });
    };

    onVoteUpdated(handleVoteUpdate);
    onPredictionAdded(handlePredictionAdded);

    // Cleanup listeners on unmount
    return () => {
      offVoteUpdated(handleVoteUpdate);
      offPredictionAdded(handlePredictionAdded);
    };
  }, []);

  // Load predictions and user votes on component mount
  useEffect(() => {
    loadPredictions();
    // Load user votes from localStorage
    const storedVotes = loadUserVotesFromStorage();
    if (Object.keys(storedVotes).length > 0) {
      dispatch({ 
        type: actionTypes.SET_USER_VOTE, 
        payload: { userVotes: storedVotes } 
      });
    }
  }, []);

  // API functions
  const loadPredictions = async () => {
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true });
      const response = await fetch('/api/predictions');
      if (!response.ok) throw new Error('Failed to load predictions');
      const predictions = await response.json();
      dispatch({ type: actionTypes.SET_PREDICTIONS, payload: predictions });
    } catch (error) {
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
    }
  };

  const addPrediction = async (predictionData) => {
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true });
      const response = await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(predictionData),
      });
      if (!response.ok) throw new Error('Failed to add prediction');
      const newPrediction = await response.json();
      dispatch({ type: actionTypes.ADD_PREDICTION, payload: newPrediction });
      dispatch({ type: actionTypes.SET_LOADING, payload: false });
      
      // Broadcast new prediction to other clients
      emitPredictionCreated(newPrediction);
      
      // Refresh the predictions list to ensure we have the latest data
      await loadPredictions();
    } catch (error) {
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
      dispatch({ type: actionTypes.SET_LOADING, payload: false });
      throw error; // Re-throw to let the modal handle it
    }
  };

  const voteOnPrediction = async (predictionId, voteType) => {
    // Check if user has already voted on this prediction
    if (state.userVotes[predictionId]) {
      dispatch({ type: actionTypes.SET_ERROR, payload: 'You have already voted on this prediction' });
      return;
    }

    try {
      // Optimistically update the UI first
      dispatch({ type: actionTypes.VOTE_ON_PREDICTION, payload: { predictionId, voteType } });
      dispatch({ type: actionTypes.SET_USER_VOTE, payload: { predictionId, voteType } });

      // Generate or get user ID for voting
      let userId = localStorage.getItem('predix_user_id');
      if (!userId) {
        userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('predix_user_id', userId);
      }

      const response = await fetch('/api/predictions/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ predictionId, voteType, userId }),
      });
      
      if (!response.ok) {
        // If API call fails, we need to revert the optimistic update
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to vote');
      }
      
      const result = await response.json();
      
      // Update with the actual server response to ensure consistency
      dispatch({ type: actionTypes.UPDATE_PREDICTION, payload: result.prediction });
      
      // Broadcast vote update to other clients
      emitVoteUpdate(result.prediction);
    } catch (error) {
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
      // TODO: Implement proper rollback of optimistic update
    }
  };

  const deletePrediction = async (predictionId) => {
    try {
      const response = await fetch(`/api/predictions/${predictionId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete prediction');
      dispatch({ type: actionTypes.DELETE_PREDICTION, payload: predictionId });
    } catch (error) {
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
    }
  };

  const toggleAddPredictionModal = () => {
   
    dispatch({ type: actionTypes.TOGGLE_ADD_PREDICTION_MODAL });
  };

  const setSelectedPrediction = (prediction) => {
    dispatch({ type: actionTypes.SET_SELECTED_PREDICTION, payload: prediction });
  };

  const clearError = () => {
    dispatch({ type: actionTypes.SET_ERROR, payload: null });
  };

  const value = {
    ...state,
    colors,
    actions: {
      loadPredictions,
      addPrediction,
      voteOnPrediction,
      deletePrediction,
      toggleAddPredictionModal,
      setSelectedPrediction,
      clearError,
    },
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

// Custom hook to use the context
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export default AppContext;