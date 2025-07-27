/**
 * Profile Header Component
 * Displays user avatar, basic info and quick stats
 */

'use client';

import React, { useState } from 'react';
import { User } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Camera, Edit3, Calendar, MapPin, Globe } from 'lucide-react';

interface ProfileHeaderProps {
  user: User;
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getUserLevel = (level: string) => {
    const levels = {
      'beginner': { label: 'Beginner', color: 'bg-green-100 text-green-800', icon: '🌱' },
      'intermediate': { label: 'Intermediate', color: 'bg-blue-100 text-blue-800', icon: '🌿' },
      'advanced': { label: 'Advanced', color: 'bg-purple-100 text-purple-800', icon: '🌳' },
      'expert': { label: 'Expert', color: 'bg-orange-100 text-orange-800', icon: '🏆' }
    };
    return levels[level as keyof typeof levels] || levels['beginner'];
  };

  const levelInfo = getUserLevel(user.level);

  return (
    <Card className="overflow-hidden bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white">
      <div className="relative p-6 sm:p-8">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
            {/* Avatar Section */}
            <div className="relative group">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-white bg-opacity-20 backdrop-blur-sm flex items-center justify-center overflow-hidden border-4 border-white border-opacity-30">
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl sm:text-4xl font-bold text-white">
                    {getInitials(user.firstName, user.lastName)}
                  </span>
                )}
              </div>
              
              {/* Avatar Upload Overlay */}
              <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="w-6 h-6 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* User Information */}
            <div className="flex-1 space-y-3">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white">
                  {user.firstName} {user.lastName}
                </h2>
                <p className="text-lg text-white text-opacity-90">@{user.username}</p>
                <p className="text-white text-opacity-75">{user.email}</p>
              </div>

              {/* Level Badge */}
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{levelInfo.icon}</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${levelInfo.color} bg-opacity-90`}>
                  {levelInfo.label} Learner
                </span>
              </div>

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-4 text-sm text-white text-opacity-90">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {formatDate(user.createdAt)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Globe className="w-4 h-4" />
                  <span>English Learner</span>
                </div>
              </div>
            </div>

            {/* Edit Button */}
            <div className="sm:self-start">
              <button className="flex items-center space-x-2 px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors rounded-lg backdrop-blur-sm border border-white border-opacity-30">
                <Edit3 className="w-4 h-4" />
                <span className="text-sm font-medium">Edit Profile</span>
              </button>
            </div>
          </div>

          {/* Achievement Stats Row */}
          <div className="mt-6 pt-6 border-t border-white border-opacity-20">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white">127</div>
                <div className="text-sm text-white text-opacity-75">Words Learned</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white">15</div>
                <div className="text-sm text-white text-opacity-75">Stories Read</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white">8</div>
                <div className="text-sm text-white text-opacity-75">Day Streak</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white">92%</div>
                <div className="text-sm text-white text-opacity-75">Accuracy</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}