'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Camera, Save } from 'lucide-react';
import { mockUsers } from '@/lib/mockData';

export default function EditProfilePage() {
  const router = useRouter();
  const currentUser = mockUsers[0];

  const [formData, setFormData] = useState({
    displayName: currentUser.displayName,
    username: currentUser.username,
    bio: currentUser.bio || '',
    location: currentUser.location || '',
    website: currentUser.website || '',
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Simulate saving
      await new Promise(resolve => setTimeout(resolve, 1500));
      router.push('/profile');
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-deep-space pb-20">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h1 className="text-2xl font-bold text-white font-heading">
                Edit Profile
              </h1>
            </div>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center space-x-2 px-6 py-2 bg-zeeky-blue hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              <span>{saving ? 'Saving...' : 'Save'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Cover Photo */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Cover Photo
          </label>
          <div className="relative h-48 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg overflow-hidden">
            {currentUser.coverPhoto && (
              <img
                src={currentUser.coverPhoto}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            )}
            <button className="absolute inset-0 bg-black/40 hover:bg-black/60 transition-colors flex items-center justify-center">
              <Camera className="w-8 h-8 text-white" />
            </button>
          </div>
        </div>

        {/* Avatar */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Profile Picture
          </label>
          <div className="flex items-center space-x-6">
            <div className="relative">
              <img
                src={currentUser.avatar}
                alt={currentUser.displayName}
                className="w-24 h-24 rounded-full"
              />
              <button className="absolute inset-0 bg-black/40 hover:bg-black/60 transition-colors rounded-full flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" />
              </button>
            </div>
            <div className="text-sm text-gray-400">
              <p>Recommended: Square image, at least 400x400px</p>
              <p>Max file size: 5MB</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-300 mb-2">
              Display Name
            </label>
            <input
              type="text"
              id="displayName"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-zeeky-blue"
              required
            />
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
              Username
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">@</span>
              <input
                type="text"
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full pl-8 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-zeeky-blue"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-2">
              Bio
            </label>
            <textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-zeeky-blue resize-none"
              placeholder="Tell people about yourself..."
              maxLength={160}
            />
            <p className="text-xs text-gray-400 mt-1">
              {formData.bio.length}/160 characters
            </p>
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-300 mb-2">
              Location
            </label>
            <input
              type="text"
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-zeeky-blue"
              placeholder="City, Country"
            />
          </div>

          <div>
            <label htmlFor="website" className="block text-sm font-medium text-gray-300 mb-2">
              Website
            </label>
            <input
              type="url"
              id="website"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-zeeky-blue"
              placeholder="https://example.com"
            />
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-zeeky-blue hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
