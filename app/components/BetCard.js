'use client';

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

const BetCard = ({ bet }) => {
  const { colors, actions, userVotes } = useApp();
  const [isVoting, setIsVoting] = useState(false);
  
  // Check if user has voted on this bet
  const userVote = userVotes[bet.id];
  const hasVoted = !!userVote;

  const handleVote = async (voteType) => {
    if (hasVoted || isVoting) return;
    
    setIsVoting(true);
    try {
      await actions.voteOnBet(bet.id, voteType);
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setIsVoting(false);
    }
  };

  const getVotePercentage = (voteType) => {
    if (bet.totalVotes === 0) return 0;
    return Math.round((bet.votes[voteType] / bet.totalVotes) * 100);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const isExpired = new Date() > new Date(bet.expiresAt);

  return (
    <div 
      className="rounded-xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group cursor-pointer border"
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
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div 
            className="px-3 py-1 rounded-full text-xs font-medium"
            style={{ 
              backgroundColor: colors.interactive.hover,
              color: colors.text.accent
            }}
          >
            {bet.category}
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
          {bet.totalVotes} votes
        </div>
      </div>

      {/* Title and Description */}
      <div className="mb-6">
        <h3 
          className="text-lg font-semibold mb-2 group-hover:text-opacity-90 transition-colors duration-200"
          style={{ color: colors.text.primary }}
        >
          {bet.title}
        </h3>
        <p 
          className="text-sm leading-relaxed"
          style={{ color: colors.text.secondary }}
        >
          {bet.description}
        </p>
      </div>

      {/* Voting Section */}
      <div className="mb-6">
        <div className="flex space-x-3 mb-4">
          <button
            onClick={() => handleVote('yes')}
            disabled={isVoting || hasVoted || isExpired}
            className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
              isVoting || hasVoted || isExpired 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:scale-105 hover:shadow-md'
            }`}
            style={{ 
              backgroundColor: colors.status.success + '20',
              color: colors.status.success,
              border: `1px solid ${colors.status.success}40`
            }}
          >
            <span className="flex items-center justify-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Yes ({getVotePercentage('yes')}%)</span>
            </span>
          </button>
          
          <button
            onClick={() => handleVote('no')}
            disabled={isVoting || hasVoted || isExpired}
            className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
              isVoting || hasVoted || isExpired 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:scale-105 hover:shadow-md'
            }`}
            style={{ 
              backgroundColor: colors.status.error + '20',
              color: colors.status.error,
              border: `1px solid ${colors.status.error}40`
            }}
          >
            <span className="flex items-center justify-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>No ({getVotePercentage('no')}%)</span>
            </span>
          </button>
        </div>

        {/* Vote Progress Bar */}
        <div 
          className="w-full bg-gray-700 rounded-full h-2 overflow-hidden"
          style={{ backgroundColor: colors.background.tertiary }}
        >
          <div 
            className="h-full transition-all duration-500 ease-out"
            style={{ 
              width: `${getVotePercentage('yes')}%`,
              background: colors.status.success
            }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs">
        <div style={{ color: colors.text.muted }}>
          By {bet.createdBy} • {formatDate(bet.createdAt)}
        </div>
        <div style={{ color: colors.text.muted }}>
          Expires: {formatDate(bet.expiresAt)}
        </div>
      </div>

      {/* Tags */}
      {bet.tags && bet.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {bet.tags.map((tag, index) => (
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
  );
};

export default BetCard;