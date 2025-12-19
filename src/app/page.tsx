'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { ScheduleEvent } from '@/types';
import { scheduleApi, initializeDatabase } from '@/lib/api';
import { Calendar, MapPin, ChevronDown, ChevronUp, Save, Plus } from 'lucide-react';

export default function SchedulePage() {
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      await initializeDatabase();
      const data = await scheduleApi.getAll();
      setEvents(data);
      // 初期化: 各イベントのnotesをeditingNotesにセット
      const notes: { [key: string]: string } = {};
      data.forEach((e) => {
        notes[e.id] = e.notes || '';
      });
      setEditingNotes(notes);
    } catch (error) {
      console.error('Failed to load schedule:', error);
    } finally {
      setLoading(false);
    }
  }

  async function saveNotes(id: string) {
    try {
      await scheduleApi.update({ id, notes: editingNotes[id] });
      setEvents((prev) =>
        prev.map((e) => (e.id === id ? { ...e, notes: editingNotes[id] } : e))
      );
    } catch (error) {
      console.error('Failed to save notes:', error);
    }
  }

  function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    const weekday = weekdays[date.getDay()];
    return `${month}/${day}（${weekday}）`;
  }

  function isUpcoming(dateStr: string) {
    const eventDate = new Date(dateStr);
    const today = new Date();
    const diffDays = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 14;
  }

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
    <div className="min-h-screen">
      <Navigation />

      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-primary to-primary-light text-white py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calendar size={28} />
            年間スケジュール
          </h1>
          <p className="mt-2 text-white/80">2025年度の同窓会イベント</p>
        </div>
      </div>

      {/* イベントリスト */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-4">
          {events.map((event) => {
            const isExpanded = expandedId === event.id;
            const upcoming = isUpcoming(event.date);

            return (
              <div
                key={event.id}
                className={`bg-white rounded-xl shadow-sm border-l-4 overflow-hidden transition-all ${
                  upcoming
                    ? 'border-l-gold bg-yellow-50/30'
                    : event.isHighlight
                    ? 'border-l-accent'
                    : 'border-l-primary'
                }`}
              >
                {/* イベントヘッダー */}
                <div
                  className="p-4 cursor-pointer flex items-start gap-4"
                  onClick={() => setExpandedId(isExpanded ? null : event.id)}
                >
                  <div className="flex-shrink-0 text-center">
                    <div
                      className={`text-2xl font-bold ${
                        upcoming ? 'text-gold' : 'text-primary'
                      }`}
                    >
                      {formatDate(event.date)}
                    </div>
                    {upcoming && (
                      <span className="text-xs bg-gold text-white px-2 py-0.5 rounded-full">
                        まもなく
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-gray-800">{event.title}</h3>
                    {event.description && (
                      <p className="text-gray-600 text-sm mt-0.5">{event.description}</p>
                    )}
                    {event.location && (
                      <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                        <MapPin size={14} />
                        {event.location}
                      </p>
                    )}
                  </div>

                  <button className="text-gray-400 hover:text-gray-600 p-1">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                </div>

                {/* 展開コンテンツ */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-100 pt-4 animate-fadeIn">
                    {/* 詳細 */}
                    {event.details && event.details.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-500 mb-2">詳細</h4>
                        <ul className="space-y-1.5">
                          {event.details.map((detail, idx) => (
                            <li
                              key={idx}
                              className="text-sm text-gray-700 flex items-start gap-2"
                            >
                              <span className="text-primary mt-0.5">•</span>
                              {detail}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* メモ */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">メモ</h4>
                      <div className="flex gap-2">
                        <textarea
                          value={editingNotes[event.id] || ''}
                          onChange={(e) =>
                            setEditingNotes((prev) => ({
                              ...prev,
                              [event.id]: e.target.value,
                            }))
                          }
                          placeholder="メモを入力..."
                          className="flex-1 p-3 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          rows={2}
                        />
                        <button
                          onClick={() => saveNotes(event.id)}
                          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors flex items-center gap-1"
                        >
                          <Save size={16} />
                        </button>
                      </div>
                      {event.notes && editingNotes[event.id] !== event.notes && (
                        <p className="text-xs text-gray-400 mt-1">未保存の変更があります</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* イレギュラー */}
        <div className="mt-8 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
          <h2 className="font-bold text-lg text-orange-800 mb-4 flex items-center gap-2">
            ⚡ イレギュラー対応
          </h2>
          <ul className="space-y-2 text-sm text-orange-900">
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>ローマのサレジアンシスターズ評議員来日の際に対応</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>
                <strong>2025年10月頃</strong> サレジオ会総長来日（静岡に来るかは未定）
              </span>
            </li>
          </ul>
          <div className="mt-4 p-3 bg-white/60 rounded-lg">
            <p className="text-sm text-orange-800">
              <strong>📌 記念年：</strong>
              2025年 サレジオ会日本来日100周年 / 2028年頃 サレジアンシスターズ日本来日100周年
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
