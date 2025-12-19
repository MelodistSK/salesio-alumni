// スケジュールイベント
export interface ScheduleEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  location?: string;
  details?: string[];
  notes: string;
  isHighlight?: boolean;
  order: number;
}

// 改善ポイント
export interface Improvement {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  notes: string;
  status: 'pending' | 'in-progress' | 'done';
  priority: 'high' | 'medium' | 'low';
  order: number;
}

// 用語
export interface GlossaryTerm {
  id: string;
  term: string;
  reading?: string;
  description: string;
  category: string;
  relatedTerms?: string[];
}

// 同窓会誌コンテンツ
export interface MagazineContent {
  id: string;
  title: string;
  pages: number; // 0.2単位
  deadline: string;
  assignee: string;
  assigneeRole?: string;
  status: 'not-started' | 'requesting' | 'in-progress' | 'review' | 'done';
  notes: string;
  tasks: MagazineTask[];
  order: number;
  isColorPage?: boolean;
}

export interface MagazineTask {
  id: string;
  type: 'text' | 'photo' | 'data';
  description: string;
  assignee: string;
  completed: boolean;
}

// ステータスラベル
export const STATUS_LABELS = {
  'not-started': '未着手',
  'requesting': '依頼中',
  'in-progress': '作成中',
  'review': '確認中',
  'done': '完了',
} as const;

export const STATUS_COLORS = {
  'not-started': 'bg-gray-100 text-gray-600',
  'requesting': 'bg-blue-100 text-blue-600',
  'in-progress': 'bg-yellow-100 text-yellow-600',
  'review': 'bg-purple-100 text-purple-600',
  'done': 'bg-green-100 text-green-600',
} as const;
