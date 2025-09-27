'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BetCard from './components/BetCard';
import AddBetModal from './components/AddBetModal';

export default function Home() {
  const { bets, loading, error, colors } = useApp();
  const [filteredBets, setFilteredBets] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let filtered = bets;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(bet => bet.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(bet => 
        bet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bet.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bet.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredBets(filtered);
  }, [bets, selectedCategory, searchTerm]);

  const categories = ['all', 'Technology', 'Cryptocurrency', 'Sports', 'Politics', 'Entertainment', 'Science', 'Economics', 'Space', 'Automotive', 'Health'];

  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: colors.background.primary }}
    >
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <h1 
              className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent"
              style={{ backgroundImage: colors.primary.gradient }}
            >
              Predict the Future
            </h1>
            <p 
              className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto"
              style={{ color: colors.text.secondary }}
            >
              Join the world's most advanced prediction market. Create bets, vote on outcomes, and discover what the collective intelligence thinks about tomorrow.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto mb-12">
              <div className="text-center">
                <div 
                  className="text-3xl font-bold mb-2"
                  style={{ color: colors.text.accent }}
                >
                  {bets.length}
                </div>
                <div style={{ color: colors.text.muted }}>
                  Active Predictions
                </div>
              </div>
              <div className="text-center">
                <div 
                  className="text-3xl font-bold mb-2"
                  style={{ color: colors.text.accent }}
                >
                  {bets.reduce((total, bet) => total + bet.totalVotes, 0)}
                </div>
                <div style={{ color: colors.text.muted }}>
                  Total Votes
                </div>
              </div>
              <div className="text-center">
                <div 
                  className="text-3xl font-bold mb-2"
                  style={{ color: colors.text.accent }}
                >
                  {categories.length - 1}
                </div>
                <div style={{ color: colors.text.muted }}>
                  Categories
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-md mx-auto">
              <input
                type="text"
                placeholder="Search predictions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-12 rounded-full border transition-all duration-200 focus:outline-none focus:ring-2"
                style={{ 
                  backgroundColor: colors.background.card,
                  borderColor: colors.interactive.border,
                  color: colors.text.primary
                }}
              />
              <svg 
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5"
                style={{ color: colors.text.muted }}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 ${
                  selectedCategory === category ? 'shadow-lg' : ''
                }`}
                style={{ 
                  backgroundColor: selectedCategory === category 
                    ? colors.primary.cyan + '20' 
                    : colors.background.card,
                  color: selectedCategory === category 
                    ? colors.primary.cyan 
                    : colors.text.secondary,
                  border: `1px solid ${selectedCategory === category 
                    ? colors.primary.cyan 
                    : colors.interactive.border}`
                }}
              >
                {category === 'all' ? 'All Categories' : category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Bets Grid */}
      <section className="pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div 
                className="animate-spin rounded-full h-12 w-12 border-b-2"
                style={{ borderColor: colors.primary.cyan }}
              />
            </div>
          ) : error ? (
            <div 
              className="text-center py-16 px-4 rounded-lg"
              style={{ 
                backgroundColor: colors.status.error + '20',
                color: colors.status.error
              }}
            >
              <p className="text-lg font-medium mb-2">Error loading predictions</p>
              <p className="text-sm">{error}</p>
            </div>
          ) : filteredBets.length === 0 ? (
            <div className="text-center py-16">
              <div 
                className="text-6xl mb-4"
                style={{ color: colors.text.muted }}
              >
                🔮
              </div>
              <h3 
                className="text-xl font-medium mb-2"
                style={{ color: colors.text.primary }}
              >
                No predictions found
              </h3>
              <p style={{ color: colors.text.muted }}>
                {searchTerm || selectedCategory !== 'all' 
                  ? 'Try adjusting your filters or search terms.'
                  : 'Be the first to create a prediction!'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBets.map(bet => (
                <BetCard key={bet.id} bet={bet} />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
      <AddBetModal />
    </div>
  );
}
