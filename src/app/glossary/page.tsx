'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { GlossaryTerm } from '@/types';
import { glossaryApi, initializeDatabase } from '@/lib/api';
import { BookOpen, Search, Users, Building, Heart } from 'lucide-react';

const CATEGORY_CONFIG: {
  [key: string]: { label: string; color: string; icon: React.ElementType };
} = {
  組織: { label: '組織', color: 'bg-blue-100 text-blue-700', icon: Building },
  同窓会: { label: '同窓会', color: 'bg-green-100 text-green-700', icon: Heart },
  役割: { label: '役割', color: 'bg-purple-100 text-purple-700', icon: Users },
};

export default function GlossaryPage() {
  const [terms, setTerms] = useState<GlossaryTerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      await initializeDatabase();
      const data = await glossaryApi.getAll();
      setTerms(data);
    } catch (error) {
      console.error('Failed to load glossary:', error);
    } finally {
      setLoading(false);
    }
  }

  // フィルタリング
  const filteredTerms = terms.filter((term) => {
    const matchesSearch =
      searchQuery === '' ||
      term.term.includes(searchQuery) ||
      term.description.includes(searchQuery) ||
      (term.reading && term.reading.includes(searchQuery));

    const matchesCategory =
      selectedCategory === null || term.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // カテゴリ別にグループ化
  const categories = Array.from(new Set(terms.map((t) => t.category)));

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
            <BookOpen size={28} />
            用語集
          </h1>
          <p className="mt-2 text-white/80">
            サレジアンファミリーと同窓会に関する用語
          </p>
        </div>
      </div>

      {/* 検索とフィルター */}
      <div className="max-w-4xl mx-auto px-4 -mt-4">
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* 検索 */}
            <div className="flex-1 relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="用語を検索..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            {/* カテゴリフィルター */}
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === null
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                すべて
              </button>
              {categories.map((category) => {
                const config = CATEGORY_CONFIG[category] || {
                  label: category,
                  color: 'bg-gray-100 text-gray-600',
                };
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? config.color + ' ring-2 ring-offset-1'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {config.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 組織構造図 */}
      <div className="max-w-4xl mx-auto px-4 mt-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            🏛️ サレジアンファミリー組織構造
          </h2>
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              {/* ドン・ボスコ */}
              <div className="flex justify-center mb-4">
                <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-400 rounded-xl p-4 text-center">
                  <div className="text-2xl mb-1">⭐</div>
                  <div className="font-bold text-yellow-800">ドン・ボスコ</div>
                  <div className="text-xs text-yellow-600">創立者</div>
                </div>
              </div>

              {/* 矢印 */}
              <div className="flex justify-center mb-4">
                <div className="w-0.5 h-8 bg-gray-300"></div>
              </div>

              {/* サレジオ会 & サレジアンシスターズ */}
              <div className="flex justify-center gap-8 mb-4">
                <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-4 text-center w-48">
                  <div className="text-xl mb-1">👨‍👦</div>
                  <div className="font-bold text-blue-800">サレジオ会</div>
                  <div className="text-xs text-blue-600">男子修道会</div>
                  <div className="text-xs text-gray-500 mt-1">2025年: 日本来日100周年</div>
                </div>
                <div className="bg-pink-50 border-2 border-pink-300 rounded-xl p-4 text-center w-48">
                  <div className="text-xl mb-1">👩‍👧</div>
                  <div className="font-bold text-pink-800">サレジアンシスターズ</div>
                  <div className="text-xs text-pink-600">女子修道会（扶助者聖母会）</div>
                  <div className="text-xs text-gray-500 mt-1">静岡サレジオの母体</div>
                </div>
              </div>

              {/* 矢印 */}
              <div className="flex justify-center gap-8 mb-4">
                <div className="w-48 flex justify-center">
                  <div className="w-0.5 h-8 bg-gray-300"></div>
                </div>
                <div className="w-48 flex justify-center">
                  <div className="w-0.5 h-8 bg-gray-300"></div>
                </div>
              </div>

              {/* 同窓会 */}
              <div className="flex justify-center gap-8">
                <div className="bg-blue-100/50 border border-blue-200 rounded-lg p-3 text-center w-48">
                  <div className="text-sm font-medium text-blue-700">男子校の同窓会</div>
                </div>
                <div className="bg-pink-100/50 border border-pink-200 rounded-lg p-3 text-center w-48">
                  <div className="text-sm font-medium text-pink-700">ウニオーネ</div>
                  <div className="text-xs text-pink-600">同窓会世界連合</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 日本のサレジアンシスターズ支部 */}
      <div className="max-w-4xl mx-auto px-4 mt-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            🇯🇵 日本のサレジアンシスターズ支部
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { name: '東京', school: 'サレジアン国際学園', note: '旧：星美学園' },
              { name: '世田谷', school: 'サレジアン国際学園世田谷', note: '旧：目黒星美' },
              { name: '静岡', school: '静岡サレジオ', note: '← ここ！', highlight: true },
              { name: '大阪', school: 'ヴェリタス城星', note: '旧：城星学園' },
              { name: '赤羽', school: '星美ホーム', note: '養護施設' },
              { name: '大分', school: '別府明星', note: '閉校済み' },
            ].map((branch) => (
              <div
                key={branch.name}
                className={`p-3 rounded-lg ${
                  branch.highlight
                    ? 'bg-primary text-white'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className={`font-bold ${branch.highlight ? '' : 'text-gray-800'}`}>
                  {branch.name}支部
                </div>
                <div
                  className={`text-sm ${branch.highlight ? 'text-white/90' : 'text-gray-600'}`}
                >
                  {branch.school}
                </div>
                {branch.note && (
                  <div
                    className={`text-xs mt-1 ${
                      branch.highlight ? 'text-white/70' : 'text-gray-400'
                    }`}
                  >
                    {branch.note}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 用語リスト */}
      <div className="max-w-4xl mx-auto px-4 mt-6 space-y-3">
        {filteredTerms.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            該当する用語が見つかりません
          </div>
        ) : (
          filteredTerms.map((term) => {
            const config = CATEGORY_CONFIG[term.category] || {
              label: term.category,
              color: 'bg-gray-100 text-gray-600',
              icon: BookOpen,
            };
            const Icon = config.icon;

            return (
              <div
                key={term.id}
                className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${config.color}`}
                  >
                    <Icon size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-gray-800">{term.term}</h3>
                      {term.reading && (
                        <span className="text-sm text-gray-400">({term.reading})</span>
                      )}
                      <span className={`px-2 py-0.5 rounded text-xs ${config.color}`}>
                        {config.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{term.description}</p>
                    {term.relatedTerms && term.relatedTerms.length > 0 && (
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className="text-xs text-gray-400">関連:</span>
                        {term.relatedTerms.map((related) => (
                          <button
                            key={related}
                            onClick={() => setSearchQuery(related)}
                            className="text-xs text-primary hover:underline"
                          >
                            {related}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 関係者メモ */}
      <div className="max-w-4xl mx-auto px-4 mt-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            👤 関係者メモ
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                name: '川端先生',
                role: '小学校',
                note: '30歳の集い中心メンバー。末吉先生の写真依頼先。',
              },
              {
                name: '萩原さん',
                role: '事務局',
                note: '卒業生。30歳の集い中心メンバー。',
              },
              {
                name: '中村エリカさん',
                role: 'プライマリー・ミドル担任',
                note: '卒業生。30歳の集いの写真担当。',
              },
              {
                name: '渡辺伸也先生',
                role: '小学校の先生',
                note: '小学校卒業生。末吉先生の追悼文執筆。',
              },
              {
                name: '白田先生',
                role: 'ミドル',
                note: '卒業生。今後の30歳の集い候補。',
              },
              {
                name: 'ミカサ写真館',
                role: '七間町・老舗写真館',
                note: '卒業アルバム・20歳の集い撮影担当。メールで依頼。',
              },
            ].map((person) => (
              <div key={person.name} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-800">{person.name}</span>
                  <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded">
                    {person.role}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{person.note}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
