// src/pages/designer/EarningsPage.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import {
  Wallet, TrendingUp, Clock, CheckCircle, DollarSign,
  Download, Calendar, Loader2, ArrowUpRight,
  Shield, Banknote, Smartphone, Edit2, Check, X, AlertTriangle,
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

export default function EarningsPage() {
  const { getToken } = useAuth();
  const { toast } = useToast();

  const [payments, setPayments]         = useState<Payment[]>([]);
  const [loading, setLoading]           = useState(true);

  // Payout settings state
  const [payoutPhone, setPayoutPhone]         = useState('');
  const [editingPhone, setEditingPhone]       = useState(false);
  const [newPhone, setNewPhone]               = useState('');
  const [savingPhone, setSavingPhone]         = useState(false);
  const [loadingProfile, setLoadingProfile]   = useState(true);

  // Stats
  const totalEarnings    = payments.filter(p => p.status === 'released').reduce((sum, p) => sum + p.designerAmount, 0);
  const pendingEarnings  = payments.filter(p => p.status === 'held').reduce((sum, p) => sum + p.designerAmount, 0);
  const completedPayments = payments.filter(p => p.status === 'released').length;

  useEffect(() => {
    fetchPayments();
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = await getToken();
      const res = await fetch('http://localhost:5000/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.user.phone) {
        setPayoutPhone(data.user.phone);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

 const fetchPayments = async () => {
  try {
    const token = await getToken();
    // ✅ Only fetch payments where this user is the designer
    const res = await fetch('http://localhost:5000/api/payments/my-payments?role=designer', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.success) setPayments(data.payments);
  } catch (error) {
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
      const res = await fetch('http://localhost:5000/api/users/update-profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ phone: newPhone.trim() }),
      });
      const data = await res.json();

      if (data.success) {
        setPayoutPhone(newPhone.trim());
        setEditingPhone(false);
        setNewPhone('');
        toast({ title: '✅ Saved', description: 'Your M-Pesa payout number has been updated.' });
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to update phone number', variant: 'destructive' });
    } finally {
      setSavingPhone(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingPhone(false);
    setNewPhone('');
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' });

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; color: string }> = {
      held:     { label: 'In Escrow', color: 'bg-amber-500/10 text-amber-700 border-amber-200' },
      released: { label: 'Paid',      color: 'bg-green-500/10 text-green-700 border-green-200' },
      pending:  { label: 'Pending',   color: 'bg-blue-500/10 text-blue-700 border-blue-200'    },
      failed:   { label: 'Failed',    color: 'bg-red-500/10 text-red-700 border-red-200'       },
    };
    const { label, color } = config[status] || config.pending;
    return <Badge variant="outline" className={cn('text-xs', color)}>{label}</Badge>;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
        <div className="container mx-auto px-4 py-12 max-w-7xl">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold">Earnings & Payments</h1>
            <p className="text-muted-foreground">Track your income and payment history</p>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-200">
                <div className="flex items-center justify-between mb-4">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-sm text-muted-foreground mb-1">Total Earned</p>
                <p className="text-3xl font-bold text-green-700">KSh {totalEarnings.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {completedPayments} completed payment{completedPayments !== 1 ? 's' : ''}
                </p>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="p-6 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-200">
                <div className="flex items-center justify-between mb-4">
                  <Shield className="w-5 h-5 text-amber-600" />
                </div>
                <p className="text-sm text-muted-foreground mb-1">In Escrow</p>
                <p className="text-3xl font-bold text-amber-700">KSh {pendingEarnings.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-2">Awaiting client approval</p>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
                <div className="flex items-center justify-between mb-4">
                  <ArrowUpRight className="w-5 h-5 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground mb-1">This Month</p>
                <p className="text-3xl font-bold text-primary">
                  KSh {payments
                    .filter(p => {
                      const d = new Date(p.createdAt);
                      const now = new Date();
                      return d.getMonth() === now.getMonth() &&
                             d.getFullYear() === now.getFullYear() &&
                             p.status === 'released';
                    })
                    .reduce((sum, p) => sum + p.designerAmount, 0)
                    .toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-2">Current month earnings</p>
              </Card>
            </motion.div>
          </div>

          {/* ✅ Payout Settings */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mb-8">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <Smartphone className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">M-Pesa Payout Number</h2>
                  <p className="text-sm text-muted-foreground">
                    This number receives your payments when a client approves your work
                  </p>
                </div>
              </div>

              {loadingProfile ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Loading...</span>
                </div>
              ) : editingPhone ? (
                // Edit mode
                <div className="space-y-3">
                  <Label htmlFor="payout-phone">New M-Pesa Number</Label>
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="payout-phone"
                        type="tel"
                        value={newPhone}
                        onChange={e => setNewPhone(e.target.value)}
                        placeholder="0712 345 678"
                        className="pl-10"
                        autoFocus
                      />
                    </div>
                    <Button
                      onClick={handleSavePhone}
                      disabled={savingPhone}
                      className="gap-2 flex-shrink-0"
                    >
                      {savingPhone
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <><Check className="w-4 h-4" /> Save</>
                      }
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancelEdit}
                      disabled={savingPhone}
                      className="flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enter the M-Pesa number you want to receive payments on (e.g. 0712345678)
                  </p>
                </div>
              ) : payoutPhone ? (
                // Phone set — show it
                <div className="flex items-center justify-between p-4 rounded-xl bg-green-50 border border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-green-500/20 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-green-900">{payoutPhone}</p>
                      <p className="text-xs text-green-700">Active payout number</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setEditingPhone(true); setNewPhone(payoutPhone); }}
                    className="gap-2 border-green-300 text-green-700 hover:bg-green-100"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Change
                  </Button>
                </div>
              ) : (
                // No phone set — warn and prompt
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-amber-900">No payout number set</p>
                      <p className="text-xs text-amber-700 mt-0.5">
                        You won't be able to receive payments until you add your M-Pesa number.
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setEditingPhone(true)}
                    className="gap-2"
                  >
                    <Smartphone className="w-4 h-4" />
                    Add M-Pesa Number
                  </Button>
                </div>
              )}
            </Card>
          </motion.div>

          {/* How Payments Work */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mb-8">
            <Card className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-blue-900 mb-1">How Payments Work</h3>
                  <p className="text-sm text-blue-800 leading-relaxed">
                    Payments are held in <strong>escrow</strong> after the client pays. Once they approve your completed work,
                    funds are automatically sent to your M-Pesa. You'll receive <strong>90% of the project amount</strong>
                    (10% platform fee deducted).
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Payment History */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Payment History</h2>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="w-4 h-4" /> Export
                </Button>
              </div>

              {payments.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <Wallet className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No Payments Yet</h3>
                  <p className="text-muted-foreground mb-6">Your earnings will appear here once clients make payments</p>
                  <Button onClick={() => window.location.href = '/designer/open-projects'}>
                    Browse Projects
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {payments.map((payment, index) => (
                    <motion.div
                      key={payment._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-4 rounded-xl border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className={cn(
                          'w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0',
                          payment.status === 'released' ? 'bg-green-500/10' :
                          payment.status === 'held'     ? 'bg-amber-500/10' : 'bg-blue-500/10'
                        )}>
                          <DollarSign className={cn(
                            'w-6 h-6',
                            payment.status === 'released' ? 'text-green-600' :
                            payment.status === 'held'     ? 'text-amber-600' : 'text-blue-600'
                          )} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{payment.project.title}</p>
                          <div className="flex items-center gap-2 flex-wrap mt-1">
                            <span className="text-xs text-muted-foreground">{payment.client.name}</span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(payment.createdAt)}
                            </span>
                            {payment.mpesaReceiptNumber && (
                              <>
                                <span className="text-xs text-muted-foreground">•</span>
                                <span className="text-xs text-muted-foreground font-mono">
                                  {payment.mpesaReceiptNumber}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0">
                        {getStatusBadge(payment.status)}
                        <div className="text-right">
                          <p className="font-bold text-lg">KSh {payment.designerAmount.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">of KSh {payment.amount.toLocaleString()}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}