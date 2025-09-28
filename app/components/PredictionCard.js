'use client';

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

const PredictionCard = ({ prediction }) => {
  const { colors, actions, userVotes } = useApp();
  const [isVoting, setIsVoting] = useState(false);
  
  // Check if user has voted on this prediction
  const userVote = userVotes[prediction.id];
  const hasVoted = !!userVote;

  const handleVote = async (voteType) => {
    if (hasVoted || isVoting) return;
    
    setIsVoting(true);
    try {
      await actions.voteOnPrediction(prediction.id, voteType);
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setIsVoting(false);
    }
  };

  const getVotePercentage = (voteType) => {
    if (prediction.totalVotes === 0) return 0;
    return Math.round((prediction.votes[voteType] / prediction.totalVotes) * 100);
  };

  // Check if this is a player vs player prediction
  const isPlayerVsPrediction = prediction.votes.hasOwnProperty('player1') && prediction.votes.hasOwnProperty('player2');
  
  // Get vote options based on prediction type
  const getVoteOptions = () => {
    if (isPlayerVsPrediction) {
      return ['player1', 'player2'];
    }
    return ['yes', 'no'];
  };

  // Get vote label based on prediction type
  const getVoteLabel = (voteType) => {
    if (isPlayerVsPrediction) {
      if (voteType === 'player1') {
        return prediction.gameDetails?.player1Name || 'Player 1';
      } else if (voteType === 'player2') {
        return prediction.gameDetails?.player2Name || 'Player 2';
      }
    }
    return voteType === 'yes' ? 'Yes' : 'No';
  };

  // Get vote icon based on prediction type
  const getVoteIcon = (voteType) => {
    if (isPlayerVsPrediction) {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      );
    }
    
    if (voteType === 'yes') {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      );
    } else {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      );
    }
  };

  // Get vote color based on prediction type
  const getVoteColor = (voteType) => {
    if (isPlayerVsPrediction) {
      return voteType === 'player1' ? colors.status.info : colors.status.warning;
    }
    return voteType === 'yes' ? colors.status.success : colors.status.error;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const isExpired = new Date() > new Date(prediction.expiresAt);

  return (
    <div 
      className="rounded-xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group cursor-pointer border flex flex-col justify-between"
      style={{ 
        backgroundColor: colors.background.card,
        borderColor: colors.interactive.border,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = colors.interactive.borderHover;
        e.currentTarget.style.boxShadow = `0 20px 25px -5px rgba(0, 212, 255, 0.1), 0 10px 10px -5px rgba(0, 212, 255, 0.04)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = colors.interactive.border;
        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
      }}
    >
      {/* Header */}
     <div>
       <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div 
            className="px-3 py-1 rounded-full text-xs font-medium"
            style={{ 
              backgroundColor: colors.interactive.hover,
              color: colors.text.accent
            }}
          >
            {prediction.category}
          </div>
          {isExpired && (
            <div 
              className="px-3 py-1 rounded-full text-xs font-medium"
              style={{ 
                backgroundColor: colors.status.error + '20',
                color: colors.status.error
              }}
            >
              Expired
            </div>
          )}
        </div>
        <div className="text-sm" style={{ color: colors.text.muted }}>
          {prediction.totalVotes} votes
        </div>
      </div>

      {/* Title and Description */}
      <div className="mb-6">
        <h3 
          className="text-lg font-semibold mb-2 group-hover:text-opacity-90 transition-colors duration-200"
          style={{ color: colors.text.primary }}
        >
          {prediction.title}
        </h3>
        <p 
          className="text-sm leading-relaxed"
          style={{ color: colors.text.secondary }}
        >
          {prediction.description}
        </p>
      </div>
     </div>

      <div className=''>
        {/* Voting Section */}
      <div className="mb-6 ">
        <div className="flex space-x-3 mb-4">
          {getVoteOptions().map((voteType) => (
            <button
              key={voteType}
              onClick={() => handleVote(voteType)}
              disabled={isVoting || hasVoted || isExpired}
              className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
                isVoting || hasVoted || isExpired 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:scale-105 hover:shadow-md'
              }`}
              style={{ 
                backgroundColor: getVoteColor(voteType) + '20',
                color: getVoteColor(voteType),
                border: `1px solid ${getVoteColor(voteType)}40`
              }}
            >
              <span className="flex items-center justify-center space-x-2">
                {getVoteIcon(voteType)}
                <span>{getVoteLabel(voteType)} ({getVotePercentage(voteType)}%)</span>
              </span>
            </button>
          ))}
        </div>

        {/* Vote Progress Bar */}
        <div 
          className="w-full bg-gray-700 rounded-full h-2 overflow-hidden"
          style={{ backgroundColor: colors.background.tertiary }}
        >
          <div 
            className="h-full transition-all duration-500 ease-out"
            style={{ 
              width: `${getVotePercentage(getVoteOptions()[0])}%`,
              background: getVoteColor(getVoteOptions()[0])
            }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs">
        <div style={{ color: colors.text.muted }}>
          By {prediction.createdBy} • {formatDate(prediction.createdAt)}
        </div>
        <div style={{ color: colors.text.muted }}>
          Expires: {formatDate(prediction.expiresAt)}
        </div>
      </div>

      {/* Tags */}
      {prediction.tags && prediction.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {prediction.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 rounded text-xs"
              style={{ 
                backgroundColor: colors.interactive.hover,
                color: colors.text.secondary
              }}
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
     

      {/* Voting Feedback */}
      {hasVoted && (
        <div 
          className="mt-4 p-3 rounded-lg text-sm text-center"
          style={{ 
            backgroundColor: colors.status.success + '20',
            color: colors.status.success
          }}
        >
          ✓ You voted "{userVote.toUpperCase()}" on this prediction
        </div>
      )}
    </div>
     </div>
  );
};

export default PredictionCard;