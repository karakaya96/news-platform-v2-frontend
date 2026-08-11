// Types matching the Cloudflare D1 / Worker API response format

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'editor';
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  sortOrder: number;
  createdAt: string;
  // Computed (from joins)
  articleCount?: number;
  article_count?: number; // Backend returns snake_case
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
  imageUrl: string | null;
  imageAlt: string | null;
  categoryId: number;
  authorId: number;
  status: 'draft' | 'published' | 'archived';
  isFeatured: boolean;
  isBreaking: boolean;
  viewCount: number;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  // Joined fields
  categoryName?: string;
  categorySlug?: string;
  categoryColor?: string;
  authorName?: string;
  tags?: Tag[];
  related?: News[];
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
  imageUrl?: string;
  imageAlt?: string;
  categoryId: number;
  status?: 'draft' | 'published' | 'archived';
  isFeatured?: boolean;
  isBreaking?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  tagIds?: number[];
}

export interface UpdateNewsRequest extends Partial<CreateNewsRequest> {}

export interface CreateCategoryRequest {
  name: string;
  slug?: string;
  description?: string;
  color?: string;
  sortOrder?: number;
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {}

export interface CommentItem {
  id: number;
  newsId: number;
  parentId: number | null;
  authorName: string;
  authorEmail: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected' | 'spam';
  ip_address: string | null;
  createdAt: string;
  updatedAt: string;
  newsTitle?: string;
  newsSlug?: string;
  replyCount?: number;
  // For nested replies
  replies?: CommentItem[];
}

export interface CommentStats {
  pending: number;
  approved: number;
  rejected: number;
  spam: number;
}
