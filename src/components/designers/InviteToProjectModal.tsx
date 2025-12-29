import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { formatCurrency, type Designer } from '@/data/MockData';

interface InviteModalProps {
  designer: Designer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteToProjectModal({ designer, open, onOpenChange }: InviteModalProps) {
  const [title, setTitle] = useState(`Project Invite for ${designer.name}`);
  const [description, setDescription] = useState(`Hi ${designer.name.split(' ')[0]}, I'd love to invite you to work on my project. Here's what I'm looking for:`);
  const [budget, setBudget] = useState<number[]>([designer.startingPrice]);

  const handleSubmit = () => {
    // In real app: save project + send invite
    alert(`Invite sent to ${designer.name}!\n\nProject: ${title}\nBudget: ${formatCurrency(budget[0])}\n\nThey'll be notified and can respond soon.`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Invite {designer.name} to Your Project</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Project Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Budget Range</Label>
            <div className="p-4 bg-primary/10 rounded-lg text-center">
              <p className="font-display text-3xl font-bold text-primary">
                {formatCurrency(budget[0])}
              </p>
            </div>
            <Slider
              value={budget}
              onValueChange={setBudget}
              min={designer.startingPrice * 0.8}
              max={designer.startingPrice * 3}
              step={50000}
            />
          </div>

          <div className="space-y-2">
            <Label>Message to {designer.name.split(' ')[0]}</Label>
            <Textarea
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell them about your vision..."
            />
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Send Invite
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}