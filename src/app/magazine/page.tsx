'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { MagazineContent, STATUS_LABELS, STATUS_COLORS } from '@/types';
import { magazineApi, initializeDatabase } from '@/lib/api';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  Plus,
  Minus,
  Save,
  ChevronDown,
  ChevronUp,
  FileText,
  Camera,
  Database,
  User,
  Calendar,
} from 'lucide-react';

// ソート可能なアイテムコンポーネント
function SortableItem({
  content,
  pageStart,
  isInColorZone,
  onUpdate,
  onPageChange,
  expanded,
  onToggleExpand,
}: {
  content: MagazineContent;
  pageStart: number;
  isInColorZone: boolean;
  onUpdate: (id: string, updates: Partial<MagazineContent>) => void;
  onPageChange: (id: string, delta: number) => void;
  expanded: boolean;
  onToggleExpand: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: content.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const pageEnd = pageStart + content.pages;
  const statusColors = STATUS_COLORS[content.status];

  const taskIcons = {
    text: <FileText size={14} />,
    photo: <Camera size={14} />,
    data: <Database size={14} />,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-xl shadow-sm overflow-hidden transition-all ${
        isDragging ? 'opacity-50 shadow-lg scale-[1.02]' : ''
      } ${isInColorZone ? 'ring-2 ring-gold ring-offset-2' : ''}`}
    >
      {/* カラーページバッジ */}
      {isInColorZone && (
        <div className="bg-gradient-to-r from-yellow-100 to-orange-100 px-4 py-1 text-xs font-medium text-orange-700 flex items-center gap-1">
          🎨 カラーページ（P8-9）エリア
        </div>
      )}

      {/* メインコンテンツ */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* ドラッグハンドル */}
          <button
            {...attributes}
            {...listeners}
            className="mt-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
          >
            <GripVertical size={20} />
          </button>

          {/* ページ番号 */}
          <div className="flex-shrink-0 text-center">
            <div className="text-xs text-gray-500">P</div>
            <div className="text-lg font-bold text-primary">
              {pageStart.toFixed(1)}
            </div>
            <div className="text-xs text-gray-400">〜{pageEnd.toFixed(1)}</div>
          </div>

          {/* コンテンツ情報 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-gray-800">{content.title}</h3>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors}`}
              >
                {STATUS_LABELS[content.status]}
              </span>
            </div>

            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <User size={14} />
                {content.assignee}
                {content.assigneeRole && (
                  <span className="text-xs text-gray-400">({content.assigneeRole})</span>
                )}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                {new Date(content.deadline).toLocaleDateString('ja-JP', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>

          {/* ページ数調整 */}
          <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1">
            <button
              onClick={() => onPageChange(content.id, -0.2)}
              disabled={content.pages <= 0.2}
              className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Minus size={16} />
            </button>
            <span className="w-12 text-center font-mono font-medium">
              {content.pages.toFixed(1)}P
            </span>
            <button
              onClick={() => onPageChange(content.id, 0.2)}
              className="p-1.5 rounded hover:bg-gray-200"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* 展開ボタン */}
          <button
            onClick={onToggleExpand}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>

        {/* 展開コンテンツ */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-gray-100 animate-fadeIn">
            {/* ステータス選択 */}
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-500 block mb-2">
                ステータス
              </label>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(STATUS_LABELS) as Array<keyof typeof STATUS_LABELS>).map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() => onUpdate(content.id, { status })}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        content.status === status
                          ? STATUS_COLORS[status] + ' ring-2 ring-offset-1 ring-current'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {STATUS_LABELS[status]}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* タスク一覧 */}
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-500 block mb-2">
                タスク
              </label>
              <div className="space-y-2">
                {content.tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-center gap-3 p-2 rounded-lg ${
                      task.completed ? 'bg-green-50' : 'bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => {
                        const updatedTasks = content.tasks.map((t) =>
                          t.id === task.id ? { ...t, completed: !t.completed } : t
                        );
                        onUpdate(content.id, { tasks: updatedTasks });
                      }}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <span
                      className={`text-gray-500 ${
                        task.type === 'text'
                          ? 'text-blue-500'
                          : task.type === 'photo'
                          ? 'text-green-500'
                          : 'text-purple-500'
                      }`}
                    >
                      {taskIcons[task.type]}
                    </span>
                    <span
                      className={`flex-1 text-sm ${
                        task.completed ? 'text-gray-400 line-through' : 'text-gray-700'
                      }`}
                    >
                      {task.description}
                    </span>
                    <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded">
                      {task.assignee}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* メモ */}
            <div>
              <label className="text-sm font-medium text-gray-500 block mb-2">
                メモ・進捗
              </label>
              <textarea
                value={content.notes}
                onChange={(e) => onUpdate(content.id, { notes: e.target.value })}
                placeholder="進捗状況やメモを入力..."
                className="w-full p-3 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                rows={3}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MagazinePage() {
  const [contents, setContents] = useState<MagazineContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      await initializeDatabase();
      const data = await magazineApi.getAll();
      setContents(data.sort((a, b) => a.order - b.order));
    } catch (error) {
      console.error('Failed to load magazine contents:', error);
    } finally {
      setLoading(false);
    }
  }

  // 合計ページ数
  const totalPages = contents.reduce((sum, c) => sum + c.pages, 0);
  const targetPages = 14;
  const pagePercentage = Math.min((totalPages / targetPages) * 100, 100);

  // 各コンテンツの開始ページを計算
  function getPageStart(index: number): number {
    let start = 1; // 表紙の次から
    for (let i = 0; i < index; i++) {
      start += contents[i].pages;
    }
    return start;
  }

  // カラーページ（P8-9）にかかっているか判定
  function isInColorZone(index: number): boolean {
    const start = getPageStart(index);
    const end = start + contents[index].pages;
    return (start <= 9 && end >= 8) || (start >= 8 && start <= 9);
  }

  // ドラッグ終了時
  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = contents.findIndex((c) => c.id === active.id);
    const newIndex = contents.findIndex((c) => c.id === over.id);

    const newContents = arrayMove(contents, oldIndex, newIndex).map((c, i) => ({
      ...c,
      order: i + 1,
    }));

    setContents(newContents);

    // Firebaseに保存
    try {
      await magazineApi.updateOrder(
        newContents.map((c) => ({ id: c.id, order: c.order }))
      );
    } catch (error) {
      console.error('Failed to update order:', error);
    }
  }

  // コンテンツ更新
  async function handleUpdate(id: string, updates: Partial<MagazineContent>) {
    setSaving(true);
    try {
      await magazineApi.update({ id, ...updates });
      setContents((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
      );
    } catch (error) {
      console.error('Failed to update:', error);
    } finally {
      setSaving(false);
    }
  }

  // ページ数変更
  function handlePageChange(id: string, delta: number) {
    const content = contents.find((c) => c.id === id);
    if (!content) return;

    const newPages = Math.max(0.2, Math.round((content.pages + delta) * 10) / 10);
    handleUpdate(id, { pages: newPages });
  }

  // 完了率
  const completedCount = contents.filter((c) => c.status === 'done').length;
  const completionRate = Math.round((completedCount / contents.length) * 100);

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
            📖 同窓会誌「心のふるさと」
          </h1>
          <p className="mt-2 text-white/80">
            16ページ構成（表紙1P + 本文14P + 裏表紙1P）・入稿期限: 3月末
          </p>
        </div>
      </div>

      {/* ページゲージ */}
      <div className="max-w-4xl mx-auto px-4 -mt-4">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-600">本文ページ数</span>
              <span
                className={`text-2xl font-bold ${
                  totalPages > targetPages
                    ? 'text-red-500'
                    : totalPages === targetPages
                    ? 'text-green-500'
                    : 'text-primary'
                }`}
              >
                {totalPages.toFixed(1)} / {targetPages}P
              </span>
              {totalPages > targetPages && (
                <span className="text-sm text-red-500 font-medium">
                  ⚠️ {(totalPages - targetPages).toFixed(1)}P オーバー
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">進捗: {completionRate}%</span>
              {saving && (
                <span className="text-sm text-blue-500 flex items-center gap-1">
                  <Save size={14} className="animate-pulse" />
                  保存中...
                </span>
              )}
            </div>
          </div>

          {/* ゲージ */}
          <div className="relative h-8 bg-gray-100 rounded-full overflow-hidden">
            {/* 14P目標ライン */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-green-500 z-10"
              style={{ left: '100%' }}
            />

            {/* カラーページエリア（P8-9） */}
            <div
              className="absolute top-0 bottom-0 bg-yellow-200/50 border-x-2 border-dashed border-yellow-400"
              style={{
                left: `${(7 / targetPages) * 100}%`,
                width: `${(2 / targetPages) * 100}%`,
              }}
            />

            {/* 現在のページ数 */}
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                totalPages > targetPages
                  ? 'bg-red-400'
                  : totalPages >= targetPages * 0.9
                  ? 'bg-green-400'
                  : 'bg-blue-400'
              }`}
              style={{ width: `${Math.min(pagePercentage, 110)}%` }}
            />

            {/* ページ番号ラベル */}
            <div className="absolute inset-0 flex items-center justify-around text-xs text-gray-500 font-medium">
              {[2, 4, 6, 8, 10, 12, 14].map((p) => (
                <span key={p} className={p === 8 || p === 10 ? 'text-yellow-700' : ''}>
                  {p}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
            <span>表紙</span>
            <span className="text-yellow-600 font-medium">← P8-9: カラーページ →</span>
            <span>裏表紙</span>
          </div>
        </div>
      </div>

      {/* コンテンツリスト */}
      <div className="max-w-4xl mx-auto px-4 mt-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={contents.map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {contents.map((content, index) => (
                <SortableItem
                  key={content.id}
                  content={content}
                  pageStart={getPageStart(index)}
                  isInColorZone={isInColorZone(index)}
                  onUpdate={handleUpdate}
                  onPageChange={handlePageChange}
                  expanded={expandedId === content.id}
                  onToggleExpand={() =>
                    setExpandedId(expandedId === content.id ? null : content.id)
                  }
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {/* 凡例 */}
      <div className="max-w-4xl mx-auto px-4 mt-8">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-3">凡例</h3>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-yellow-200 border border-yellow-400" />
              <span>カラーページエリア</span>
            </div>
            <div className="flex items-center gap-2">
              <GripVertical size={16} className="text-gray-400" />
              <span>ドラッグで並び替え</span>
            </div>
            {Object.entries(STATUS_LABELS).map(([key, label]) => (
              <div key={key} className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded text-xs ${
                    STATUS_COLORS[key as keyof typeof STATUS_COLORS]
                  }`}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
