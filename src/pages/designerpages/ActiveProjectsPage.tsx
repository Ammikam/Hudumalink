// src/pages/designerpages/ActiveProjectsPage.tsx
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout/Layout';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import {
  Loader2, MessageSquare, DollarSign, Clock,
  Briefcase, ArrowRight, CheckCircle2,
} from 'lucide-react';

interface Project {
  _id: string;
  title: string;
  description: string;
  budget: number;
  timeline: string;
  photos: string[];
  currentPhotos?: string[];
  status: string;
  client: { name: string; avatar?: string; };
}

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function ActiveProjectsPage() {
  const { getToken } = useAuth();
  const [projects, setProjects]         = useState<Project[]>([]);
  const [loading, setLoading]           = useState(true);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  const fetchData = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const [projectsRes, unreadRes] = await Promise.all([
        fetch('https://hudumalink-backend.onrender.com/api/projects/my-active', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('https://hudumalink-backend.onrender.com/api/messages/unread-counts', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const [projectsData, unreadData] = await Promise.all([
        projectsRes.json(),
        unreadRes.json(),
      ]);

      if (projectsData.success) setProjects(projectsData.projects || []);
      if (unreadData.success)   setUnreadCounts(unreadData.unreadCounts || {});
    } catch (error) {
      console.error('Error fetching active projects:', error);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Loader2 className="w-7 h-7 animate-spin text-primary" />
        </div>
        <p className="text-sm text-muted-foreground">Loading your projects…</p>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-muted/20 to-transparent">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-4xl">

          {/* ── Header ── */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl sm:text-3xl font-bold">Active Projects</h1>
              {projects.length > 0 && (
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  {projects.length}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {projects.length > 0
                ? 'Projects where you are the hired designer'
                : 'Projects you are hired for will appear here'}
            </p>
          </motion.div>

          {/* ── Empty state ── */}
          {projects.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center px-4"
            >
              <div className="w-20 h-20 rounded-3xl bg-primary/8 flex items-center justify-center mb-6">
                <Briefcase className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mb-2">No active projects yet</h2>
              <p className="text-muted-foreground text-sm max-w-sm mb-8">
                When a client accepts your proposal, the project will appear here and you can start chatting.
              </p>
              <Button asChild>
                <Link to="/designer/open-projects" className="gap-2">
                  Browse Open Projects <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="space-y-3"
            >
              {projects.map((project) => {
                const unread    = unreadCounts[project._id] ?? 0;
                const heroPhoto = project.currentPhotos?.[0] || project.photos?.[0];

                return (
                  <motion.div key={project._id} variants={itemVariants}>
                    <Link
                      to={`/designer/projects/${project._id}`}
                      className="block group"
                    >
                      <div className="rounded-2xl border border-border/60 bg-background hover:border-border hover:shadow-md transition-all duration-200 overflow-hidden">
                        <div className="flex">

                          {/* ── Thumbnail ── */}
                          <div className="w-24 sm:w-36 flex-shrink-0 bg-muted relative overflow-hidden">
                            {heroPhoto ? (
                              <img
                                src={heroPhoto}
                                alt={project.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center min-h-[100px]">
                                <Briefcase className="w-8 h-8 text-muted-foreground/40" />
                              </div>
                            )}
                            {/* Status dot */}
                            <div className="absolute top-2 left-2">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500 text-white text-[10px] font-bold shadow">
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                Active
                              </span>
                            </div>
                          </div>

                          {/* ── Content ── */}
                          <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between gap-3 min-w-0">

                            {/* Top: title + description */}
                            <div>
                              <h3 className="font-semibold text-base sm:text-lg leading-snug line-clamp-1 group-hover:text-primary transition-colors">
                                {project.title}
                              </h3>
                              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
                                {project.description}
                              </p>
                            </div>

                            {/* Bottom: meta + CTA */}
                            <div className="flex items-center justify-between gap-3 flex-wrap">

                              {/* Client + meta */}
                              <div className="flex items-center gap-3 flex-wrap">
                                <div className="flex items-center gap-1.5">
                                  <Avatar className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0">
                                    <AvatarImage src={project.client?.avatar} />
                                    <AvatarFallback className="text-[10px] font-bold">
                                      {project.client?.name?.[0]?.toUpperCase() ?? 'C'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-xs sm:text-sm font-medium text-foreground truncate max-w-[100px] sm:max-w-none">
                                    {project.client?.name}
                                  </span>
                                </div>

                                <span className="text-muted-foreground/40 hidden sm:inline">·</span>

                                <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
                                  <DollarSign className="w-3.5 h-3.5" />
                                  <span>KSh {project.budget.toLocaleString()}</span>
                                </div>

                                <span className="text-muted-foreground/40 hidden sm:inline">·</span>

                                <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="w-3.5 h-3.5" />
                                  <span>{project.timeline}</span>
                                </div>
                              </div>

                              {/* CTA button */}
                              <div className="relative flex-shrink-0">
                                <div className={`
                                  inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors
                                  ${unread > 0
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                                  }
                                `}>
                                  <MessageSquare className="w-3.5 h-3.5" />
                                  <span className="hidden sm:inline">
                                    {unread > 0 ? `${unread} new message${unread !== 1 ? 's' : ''}` : 'Open Chat'}
                                  </span>
                                  <span className="sm:hidden">
                                    {unread > 0 ? unread : 'Chat'}
                                  </span>
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </div>
                              </div>
                            </div>

                            {/* Mobile-only budget + timeline */}
                            <div className="flex items-center gap-3 sm:hidden">
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <DollarSign className="w-3.5 h-3.5" />
                                <span>KSh {project.budget.toLocaleString()}</span>
                              </div>
                              <span className="text-muted-foreground/40">·</span>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{project.timeline}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* ── Summary footer ── */}
          {projects.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-6 p-4 rounded-2xl bg-muted/40 border border-border/60 flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">
                  {projects.length} active project{projects.length !== 1 ? 's' : ''}
                </p>
                <p className="text-xs text-muted-foreground">
                  Total value: KSh {projects.reduce((s, p) => s + p.budget, 0).toLocaleString()}
                </p>
              </div>
              <Button asChild variant="outline" size="sm" className="flex-shrink-0 text-xs gap-1">
                <Link to="/designer/open-projects">
                  Find more <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
}