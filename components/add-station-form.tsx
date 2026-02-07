'use client';

import React from "react"

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { stationAPI, riverAPI } from '@/lib/api';

interface AddStationFormProps {
  onBack: () => void;
}

interface River {
  id: number;
  name: string;
}

export default function AddStationForm({ onBack }: AddStationFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    location: '',
    basin: '',
    riverId: '',
    latitude: '',
    longitude: '',
    elevation: '',
    remarks: '',
  });

  const [rivers, setRivers] = useState<River[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchRivers();
  }, []);

  const fetchRivers = async () => {
    try {
      const response: any = await riverAPI.getPaged(1, 100);
      if (response.data && response.data.items) {
        setRivers(response.data.items);
      }
    } catch (err) {
      console.error('Failed to fetch rivers:', err);
      setError('Failed to load rivers');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear messages when user modifies form
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate required fields
      if (!formData.name || !formData.code || !formData.location || !formData.basin || !formData.riverId) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      const stationPayload = {
        name: formData.name,
        code: formData.code,
        location: formData.location,
        basin: formData.basin,
        riverId: parseInt(formData.riverId, 10),
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
        elevation: formData.elevation ? parseFloat(formData.elevation) : undefined,
        remarks: formData.remarks || undefined,
      };

      console.log('[v0] Submitting station data:', stationPayload);
      const response = await stationAPI.upsert(stationPayload);
      
      setSuccess('Station created successfully!');
      console.log('[v0] Station created:', response);
      
      // Reset form and go back after success
      setTimeout(() => {
        onBack();
      }, 1500);
    } catch (err: any) {
      console.error('[v0] Error creating station:', err);
      setError(err.message || 'Failed to create station. Please try again.');
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
        <h2 className="text-2xl font-bold text-foreground mb-6">Add New Station</h2>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md text-green-700">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
              Station Name <span className="text-red-500">*</span>
            </label>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter station name"
              disabled={loading}
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="code" className="block text-sm font-medium text-foreground mb-2">
              Station Code <span className="text-red-500">*</span>
            </label>
            <Input
              id="code"
              name="code"
              type="text"
              value={formData.code}
              onChange={handleChange}
              placeholder="Enter station code"
              disabled={loading}
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-foreground mb-2">
              Station Location <span className="text-red-500">*</span>
            </label>
            <Input
              id="location"
              name="location"
              type="text"
              value={formData.location}
              onChange={handleChange}
              placeholder="Enter station location"
              disabled={loading}
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="basin" className="block text-sm font-medium text-foreground mb-2">
              Basin <span className="text-red-500">*</span>
            </label>
            <Input
              id="basin"
              name="basin"
              type="text"
              value={formData.basin}
              onChange={handleChange}
              placeholder="Enter basin name"
              disabled={loading}
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="riverId" className="block text-sm font-medium text-foreground mb-2">
              Select River <span className="text-red-500">*</span>
            </label>
            <select
              id="riverId"
              name="riverId"
              value={formData.riverId}
              onChange={handleChange}
              disabled={loading || rivers.length === 0}
              className="w-full px-3 py-2 border border-border rounded-md text-foreground bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
            >
              <option value="">Choose a river</option>
              {rivers.map((river) => (
                <option key={river.id} value={river.id}>
                  {river.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="latitude" className="block text-sm font-medium text-foreground mb-2">
                Latitude
              </label>
              <Input
                id="latitude"
                name="latitude"
                type="number"
                step="0.0001"
                value={formData.latitude}
                onChange={handleChange}
                placeholder="e.g., 2.1232"
                disabled={loading}
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="longitude" className="block text-sm font-medium text-foreground mb-2">
                Longitude
              </label>
              <Input
                id="longitude"
                name="longitude"
                type="number"
                step="0.0001"
                value={formData.longitude}
                onChange={handleChange}
                placeholder="e.g., 2.1232"
                disabled={loading}
                className="w-full"
              />
            </div>
          </div>

          <div>
            <label htmlFor="elevation" className="block text-sm font-medium text-foreground mb-2">
              Elevation (meters)
            </label>
            <Input
              id="elevation"
              name="elevation"
              type="number"
              step="0.01"
              value={formData.elevation}
              onChange={handleChange}
              placeholder="Enter elevation"
              disabled={loading}
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="remarks" className="block text-sm font-medium text-foreground mb-2">
              Remarks
            </label>
            <textarea
              id="remarks"
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              placeholder="Enter any additional remarks"
              rows={4}
              disabled={loading}
              className="w-full px-3 py-2 border border-border rounded-md text-foreground bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none disabled:opacity-50"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Submit'}
            </Button>
            <Button
              type="button"
              onClick={onBack}
              disabled={loading}
              variant="outline"
              className="flex-1 bg-transparent disabled:opacity-50"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
