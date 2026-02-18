import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, TrendingUp, Calendar, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useGetUserTasks, useGetUserMeetings, useGetUserReminders } from '../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';
import { Priority } from '../backend';

export default function AIAssistantPanel() {
  const { data: tasks = [], isLoading: tasksLoading } = useGetUserTasks();
  const { data: meetings = [], isLoading: meetingsLoading } = useGetUserMeetings();
  const { data: reminders = [], isLoading: remindersLoading } = useGetUserReminders();

  const isLoading = tasksLoading || meetingsLoading || remindersLoading;

  // Calculate metrics
  const now = Date.now() * 1000000; // Convert to nanoseconds
  const upcomingTasks = tasks.filter(t => !t.completed && Number(t.dueDate) > now);
  const overdueTasks = tasks.filter(t => !t.completed && Number(t.dueDate) <= now);
  const completedTasks = tasks.filter(t => t.completed);
  const upcomingMeetings = meetings.filter(m => Number(m.startTime) > now);
  const upcomingReminders = reminders.filter(r => Number(r.time) > now);

  // Calculate productivity rate
  const totalTasks = tasks.length;
  const productivityRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

  // Generate meeting suggestions based on upcoming tasks
  const generateMeetingSuggestions = () => {
    const suggestions: string[] = [];
    
    if (overdueTasks.length > 0) {
      suggestions.push(`Schedule a review meeting to address ${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''}`);
    }
    
    const highPriorityTasks = upcomingTasks.filter(t => t.priority === Priority.high);
    if (highPriorityTasks.length > 2) {
      suggestions.push(`Consider a planning session for ${highPriorityTasks.length} high-priority tasks`);
    }

    if (upcomingMeetings.length === 0 && upcomingTasks.length > 0) {
      suggestions.push('No meetings scheduled - consider a team sync to discuss upcoming tasks');
    }

    if (suggestions.length === 0) {
      suggestions.push('Your schedule looks balanced. Keep up the great work!');
    }

    return suggestions;
  };

  // Generate schedule suggestions
  const generateScheduleSuggestions = () => {
    const suggestions: string[] = [];
    
    // Find tasks due soon (within 3 days)
    const threeDaysFromNow = now + (3 * 24 * 60 * 60 * 1000000000);
    const tasksDueSoon = upcomingTasks.filter(t => Number(t.dueDate) <= threeDaysFromNow);
    
    if (tasksDueSoon.length > 0) {
      suggestions.push(`${tasksDueSoon.length} task${tasksDueSoon.length > 1 ? 's' : ''} due within 3 days - allocate focused time blocks`);
    }

    // Check for meeting gaps
    if (upcomingMeetings.length > 0) {
      const sortedMeetings = [...upcomingMeetings].sort((a, b) => Number(a.startTime) - Number(b.startTime));
      for (let i = 0; i < sortedMeetings.length - 1; i++) {
        const gap = Number(sortedMeetings[i + 1].startTime) - Number(sortedMeetings[i].endTime);
        const gapHours = gap / (60 * 60 * 1000000000);
        if (gapHours >= 2) {
          suggestions.push(`${Math.floor(gapHours)}-hour gap available between meetings - ideal for deep work`);
          break;
        }
      }
    }

    if (suggestions.length === 0) {
      suggestions.push('Optimal time for focused work: mornings before meetings');
    }

    return suggestions;
  };

  const meetingSuggestions = generateMeetingSuggestions();
  const scheduleSuggestions = generateScheduleSuggestions();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Sparkles className="h-8 w-8 text-accent" />
          <div>
            <h2 className="text-3xl font-bold">AI Assistant Panel</h2>
            <p className="text-muted-foreground">Loading insights...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="bg-card/50 backdrop-blur-sm border-primary/15">
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center shadow-glow-accent">
          <Sparkles className="h-6 w-6 text-accent-foreground" />
        </div>
        <div>
          <h2 className="text-3xl font-bold">AI Assistant Panel</h2>
          <p className="text-muted-foreground">Smart insights and productivity summaries</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-sm border-primary/20 shadow-elegant hover:shadow-elegant-lg transition-all">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Upcoming Tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{upcomingTasks.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Active tasks to complete</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-destructive/10 to-destructive/5 backdrop-blur-sm border-destructive/20 shadow-elegant hover:shadow-elegant-lg transition-all">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              Overdue Items
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{overdueTasks.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Tasks past due date</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 backdrop-blur-sm border-secondary/20 shadow-elegant hover:shadow-elegant-lg transition-all">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-secondary" />
              Upcoming Meetings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-secondary">{upcomingMeetings.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Scheduled meetings</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/10 to-accent/5 backdrop-blur-sm border-accent/20 shadow-elegant hover:shadow-elegant-lg transition-all">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-accent" />
              Productivity Rate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">{productivityRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">Tasks completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Meeting Suggestions */}
      <Card className="bg-card/50 backdrop-blur-sm border-primary/15 shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Meeting Suggestions
          </CardTitle>
          <CardDescription>AI-generated recommendations based on your workload</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {meetingSuggestions.map((suggestion, index) => (
            <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
              <Sparkles className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <p className="text-sm">{suggestion}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Schedule Optimization */}
      <Card className="bg-card/50 backdrop-blur-sm border-accent/15 shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-accent" />
            Schedule Optimization
          </CardTitle>
          <CardDescription>Suggested time blocks and scheduling insights</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {scheduleSuggestions.map((suggestion, index) => (
            <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-accent/5 border border-accent/10">
              <Clock className="h-5 w-5 text-accent mt-0.5 shrink-0" />
              <p className="text-sm">{suggestion}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Activity Summary */}
      <Card className="bg-card/50 backdrop-blur-sm border-secondary/15 shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-secondary" />
            Activity Summary
          </CardTitle>
          <CardDescription>Your productivity at a glance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-lg bg-primary/5">
              <div className="text-2xl font-bold text-primary">{tasks.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Total Tasks</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-secondary/5">
              <div className="text-2xl font-bold text-secondary">{completedTasks.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Completed</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-accent/5">
              <div className="text-2xl font-bold text-accent">{meetings.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Total Meetings</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-summer-seafoam/10">
              <div className="text-2xl font-bold text-summer-seafoam">{upcomingReminders.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Active Reminders</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
