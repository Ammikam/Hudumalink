// src/components/projects/ProjectCard.tsx
import { useState } from 'react';
import { MapPin, DollarSign, Calendar, Images, Check, Eye, Users } from 'lucide-react';
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
  directInvite?: boolean;
}

export function ProjectCard({
  project,
  variant = 'open',
  alreadySent,
  unreadCount,
  onAction,
  actionLabel = 'Send Proposal',
  directInvite = false,
}: ProjectCardProps) {
  const [showModal, setShowModal] = useState(false);

  const heroPhoto = project.beforePhotos?.[0] || project.photos?.[0];
  const totalPhotos =
    (project.beforePhotos?.length || 0) +
    (project.inspirationPhotos?.length || 0) ||
    project.photos?.length || 0;

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAction) onAction();
  };

  return (
    <>
      <Card
        className={cn(
          'group overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full cursor-pointer',
          variant === 'active' && 'border-2 border-primary/20'
        )}
        onClick={() => setShowModal(true)}
      >
        {/* ── Hero image ── */}
        <div className="relative h-44 sm:h-52 overflow-hidden bg-muted flex-shrink-0">
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
              <Images className="w-12 h-12 text-muted-foreground/40" />
            </div>
          )}

          {/* Photo count pill */}
          {totalPhotos > 0 && (
            <div className="absolute bottom-2.5 right-2.5 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 font-medium">
              <Images className="w-3 h-3" />
              {totalPhotos}
            </div>
          )}

          {/* Badges */}
          {directInvite && (
            <div className="absolute top-2.5 left-2.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500 text-white text-xs font-bold shadow-md">
                <Users className="w-3 h-3" /> Direct Invite
              </span>
            </div>
          )}
          {variant === 'active' && !directInvite && (
            <div className="absolute top-2.5 left-2.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500 text-white text-xs font-bold shadow-md">
                In Progress
              </span>
            </div>
          )}

          {/* Hover overlay — desktop only */}
          <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex items-center justify-center">
            <div className="flex items-center gap-2 text-white font-medium text-sm">
              <Eye className="w-4 h-4" /> View Details
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="p-4 sm:p-5 flex flex-col flex-1">
          {/* Title + description */}
          <div className="mb-3">
            <h3 className="font-display font-bold text-base sm:text-lg leading-snug line-clamp-1 group-hover:text-primary transition-colors mb-1">
              {project.title}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {project.description}
            </p>
          </div>

          {/* Meta */}
          <div className="space-y-1.5 mb-3 text-xs sm:text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{project.location}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 flex-shrink-0 text-muted-foreground" />
              <span className="font-semibold text-foreground">KSh {project.budget.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{project.timeline}</span>
            </div>
          </div>

          {/* Style tags */}
          {project.styles?.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {project.styles.slice(0, 3).map(style => (
                <span key={style} className="text-xs px-2 py-0.5 rounded-full bg-secondary/10 text-secondary border border-secondary/20 font-medium">
                  {style}
                </span>
              ))}
              {project.styles.length > 3 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border font-medium">
                  +{project.styles.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="mt-auto pt-3 border-t border-border/60 flex items-center justify-between gap-2">
            {variant === 'open' && project.client && (
              <div className="flex items-center gap-1.5 min-w-0">
                <Avatar className="w-5 h-5 flex-shrink-0">
                  <AvatarImage src={project.client.avatar} />
                  <AvatarFallback className="text-[10px]">
                    {project.client.name?.[0]?.toUpperCase() || 'C'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground truncate">
                  by <span className="font-medium text-foreground">{project.client.name}</span>
                </span>
              </div>
            )}

            <Button
              size="sm"
              variant={alreadySent ? 'secondary' : 'default'}
              disabled={alreadySent}
              onClick={handleActionClick}
              className="ml-auto flex-shrink-0 relative h-8 text-xs px-3 gap-1.5"
            >
              {alreadySent ? (
                <><Check className="w-3.5 h-3.5" />Sent</>
              ) : (
                <>
                  {actionLabel}
                  {unreadCount && unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-destructive text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {showModal && (
        <ProjectDetailModal
          project={project}
          open={showModal}
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