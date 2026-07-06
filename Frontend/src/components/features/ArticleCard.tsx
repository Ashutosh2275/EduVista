import { Link } from 'react-router-dom';
import { ArrowRight, Clock } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Avatar, Button, Badge } from '../ui';
import { ImageWithFallback } from '../ui/ImageWithFallback';
import type { InsightArticle } from '../../types';

interface ArticleCardProps {
  article: InsightArticle;
  variant?: 'default' | 'featured' | 'horizontal';
  className?: string;
}

export function ArticleCard({ article, variant = 'default', className }: ArticleCardProps) {
  if (variant === 'featured') {
    return (
      <div
        className={cn(
          'group grid lg:grid-cols-2 gap-0 bg-surface rounded-3xl overflow-hidden shadow-large border border-border',
          'transition-all duration-500 hover:shadow-glow',
          className
        )}
      >
        <Link to={`/insights/${article.id}`} className="relative h-64 lg:h-auto min-h-[280px] overflow-hidden block">
          <ImageWithFallback
            src={article.coverImage}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent lg:bg-gradient-to-r" />
          <Badge variant="accent" size="md" className="absolute top-6 left-6">
            Featured
          </Badge>
        </Link>

        <div className="p-8 lg:p-10 flex flex-col justify-center">
          <Badge variant="outline" size="sm" className="w-fit mb-4">
            {article.category}
          </Badge>
          <Link to={`/insights/${article.id}`}>
            <h2 className="text-display-sm font-heading font-semibold text-primary mb-4 group-hover:text-accent transition-colors">
              {article.title}
            </h2>
          </Link>
          <p className="text-body text-muted mb-6 line-clamp-3">{article.excerpt}</p>

          <div className="flex items-center gap-3 mb-6">
            <Avatar src={article.author.avatar} alt={article.author.name} size="md" />
            <div>
              <p className="text-body-sm font-medium text-primary">{article.author.name}</p>
              {article.author.role && (
                <p className="text-body-xs text-muted">{article.author.role}</p>
              )}
            </div>
            <span className="text-body-xs text-muted ml-auto flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {article.readTime}
            </span>
          </div>

          <Link to={`/insights/${article.id}`}>
            <Button icon={<ArrowRight className="w-4 h-4" />} iconPosition="right">
              Read Article
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (variant === 'horizontal') {
    return (
      <Link
        to={`/insights/${article.id}`}
        className={cn(
          'group flex flex-col sm:flex-row gap-4 bg-surface rounded-2xl p-4 border border-border',
          'transition-all duration-300 hover:border-accent/30 hover:shadow-soft',
          className
        )}
      >
        <ImageWithFallback
          src={article.coverImage}
          alt={article.title}
          className="w-full sm:w-32 h-32 rounded-xl object-cover shrink-0"
        />
        <div className="flex-1 min-w-0">
          <Badge variant="outline" size="sm" className="mb-2">{article.category}</Badge>
          <h3 className="text-heading-sm font-semibold text-primary group-hover:text-accent transition-colors line-clamp-2">
            {article.title}
          </h3>
          <p className="text-body-xs text-muted mt-1 line-clamp-2">{article.excerpt}</p>
          <div className="flex items-center gap-2 mt-3 text-body-xs text-muted">
            <span>{article.author.name}</span>
            <span>·</span>
            <span>{article.readTime}</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <article
      className={cn(
        'group bg-surface rounded-3xl overflow-hidden shadow-soft border border-border',
        'transition-all duration-500 hover:shadow-large hover:-translate-y-1',
        className
      )}
    >
      <Link to={`/insights/${article.id}`} className="block">
        <div className="relative h-48 overflow-hidden">
          <ImageWithFallback
            src={article.coverImage}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>

        <div className="p-6">
          <Badge variant="outline" size="sm" className="mb-3">{article.category}</Badge>
          <h3 className="text-heading-md font-semibold text-primary mb-2 group-hover:text-accent transition-colors line-clamp-2">
            {article.title}
          </h3>
          <p className="text-body-sm text-muted line-clamp-2 mb-4">{article.excerpt}</p>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Avatar src={article.author.avatar} alt={article.author.name} size="sm" />
              <span className="text-body-xs text-muted">{article.author.name}</span>
            </div>
            <div className="flex items-center gap-1 text-body-xs text-muted">
              <Clock className="w-3 h-3" />
              {article.readTime}
            </div>
          </div>
        </div>
      </Link>

      <div className="px-6 pb-6 -mt-2">
        <Link to={`/insights/${article.id}`}>
          <Button variant="outline" fullWidth icon={<ArrowRight className="w-4 h-4" />} iconPosition="right">
            Read More
          </Button>
        </Link>
      </div>
    </article>
  );
}
