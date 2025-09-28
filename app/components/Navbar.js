'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
//789789789
const Navbar = () => {
  const { colors, actions } = useApp();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Home', href: '#home' },
    { name: 'Trending', href: '#trending' },
    { name: 'Categories', href: '#categories' },
    { name: 'Leaderboard', href: '#leaderboard' },
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-opacity-95 backdrop-blur-md shadow-lg' 
          : 'bg-opacity-80'
      }`}
      style={{ 
        backgroundColor: isScrolled 
          ? colors.background.modal 
          : colors.background.primary + '80'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-bold flex">
              <span style={{ color: colors.text.primary }}>P</span>
              <span 
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: colors.primary.gradient }}
              >
                X
              </span>
              <span style={{ color: colors.text.primary }}>A</span>
            </div>
            <div className="text-sm font-medium" style={{ color: colors.text.secondary }}>
              PrediX Algo
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:scale-105"
                  style={{ 
                    color: colors.text.secondary,
                    ':hover': {
                      color: colors.text.accent,
                      backgroundColor: colors.interactive.hover
                    }
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = colors.text.accent;
                    e.target.style.backgroundColor = colors.interactive.hover;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = colors.text.secondary;
                    e.target.style.backgroundColor = 'transparent';
                  }}
                >
                  {item.name}
                </a>
              ))}
            </div>
          </div>

          {/* Add Prediction Button */}
          <div className="hidden md:block">
            <button
              onClick={actions.toggleAddPredictionModal}
              className="relative px-6 py-2 rounded-full font-medium text-sm transition-all duration-300 hover:scale-105 hover:shadow-lg group overflow-hidden"
              style={{ 
                background: colors.primary.gradient,
                color: colors.text.primary
              }}
            >
              <span className="relative z-10 flex items-center space-x-2">
                <svg 
                  className="w-4 h-4" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 4v16m8-8H4" 
                  />
                </svg>
                <span>New Prediction</span>
              </span>
              <div 
                className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"
              />
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md transition-colors duration-200"
              style={{ 
                color: colors.text.secondary,
                backgroundColor: isMobileMenuOpen ? colors.interactive.active : 'transparent'
              }}
            >
              <svg 
                className="h-6 w-6" 
                stroke="currentColor" 
                fill="none" 
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M6 18L18 6M6 6l12 12" 
                  />
                ) : (
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4 6h16M4 12h16M4 18h16" 
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div 
        className={`md:hidden transition-all duration-300 overflow-hidden ${
          isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
        style={{ backgroundColor: colors.background.secondary }}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
              style={{ color: colors.text.secondary }}
              onMouseEnter={(e) => {
                e.target.style.color = colors.text.accent;
                e.target.style.backgroundColor = colors.interactive.hover;
              }}
              onMouseLeave={(e) => {
                e.target.style.color = colors.text.secondary;
                e.target.style.backgroundColor = 'transparent';
              }}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.name}
            </a>
          ))}
          
          {/* Mobile Add Prediction Button */}
          <button
            onClick={() => {
              actions.toggleAddPredictionModal();
              setIsMobileMenuOpen(false);
            }}
            className="w-full mt-4 px-4 py-2 rounded-full font-medium text-sm transition-all duration-300"
            style={{ 
              background: colors.primary.gradient,
              color: colors.text.primary
            }}
          >
            <span className="flex items-center justify-center space-x-2">
              <svg 
                className="w-4 h-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 4v16m8-8H4" 
                />
              </svg>
              <span>New Prediction</span>
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;