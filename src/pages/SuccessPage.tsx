import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Layout } from '@/components/Layout/Layout';
import { Link } from 'react-router-dom';
import { designers } from '@/data/MockData';

export default function SuccessPage() {
  return (
    <Layout>
      <div className="min-h-screen py-12 lg:py-24 bg-gradient-to-b from-primary/5 to-cream">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <CheckCircle className="w-24 h-24 mx-auto text-primary mb-8" />
            <h1 className="font-display text-4xl lg:text-6xl font-bold mb-6">
              Your Project is Live! 🎉
            </h1>
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
              Congratulations! Your project has been posted. Verified designers across Kenya are reviewing it now. 
              Expect personalized proposals within 24 hours.
            </p>
          </motion.div>

          <Card className="card-premium p-8 mb-12">
            <h2 className="font-display text-2xl font-bold mb-6">Top Designers Already Viewing</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {designers.slice(0, 3).map((designer) => (
                <div key={designer.id} className="text-center">
                  <img src={designer.avatar} alt={designer.name} className="w-20 h-20 rounded-full mx-auto mb-3 object-cover" />
                  <p className="font-medium">{designer.name}</p>
                  <p className="text-sm text-muted-foreground">{designer.location}</p>
                  <p className="text-sm text-primary font-medium mt-1">{designer.rating} ★</p>
                </div>
              ))}
            </div>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/dashboard">
              <Button size="lg">
                View Your Dashboard
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline" size="lg">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}