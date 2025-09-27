'use client';

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

const AddBetModal = () => {
  const { colors, isAddBetModalOpen, actions } = useApp();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    expiresAt: '',
    tags: '',
    createdBy: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const categories = [
    'Technology', 'Cryptocurrency', 'Sports', 'Politics', 
    'Entertainment', 'Science', 'Economics', 'Space', 
    'Automotive', 'Health'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 10) {
      newErrors.title = 'Title must be at least 10 characters';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    if (!formData.expiresAt) {
      newErrors.expiresAt = 'Expiration date is required';
    } else {
      const expirationDate = new Date(formData.expiresAt);
      const now = new Date();
      if (expirationDate <= now) {
        newErrors.expiresAt = 'Expiration date must be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const betData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        expiresAt: new Date(formData.expiresAt).toISOString()
      };
      
      await actions.addBet(betData);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        expiresAt: '',
        tags: '',
        createdBy: ''
      });
      
      actions.toggleAddBetModal();
    } catch (error) {
      console.error('Error adding bet:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      actions.toggleAddBetModal();
      setErrors({});
    }
  };

  if (!isAddBetModalOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{ backgroundColor: colors.background.modal }}
    >
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 transition-opacity"
          onClick={handleClose}
        />

        {/* Modal panel */}
        <div 
          className="inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
          style={{ backgroundColor: colors.background.card }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div 
            className="px-6 py-4 border-b"
            style={{ borderColor: colors.interactive.border }}
          >
            <div className="flex items-center justify-between">
              <h3 
                className="text-lg font-medium"
                style={{ color: colors.text.primary }}
              >
                Create New Prediction
              </h3>
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className="p-2 rounded-full transition-colors duration-200"
                style={{ color: colors.text.muted }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = colors.interactive.hover;
                  e.target.style.color = colors.text.primary;
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = colors.text.muted;
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
            {/* Title */}
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: colors.text.primary }}
              >
                Prediction Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="What do you predict will happen?"
                className="w-full px-3 py-2 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2"
                style={{ 
                  backgroundColor: colors.background.tertiary,
                  borderColor: errors.title ? colors.status.error : colors.interactive.border,
                  color: colors.text.primary,
                  focusRingColor: colors.primary.cyan
                }}
              />
              {errors.title && (
                <p className="mt-1 text-sm" style={{ color: colors.status.error }}>
                  {errors.title}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: colors.text.primary }}
              >
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Provide more details about your prediction..."
                rows={3}
                className="w-full px-3 py-2 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 resize-none"
                style={{ 
                  backgroundColor: colors.background.tertiary,
                  borderColor: errors.description ? colors.status.error : colors.interactive.border,
                  color: colors.text.primary
                }}
              />
              {errors.description && (
                <p className="mt-1 text-sm" style={{ color: colors.status.error }}>
                  {errors.description}
                </p>
              )}
            </div>

            {/* Category */}
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: colors.text.primary }}
              >
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2"
                style={{ 
                  backgroundColor: colors.background.tertiary,
                  borderColor: errors.category ? colors.status.error : colors.interactive.border,
                  color: colors.text.primary
                }}
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm" style={{ color: colors.status.error }}>
                  {errors.category}
                </p>
              )}
            </div>

            {/* Expiration Date */}
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: colors.text.primary }}
              >
                Expiration Date *
              </label>
              <input
                type="datetime-local"
                name="expiresAt"
                value={formData.expiresAt}
                onChange={handleInputChange}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full px-3 py-2 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2"
                style={{ 
                  backgroundColor: colors.background.tertiary,
                  borderColor: errors.expiresAt ? colors.status.error : colors.interactive.border,
                  color: colors.text.primary
                }}
              />
              {errors.expiresAt && (
                <p className="mt-1 text-sm" style={{ color: colors.status.error }}>
                  {errors.expiresAt}
                </p>
              )}
            </div>

            {/* Creator Name */}
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: colors.text.primary }}
              >
                Your Name (Optional)
              </label>
              <input
                type="text"
                name="createdBy"
                value={formData.createdBy}
                onChange={handleInputChange}
                placeholder="Anonymous"
                className="w-full px-3 py-2 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2"
                style={{ 
                  backgroundColor: colors.background.tertiary,
                  borderColor: colors.interactive.border,
                  color: colors.text.primary
                }}
              />
            </div>

            {/* Tags */}
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: colors.text.primary }}
              >
                Tags (Optional)
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="bitcoin, crypto, prediction (comma separated)"
                className="w-full px-3 py-2 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2"
                style={{ 
                  backgroundColor: colors.background.tertiary,
                  borderColor: colors.interactive.border,
                  color: colors.text.primary
                }}
              />
              <p className="mt-1 text-xs" style={{ color: colors.text.muted }}>
                Separate tags with commas
              </p>
            </div>

            {/* Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200"
                style={{ 
                  backgroundColor: colors.background.tertiary,
                  color: colors.text.secondary,
                  border: `1px solid ${colors.interactive.border}`
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  background: colors.primary.gradient,
                  color: colors.text.primary
                }}
              >
                {isSubmitting ? 'Creating...' : 'Create Prediction'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddBetModal;