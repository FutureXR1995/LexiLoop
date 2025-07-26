'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Trophy, 
  Target, 
  Star, 
  Plus, 
  MessageCircle,
  TrendingUp,
  Award,
  UserPlus,
  Calendar,
  Zap
} from 'lucide-react';

interface UserStats {
  totalWordsLearned: number;
  totalStudyTimeMinutes: number;
  currentStreak: number;
  longestStreak: number;
  totalPoints: number;
  level: number;
  experiencePoints: number;
  averageAccuracy: number;
}

interface Friend {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  userStats?: {
    totalPoints: number;
    currentStreak: number;
    level: number;
  };
}

interface Achievement {
  achievement: {
    id: string;
    name: string;
    title: string;
    description: string;
    category: string;
    icon: string;
    color: string;
    rarity: string;
  };
  earned: boolean;
  earnedAt?: string;
  progress: number;
  target: number;
}

interface LeaderboardEntry {
  rank: number;
  user: {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
  };
  stats: {
    totalPoints: number;
    currentStreak: number;
    totalWordsLearned: number;
    level: number;
  };
}

const SocialHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'friends' | 'achievements' | 'leaderboard'>('overview');
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [friendEmail, setFriendEmail] = useState('');

  useEffect(() => {
    loadSocialData();
  }, []);

  const loadSocialData = async () => {
    try {
      setLoading(true);
      
      // Load user stats, friends, achievements, and leaderboard in parallel
      const [statsRes, friendsRes, achievementsRes, leaderboardRes] = await Promise.all([
        fetch('/api/social/stats', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/social/friends', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/social/achievements', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/social/leaderboard?limit=10', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (statsRes.ok) {
        const stats = await statsRes.json();
        setUserStats(stats.data);
      }

      if (friendsRes.ok) {
        const friendsData = await friendsRes.json();
        setFriends(friendsData.data);
      }

      if (achievementsRes.ok) {
        const achievementsData = await achievementsRes.json();
        setAchievements(achievementsData.data);
      }

      if (leaderboardRes.ok) {
        const leaderboardData = await leaderboardRes.json();
        setLeaderboard(leaderboardData.data);
      }
    } catch (error) {
      console.error('Failed to load social data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async () => {
    if (!friendEmail.trim()) return;

    try {
      const response = await fetch('/api/social/friends/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ friendEmail })
      });

      if (response.ok) {
        setFriendEmail('');
        setShowAddFriend(false);
        // Optionally show success message
      }
    } catch (error) {
      console.error('Failed to send friend request:', error);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-600';
      case 'rare': return 'text-blue-600';
      case 'epic': return 'text-purple-600';
      case 'legendary': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getRarityBg = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100';
      case 'rare': return 'bg-blue-100';
      case 'epic': return 'bg-purple-100';
      case 'legendary': return 'bg-yellow-100';
      default: return 'bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Social Hub</h1>
        <p className="text-gray-600">Connect with friends and track your progress</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {[
          { id: 'overview', label: 'Overview', icon: TrendingUp },
          { id: 'friends', label: 'Friends', icon: Users },
          { id: 'achievements', label: 'Achievements', icon: Trophy },
          { id: 'leaderboard', label: 'Leaderboard', icon: Star }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'overview' && userStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Stats Cards */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Words Learned</h3>
                  <p className="text-2xl font-bold text-blue-600">{userStats.totalWordsLearned}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Zap className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Current Streak</h3>
                  <p className="text-2xl font-bold text-orange-600">{userStats.currentStreak} days</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Level</h3>
                  <p className="text-2xl font-bold text-purple-600">{userStats.level}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Star className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Total Points</h3>
                  <p className="text-2xl font-bold text-green-600">{userStats.totalPoints}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Study Time</h3>
                  <p className="text-2xl font-bold text-indigo-600">{Math.round(userStats.totalStudyTimeMinutes / 60)}h</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-pink-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-pink-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Accuracy</h3>
                  <p className="text-2xl font-bold text-pink-600">{Math.round(userStats.averageAccuracy * 100)}%</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'friends' && (
          <div className="space-y-6">
            {/* Add Friend Button */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Friends ({friends.length})</h2>
              <button
                onClick={() => setShowAddFriend(!showAddFriend)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Add Friend
              </button>
            </div>

            {/* Add Friend Form */}
            {showAddFriend && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Add Friend by Email</h3>
                <div className="flex gap-4">
                  <input
                    type="email"
                    value={friendEmail}
                    onChange={(e) => setFriendEmail(e.target.value)}
                    placeholder="Enter friend's email"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleAddFriend}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Send Request
                  </button>
                </div>
              </div>
            )}

            {/* Friends List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {friends.map((friend) => (
                <div key={friend.id} className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{friend.username}</h3>
                      {(friend.firstName || friend.lastName) && (
                        <p className="text-sm text-gray-600">
                          {friend.firstName} {friend.lastName}
                        </p>
                      )}
                    </div>
                  </div>
                  {friend.userStats && (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Level:</span>
                        <span className="font-medium">{friend.userStats.level}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Points:</span>
                        <span className="font-medium">{friend.userStats.totalPoints}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Streak:</span>
                        <span className="font-medium">{friend.userStats.currentStreak} days</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {friends.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No friends yet</h3>
                <p className="text-gray-600">Add friends to see their progress and compete together!</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Achievements ({achievements.filter(a => a.earned).length}/{achievements.length})
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((achievement) => (
                <div
                  key={achievement.achievement.id}
                  className={`bg-white rounded-xl shadow-lg p-6 border-2 transition-all ${
                    achievement.earned 
                      ? `border-${achievement.achievement.color.replace('#', '')} ${getRarityBg(achievement.achievement.rarity)}`
                      : 'border-gray-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-3xl">{achievement.achievement.icon}</div>
                    <div>
                      <h3 className={`font-semibold ${getRarityColor(achievement.achievement.rarity)}`}>
                        {achievement.achievement.title}
                      </h3>
                      <p className="text-sm text-gray-600 capitalize">
                        {achievement.achievement.rarity} • {achievement.achievement.category}
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-4">
                    {achievement.achievement.description}
                  </p>
                  
                  {!achievement.earned && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">
                          {achievement.progress}/{achievement.target}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, (achievement.progress / achievement.target) * 100)}%`
                          }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {achievement.earned && achievement.earnedAt && (
                    <div className="text-xs text-gray-500">
                      Earned on {new Date(achievement.earnedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Top Learners</h2>
            
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="divide-y divide-gray-200">
                {leaderboard.map((entry) => (
                  <div key={entry.user.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        entry.rank === 1 ? 'bg-yellow-100 text-yellow-600' :
                        entry.rank === 2 ? 'bg-gray-100 text-gray-600' :
                        entry.rank === 3 ? 'bg-orange-100 text-orange-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {entry.rank}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{entry.user.username}</h3>
                        {(entry.user.firstName || entry.user.lastName) && (
                          <p className="text-sm text-gray-600">
                            {entry.user.firstName} {entry.user.lastName}
                          </p>
                        )}
                      </div>
                      
                      <div className="text-right space-y-1">
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="font-bold text-gray-900">{entry.stats.totalPoints}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Level {entry.stats.level} • {entry.stats.totalWordsLearned} words
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {leaderboard.length === 0 && (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No leaderboard data</h3>
                <p className="text-gray-600">Start learning to see rankings!</p>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default SocialHub;