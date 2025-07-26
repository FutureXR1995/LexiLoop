'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, FileText, Users, Brain, Clock, TrendingUp, 
  Eye, Edit, Trash2, Plus, Filter, Search, Calendar,
  BookOpen, Target, Zap, Award
} from 'lucide-react';

interface ContentItem {
  id: string;
  type: 'story' | 'test' | 'vocabulary';
  title: string;
  description: string;
  status: 'draft' | 'published' | 'archived';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  createdAt: string;
  updatedAt: string;
  stats: {
    views: number;
    completions: number;
    averageScore: number;
    engagement: number;
  };
}

interface DashboardStats {
  totalContent: number;
  activeUsers: number;
  totalCompletions: number;
  averageEngagement: number;
  weeklyGrowth: number;
  contentByType: {
    stories: number;
    tests: number;
    vocabulary: number;
  };
}

const ContentManagementDashboard: React.FC = () => {
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<ContentItem[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  // 模拟数据加载
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 模拟内容数据
        const mockContent: ContentItem[] = [
          {
            id: 'story_001',
            type: 'story',
            title: 'The Ambitious Entrepreneur',
            description: 'A story about a young entrepreneur starting a tech company, featuring business vocabulary.',
            status: 'published',
            difficulty: 'intermediate',
            category: 'Business English',
            createdAt: '2024-01-15T10:30:00Z',
            updatedAt: '2024-01-16T14:20:00Z',
            stats: {
              views: 1250,
              completions: 890,
              averageScore: 85,
              engagement: 92
            }
          },
          {
            id: 'test_001',
            type: 'test',
            title: 'TOEFL Vocabulary Challenge',
            description: 'Advanced vocabulary test focusing on academic English terms.',
            status: 'published',
            difficulty: 'advanced',
            category: 'Academic English',
            createdAt: '2024-01-12T09:15:00Z',
            updatedAt: '2024-01-18T11:45:00Z',
            stats: {
              views: 2100,
              completions: 1456,
              averageScore: 73,
              engagement: 88
            }
          },
          {
            id: 'vocab_001',
            type: 'vocabulary',
            title: 'Medical Terminology Basics',
            description: 'Essential medical vocabulary for healthcare professionals.',
            status: 'draft',
            difficulty: 'advanced',
            category: 'Medical English',
            createdAt: '2024-01-20T16:00:00Z',
            updatedAt: '2024-01-22T10:30:00Z',
            stats: {
              views: 45,
              completions: 12,
              averageScore: 68,
              engagement: 75
            }
          },
          {
            id: 'story_002',
            type: 'story',
            title: 'Climate Change Solutions',
            description: 'An educational story about environmental conservation and green technology.',
            status: 'published',
            difficulty: 'intermediate',
            category: 'Environmental Science',
            createdAt: '2024-01-18T13:45:00Z',
            updatedAt: '2024-01-19T09:20:00Z',
            stats: {
              views: 856,
              completions: 623,
              averageScore: 78,
              engagement: 84
            }
          }
        ];

        // 模拟统计数据
        const mockStats: DashboardStats = {
          totalContent: 127,
          activeUsers: 2856,
          totalCompletions: 18945,
          averageEngagement: 87,
          weeklyGrowth: 12.5,
          contentByType: {
            stories: 45,
            tests: 38,
            vocabulary: 44
          }
        };

        setContentItems(mockContent);
        setFilteredItems(mockContent);
        setDashboardStats(mockStats);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 过滤和搜索
  useEffect(() => {
    let filtered = contentItems;

    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(item => item.type === selectedType);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(item => item.status === selectedStatus);
    }

    setFilteredItems(filtered);
  }, [contentItems, searchQuery, selectedType, selectedStatus]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'text-green-600 bg-green-100';
      case 'draft': return 'text-yellow-600 bg-yellow-100';
      case 'archived': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'story': return <FileText className="h-4 w-4" />;
      case 'test': return <Target className="h-4 w-4" />;
      case 'vocabulary': return <BookOpen className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage your learning content and track performance metrics
              </p>
            </div>
            <button className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              <Plus className="h-4 w-4 mr-2" />
              Create Content
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        {dashboardStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FileText className="h-8 w-8 text-indigo-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Content</p>
                  <p className="text-2xl font-semibold text-gray-900">{dashboardStats.totalContent}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-semibold text-gray-900">{dashboardStats.activeUsers.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Award className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completions</p>
                  <p className="text-2xl font-semibold text-gray-900">{dashboardStats.totalCompletions.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Engagement</p>
                  <p className="text-2xl font-semibold text-gray-900">{dashboardStats.averageEngagement}%</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content Type Distribution */}
        {dashboardStats && (
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Content Distribution</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-indigo-600">{dashboardStats.contentByType.stories}</div>
                  <div className="text-sm text-gray-600">Stories</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{dashboardStats.contentByType.tests}</div>
                  <div className="text-sm text-gray-600">Tests</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600">{dashboardStats.contentByType.vocabulary}</div>
                  <div className="text-sm text-gray-600">Vocabulary Sets</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Type Filter */}
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="story">Stories</option>
                <option value="test">Tests</option>
                <option value="vocabulary">Vocabulary</option>
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Content Items</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Content
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Updated
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-1">
                          {getTypeIcon(item.type)}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{item.title}</div>
                          <div className="text-sm text-gray-500 mt-1">{item.description}</div>
                          <div className="flex items-center mt-2 space-x-2">
                            <span className="text-xs text-gray-500">{item.category}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(item.difficulty)}`}>
                              {item.difficulty}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="capitalize text-sm text-gray-900">{item.type}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        <div>{item.stats.views} views</div>
                        <div className="text-gray-500">{item.stats.completions} completions</div>
                        <div className="text-gray-500">{item.stats.engagement}% engagement</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(item.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button className="text-indigo-600 hover:text-indigo-900">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No content found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || selectedType !== 'all' || selectedStatus !== 'all'
                ? 'Try adjusting your search filters.'
                : 'Create your first piece of content to get started.'
              }
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default ContentManagementDashboard;