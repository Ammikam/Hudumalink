// src/pages/designerpages/ProposalsPage.tsx
import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout/Layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import {
  Loader2, ArrowRight, Briefcase, Clock,
  DollarSign, CheckCircle2, XCircle, Timer,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Proposal {
  _id: string;
  project: {
    _id: string;
    title: string;
    description?: string;
    budget?: number;
    timeline?: string;
    status?: string;
  };
  message: string;
  price: number;
  timeline: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

const PROPOSAL_STATUS = {
  pending:  { label: 'Pending',  color: 'bg-amber-500/10 text-amber-700 border-amber-200',  icon: Timer        },
  accepted: { label: 'Accepted', color: 'bg-green-500/10 text-green-700 border-green-200',  icon: CheckCircle2 },
  rejected: { label: 'Declined', color: 'bg-red-500/10 text-red-700 border-red-200',        icon: XCircle      },
};

const PROJECT_STATUS = {
  open:            { label: 'Open',             color: 'bg-emerald-500/10 text-emerald-700 border-emerald-200' },
  payment_pending: { label: 'Awaiting Payment',  color: 'bg-amber-500/10 text-amber-700 border-amber-200'      },
  in_progress:     { label: 'In Progress',       color: 'bg-blue-500/10 text-blue-700 border-blue-200'          },
  completed:       { label: 'Completed',          color: 'bg-muted text-muted-foreground border-border'          },
};

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function ProposalsPage() {
  const { getToken }                  = useAuth();
  const [proposals, setProposals]     = useState<Proposal[]>([]);
  const [loading, setLoading]         = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'accepted' | 'pending' | 'rejected'>('all');

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const res  = await fetch('http://localhost:5000/api/proposals/my', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) setProposals(data.proposals || []);
      } catch (e) {
        console.error('Error fetching proposals:', e);
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, [getToken]);

  const accepted = proposals.filter(p => p.status === 'accepted');
  const pending  = proposals.filter(p => p.status === 'pending');
  const rejected = proposals.filter(p => p.status === 'rejected');

  const filtered = activeFilter === 'all'
    ? [...accepted, ...pending, ...rejected]
    : proposals.filter(p => p.status === activeFilter);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' });

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Loader2 className="w-7 h-7 animate-spin text-primary" />
        </div>
        <p className="text-sm text-muted-foreground">Loading proposals…</p>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-muted/20 to-transparent">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-3xl">

          {/* ── Header ── */}
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-6 sm:mb-8">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl sm:text-3xl font-bold">My Proposals</h1>
              {proposals.length > 0 && (
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  {proposals.length}
                </span>
              )}
            </div>
            {proposals.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {accepted.length} accepted · {pending.length} pending · {rejected.length} declined
              </p>
            )}
          </motion.div>

          {/* ── Empty state ── */}
          {proposals.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center px-4"
            >
              <div className="w-20 h-20 rounded-3xl bg-primary/8 flex items-center justify-center mb-6">
                <Briefcase className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mb-2">No proposals sent yet</h2>
              <p className="text-muted-foreground text-sm max-w-sm mb-8">
                Browse open projects and send your first proposal to start working with clients.
              </p>
              <Button asChild>
                <Link to="/designer/open-projects" className="gap-2">
                  Browse Open Projects <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </motion.div>
          ) : (
            <>
              {/* ── Filter tabs ── */}
              <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide">
                {([
                  { key: 'all',      label: 'All',      count: proposals.length },
                  { key: 'accepted', label: 'Accepted', count: accepted.length  },
                  { key: 'pending',  label: 'Pending',  count: pending.length   },
                  { key: 'rejected', label: 'Declined', count: rejected.length  },
                ] as const).map(({ key, label, count }) => (
                  <button
                    key={key}
                    onClick={() => setActiveFilter(key)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all flex-shrink-0',
                      activeFilter === key
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    )}
                  >
                    {label}
                    <span className={cn(
                      'inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold',
                      activeFilter === key ? 'bg-white/20 text-white' : 'bg-background text-muted-foreground'
                    )}>
                      {count}
                    </span>
                  </button>
                ))}
              </div>

              {/* ── Proposal list ── */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="space-y-3"
              >
                {filtered.map((proposal) => {
                  const proposalCfg = PROPOSAL_STATUS[proposal.status];
                  const ProposalIcon = proposalCfg.icon;
                  const projectStatus = proposal.project?.status;
                  const projectCfg = projectStatus
                    ? PROJECT_STATUS[projectStatus as keyof typeof PROJECT_STATUS]
                    : null;

                  return (
                    <motion.div
                      key={proposal._id}
                      variants={itemVariants}
                      className={cn(
                        'rounded-2xl border border-border/60 bg-background overflow-hidden transition-opacity',
                        proposal.status === 'rejected' && 'opacity-60'
                      )}
                    >
                      <div className="p-4 sm:p-5 space-y-3">

                        {/* ── Top row: title + badges ── */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base sm:text-lg leading-snug truncate">
                              {proposal.project?.title ?? 'Project'}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Sent {formatDate(proposal.createdAt)}
                            </p>
                          </div>

                          {/* Both badges stacked */}
                          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                            {/* Proposal status */}
                            <Badge variant="outline" className={cn('text-xs gap-1', proposalCfg.color)}>
                              <ProposalIcon className="w-3 h-3" />
                              {proposalCfg.label}
                            </Badge>
                           {/* Project status — only show if different context */}
                           {projectCfg && projectStatus !== 'open' && proposal.status !== 'rejected' && (
                            <Badge variant="outline" className={cn('text-xs', projectCfg.color)}>
                             Project: {projectCfg.label}
                            </Badge>
                       )}
                          </div>
                        </div>

                        {/* ── Message preview ── */}
                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                          {proposal.message}
                        </p>

                        {/* ── Price + timeline ── */}
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5 text-sm">
                            <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="font-bold">KSh {proposal.price.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{proposal.timeline}</span>
                          </div>
                        </div>

                        {/* ── Status-specific footer ── */}
                        {proposal.status === 'accepted' && (
                          <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-green-50 border border-green-200">
                            <div className="flex items-center gap-2 min-w-0">
                              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                              <p className="text-xs sm:text-sm font-semibold text-green-800 truncate">
                                Proposal accepted — project is live!
                              </p>
                            </div>
                            <Button size="sm" asChild className="flex-shrink-0 h-8 text-xs gap-1">
                              <Link to={`/designer/projects/${proposal.project._id}`}>
                                Open <ArrowRight className="w-3.5 h-3.5" />
                              </Link>
                            </Button>
                          </div>
                        )}

                        {proposal.status === 'pending' && projectStatus === 'in_progress' && (
                          <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-50 border border-blue-200">
                            <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                            <p className="text-xs text-blue-800">
                              This project has already hired another designer.
                            </p>
                          </div>
                        )}

                        {proposal.status === 'rejected' && (
                          <div className="p-3 rounded-xl bg-muted/60 border border-border/40">
                            <p className="text-xs text-muted-foreground">
                              This proposal was not selected for the project.
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* ── Summary footer ── */}
              {accepted.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                  className="mt-6 p-4 rounded-2xl bg-green-50 border border-green-200 flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-green-900">
                      {accepted.length} accepted proposal{accepted.length !== 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-green-700">
                      Total value: KSh {accepted.reduce((s, p) => s + p.price, 0).toLocaleString()}
                    </p>
                  </div>
                  <Button asChild size="sm" variant="outline"
                    className="flex-shrink-0 border-green-300 text-green-700 hover:bg-green-100 text-xs gap-1">
                    <Link to="/designer/active-projects">
                      View Active <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </Button>
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}