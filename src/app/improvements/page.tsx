'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Improvement } from '@/types';
import { improvementsApi, initializeDatabase } from '@/lib/api';
import {
  Lightbulb,
  Calendar,
  ChevronDown,
  ChevronUp,
  Save,
  AlertTriangle,
  Clock,
  CheckCircle,
} from 'lucide-react';

const STATUS_CONFIG = {
  pending: {
    label: '未着手',
    color: 'bg-gray-100 text-gray-600',
    icon: Clock,
  },
  'in-progress': {
    label: '進行中',
    color: 'bg-yellow-100 text-yellow-600',
    icon: AlertTriangle,
  },
  done: {
    label: '完了',
    color: 'bg-green-100 text-green-600',
    icon: CheckCircle,
  },
};

const PRIORITY_CONFIG = {
  high: { label: '高', color: 'text-red-500 bg-red-50' },
  medium: { label: '中', color: 'text-yellow-600 bg-yellow-50' },
  low: { label: '低', color: 'text-gray-500 bg-gray-50' },
};

export default function ImprovementsPage() {
  const [improvements, setImprovements] = useState<Improvement[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      await initializeDatabase();
      const data = await improvementsApi.getAll();
      setImprovements(data);
      const notes: { [key: string]: string } = {};
      data.forEach((item) => {
        notes[item.id] = item.notes || '';
      });
      setEditingNotes(notes);
    } catch (error) {
      console.error('Failed to load improvements:', error);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, status: Improvement['status']) {
    try {
      await improvementsApi.update({ id, status });
      setImprovements((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status } : item))
      );
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  }

  async function saveNotes(id: string) {
    try {
      await improvementsApi.update({ id, notes: editingNotes[id] });
      setImprovements((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, notes: editingNotes[id] } : item
        )
      );
    } catch (error) {
      console.error('Failed to save notes:', error);
    }
  }

  async function updateTargetDate(id: string, targetDate: string) {
    try {
      await improvementsApi.update({ id, targetDate });
      setImprovements((prev) =>
        prev.map((item) => (item.id === id ? { ...item, targetDate } : item))
      );
    } catch (error) {
      console.error('Failed to update target date:', error);
    }
  }

  // 優先度でソート
  const sortedImprovements = [...improvements].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const statusOrder = { pending: 0, 'in-progress': 1, done: 2 };

    if (a.status === 'done' && b.status !== 'done') return 1;
    if (a.status !== 'done' && b.status === 'done') return -1;

    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  // 統計
  const stats = {
    total: improvements.length,
    done: improvements.filter((i) => i.status === 'done').length,
    inProgress: improvements.filter((i) => i.status === 'in-progress').length,
    pending: improvements.filter((i) => i.status === 'pending').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8">
      <Navigation />

      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-primary to-primary-light text-white py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Lightbulb size={28} />
            今後の改善ポイント
          </h1>
          <p className="mt-2 text-white/80">
            同窓会運営をより良くするための取り組み
          </p>
        </div>
      </div>

      {/* 統計 */}
      <div className="max-w-4xl mx-auto px-4 -mt-4">
        <div className="bg-white rounded-xl shadow-lg p-4 grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
            <div className="text-sm text-gray-500">全体</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-500">{stats.pending}</div>
            <div className="text-sm text-gray-500">未着手</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-500">{stats.inProgress}</div>
            <div className="text-sm text-gray-500">進行中</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">{stats.done}</div>
            <div className="text-sm text-gray-500">完了</div>
          </div>
        </div>
      </div>

      {/* 改善ポイントリスト */}
      <div className="max-w-4xl mx-auto px-4 mt-6 space-y-4">
        {sortedImprovements.map((item) => {
          const isExpanded = expandedId === item.id;
          const statusConfig = STATUS_CONFIG[item.status];
          const priorityConfig = PRIORITY_CONFIG[item.priority];
          const StatusIcon = statusConfig.icon;

          return (
            <div
              key={item.id}
              className={`bg-white rounded-xl shadow-sm overflow-hidden transition-all ${
                item.status === 'done' ? 'opacity-60' : ''
              }`}
            >
              {/* ヘッダー */}
              <div
                className="p-4 cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
              >
                <div className="flex items-start gap-4">
                  {/* 優先度 */}
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${priorityConfig.color}`}
                  >
                    {priorityConfig.label}
                  </div>

                  {/* コンテンツ */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3
                        className={`font-bold text-gray-800 ${
                          item.status === 'done' ? 'line-through' : ''
                        }`}
                      >
                        {item.title}
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${statusConfig.color}`}
                      >
                        <StatusIcon size={12} />
                        {statusConfig.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                      <Calendar size={14} />
                      <span>目標: {new Date(item.targetDate).toLocaleDateString('ja-JP')}</span>
                    </div>
                  </div>

                  <button className="text-gray-400 hover:text-gray-600 p-1">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                </div>
              </div>

              {/* 展開コンテンツ */}
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-gray-100 pt-4 animate-fadeIn">
                  {/* ステータス変更 */}
                  <div className="mb-4">
                    <label className="text-sm font-medium text-gray-500 block mb-2">
                      ステータス
                    </label>
                    <div className="flex gap-2">
                      {(Object.keys(STATUS_CONFIG) as Array<keyof typeof STATUS_CONFIG>).map(
                        (status) => {
                          const config = STATUS_CONFIG[status];
                          const Icon = config.icon;
                          return (
                            <button
                              key={status}
                              onClick={() => updateStatus(item.id, status)}
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 transition-all ${
                                item.status === status
                                  ? config.color + ' ring-2 ring-offset-1'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              <Icon size={14} />
                              {config.label}
                            </button>
                          );
                        }
                      )}
                    </div>
                  </div>

                  {/* 目標期日 */}
                  <div className="mb-4">
                    <label className="text-sm font-medium text-gray-500 block mb-2">
                      目標期日
                    </label>
                    <input
                      type="date"
                      value={item.targetDate}
                      onChange={(e) => updateTargetDate(item.id, e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>

                  {/* メモ */}
                  <div>
                    <label className="text-sm font-medium text-gray-500 block mb-2">
                      メモ・進捗
                    </label>
                    <div className="flex gap-2">
                      <textarea
                        value={editingNotes[item.id] || ''}
                        onChange={(e) =>
                          setEditingNotes((prev) => ({
                            ...prev,
                            [item.id]: e.target.value,
                          }))
                        }
                        placeholder="進捗状況やメモを入力..."
                        className="flex-1 p-3 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        rows={3}
                      />
                      <button
                        onClick={() => saveNotes(item.id)}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors flex items-center gap-1 h-fit"
                      >
                        <Save size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 第二象限タスク */}
      <div className="max-w-4xl mx-auto px-4 mt-8">
        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 border border-red-200">
          <h2 className="font-bold text-lg text-red-800 mb-2 flex items-center gap-2">
            🎯 第二象限タスク（重要だが緊急でない）
          </h2>
          <p className="text-red-700">
            バザーの仕切りよりも<strong>「同窓会要員を集める」</strong>ことが最重要！
          </p>
          <p className="text-sm text-red-600 mt-2">
            若い世代への声かけ、山梨くんたちとの協力、前後の学年も含めて仲間づくり。
          </p>
        </div>
      </div>
    </div>
  );
}
