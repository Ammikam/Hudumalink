// src/pages/SuccessPage.tsx
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, Home, Eye } from 'lucide-react';
import { Layout } from '@/components/Layout/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function SuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const { successMessage, redirectTo } = (location.state as {
    successMessage?: string;
    redirectTo?: string;
  }) || {};

  // Auto-redirect if redirectTo is provided (after 3 seconds)
  useEffect(() => {
    if (redirectTo) {
      const timer = setTimeout(() => {
        navigate(redirectTo);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [redirectTo, navigate]);

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-green-50/50 to-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl w-full"
        >
          <Card className="p-8 sm:p-12 text-center shadow-xl">
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500 mb-6"
            >
              <CheckCircle2 className="w-12 h-12 text-white" />
            </motion.div>

            {/* Message */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
                Success! 🎉
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                {successMessage || 'Your action was completed successfully!'}
              </p>
            </motion.div>

            {/* What happens next */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-muted/50 rounded-lg p-6 mb-8 text-left"
            >
              <h2 className="font-semibold text-foreground mb-3">What happens next?</h2>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Your project is now live and visible to designers</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Designers will review your project and send proposals</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>You'll receive email notifications when proposals arrive</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Review proposals and hire the best designer for your project</span>
                </li>
              </ul>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <Button
                onClick={() => navigate('/dashboard/client')}
                size="lg"
                className="flex-1 gap-2"
              >
                <Eye className="w-5 h-5" />
                View My Projects
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                size="lg"
                className="flex-1 gap-2"
              >
                <Home className="w-5 h-5" />
                Back to Home
              </Button>
            </motion.div>

            {/* Auto-redirect message */}
            {redirectTo && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-xs text-muted-foreground mt-6"
              >
                Redirecting you automatically in a few seconds...
              </motion.p>
            )}
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}