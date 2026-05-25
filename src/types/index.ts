// Types matching the Cloudflare D1 / Worker API response format

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'editor';
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  sort_order: number;
  created_at: string;
  // Computed (from joins)
  article_count?: number;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
}

export interface News {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  image_url: string | null;
  image_alt: string | null;
  category_id: number;
  author_id: number;
  status: 'draft' | 'published' | 'archived';
  is_featured: number;  // SQLite boolean (0/1)
  is_breaking: number;  // SQLite boolean (0/1)
  view_count: number;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  category_name?: string;
  category_slug?: string;
  category_color?: string;
  author_name?: string;
  tags?: Tag[];
}

export interface DashboardStats {
  totalNews: number;
  publishedNews: number;
  draftNews: number;
  totalCategories: number;
  recentNews: News[];
  categoryStats: { name: string; count: number; color: string }[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedNews {
  articles: News[];
  pagination: PaginationMeta;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: PaginationMeta;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

// Form types (for admin)
export interface CreateNewsRequest {
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  image_url?: string;
  image_alt?: string;
  category_id: number;
  status?: 'draft' | 'published' | 'archived';
  is_featured?: boolean;
  is_breaking?: boolean;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  tag_ids?: number[];
}

export interface UpdateNewsRequest extends Partial<CreateNewsRequest> {}

export interface CreateCategoryRequest {
  name: string;
  slug?: string;
  description?: string;
  color?: string;
  sort_order?: number;
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {}
