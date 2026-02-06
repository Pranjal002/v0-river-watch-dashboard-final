'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { riverAPI } from '@/lib/api'; // Adjust path if your api file is named/located differently

interface AddRiverFormProps {
  onBack: () => void;
}

export default function AddRiverForm({ onBack }: AddRiverFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    code: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      
      // Use the riverAPI.create method
      const response = await riverAPI.create(
        formData.name.trim(),
        formData.location.trim(),
        formData.code.trim()
      );

      // If we reach here → request was successful (apiCall throws on error)
      setSuccess('River added successfully!');
      
      // Reset form
      setFormData({
        name: '',
        location: '',
        code: '',
      });

      // Optional: go back to list or previous screen after a short delay
      setTimeout(() => {
        onBack();
      }, 1500);

    } catch (err: any) {
      console.error('Failed to add river:', err);
      
      // Show user-friendly error message
      const errorMessage = err.message || 'Failed to add river. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-primary hover:text-primary/80 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <Card className="p-8">
        <h2 className="text-2xl font-bold text-foreground mb-6">Add New River</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
              River Name
            </label>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter river name"
              required
              disabled={loading}
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-foreground mb-2">
              River Location
            </label>
            <Input
              id="location"
              name="location"
              type="text"
              value={formData.location}
              onChange={handleChange}
              placeholder="Enter river location (e.g. Kathmandu Valley)"
              required
              disabled={loading}
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="code" className="block text-sm font-medium text-foreground mb-2">
              River Code
            </label>
            <Input
              id="code"
              name="code"
              type="text"
              value={formData.code}
              onChange={handleChange}
              placeholder="Enter unique river code"
              required
              disabled={loading}
              className="w-full"
            />
          </div>

          {/* Feedback messages */}
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-md text-destructive text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
              {success}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white"
            >
              {loading ? 'Adding...' : 'Add River'}
            </Button>

            <Button
              type="button"
              onClick={onBack}
              variant="outline"
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}