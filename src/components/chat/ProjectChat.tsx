// src/components/chat/ProjectChat.tsx
import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { io, Socket } from 'socket.io-client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Loader2, MessageSquare } from 'lucide-react';

interface Message {
  _id: string;
  sender: {
    _id: string;
    name: string;
    avatar?: string;
  };
  message: string;
  createdAt: string;
}

interface ProjectChatProps {
  projectId: string;
  height?: string;
  showHeader?: boolean;
  className?: string;
}

let socket: Socket | null = null;

const getSocket = () => {
  if (!socket) {
    socket = io('http://localhost:5000', { autoConnect: false });
  }
  return socket;
};

export function ProjectChat({ 
  projectId, 
  height = 'h-[600px]',
  showHeader = true,
  className = ''
}: ProjectChatProps) {
  const { userId: clerkUserId, getToken } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [connected, setConnected] = useState(false);
  const [mongoUserId, setMongoUserId] = useState<string | null>(null);

  // Fetch MongoDB _id using Clerk ID — no extra imports!
  useEffect(() => {
    const fetchMongoId = async () => {
      if (!clerkUserId) return;

      try {
        const token = await getToken();
        const res = await fetch(`http://localhost:5000/api/projects/mongo-id/${clerkUserId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (data.success && data.mongoId) {
          setMongoUserId(data.mongoId);
        }
      } catch (err) {
        console.error('Failed to fetch MongoDB user ID');
      }
    };

    fetchMongoId();
  }, [clerkUserId, getToken]);

  // Socket setup — only when we have projectId and mongoUserId
  useEffect(() => {
    if (!projectId || !mongoUserId) return;

    const socketInstance = getSocket();
    socketInstance.connect();
    socketInstance.emit('join_project', projectId);

    const handleConnect = () => {
      setConnected(true);
      socketInstance.emit('load_messages', projectId);
    };

    const handleMessagesLoaded = (loadedMessages: Message[]) => {
      setMessages(loadedMessages);
    };

    const handleNewMessage = (message: Message) => {
      setMessages(prev => [...prev, message]);
    };

    const handleDisconnect = () => {
      setConnected(false);
    };

    socketInstance.on('connect', handleConnect);
    socketInstance.on('messages_loaded', handleMessagesLoaded);
    socketInstance.on('new_message', handleNewMessage);
    socketInstance.on('disconnect', handleDisconnect);

    return () => {
      socketInstance.off('connect', handleConnect);
      socketInstance.off('messages_loaded', handleMessagesLoaded);
      socketInstance.off('new_message', handleNewMessage);
      socketInstance.off('disconnect', handleDisconnect);
      socketInstance.emit('leave_project', projectId);
    };
  }, [projectId, mongoUserId]);

  const sendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!newMessage.trim() || !mongoUserId || !connected) return;

    setSending(true);
    getSocket().emit('send_message', {
      projectId,
      senderId: mongoUserId, // ← Now using correct MongoDB _id
      message: newMessage.trim(),
    });
    setNewMessage('');
    setSending(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });
  };

  return (
    <Card className={`${height} flex flex-col ${className}`}>
      {showHeader && (
        <div className="p-4 border-b bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="flex items-center justify-between">
            <h3 className="font-bold">Project Chat</h3>
            <div className="flex items-center gap-2">
              <div 
                className={`w-2 h-2 rounded-full ${
                  connected ? 'bg-green-500' : 'bg-gray-400'
                } animate-pulse`} 
              />
              <span className="text-xs text-muted-foreground">
                {connected ? 'Online' : 'Connecting...'}
              </span>
            </div>
          </div>
        </div>
      )}

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No messages yet</p>
              <p className="text-sm text-muted-foreground mt-2">Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isOwnMessage = msg.sender._id === mongoUserId;
              
              return (
                <div
                  key={msg._id}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="flex gap-3 max-w-[70%]">
                    {!isOwnMessage && (
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarImage src={msg.sender.avatar} />
                        <AvatarFallback className="text-xs">
                          {msg.sender.name?.[0]?.toUpperCase() || '?'}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`px-4 py-3 rounded-2xl ${
                        isOwnMessage
                          ? 'bg-primary text-primary-foreground rounded-br-none'
                          : 'bg-muted rounded-bl-none'
                      }`}
                    >
                      <p className="font-medium text-xs mb-1 opacity-80">
                        {msg.sender.name}
                      </p>
                      <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                      <p className="text-xs opacity-60 mt-1">
                        {formatDate(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <form onSubmit={sendMessage} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={mongoUserId ? "Type a message..." : "Loading user..."}
            disabled={sending || !connected || !mongoUserId}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={sending || !newMessage.trim() || !mongoUserId}
            size="icon"
          >
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </form>
      </div>
    </Card>
  );
}

// Optional: Clean disconnect
export const disconnectChatSocket = () => {
  if (socket && socket.connected) {
    socket.disconnect();
    socket = null;
  }
};