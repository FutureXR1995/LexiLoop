'use client';

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Flag, 
  Users, 
  FileText, 
  Clock,
  TrendingUp,
  Eye,
  Filter,
  Search,
  MoreHorizontal,
  Calendar,
  BarChart3
} from 'lucide-react';

// 内容状态枚举
enum ContentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  FLAGGED = 'flagged',
  UNDER_REVIEW = 'under_review'
}

// 内容类型枚举
enum ContentType {
  VOCABULARY_COLLECTION = 'vocabulary_collection',
  VOCABULARY_WORD = 'vocabulary_word',
  USER_SUBMISSION = 'user_submission',
  COMMENT = 'comment',
  REVIEW = 'review'
}

// 审核动作枚举
enum ModerationAction {
  APPROVE = 'approve',
  REJECT = 'reject',
  FLAG = 'flag',
  DELETE = 'delete',
  EDIT = 'edit',
  WARN_USER = 'warn_user',
  SUSPEND_USER = 'suspend_user'
}

// 接口定义
interface ModerationItem {
  id: string;
  contentId: string;
  contentType: ContentType;
  content: any;
  authorId: string;
  authorInfo: {
    username: string;
    email: string;
    registrationDate: Date;
    previousViolations: number;
  };
  status: ContentStatus;
  priority: 'low' | 'medium' | 'high' | 'critical';
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  moderatorNotes?: string;
  autoFlagReason?: string;
  reportCount: number;
}

interface ModerationStats {
  totalPending: number;
  totalReviewed: number;
  totalFlagged: number;
  reviewedToday: number;
  averageReviewTime: number;
  contentBreakdown: {
    [key in ContentType]: {
      pending: number;
      approved: number;
      rejected: number;
      flagged: number;
    };
  };
}

const AdminModerationPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pending' | 'history' | 'users'>('dashboard');
  const [moderationItems, setModerationItems] = useState<ModerationItem[]>([]);
  const [stats, setStats] = useState<ModerationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState({
    status: 'all',
    contentType: 'all',
    priority: 'all',
    search: ''
  });

  // 模拟数据加载
  useEffect(() => {
    const loadMockData = async () => {
      try {
        // 模拟统计数据
        const mockStats: ModerationStats = {
          totalPending: 23,
          totalReviewed: 156,
          totalFlagged: 7,
          reviewedToday: 12,
          averageReviewTime: 8,
          contentBreakdown: {
            [ContentType.VOCABULARY_COLLECTION]: {
              pending: 8,
              approved: 45,
              rejected: 3,
              flagged: 2
            },
            [ContentType.VOCABULARY_WORD]: {
              pending: 12,
              approved: 89,
              rejected: 8,
              flagged: 4
            },
            [ContentType.USER_SUBMISSION]: {
              pending: 3,
              approved: 22,
              rejected: 2,
              flagged: 1
            },
            [ContentType.COMMENT]: {
              pending: 0,
              approved: 0,
              rejected: 0,
              flagged: 0
            },
            [ContentType.REVIEW]: {
              pending: 0,
              approved: 0,
              rejected: 0,
              flagged: 0
            }
          }
        };

        // 模拟审核项目
        const mockItems: ModerationItem[] = [
          {
            id: 'mod_001',
            contentId: 'vocab_001',
            contentType: ContentType.VOCABULARY_COLLECTION,
            content: {
              name: 'Advanced Business Terms',
              description: 'Professional vocabulary for business communication',
              words: 150
            },
            authorId: 'user_001',
            authorInfo: {
              username: 'john_learner',
              email: 'john@example.com',
              registrationDate: new Date('2024-01-15'),
              previousViolations: 0
            },
            status: ContentStatus.PENDING,
            priority: 'medium',
            submittedAt: new Date('2024-01-20T10:30:00'),
            reportCount: 0
          },
          {
            id: 'mod_002',
            contentId: 'vocab_002',
            contentType: ContentType.VOCABULARY_WORD,
            content: {
              word: 'questionable_term',
              definition: 'This might contain inappropriate content',
              examples: ['Example usage']
            },
            authorId: 'user_002',
            authorInfo: {
              username: 'problematic_user',
              email: 'problem@example.com',
              registrationDate: new Date('2024-01-10'),
              previousViolations: 2
            },
            status: ContentStatus.FLAGGED,
            priority: 'high',
            submittedAt: new Date('2024-01-21T14:15:00'),
            autoFlagReason: 'Potential inappropriate content detected',
            reportCount: 3
          },
          {
            id: 'mod_003',
            contentId: 'collection_003',
            contentType: ContentType.VOCABULARY_COLLECTION,
            content: {
              name: 'TOEFL Preparation Set',
              description: 'Comprehensive TOEFL vocabulary with examples',
              words: 500
            },
            authorId: 'user_004',
            authorInfo: {
              username: 'teacher_mike',
              email: 'mike@school.edu',
              registrationDate: new Date('2023-12-01'),
              previousViolations: 0
            },
            status: ContentStatus.UNDER_REVIEW,
            priority: 'low',
            submittedAt: new Date('2024-01-19T09:00:00'),
            reportCount: 1
          }
        ];

        setStats(mockStats);
        setModerationItems(mockItems);
        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setLoading(false);
      }
    };

    loadMockData();
  }, []);

  // 状态图标映射
  const getStatusIcon = (status: ContentStatus) => {
    switch (status) {
      case ContentStatus.PENDING:
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case ContentStatus.APPROVED:
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case ContentStatus.REJECTED:
        return <XCircle className="h-4 w-4 text-red-600" />;
      case ContentStatus.FLAGGED:
        return <Flag className="h-4 w-4 text-red-600" />;
      case ContentStatus.UNDER_REVIEW:
        return <Eye className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  // 优先级颜色映射
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // 内容类型显示名映射
  const getContentTypeLabel = (type: ContentType) => {
    switch (type) {
      case ContentType.VOCABULARY_COLLECTION:
        return 'Vocabulary Collection';
      case ContentType.VOCABULARY_WORD:
        return 'Vocabulary Word';
      case ContentType.USER_SUBMISSION:
        return 'User Submission';
      case ContentType.COMMENT:
        return 'Comment';
      case ContentType.REVIEW:
        return 'Review';
      default:
        return 'Unknown';
    }
  };

  // 处理审核动作
  const handleModerationAction = async (itemId: string, action: ModerationAction, reason: string) => {
    try {
      // 模拟API调用
      console.log(`Moderating item ${itemId} with action ${action}: ${reason}`);
      
      // 更新本地状态
      setModerationItems(prev => prev.map(item => {
        if (item.id === itemId) {
          let newStatus: ContentStatus;
          switch (action) {
            case ModerationAction.APPROVE:
              newStatus = ContentStatus.APPROVED;
              break;
            case ModerationAction.REJECT:
              newStatus = ContentStatus.REJECTED;
              break;
            case ModerationAction.FLAG:
              newStatus = ContentStatus.FLAGGED;
              break;
            default:
              newStatus = ContentStatus.UNDER_REVIEW;
          }
          return {
            ...item,
            status: newStatus,
            reviewedAt: new Date(),
            reviewedBy: 'current_moderator',
            moderatorNotes: reason
          };
        }
        return item;
      }));
    } catch (error) {
      console.error('Error moderating content:', error);
    }
  };

  // 过滤项目
  const filteredItems = moderationItems.filter(item => {
    if (filters.status !== 'all' && item.status !== filters.status) return false;
    if (filters.contentType !== 'all' && item.contentType !== filters.contentType) return false;
    if (filters.priority !== 'all' && item.priority !== filters.priority) return false;
    if (filters.search && !JSON.stringify(item.content).toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-indigo-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Moderation Panel</h1>
                <p className="text-sm text-gray-600">Content moderation and user management</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                Auto-Flag Content
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'pending', label: 'Pending Items', icon: Clock },
              { id: 'history', label: 'History', icon: FileText },
              { id: 'users', label: 'User Management', icon: Users }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && stats && (
          <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Clock className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending Review</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalPending}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Flag className="h-8 w-8 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Flagged Content</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalFlagged}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Reviewed Today</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.reviewedToday}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingUp className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Avg Review Time</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.averageReviewTime}m</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Breakdown */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Content Type Breakdown</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {Object.entries(stats.contentBreakdown).map(([type, data]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        {getContentTypeLabel(type as ContentType)}
                      </span>
                      <div className="flex space-x-4 text-sm">
                        <span className="text-yellow-600">Pending: {data.pending}</span>
                        <span className="text-green-600">Approved: {data.approved}</span>
                        <span className="text-red-600">Rejected: {data.rejected}</span>
                        <span className="text-orange-600">Flagged: {data.flagged}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pending Items Tab */}
        {activeTab === 'pending' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search content..."
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Status</option>
                  <option value={ContentStatus.PENDING}>Pending</option>
                  <option value={ContentStatus.FLAGGED}>Flagged</option>
                  <option value={ContentStatus.UNDER_REVIEW}>Under Review</option>
                </select>

                <select
                  value={filters.contentType}
                  onChange={(e) => setFilters(prev => ({ ...prev, contentType: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Types</option>
                  <option value={ContentType.VOCABULARY_COLLECTION}>Collections</option>
                  <option value={ContentType.VOCABULARY_WORD}>Words</option>
                  <option value={ContentType.USER_SUBMISSION}>Submissions</option>
                </select>

                <select
                  value={filters.priority}
                  onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Priorities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            {/* Items List */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">
                    Moderation Queue ({filteredItems.length} items)
                  </h3>
                  {selectedItems.size > 0 && (
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">
                        Bulk Approve ({selectedItems.size})
                      </button>
                      <button className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">
                        Bulk Reject ({selectedItems.size})
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="divide-y divide-gray-200">
                {filteredItems.map(item => (
                  <div key={item.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <input
                          type="checkbox"
                          checked={selectedItems.has(item.id)}
                          onChange={(e) => {
                            const newSelected = new Set(selectedItems);
                            if (e.target.checked) {
                              newSelected.add(item.id);
                            } else {
                              newSelected.delete(item.id);
                            }
                            setSelectedItems(newSelected);
                          }}
                          className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            {getStatusIcon(item.status)}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(item.priority)}`}>
                              {item.priority.toUpperCase()}
                            </span>
                            <span className="text-sm text-gray-500">
                              {getContentTypeLabel(item.contentType)}
                            </span>
                          </div>
                          
                          <h4 className="text-lg font-medium text-gray-900 mb-2">
                            {typeof item.content === 'object' && item.content.name 
                              ? item.content.name 
                              : item.content.word || 'Content Item'}
                          </h4>
                          
                          <p className="text-sm text-gray-600 mb-2">
                            {typeof item.content === 'object' && item.content.description 
                              ? item.content.description 
                              : 'No description available'}
                          </p>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>By: {item.authorInfo.username}</span>
                            <span>Submitted: {new Date(item.submittedAt).toLocaleDateString()}</span>
                            {item.reportCount > 0 && (
                              <span className="text-red-600">
                                {item.reportCount} report{item.reportCount > 1 ? 's' : ''}
                              </span>
                            )}
                            {item.autoFlagReason && (
                              <span className="text-orange-600">
                                Auto-flagged: {item.autoFlagReason}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => handleModerationAction(item.id, ModerationAction.APPROVE, 'Content approved')}
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleModerationAction(item.id, ModerationAction.REJECT, 'Content rejected')}
                          className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleModerationAction(item.id, ModerationAction.FLAG, 'Content flagged for review')}
                          className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700 transition-colors"
                        >
                          Flag
                        </button>
                        <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {filteredItems.length === 0 && (
                <div className="p-8 text-center">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No items to review</h3>
                  <p className="text-gray-600">All content has been reviewed or no items match your filters.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Placeholder for other tabs */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Moderation History</h3>
            <p className="text-gray-600">View detailed history of all moderation actions.</p>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">User Management</h3>
            <p className="text-gray-600">Manage user accounts, violations, and permissions.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminModerationPanel;