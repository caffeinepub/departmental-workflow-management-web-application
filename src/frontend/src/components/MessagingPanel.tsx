import { useState, useEffect, useRef } from 'react';
import { useGetUserChatGroups, useGetMessages, useCreateChatGroup, useSendMessage } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Plus, Send, Users, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import type { Message } from '../backend';
import { Principal } from '@icp-sdk/core/principal';

// Define ChatGroup locally since it's not exported from backend
interface ChatGroup {
  id: string;
  members: Principal[];
  creator: Principal;
}

export default function MessagingPanel() {
  const { data: chatGroups = [], isLoading } = useGetUserChatGroups();
  const { identity } = useInternetIdentity();
  const createChatGroup = useCreateChatGroup();
  const sendMessage = useSendMessage();

  const [selectedGroup, setSelectedGroup] = useState<ChatGroup | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages = [] } = useGetMessages(selectedGroup?.id || null);

  const [formData, setFormData] = useState({
    members: '',
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.members.trim()) {
      toast.error('Please add at least one member');
      return;
    }

    try {
      const memberIds = formData.members
        .split(',')
        .map(m => m.trim())
        .filter(m => m.length > 0);

      const members: Principal[] = [];
      for (const id of memberIds) {
        try {
          members.push(Principal.fromText(id));
        } catch {
          toast.error(`Invalid principal ID: ${id}`);
          return;
        }
      }

      // Add current user if not in list
      if (identity && !members.some(m => m.toString() === identity.getPrincipal().toString())) {
        members.push(identity.getPrincipal());
      }

      const groupId = `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      await createChatGroup.mutateAsync({ groupId, members });
      toast.success('Chat group created successfully');
      setIsCreateOpen(false);
      setFormData({ members: '' });
    } catch (error) {
      toast.error('Failed to create chat group');
      console.error(error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageText.trim() || !selectedGroup || !identity) {
      return;
    }

    try {
      await sendMessage.mutateAsync({
        groupId: selectedGroup.id,
        content: messageText.trim(),
      });

      setMessageText('');
    } catch (error) {
      toast.error('Failed to send message');
      console.error(error);
    }
  };

  const getPrincipalInitials = (principal: Principal) => {
    const str = principal.toString();
    return str.slice(0, 2).toUpperCase();
  };

  const isOwnMessage = (message: Message) => {
    return identity && message.sender.toString() === identity.getPrincipal().toString();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Messages</h2>
          <p className="text-muted-foreground">Team communication and chat groups</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              New Group
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card/95 backdrop-blur-sm border-primary/20 shadow-summer-lg">
            <DialogHeader>
              <DialogTitle>Create Chat Group</DialogTitle>
              <DialogDescription>
                Create a new group chat with team members
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="members">Members (Principal IDs, comma-separated) *</Label>
                <Textarea
                  id="members"
                  value={formData.members}
                  onChange={(e) => setFormData({ members: e.target.value })}
                  placeholder="principal-id-1, principal-id-2, ..."
                  rows={3}
                  className="border-primary/20 focus:border-primary"
                />
                <p className="text-xs text-muted-foreground">
                  Enter member principal IDs separated by commas. You will be automatically added.
                </p>
              </div>

              <DialogFooter>
                <Button type="submit" disabled={createChatGroup.isPending} className="bg-primary hover:bg-primary/90">
                  {createChatGroup.isPending ? 'Creating...' : 'Create Group'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chat Groups List */}
        <Card className="bg-card/50 backdrop-blur-sm border-primary/15 shadow-summer">
          <CardHeader>
            <CardTitle>Chat Groups</CardTitle>
            <CardDescription>{chatGroups.length} group{chatGroups.length !== 1 ? 's' : ''}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : chatGroups.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No chat groups yet. Create one to start messaging!
              </p>
            ) : (
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {chatGroups.map(group => (
                    <button
                      key={group.id}
                      onClick={() => setSelectedGroup(group)}
                      className={`
                        w-full p-3 rounded-lg border text-left transition-all
                        ${selectedGroup?.id === group.id ? 'bg-primary/10 border-primary shadow-glow-primary' : 'hover:bg-accent border-primary/10'}
                      `}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-sm">Group Chat</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {group.members.length} member{group.members.length !== 1 ? 's' : ''}
                      </Badge>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Chat Messages */}
        <Card className="lg:col-span-2 bg-card/50 backdrop-blur-sm border-primary/15 shadow-summer">
          <CardHeader>
            <CardTitle>
              {selectedGroup ? (
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span>Group Chat</span>
                  <Badge variant="secondary">{selectedGroup.members.length} members</Badge>
                </div>
              ) : (
                'Select a group to start messaging'
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedGroup ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Select a chat group from the list to view messages
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Messages */}
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-4">
                    {messages.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        No messages yet. Start the conversation!
                      </p>
                    ) : (
                      messages.map(message => {
                        const isOwn = isOwnMessage(message);
                        return (
                          <div
                            key={message.id}
                            className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}
                          >
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className={isOwn ? 'bg-primary text-primary-foreground' : ''}>
                                {getPrincipalInitials(message.sender)}
                              </AvatarFallback>
                            </Avatar>
                            <div className={`flex-1 space-y-1 ${isOwn ? 'items-end' : ''}`}>
                              <div className={`flex items-center gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
                                <span className="text-xs text-muted-foreground">
                                  {message.sender.toString().slice(0, 8)}...
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {format(Number(message.timestamp) / 1000000, 'HH:mm')}
                                </span>
                              </div>
                              <div
                                className={`
                                  inline-block p-3 rounded-lg max-w-[80%]
                                  ${isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted'}
                                `}
                              >
                                <p className="text-sm">{message.content}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type a message..."
                    disabled={sendMessage.isPending}
                    className="border-primary/20 focus:border-primary"
                  />
                  <Button type="submit" size="icon" disabled={!messageText.trim() || sendMessage.isPending} className="bg-primary hover:bg-primary/90">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
