// src/pages/designer/EarningsPage.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import {
  Wallet, TrendingUp, Loader2, ArrowUpRight,
  Shield, Smartphone, Edit2, Check, X, AlertTriangle,
  DollarSign, Calendar, Download, ChevronLeft, ChevronRight,
  CheckCircle, FileText,
} from 'lucide-react';
import { Layout } from '@/components/Layout/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

interface Payment {
  _id: string;
  amount: number;
  platformFee: number;
  designerAmount: number;
  status: string;
  createdAt: string;
  heldAt?: string;
  releasedAt?: string;
  project: { title: string };
  client: { name: string };
  mpesaReceiptNumber?: string;
}

const PAGE_SIZE = 5;

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  held:     { label: 'In Escrow', color: 'bg-amber-500/10 text-amber-700 border-amber-200' },
  released: { label: 'Paid',      color: 'bg-green-500/10 text-green-700 border-green-200' },
  pending:  { label: 'Pending',   color: 'bg-blue-500/10 text-blue-700 border-blue-200'    },
  failed:   { label: 'Failed',    color: 'bg-red-500/10 text-red-700 border-red-200'       },
};

export default function EarningsPage() {
  const { getToken } = useAuth();
  const { toast }    = useToast();

  const [payments, setPayments]           = useState<Payment[]>([]);
  const [loading, setLoading]             = useState(true);
  const [currentPage, setCurrentPage]     = useState(1);

  // Payout settings
  const [payoutPhone, setPayoutPhone]     = useState('');
  const [editingPhone, setEditingPhone]   = useState(false);
  const [newPhone, setNewPhone]           = useState('');
  const [savingPhone, setSavingPhone]     = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Stats
  const totalEarnings     = payments.filter(p => p.status === 'released').reduce((s, p) => s + p.designerAmount, 0);
  const pendingEarnings   = payments.filter(p => p.status === 'held').reduce((s, p) => s + p.designerAmount, 0);
  const completedPayments = payments.filter(p => p.status === 'released').length;
  const thisMonthEarnings = payments
    .filter(p => {
      const d = new Date(p.createdAt), now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && p.status === 'released';
    })
    .reduce((s, p) => s + p.designerAmount, 0);

  // Pagination
  const totalPages   = Math.ceil(payments.length / PAGE_SIZE);
  const paginatedPayments = payments.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => { fetchPayments(); fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const token = await getToken();
      const res   = await fetch('https://hudumalink-backend.onrender.com/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data  = await res.json();
      if (data.success && data.user.phone) setPayoutPhone(data.user.phone);
    } catch (e) {
      console.error('Error fetching profile:', e);
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchPayments = async () => {
    try {
      const token = await getToken();
      const res   = await fetch('https://hudumalink-backend.onrender.com/api/payments/my-payments?role=designer', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data  = await res.json();
      if (data.success) setPayments(data.payments);
    } catch {
      toast({ title: 'Error', description: 'Failed to load earnings data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSavePhone = async () => {
    if (!newPhone.trim() || newPhone.length < 10) {
      toast({ title: 'Invalid Number', description: 'Please enter a valid M-Pesa number', variant: 'destructive' });
      return;
    }
    setSavingPhone(true);
    try {
      const token = await getToken();
      const res   = await fetch('https://hudumalink-backend.onrender.com/api/users/update-profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ phone: newPhone.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setPayoutPhone(newPhone.trim());
        setEditingPhone(false);
        setNewPhone('');
        toast({ title: '✅ Saved', description: 'M-Pesa payout number updated.' });
      } else {
        throw new Error(data.error);
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e.message || 'Failed to update', variant: 'destructive' });
    } finally {
      setSavingPhone(false);
    }
  };

  // ✅ Export to CSV
  const handleExport = () => {
    if (payments.length === 0) {
      toast({ title: 'Nothing to export', description: 'No payment records found.', variant: 'destructive' });
      return;
    }

    const headers = ['Date', 'Project', 'Client', 'Total Amount (KSh)', 'Platform Fee (KSh)', 'Your Earnings (KSh)', 'Status', 'M-Pesa Receipt'];
    const rows = payments.map(p => [
      new Date(p.createdAt).toLocaleDateString('en-KE'),
      `"${p.project.title.replace(/"/g, '""')}"`,
      `"${p.client.name.replace(/"/g, '""')}"`,
      p.amount,
      p.platformFee,
      p.designerAmount,
      STATUS_CONFIG[p.status]?.label || p.status,
      p.mpesaReceiptNumber || '-',
    ]);

    const csv     = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob    = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url     = URL.createObjectURL(blob);
    const link    = document.createElement('a');
    link.href     = url;
    link.download = `hudumalink-earnings-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({ title: '✅ Exported', description: `${payments.length} records downloaded as CSV.` });
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' });

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
        <div className="container mx-auto px-4 py-8 sm:py-12 max-w-5xl">

          {/* ── Header ── */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Earnings & Payments</h1>
            <p className="text-muted-foreground text-sm sm:text-base">Track your income and payment history</p>
          </motion.div>

          {/* ── Stats — 2 cols on mobile, 3 on md ── */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="p-4 sm:p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-200 h-full">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mb-3" />
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">Total Earned</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-green-700">
                  KSh {totalEarnings.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1 sm:mt-2">
                  {completedPayments} payment{completedPayments !== 1 ? 's' : ''}
                </p>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="p-4 sm:p-6 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-200 h-full">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 mb-3" />
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">In Escrow</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-amber-700">
                  KSh {pendingEarnings.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1 sm:mt-2">Awaiting approval</p>
              </Card>
            </motion.div>

            {/* This month — full width on mobile (spans 2 cols), normal on md */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="col-span-2 md:col-span-1"
            >
              <Card className="p-4 sm:p-6 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20 h-full">
                <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-primary mb-3" />
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">This Month</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-primary">
                  KSh {thisMonthEarnings.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1 sm:mt-2">Current month earnings</p>
              </Card>
            </motion.div>
          </div>

          {/* ── Payout Settings ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mb-6 sm:mb-8">
            <Card className="p-4 sm:p-6">
              <div className="flex items-start sm:items-center gap-3 mb-5">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold">M-Pesa Payout Number</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Receives your payments when a client approves your work
                  </p>
                </div>
              </div>

              {loadingProfile ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Loading...</span>
                </div>
              ) : editingPhone ? (
                <div className="space-y-3">
                  <Label htmlFor="payout-phone">New M-Pesa Number</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="payout-phone" type="tel" value={newPhone}
                        onChange={e => setNewPhone(e.target.value)}
                        placeholder="0712 345 678" className="pl-10" autoFocus
                      />
                    </div>
                    <Button onClick={handleSavePhone} disabled={savingPhone} className="gap-1.5 flex-shrink-0">
                      {savingPhone ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" /><span className="hidden sm:inline">Save</span></>}
                    </Button>
                    <Button variant="outline" onClick={() => { setEditingPhone(false); setNewPhone(''); }} disabled={savingPhone} className="flex-shrink-0">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">e.g. 0712345678</p>
                </div>
              ) : payoutPhone ? (
                <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-green-50 border border-green-200 gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-green-900 text-sm sm:text-base truncate">{payoutPhone}</p>
                      <p className="text-xs text-green-700">Active payout number</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm"
                    onClick={() => { setEditingPhone(true); setNewPhone(payoutPhone); }}
                    className="gap-1.5 border-green-300 text-green-700 hover:bg-green-100 flex-shrink-0 text-xs">
                    <Edit2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Change</span>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 sm:p-4 rounded-xl bg-amber-50 border border-amber-200">
                    <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-amber-900">No payout number set</p>
                      <p className="text-xs text-amber-700 mt-0.5">You won't receive payments until you add your M-Pesa number.</p>
                    </div>
                  </div>
                  <Button onClick={() => setEditingPhone(true)} className="gap-2 w-full sm:w-auto">
                    <Smartphone className="w-4 h-4" /> Add M-Pesa Number
                  </Button>
                </div>
              )}
            </Card>
          </motion.div>

          {/* ── How Payments Work ── */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mb-6 sm:mb-8">
            <Card className="p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-blue-900 mb-1 text-sm sm:text-base">How Payments Work</h3>
                  <p className="text-xs sm:text-sm text-blue-800 leading-relaxed">
                    Payments are held in <strong>escrow</strong> after the client pays. Once they approve your work,
                    funds are sent to your M-Pesa. You receive <strong>90% of the project amount</strong> (10% platform fee).
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* ── Payment History ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card className="p-4 sm:p-6">

              {/* Header row */}
              <div className="flex items-center justify-between mb-5 gap-3">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold">Payment History</h2>
                  {payments.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {payments.length} record{payments.length !== 1 ? 's' : ''} total
                    </p>
                  )}
                </div>
                {/* ✅ Export button — real CSV download */}
                <Button
                  variant="outline" size="sm"
                  onClick={handleExport}
                  disabled={payments.length === 0}
                  className="gap-2 flex-shrink-0 text-xs sm:text-sm"
                >
                  <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Export CSV</span>
                  <span className="sm:hidden">Export</span>
                </Button>
              </div>

              {payments.length === 0 ? (
                <div className="text-center py-12 sm:py-16">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <Wallet className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold mb-2">No Payments Yet</h3>
                  <p className="text-sm text-muted-foreground mb-6">Your earnings will appear here once clients make payments</p>
                  <Button onClick={() => window.location.href = '/designer/open-projects'} size="sm">
                    Browse Projects
                  </Button>
                </div>
              ) : (
                <>
                  {/* ── Payment list ── */}
                  <div className="space-y-3 mb-5">
                    {paginatedPayments.map((payment, index) => (
                      <motion.div
                        key={payment._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="rounded-xl border hover:bg-muted/50 transition-colors overflow-hidden"
                      >
                        {/* Main row */}
                        <div className="flex items-center gap-3 p-3 sm:p-4">
                          {/* Icon */}
                          <div className={cn(
                            'w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center flex-shrink-0',
                            payment.status === 'released' ? 'bg-green-500/10' :
                            payment.status === 'held'     ? 'bg-amber-500/10' : 'bg-blue-500/10'
                          )}>
                            <DollarSign className={cn(
                              'w-4 h-4 sm:w-5 sm:h-5',
                              payment.status === 'released' ? 'text-green-600' :
                              payment.status === 'held'     ? 'text-amber-600' : 'text-blue-600'
                            )} />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate">{payment.project.title}</p>
                            <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                              <span className="text-xs text-muted-foreground">{payment.client.name}</span>
                              <span className="text-muted-foreground/40 text-xs">•</span>
                              <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                                <Calendar className="w-3 h-3" />
                                {formatDate(payment.createdAt)}
                              </span>
                            </div>
                            {/* Receipt on mobile — below client name */}
                            {payment.mpesaReceiptNumber && (
                              <p className="text-xs text-muted-foreground font-mono mt-0.5 sm:hidden">
                                {payment.mpesaReceiptNumber}
                              </p>
                            )}
                          </div>

                          {/* Right: amount + badge */}
                          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                            <p className="font-bold text-sm sm:text-base">
                              KSh {payment.designerAmount.toLocaleString()}
                            </p>
                            <Badge
                              variant="outline"
                              className={cn('text-xs', STATUS_CONFIG[payment.status]?.color || 'bg-muted')}
                            >
                              {STATUS_CONFIG[payment.status]?.label || payment.status}
                            </Badge>
                          </div>
                        </div>

                        {/* Receipt row — desktop only, shown as a subtle footer */}
                        {payment.mpesaReceiptNumber && (
                          <div className="hidden sm:flex items-center gap-2 px-4 pb-3 pt-0">
                            <FileText className="w-3 h-3 text-muted-foreground/50" />
                            <span className="text-xs text-muted-foreground font-mono">
                              Receipt: {payment.mpesaReceiptNumber}
                            </span>
                            <span className="text-xs text-muted-foreground ml-auto">
                              of KSh {payment.amount.toLocaleString()} total
                            </span>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>

                  {/* ── Pagination ── */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between gap-3 pt-4 border-t border-border/60">
                      <p className="text-xs sm:text-sm text-muted-foreground flex-shrink-0">
                        Page {currentPage} of {totalPages}
                        <span className="hidden sm:inline"> · {payments.length} records</span>
                      </p>

                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="outline" size="sm"
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3 p-0 gap-1"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span className="hidden sm:inline">Prev</span>
                        </Button>

                        {/* Page number pills — show up to 5 */}
                        <div className="flex gap-1">
                          {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(p => {
                              if (totalPages <= 5) return true;
                              if (p === 1 || p === totalPages) return true;
                              return Math.abs(p - currentPage) <= 1;
                            })
                            .reduce((acc: (number | '...')[], p, i, arr) => {
                              if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('...');
                              acc.push(p);
                              return acc;
                            }, [])
                            .map((p, i) =>
                              p === '...' ? (
                                <span key={`ellipsis-${i}`} className="h-8 w-8 flex items-center justify-center text-xs text-muted-foreground">
                                  …
                                </span>
                              ) : (
                                <button
                                  key={p}
                                  onClick={() => setCurrentPage(p as number)}
                                  className={cn(
                                    'h-8 w-8 rounded-lg text-xs font-medium transition-colors',
                                    currentPage === p
                                      ? 'bg-primary text-primary-foreground'
                                      : 'hover:bg-muted text-muted-foreground'
                                  )}
                                >
                                  {p}
                                </button>
                              )
                            )
                          }
                        </div>

                        <Button
                          variant="outline" size="sm"
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3 p-0 gap-1"
                        >
                          <span className="hidden sm:inline">Next</span>
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </Card>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}