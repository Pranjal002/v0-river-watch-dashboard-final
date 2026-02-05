'use client';

import React from "react"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

interface AddStationFormProps {
  onBack: () => void;
}

export default function AddStationForm({ onBack }: AddStationFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    basin: '',
    river: '',
    latitude: '',
    longitude: '',
    elevation: '',
    remarks: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[v0] Station form submitted:', formData);
    // API call will be added here later
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
              Station Name
            </label>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter station name"
              required
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-foreground mb-2">
              Station Location
            </label>
            <Input
              id="location"
              name="location"
              type="text"
              value={formData.location}
              onChange={handleChange}
              placeholder="Enter station location"
              required
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="basin" className="block text-sm font-medium text-foreground mb-2">
              Basin
            </label>
            <Input
              id="basin"
              name="basin"
              type="text"
              value={formData.basin}
              onChange={handleChange}
              placeholder="Enter basin name"
              required
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="river" className="block text-sm font-medium text-foreground mb-2">
              Select River
            </label>
            <select
              id="river"
              name="river"
              value={formData.river}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-border rounded-md text-foreground bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Choose a river</option>
              <option value="river1">River 1</option>
              <option value="river2">River 2</option>
              <option value="river3">River 3</option>
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
                required
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
                required
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
              required
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
              className="w-full px-3 py-2 border border-border rounded-md text-foreground bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white"
            >
              Submit
            </Button>
            <Button
              type="button"
              onClick={onBack}
              variant="outline"
              className="flex-1 bg-transparent"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
