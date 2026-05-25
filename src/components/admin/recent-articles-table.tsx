'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { Edit, Eye } from 'lucide-react';
import type { News } from '@/types';

interface RecentArticlesTableProps {
  articles: News[];
}

const statusColors: Record<string, string> = {
  published: 'bg-green-100 text-green-800',
  draft: 'bg-yellow-100 text-yellow-800',
  archived: 'bg-slate-100 text-slate-800',
};

export function RecentArticlesTable({ articles }: RecentArticlesTableProps) {
  if (articles.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Henüz haber yok. İlk haberinizi oluşturun!
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b text-left">
            <th className="pb-3 text-sm font-medium text-muted-foreground">
              Başlık
            </th>
            <th className="pb-3 text-sm font-medium text-muted-foreground hidden sm:table-cell">
              Durum
            </th>
            <th className="pb-3 text-sm font-medium text-muted-foreground hidden md:table-cell">
              Tarih
            </th>
            <th className="pb-3 text-sm font-medium text-muted-foreground text-right">
              İşlemler
            </th>
          </tr>
        </thead>
        <tbody>
          {articles.map((article) => (
            <tr key={article.id} className="border-b last:border-0">
              <td className="py-3 pr-4">
                <p className="font-medium text-sm truncate max-w-[300px]">
                  {article.title}
                </p>
                <p className="text-xs text-muted-foreground sm:hidden">
                  {article.status}
                </p>
              </td>
              <td className="py-3 pr-4 hidden sm:table-cell">
                <Badge
                  variant="secondary"
                  className={statusColors[article.status] || ''}
                >
                  {article.status}
                </Badge>
              </td>
              <td className="py-3 pr-4 hidden md:table-cell">
                <span className="text-sm text-muted-foreground">
                  {formatDate(article.published_at || article.updated_at)}
                </span>
              </td>
              <td className="py-3 text-right">
                <div className="flex items-center justify-end gap-1">
                  <Link href={`/news/${article.slug}`} target="_blank">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href={`/admin/news/${article.id}/edit`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
