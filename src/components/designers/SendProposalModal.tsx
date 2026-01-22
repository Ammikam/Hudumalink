// src/components/designerpages/ProposalModal.tsx
import { useState } from 'react';
import { X, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Project {
  _id: string;
  title: string;
  budget: number;
  timeline: string;
}

interface ProposalModalProps {
  project: Project;
  onClose: () => void;
  onSubmit: (proposal: { message: string; price: number; timeline: string }) => Promise<void>;
}

export default function ProposalModal({ project, onClose, onSubmit }: ProposalModalProps) {
  // Early return if project is undefined
  if (!project) {
    return null;
  }

  const [message, setMessage] = useState('');
  const [price, setPrice] = useState(project.budget.toString());
  const [timeline, setTimeline] = useState(project.timeline);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) {
      alert('Please write a proposal message');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        message: message.trim(),
        price: Number(price) || project.budget,
        timeline: timeline.trim() || project.timeline,
      });
      onClose();
    } catch (error) {
      console.error('Send proposal error:', error);
      alert('Failed to send proposal. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Send Proposal</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Project Details</h3>
            <p className="font-medium text-lg">{project.title}</p>
            <div className="text-sm text-gray-600 mt-3 space-y-1">
              <p>Budget: KSh {project.budget.toLocaleString()}</p>
              <p>Timeline: {project.timeline}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Your Message *</Label>
            <Textarea
              id="message"
              placeholder="Why are you the best designer for this project? Share your experience, ideas, and approach..."
              rows={8}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="resize-none"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="price">Your Price (KSh)</Label>
              <Input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 1200000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeline">Your Timeline</Label>
              <Input
                id="timeline"
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                placeholder="e.g. 6-8 weeks"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting || !message.trim()}
              className="min-w-[160px]"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Send Proposal
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}