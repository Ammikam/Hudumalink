import { useState } from 'react';
//import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import { Layout } from '../components/Layout/Layout';
import { Button } from '../components/ui/button';
import { useStore } from '../store/use-store';
import { formatCurrency } from '../data/MockData';

export default function ClientDashboard() {
  const { projects, messages, savedIdeas, inspirations, addMessage } = useStore();
  const [activeTab, setActiveTab] = useState('projects');
  const [newMessage, setNewMessage] = useState('');
  const project = projects[0];

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    addMessage({
      id: Date.now().toString(),
      senderId: 'client',
      senderName: 'You',
      senderAvatar: '',
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOwn: true,
    });
    setNewMessage('');
  };

  return (
    <Layout hideFooter>
      <div className="container mx-auto px-4 lg:px-8 py-6">
        <h1 className="font-display text-2xl lg:text-3xl font-bold mb-6">My Dashboard</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['projects', 'messages', 'saved'].map((tab) => (
            <Button key={tab} variant={activeTab === tab ? 'default' : 'outline'} size="sm" onClick={() => setActiveTab(tab)} className="capitalize">
              {tab}
            </Button>
          ))}
        </div>

        {activeTab === 'projects' && project && (
          <div className="space-y-6">
            <div className="card-elevated p-6">
              <h2 className="font-display text-xl font-semibold mb-4">{project.title}</h2>
              <p className="text-muted-foreground mb-4">{project.description}</p>
              
              {/* Milestones */}
              <div className="space-y-3">
                <h3 className="font-semibold">Progress</h3>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: '25%' }} />
                </div>
                {project.milestones.map((m) => (
                  <div key={m.id} className={`flex items-center justify-between p-3 rounded-xl ${m.status === 'completed' ? 'bg-primary/10' : 'bg-muted'}`}>
                    <span className={m.status === 'completed' ? 'text-primary font-medium' : ''}>{m.title}</span>
                    <span className="text-sm text-muted-foreground">{formatCurrency(m.amount)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Proposals */}
            <div>
              <h3 className="font-display text-lg font-semibold mb-4">Proposals ({project.proposals.length})</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {project.proposals.map((p) => (
                  <div key={p.id} className="card-premium p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <img src={p.designerAvatar} alt={p.designerName} className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <p className="font-semibold">{p.designerName}</p>
                        <p className="text-sm text-muted-foreground">{formatCurrency(p.quote)}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{p.coverLetter}</p>
                    <Button size="sm" className="w-full">View Proposal</Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="card-elevated h-[60vh] flex flex-col">
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl ${msg.isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    {!msg.isOwn && <p className="text-xs font-medium mb-1">{msg.senderName}</p>}
                    <p className="text-sm">{msg.content}</p>
                    <p className={`text-xs mt-1 ${msg.isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{msg.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-border flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type a message..."
                className="flex-1 h-10 px-4 rounded-xl bg-muted border-0"
              />
              <Button size="icon" onClick={handleSendMessage}><Send className="w-4 h-4" /></Button>
            </div>
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {savedIdeas.length === 0 ? (
              <p className="col-span-full text-center py-12 text-muted-foreground">No saved ideas yet</p>
            ) : (
              savedIdeas.map((saved) => {
                const idea = inspirations.find((i) => i.id === saved.id);
                return idea ? (
                  <div key={idea.id} className="relative rounded-xl overflow-hidden aspect-square">
                    <img src={idea.image} alt={idea.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent flex items-end p-3">
                      <p className="text-white text-sm font-medium">{idea.title}</p>
                    </div>
                  </div>
                ) : null;
              })
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
