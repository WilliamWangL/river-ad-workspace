'use client';

import { useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Category } from '@/types';
import { useTranslations } from 'next-intl';
import {
  Laptop,
  Shirt,
  Home,
  Sparkles,
  Dumbbell,
  Baby,
  ShoppingBasket,
  Heart,
  Tag,
  Layers,
  type LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

const IconMap: Record<string, LucideIcon> = {
  Laptop,
  Shirt,
  Home,
  Sparkles,
  Dumbbell,
  Baby,
  ShoppingBasket,
  Heart,
};

interface DealCategoryFilterProps {
  categories: Category[];
}

/**
 * 在 category tree 中查找指定 slug 的分类
 */
function findCategoryBySlug(categories: Category[], slug: string): Category | null {
  for (const cat of categories) {
    if (cat.slug === slug) return cat;
    if (cat.children) {
      const found = findCategoryBySlug(cat.children, slug);
      if (found) return found;
    }
  }
  return null;
}

export function DealCategoryFilter({ categories }: DealCategoryFilterProps) {
  const t = useTranslations('deals');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSlug = searchParams.get('category') || '';
  const selectedCategory = currentSlug ? findCategoryBySlug(categories, currentSlug) : null;
  const subcategories = selectedCategory?.children || [];

  const handleCategoryClick = (slug: string | null) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (slug) {
        params.set('category', slug);
      } else {
        params.delete('category');
      }
      params.delete('page'); // 切换分类时重置分页
      router.push(`?${params.toString()}`, { scroll: false });
    });
  };

  if (categories.length === 0) return null;

  return (
    <div className={cn('space-y-2.5 pt-2', isPending && 'opacity-60 pointer-events-none transition-opacity')}>
      {/* 一级分类 pills */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
        {/* All */}
        <button
          onClick={() => handleCategoryClick(null)}
          className={cn(
            'inline-flex items-center gap-1.5 shrink-0 px-4 py-2 rounded-full text-sm font-medium',
            'transition-all duration-200',
            !currentSlug
              ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
              : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
        >
          <Layers className="w-3.5 h-3.5" />
          {t('categoryFilter.all')}
        </button>

        {/* 各一级分类 */}
        {categories.map((cat) => {
          const Icon = IconMap[cat.icon || ''] || Tag;
          const isActive = currentSlug === cat.slug;
          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(isActive ? null : cat.slug)}
              className={cn(
                'inline-flex items-center gap-1.5 shrink-0 px-4 py-2 rounded-full text-sm font-medium',
                'transition-all duration-200',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* 二级子分类 pills — 仅当选中分类有子分类时显示 */}
      {subcategories.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-0.5 -mx-1 px-1">
          {/* All subcategories — 指向父分类 */}
          <button
            onClick={() => handleCategoryClick(selectedCategory!.slug)}
            className={cn(
              'inline-flex items-center gap-1 shrink-0 px-3 py-1.5 rounded-full text-xs font-medium',
              'transition-all duration-200',
              currentSlug === selectedCategory!.slug
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'bg-background text-muted-foreground border border-border/50 hover:border-primary/30 hover:text-primary'
            )}
          >
            {t('categoryFilter.allSubcategories')}
          </button>
          {subcategories.map((sub) => (
            <button
              key={sub.id}
              onClick={() => handleCategoryClick(sub.slug)}
              className={cn(
                'inline-flex items-center shrink-0 px-3 py-1.5 rounded-full text-xs font-medium',
                'transition-all duration-200',
                currentSlug === sub.slug
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'bg-background text-muted-foreground border border-border/50 hover:border-primary/30 hover:text-primary'
              )}
            >
              {sub.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
