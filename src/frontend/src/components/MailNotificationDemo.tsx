import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateMailNotification } from '../hooks/useQueries';
import { toast } from 'sonner';
import { Mail, Sparkles } from 'lucide-react';
import type { MailSender } from '../backend';

export default function MailNotificationDemo() {
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [source, setSource] = useState<'Gmail' | 'Outlook'>('Gmail');
  const createMail = useCreateMailNotification();

  const handleCreateSampleMail = async () => {
    if (!subject.trim()) {
      toast.error('Please enter a subject');
      return;
    }

    const sender: MailSender = {
      displayName: senderName.trim() || 'Unknown Sender',
      address: senderEmail.trim() || 'noreply@example.com',
    };

    try {
      await createMail.mutateAsync({
        sender,
        subject: subject.trim(),
        source,
      });
      toast.success(`Sample ${source} mail notification created!`);
      setSenderName('');
      setSenderEmail('');
      setSubject('');
    } catch (error) {
      toast.error('Failed to create mail notification');
      console.error(error);
    }
  };

  const handleQuickSample = async (type: 'gmail' | 'outlook') => {
    const samples = {
      gmail: {
        sender: {
          displayName: 'Google Team',
          address: 'noreply@google.com',
        },
        subject: 'Your weekly activity summary is ready',
        source: 'Gmail' as const,
      },
      outlook: {
        sender: {
          displayName: 'Microsoft 365',
          address: 'noreply@microsoft.com',
        },
        subject: 'New document shared with you',
        source: 'Outlook' as const,
      },
    };

    const sample = samples[type];
    try {
      await createMail.mutateAsync(sample);
      toast.success(`Sample ${sample.source} notification created!`);
    } catch (error) {
      toast.error('Failed to create sample notification');
      console.error(error);
    }
  };

  return (
    <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Mail className="h-5 w-5" />
          Mail Notification Demo
        </CardTitle>
        <CardDescription>
          Create sample mail notifications to test the integration layer
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => handleQuickSample('gmail')}
            disabled={createMail.isPending}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Quick Gmail Sample
          </Button>
          <Button
            onClick={() => handleQuickSample('outlook')}
            disabled={createMail.isPending}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Quick Outlook Sample
          </Button>
        </div>

        <div className="border-t border-primary/10 pt-4">
          <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Custom Mail Notification</h4>
          <div className="space-y-3">
            <div>
              <Label htmlFor="source">Mail Provider</Label>
              <Select value={source} onValueChange={(v) => setSource(v as 'Gmail' | 'Outlook')}>
                <SelectTrigger id="source">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Gmail">Gmail</SelectItem>
                  <SelectItem value="Outlook">Outlook</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="senderName">Sender Name</Label>
              <Input
                id="senderName"
                placeholder="John Doe"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="senderEmail">Sender Email</Label>
              <Input
                id="senderEmail"
                type="email"
                placeholder="sender@example.com"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Important message..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <Button
              onClick={handleCreateSampleMail}
              disabled={createMail.isPending}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {createMail.isPending ? 'Creating...' : 'Create Custom Mail'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
