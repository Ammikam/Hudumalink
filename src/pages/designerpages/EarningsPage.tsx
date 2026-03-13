// src/pages/designer/EarningsPage.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { 
  Wallet, TrendingUp, Clock, CheckCircle, DollarSign, 
  Download, Calendar, AlertCircle, Loader2, ArrowUpRight,
  Shield, Banknote
} from 'lucide-react';
import { Layout } from '@/components/Layout/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  project: {
    title: string;
  };
  client: {
    name: string;
  };
  mpesaReceiptNumber?: string;
}

export default function EarningsPage() {
  const { getToken } = useAuth();
  const { toast } = useToast();

  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  // Stats
  const totalEarnings = payments
    .filter(p => p.status === 'released')
    .reduce((sum, p) => sum + p.designerAmount, 0);

  const pendingEarnings = payments
    .filter(p => p.status === 'held')
    .reduce((sum, p) => sum + p.designerAmount, 0);

  const completedPayments = payments.filter(p => p.status === 'released').length;

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const token = await getToken();
      const res = await fetch('http://localhost:5000/api/payments/my-payments', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.success) {
        setPayments(data.payments);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast({
        title: 'Error',
        description: 'Failed to load earnings data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const config = {
      held: { label: 'In Escrow', color: 'bg-amber-500/10 text-amber-700 border-amber-200' },
      released: { label: 'Paid', color: 'bg-green-500/10 text-green-700 border-green-200' },
      pending: { label: 'Pending', color: 'bg-blue-500/10 text-blue-700 border-blue-200' },
      failed: { label: 'Failed', color: 'bg-red-500/10 text-red-700 border-red-200' },
    };

    const { label, color } = config[status as keyof typeof config] || config.pending;

    return (
      <Badge variant="outline" className={cn('text-xs', color)}>
        {label}
      </Badge>
    );
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
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="mb-2">
              <h1 className="text-3xl md:text-4xl font-bold">Earnings & Payments</h1>
              <p className="text-muted-foreground">Track your income and payment history</p>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-sm text-muted-foreground mb-1">Total Earned</p>
                <p className="text-3xl font-bold text-green-700">
                  KSh {totalEarnings.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {completedPayments} completed payment{completedPayments !== 1 ? 's' : ''}
                </p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-amber-600" />
                  </div>
                  <Shield className="w-5 h-5 text-amber-600" />
                </div>
                <p className="text-sm text-muted-foreground mb-1">In Escrow</p>
                <p className="text-3xl font-bold text-amber-700">
                  KSh {pendingEarnings.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Awaiting client approval
                </p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Banknote className="w-6 h-6 text-primary" />
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground mb-1">This Month</p>
                <p className="text-3xl font-bold text-primary">
                  KSh {payments
                    .filter(p => {
                      const date = new Date(p.createdAt);
                      const now = new Date();
                      return date.getMonth() === now.getMonth() && 
                             date.getFullYear() === now.getFullYear() &&
                             p.status === 'released';
                    })
                    .reduce((sum, p) => sum + p.designerAmount, 0)
                    .toLocaleString()
                  }
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Current month earnings
                </p>
              </Card>
            </motion.div>
          </div>

          {/* Info Alert */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6 mb-8 bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Payment History</h2>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </Button>
              </div>

              {payments.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <Wallet className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No Payments Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Your earnings will appear here once clients make payments
                  </p>
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
                          payment.status === 'held' ? 'bg-amber-500/10' :
                          'bg-blue-500/10'
                        )}>
                          <DollarSign className={cn(
                            'w-6 h-6',
                            payment.status === 'released' ? 'text-green-600' :
                            payment.status === 'held' ? 'text-amber-600' :
                            'text-blue-600'
                          )} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{payment.project.title}</p>
                          <div className="flex items-center gap-2 flex-wrap mt-1">
                            <span className="text-xs text-muted-foreground">
                              {payment.client.name}
                            </span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(payment.createdAt)}
                            </span>
                            {payment.mpesaReceiptNumber && (
                              <>
                                <span className="text-xs text-muted-foreground">•</span>
                                <span className="text-xs text-muted-foreground">
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
                          <p className="font-bold text-lg">
                            KSh {payment.designerAmount.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            of KSh {payment.amount.toLocaleString()}
                          </p>
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