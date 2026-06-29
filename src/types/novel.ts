export interface Novel {
  id?: number;
  title: string;
  author?: string;
  synopsis?: string;
  cover_path?: string;
  status: string;
  word_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface NovelChapter {
  id?: number;
  novel_id: number;
  title: string;
  content: string;
  word_count?: number;
  sort_order: number;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface NovelInspiration {
  id?: number;
  novel_id?: number;
  content: string;
  source?: string;
  tags?: string;
  created_at?: string;
}
