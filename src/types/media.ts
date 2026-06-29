export interface MediaItem {
  id?: number;
  title: string;
  title_cn?: string;
  type: string;
  status: string;
  score?: number;
  episodes?: number;
  progress?: number;
  cover_url?: string;
  summary?: string;
  tags?: string;
  comment?: string;
  start_date?: string;
  finish_date?: string;
  platform?: string;
  platform_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MediaStats {
  watching: number;
  completed: number;
  plan: number;
  paused: number;
  dropped: number;
  total: number;
}
