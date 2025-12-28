import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar } from '@/components/ui/avatar';
import { Send } from 'lucide-react';
import { type Designer } from '@/data/MockData';

interface SendMessageModalProps {
  designer: Designer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SendMessageModal({ designer, open, onOpenChange }: SendMessageModalProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, text: `Hi! I'm interested in your work. Can you tell me more about your process?`, sender: 'client' },
    { id: 2, text: `Hello! I'd love to help with your project. Could you share more details about your space and vision?`, sender: 'designer', name: designer.name },
  ]);

  const sendMessage = () => {
    if (message.trim()) {
      setMessages([...messages, { id: messages.length + 1, text: message, sender: 'client' }]);
      setMessage('');
      // Simulate designer reply
      setTimeout(() => {
        setMessages(prev => [...prev, { id: prev.length + 1, text: 'Thanks for reaching out! I\'ll review your message and reply soon.', sender: 'designer', name: designer.name }]);
      }, 1000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col p-0">
        <DialogHeader className="p-6 border-b border-border">
          <div className="flex items-center gap-4">
            <Avatar className="w-12 h-12">
              <img src={designer.avatar} alt={designer.name} />
            </Avatar>
            <div>
              <DialogTitle className="text-xl">{designer.name}</DialogTitle>
              <p className="text-sm text-muted-foreground">Typically replies in {designer.responseTime}</p>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6">
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'client' ? 'justify-end' : 'justify-start'} gap-3`}
              >
                {msg.sender === 'designer' && (
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <img src={designer.avatar} alt={designer.name} />
                  </Avatar>
                )}
                <div className={`max-w-xs lg:max-w-md rounded-2xl px-4 py-3 ${
                  msg.sender === 'client' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted'
                }`}>
                  {msg.sender === 'designer' && (
                    <p className="text-xs font-semibold mb-1">{designer.name}</p>
                  )}
                  <p>{msg.text}</p>
                </div>
                {msg.sender === 'client' && (
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <div className="w-full h-full bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">
                      Y
                    </div>
                  </Avatar>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="p-6 border-t border-border">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex gap-3"
          >
            <Input
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={!message.trim()}>
              <Send className="w-5 h-5" />
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}