'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { useApp } from '@/lib/context';
import { User, Bell, Lock, Palette, Moon, Sun } from 'lucide-react';

export default function SettingsPage() {
  const { userSettings, updateUserSettings, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'privacy' | 'appearance'>('profile');

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: User },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
    { id: 'privacy' as const, label: 'Privacy', icon: Lock },
    { id: 'appearance' as const, label: 'Appearance', icon: Palette },
  ];

  return (
    <div className="min-h-screen bg-deep-space pb-24">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-white mb-6">Settings</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-zeeky-blue text-white'
                      : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="md:col-span-3">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              {activeTab === 'profile' && <ProfileSettings />}
              {activeTab === 'notifications' && <NotificationSettings />}
              {activeTab === 'privacy' && <PrivacySettings />}
              {activeTab === 'appearance' && <AppearanceSettings />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileSettings() {
  const { currentUser } = useApp();
  const [formData, setFormData] = useState({
    displayName: currentUser.displayName,
    username: currentUser.username,
    bio: currentUser.bio || '',
    location: currentUser.location || '',
    website: currentUser.website || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would update the user profile
    alert('Profile updated successfully!');
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Profile Settings</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Display Name
          </label>
          <input
            type="text"
            value={formData.displayName}
            onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-zeeky-blue"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-zeeky-blue"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-zeeky-blue resize-none"
            rows={3}
            placeholder="Tell us about yourself..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-zeeky-blue"
            placeholder="Where are you from?"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Website</label>
          <input
            type="url"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-zeeky-blue"
            placeholder="https://example.com"
          />
        </div>

        <button
          type="submit"
          className="px-6 py-2 bg-zeeky-blue hover:bg-blue-600 text-white rounded-lg transition-colors"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}

function NotificationSettings() {
  const { userSettings, updateUserSettings } = useApp();

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Notification Settings</h2>

      <div className="space-y-4">
        <ToggleSetting
          label="Enable Notifications"
          description="Receive notifications for activity on your account"
          checked={userSettings.notificationsEnabled}
          onChange={(checked) => updateUserSettings({ notificationsEnabled: checked })}
        />

        <ToggleSetting
          label="Email Notifications"
          description="Receive email notifications for important updates"
          checked={userSettings.emailNotifications}
          onChange={(checked) => updateUserSettings({ emailNotifications: checked })}
        />

        <ToggleSetting
          label="Push Notifications"
          description="Receive push notifications on your device"
          checked={userSettings.pushNotifications}
          onChange={(checked) => updateUserSettings({ pushNotifications: checked })}
        />

        <ToggleSetting
          label="Message Notifications"
          description="Get notified when you receive new messages"
          checked={userSettings.messageNotifications}
          onChange={(checked) => updateUserSettings({ messageNotifications: checked })}
        />
      </div>
    </div>
  );
}

function PrivacySettings() {
  const { userSettings, updateUserSettings } = useApp();

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Privacy Settings</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Account Privacy
          </label>
          <select
            value={userSettings.accountPrivacy}
            onChange={(e) =>
              updateUserSettings({ accountPrivacy: e.target.value as 'public' | 'private' })
            }
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-zeeky-blue"
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
          <p className="text-sm text-gray-400 mt-1">
            {userSettings.accountPrivacy === 'public'
              ? 'Anyone can see your profile and posts'
              : 'Only approved followers can see your content'}
          </p>
        </div>

        <ToggleSetting
          label="Show Online Status"
          description="Let others see when you're online"
          checked={userSettings.showOnlineStatus}
          onChange={(checked) => updateUserSettings({ showOnlineStatus: checked })}
        />

        <ToggleSetting
          label="Allow Tagging"
          description="Let others tag you in posts"
          checked={userSettings.allowTagging}
          onChange={(checked) => updateUserSettings({ allowTagging: checked })}
        />

        <ToggleSetting
          label="Allow Comments"
          description="Let others comment on your posts"
          checked={userSettings.allowComments}
          onChange={(checked) => updateUserSettings({ allowComments: checked })}
        />
      </div>
    </div>
  );
}

function AppearanceSettings() {
  const { userSettings, updateUserSettings } = useApp();

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Appearance Settings</h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Theme</label>
          <div className="grid grid-cols-3 gap-3">
            {(['light', 'dark', 'auto'] as const).map((theme) => (
              <button
                key={theme}
                onClick={() => updateUserSettings({ theme })}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  userSettings.theme === theme
                    ? 'border-zeeky-blue bg-gray-900'
                    : 'border-gray-700 bg-gray-900 hover:border-gray-600'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  {theme === 'light' && <Sun className="w-6 h-6 text-yellow-500" />}
                  {theme === 'dark' && <Moon className="w-6 h-6 text-blue-500" />}
                  {theme === 'auto' && <Palette className="w-6 h-6 text-purple-500" />}
                  <span className="text-white capitalize">{theme}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Font Size</label>
          <select
            value={userSettings.fontSize}
            onChange={(e) =>
              updateUserSettings({ fontSize: e.target.value as 'small' | 'medium' | 'large' })
            }
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-zeeky-blue"
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Chat Bubble Color
          </label>
          <input
            type="color"
            value={userSettings.chatBubbleColor}
            onChange={(e) => updateUserSettings({ chatBubbleColor: e.target.value })}
            className="w-full h-12 bg-gray-900 border border-gray-700 rounded-lg cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}

function ToggleSetting({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between py-3 border-b border-gray-700">
      <div className="flex-1">
        <h4 className="text-white font-medium">{label}</h4>
        <p className="text-sm text-gray-400 mt-1">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-zeeky-blue' : 'bg-gray-700'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}
