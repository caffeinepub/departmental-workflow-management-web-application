import { useGetUserTasks, useGetUserMeetings, useGetUserReminders } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckSquare, Calendar, Bell, TrendingUp } from 'lucide-react';
import { format, isToday, isThisWeek, isThisMonth, startOfDay, endOfDay } from 'date-fns';

export default function TimeManagement() {
  const { data: tasks = [] } = useGetUserTasks();
  const { data: meetings = [] } = useGetUserMeetings();
  const { data: reminders = [] } = useGetUserReminders();

  const now = Date.now();
  const todayStart = startOfDay(now).getTime();
  const todayEnd = endOfDay(now).getTime();

  // Today's items
  const todayTasks = tasks.filter(task => {
    const dueDate = Number(task.dueDate) / 1000000;
    return dueDate >= todayStart && dueDate <= todayEnd;
  });

  const todayMeetings = meetings.filter(meeting => {
    const startTime = Number(meeting.startTime) / 1000000;
    return isToday(startTime);
  });

  const todayReminders = reminders.filter(reminder => {
    const time = Number(reminder.time) / 1000000;
    return isToday(time);
  });

  // Week's items
  const weekTasks = tasks.filter(task => isThisWeek(Number(task.dueDate) / 1000000));
  const weekMeetings = meetings.filter(meeting => isThisWeek(Number(meeting.startTime) / 1000000));

  // Month's items
  const monthTasks = tasks.filter(task => isThisMonth(Number(task.dueDate) / 1000000));
  const monthMeetings = meetings.filter(meeting => isThisMonth(Number(meeting.startTime) / 1000000));

  // Task completion stats
  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-primary">Dashboard</h2>
        <p className="text-muted-foreground">Overview of your tasks, meetings, and reminders</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-primary/20 bg-primary/10 hover:shadow-summer transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <div className="p-2 rounded-lg bg-primary/15">
              <CheckSquare className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalTasks}</div>
            <p className="text-xs text-muted-foreground">
              {completedTasks} completed
            </p>
          </CardContent>
        </Card>

        <Card className="border-accent/20 bg-accent/10 hover:shadow-summer transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <div className="p-2 rounded-lg bg-accent/15">
              <TrendingUp className="h-4 w-4 text-accent" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{completionRate.toFixed(0)}%</div>
            <Progress value={completionRate} className="mt-2 bg-accent/20" />
          </CardContent>
        </Card>

        <Card className="border-secondary/20 bg-secondary/10 hover:shadow-summer transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Meetings</CardTitle>
            <div className="p-2 rounded-lg bg-secondary/15">
              <Calendar className="h-4 w-4 text-secondary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">{meetings.length}</div>
            <p className="text-xs text-muted-foreground">
              {todayMeetings.length} today
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-summer-seafoam/15 hover:shadow-summer transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reminders</CardTitle>
            <div className="p-2 rounded-lg bg-summer-seafoam/25">
              <Bell className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{reminders.length}</div>
            <p className="text-xs text-muted-foreground">
              {todayReminders.length} today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Time Views */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Today */}
        <Card className="border-primary/20 bg-card/50 backdrop-blur-sm hover:shadow-summer transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-primary">Today</CardTitle>
            <CardDescription>{format(now, 'EEEE, MMMM d')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Tasks</span>
                <Badge variant="secondary" className="bg-primary/15 text-primary border-primary/25">{todayTasks.length}</Badge>
              </div>
              {todayTasks.length > 0 ? (
                <ul className="space-y-1">
                  {todayTasks.slice(0, 3).map(task => (
                    <li key={task.id} className="text-sm text-muted-foreground truncate">
                      • {task.title}
                    </li>
                  ))}
                  {todayTasks.length > 3 && (
                    <li className="text-sm text-muted-foreground">
                      +{todayTasks.length - 3} more
                    </li>
                  )}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No tasks today</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Meetings</span>
                <Badge variant="secondary" className="bg-accent/15 text-accent border-accent/25">{todayMeetings.length}</Badge>
              </div>
              {todayMeetings.length > 0 ? (
                <ul className="space-y-1">
                  {todayMeetings.slice(0, 3).map(meeting => (
                    <li key={meeting.id} className="text-sm text-muted-foreground truncate">
                      • {meeting.title} at {format(Number(meeting.startTime) / 1000000, 'HH:mm')}
                    </li>
                  ))}
                  {todayMeetings.length > 3 && (
                    <li className="text-sm text-muted-foreground">
                      +{todayMeetings.length - 3} more
                    </li>
                  )}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No meetings today</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* This Week */}
        <Card className="border-accent/20 bg-card/50 backdrop-blur-sm hover:shadow-summer transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-accent">This Week</CardTitle>
            <CardDescription>Weekly overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Tasks</span>
                <Badge variant="secondary" className="bg-accent/15 text-accent border-accent/25">{weekTasks.length}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {weekTasks.filter(t => t.completed).length} completed
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Meetings</span>
                <Badge variant="secondary" className="bg-secondary/15 text-secondary border-secondary/25">{weekMeetings.length}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Scheduled this week
              </p>
            </div>
          </CardContent>
        </Card>

        {/* This Month */}
        <Card className="border-secondary/20 bg-card/50 backdrop-blur-sm hover:shadow-summer transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-secondary">This Month</CardTitle>
            <CardDescription>{format(now, 'MMMM yyyy')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Tasks</span>
                <Badge variant="secondary" className="bg-secondary/15 text-secondary border-secondary/25">{monthTasks.length}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {monthTasks.filter(t => t.completed).length} completed
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Meetings</span>
                <Badge variant="secondary" className="bg-primary/15 text-primary border-primary/25">{monthMeetings.length}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Scheduled this month
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
