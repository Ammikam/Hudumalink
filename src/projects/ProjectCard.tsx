// src/components/projects/ProjectCard.tsx - WITH MODAL INTEGRATION
import { useState } from 'react';
import { MapPin, DollarSign, Calendar, Images, Check, Eye } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { ProjectDetailModal } from './ProjectDetailModal';
import { cn } from '@/lib/utils';

interface Project {
  _id: string;
  title: string;
  description: string;
  location: string;
  budget: number;
  timeline: string;
  styles: string[];
  photos: string[];
  beforePhotos?: string[];
  inspirationPhotos?: string[];
  inspirationNotes?: string;
  status: string;
  createdAt: string;
  client?: { name: string; avatar?: string };
}

interface ProjectCardProps {
  project: Project;
  variant?: 'open' | 'active';
  alreadySent?: boolean;
  unreadCount?: number;
  onAction?: () => void;
  actionLabel?: string;
}

export function ProjectCard({
  project,
  variant = 'open',
  alreadySent,
  unreadCount,
  onAction,
  actionLabel = 'Send Proposal',
}: ProjectCardProps) {
  const [showModal, setShowModal] = useState(false);

  // Determine which photo to show
  const heroPhoto = project.beforePhotos?.[0] || project.photos?.[0];
  const totalPhotos = (project.beforePhotos?.length || 0) + (project.inspirationPhotos?.length || 0) || project.photos?.length || 0;

  const handleCardClick = () => {
    setShowModal(true);
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAction) onAction();
  };

  return (
    <>
      <Card 
        className={cn(
          'group overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full cursor-pointer',
          variant === 'active' && 'border-2 border-primary/20'
        )}
        onClick={handleCardClick}
      >
        {/* Hero Image */}
        <div className="relative h-56 overflow-hidden bg-muted">
          {heroPhoto ? (
            <OptimizedImage
              src={heroPhoto}
              alt={project.title}
              preset="portfolio"
              size="card"
              className="w-full h-full group-hover:scale-105 transition-transform duration-500"
              objectFit="cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Images className="w-16 h-16 text-muted-foreground" />
            </div>
          )}

          {/* Photo Count Badge */}
          {totalPhotos > 0 && (
            <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-white text-xs px-2.5 py-1.5 rounded-full flex items-center gap-1.5 font-medium">
              <Images className="w-3.5 h-3.5" />
              {totalPhotos}
            </div>
          )}

          {/* Status Badge (for active projects) */}
          {variant === 'active' && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-blue-500 text-white shadow-lg">
                In Progress
              </Badge>
            </div>
          )}

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="flex items-center gap-2 text-white font-medium">
              <Eye className="w-5 h-5" />
              View Details
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          {/* Title & Description */}
          <div className="mb-4">
            <h3 className="text-xl font-bold mb-2 line-clamp-1 group-hover:text-primary transition-colors">
              {project.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {project.description}
            </p>
          </div>

          {/* Metadata Grid */}
          <div className="space-y-2.5 mb-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{project.location}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="w-4 h-4 flex-shrink-0" />
              <span className="font-semibold text-foreground">
                KSh {project.budget.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4 flex-shrink-0" />
              <span>{project.timeline}</span>
            </div>
          </div>

          {/* Styles Tags */}
          {project.styles?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {project.styles.slice(0, 3).map(style => (
                <Badge key={style} variant="secondary" className="text-xs font-medium">
                  {style}
                </Badge>
              ))}
              {project.styles.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{project.styles.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="mt-auto pt-4 border-t flex items-center justify-between gap-3">
            {/* Client Info (for open projects) */}
            {variant === 'open' && project.client && (
              <div className="flex items-center gap-2 min-w-0">
                <Avatar className="w-6 h-6 flex-shrink-0">
                  <AvatarImage src={project.client.avatar} />
                  <AvatarFallback className="text-xs">
                    {project.client.name?.[0]?.toUpperCase() || 'C'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground truncate">
                  by <span className="font-medium text-foreground">{project.client.name}</span>
                </span>
              </div>
            )}

            {/* Action Button */}
            <Button
              size="sm"
              variant={alreadySent ? 'secondary' : 'default'}
              disabled={alreadySent}
              onClick={handleActionClick}
              className="ml-auto flex-shrink-0 relative"
            >
              {alreadySent ? (
                <>
                  <Check className="w-4 h-4 mr-1.5" />
                  Sent
                </>
              ) : (
                <>
                  {actionLabel}
                  {unreadCount && unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 min-w-[20px] h-5 px-1 bg-destructive text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Detail Modal */}
      {showModal && (
        <ProjectDetailModal
          project={project}
          variant={variant}
          alreadySent={alreadySent}
          onClose={() => setShowModal(false)}
          onAction={onAction}
          actionLabel={actionLabel}
        />
      )}
    </>
  );
}