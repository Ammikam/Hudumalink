// src/pages/InspirationPage.tsx - UPDATED WITH REAL DATA
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Plus, Loader2, Sparkles, TrendingUp } from 'lucide-react';
import { Layout } from '../components/Layout/Layout';
import { InspirationCard } from '../components/Inspiration/InspirationCard';
import { Button } from '../components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@clerk/clerk-react';

const styles = ['All', 'Modern', 'African Fusion', 'Bohemian', 'Minimalist', 'Luxury', 'Budget-Friendly', 'Coastal', 'Industrial', 'Scandinavian'];

interface Inspiration {
  _id: string;
  id: string;
  title: string;
  description: string;
  beforeImage: string;
  afterImage: string;
  image?: string;
  style: string;
  styles: string[];
  designerName: string;
  designerId: string;
  designerAvatar?: string;
  verified?: boolean;
  likes: number;
  views: number;
  location?: string;
  projectCost?: number;
  isPreferred?: boolean; // For personalized feed
}

export default function InspirationPage() {
  const navigate = useNavigate();
  const { isSignedIn, getToken } = useAuth();
  
  const [inspirations, setInspirations] = useState<Inspiration[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStyle, setActiveStyle] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDesigner, setIsDesigner] = useState(false);
  const [preferredStyles, setPreferredStyles] = useState<string[]>([]);

  // Check if user is a designer
  useEffect(() => {
    const checkDesigner = async () => {
      if (!isSignedIn) return;
      try {
        const token = await getToken();
        const res = await fetch('https://hudumalink-backend.onrender.com/api/users/designer-status', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setIsDesigner(data.success && data.status === 'approved');
      } catch (err) {
        console.error('Failed to check designer status:', err);
      }
    };
    checkDesigner();
  }, [isSignedIn, getToken]);

  // Fetch inspirations
  useEffect(() => {
    const fetchInspirations = async () => {
      setLoading(true);
      try {
        const token = isSignedIn ? await getToken() : null;
        
        // Use personalized endpoint if signed in, otherwise public
        const endpoint = token 
          ? 'https://hudumalink-backend.onrender.com/api/inspirations/personalized'
          : 'https://hudumalink-backend.onrender.com/api/inspirations';
        
        const headers: any = { 'Content-Type': 'application/json' };
        if (token) headers.Authorization = `Bearer ${token}`;

        const res = await fetch(endpoint, { headers });
        const data = await res.json();

        if (data.success) {
          setInspirations(data.inspirations || []);
          if (data.preferredStyles) {
            setPreferredStyles(data.preferredStyles);
          }
        }
      } catch (error) {
        console.error('Failed to fetch inspirations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInspirations();
  }, [isSignedIn, getToken]);

  // Filter inspirations
  const filteredInspirations = inspirations.filter((item) => {
    const matchesStyle = activeStyle === 'All' || item.styles.includes(activeStyle);
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.designerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStyle && matchesSearch;
  });

  // Separate preferred and other inspirations for visual distinction
  const preferredInspirations = filteredInspirations.filter(i => i.isPreferred);
  const otherInspirations = filteredInspirations.filter(i => !i.isPreferred);

  return (
    <Layout>
      <div className="container mx-auto px-4 lg:px-8 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h1 className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-2">
                Get Inspired
              </h1>
              <p className="text-muted-foreground">
                Browse stunning interior designs by Kenya's best designers
              </p>
            </div>

            {/* Add Inspiration Button - Designers Only */}
            {isDesigner && (
              <Button
                size="lg"
                onClick={() => navigate('/designer/add-inspiration')}
                className="shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="w-5 h-5 mr-2" />
                Share Your Work
              </Button>
            )}
          </div>

          {/* Personalization Badge */}
          {preferredStyles.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>
                Personalized for your style preferences:{' '}
                <span className="font-medium text-foreground">
                  {preferredStyles.join(', ')}
                </span>
              </span>
            </div>
          )}
        </motion.div>

        {/* Search & Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search designs, designers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-4 rounded-xl bg-muted border-0 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {styles.map((style) => (
              <Button
                key={style}
                variant={activeStyle === style ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveStyle(style)}
                className="flex-shrink-0"
              >
                {style}
                {style !== 'All' && preferredStyles.includes(style) && (
                  <Sparkles className="w-3 h-3 ml-1.5 fill-current" />
                )}
              </Button>
            ))}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{filteredInspirations.length} designs</span>
            {preferredInspirations.length > 0 && (
              <Badge variant="secondary" className="gap-1">
                <TrendingUp className="w-3 h-3" />
                {preferredInspirations.length} for you
              </Badge>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading inspirations...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredInspirations.length === 0 && (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <Search className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-2">No designs found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search or filters
            </p>
            {activeStyle !== 'All' && (
              <Button variant="outline" onClick={() => setActiveStyle('All')}>
                Clear Filters
              </Button>
            )}
          </div>
        )}

        {/* Inspirations Grid */}
        {!loading && filteredInspirations.length > 0 && (
          <div className="space-y-12">
            {/* Preferred Section */}
            {preferredInspirations.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h2 className="font-display text-2xl font-bold">For You</h2>
                  <Badge variant="secondary">Based on your preferences</Badge>
                </div>
                <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                  {preferredInspirations.map((inspiration, index) => (
                    <div key={inspiration.id} className="break-inside-avoid">
                      <InspirationCard inspiration={inspiration} index={index} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All/Other Designs Section */}
            {otherInspirations.length > 0 && (
              <div>
                {preferredInspirations.length > 0 && (
                  <h2 className="font-display text-2xl font-bold mb-6">
                    More Inspirations
                  </h2>
                )}
                <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                  {otherInspirations.map((inspiration, index) => (
                    <div key={inspiration.id} className="break-inside-avoid">
                      <InspirationCard 
                        inspiration={inspiration} 
                        index={preferredInspirations.length + index} 
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}