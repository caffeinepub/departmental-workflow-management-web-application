import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Trello, 
  Calendar, 
  Bell, 
  MessageSquare, 
  Users,
  Sparkles,
  Workflow,
  FileText,
  Database
} from 'lucide-react';

interface NavigationHubProps {
  onNavigate: (section: string) => void;
  isAdmin: boolean;
}

export default function NavigationHub({ onNavigate, isAdmin }: NavigationHubProps) {
  useEffect(() => {
    // Set page title for SEO
    document.title = 'WorkflowHub - Departmental Workflow Management';
  }, []);

  const navigationItems = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      description: 'View your daily overview, tasks, and meetings at a glance',
      icon: LayoutDashboard,
      color: 'primary',
      available: true,
    },
    {
      id: 'tasks',
      title: 'Tasks',
      description: 'Manage your to-do list with priorities and due dates',
      icon: CheckSquare,
      color: 'secondary',
      available: true,
    },
    {
      id: 'kanban',
      title: 'Kanban Board',
      description: 'Visualize and organize tasks with drag-and-drop columns',
      icon: Trello,
      color: 'accent',
      available: true,
    },
    {
      id: 'schedule',
      title: 'Schedule',
      description: 'Calendar view for meetings, shifts, and appointments',
      icon: Calendar,
      color: 'seafoam',
      available: true,
    },
    {
      id: 'reminders',
      title: 'Reminders',
      description: 'Set and manage reminders for important deadlines',
      icon: Bell,
      color: 'aqua',
      available: true,
    },
    {
      id: 'messaging',
      title: 'Messaging',
      description: 'Chat with team members in direct or group conversations',
      icon: MessageSquare,
      color: 'primary',
      available: true,
    },
    {
      id: 'clients',
      title: 'Client Management',
      description: 'Manage client contacts, intake, tasks, and appointments',
      icon: Users,
      color: 'secondary',
      available: true,
    },
    {
      id: 'invoices',
      title: 'Invoice Management',
      description: 'Create and manage client invoices with automated reminders',
      icon: FileText,
      color: 'accent',
      available: true,
    },
    {
      id: 'ai-assistant',
      title: 'AI Assistant Panel',
      description: 'Smart insights, summaries, and scheduling suggestions',
      icon: Sparkles,
      color: 'seafoam',
      available: true,
    },
    {
      id: 'workflow-automation',
      title: 'Workflow Automation',
      description: 'Configure rule-based triggers and automated actions',
      icon: Workflow,
      color: 'aqua',
      available: isAdmin,
    },
    {
      id: 'admin-database',
      title: 'Admin Database Dashboard',
      description: 'Comprehensive database management and data inspection',
      icon: Database,
      color: 'destructive',
      available: isAdmin,
    },
  ];

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, { bg: string; border: string; icon: string; hover: string; glow: string }> = {
      primary: {
        bg: 'bg-primary/15 backdrop-blur-md',
        border: 'border-primary/30',
        icon: 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-glow-primary',
        hover: 'hover:bg-primary/20 hover:border-primary/50 hover:shadow-summer-glow',
        glow: 'hover:shadow-glow-primary',
      },
      secondary: {
        bg: 'bg-secondary/15 backdrop-blur-md',
        border: 'border-secondary/30',
        icon: 'bg-gradient-to-br from-secondary to-secondary/80 text-secondary-foreground shadow-glow-secondary',
        hover: 'hover:bg-secondary/20 hover:border-secondary/50 hover:shadow-summer-glow',
        glow: 'hover:shadow-glow-secondary',
      },
      accent: {
        bg: 'bg-accent/15 backdrop-blur-md',
        border: 'border-accent/30',
        icon: 'bg-gradient-to-br from-accent to-accent/80 text-accent-foreground shadow-glow-accent',
        hover: 'hover:bg-accent/20 hover:border-accent/50 hover:shadow-summer-glow',
        glow: 'hover:shadow-glow-accent',
      },
      seafoam: {
        bg: 'bg-summer-seafoam/15 backdrop-blur-md',
        border: 'border-summer-seafoam/30',
        icon: 'bg-gradient-to-br from-summer-seafoam to-summer-seafoam/80 text-primary-foreground',
        hover: 'hover:bg-summer-seafoam/20 hover:border-summer-seafoam/50 hover:shadow-summer-glow',
        glow: 'hover:shadow-glow-primary',
      },
      aqua: {
        bg: 'bg-summer-aqua/15 backdrop-blur-md',
        border: 'border-summer-aqua/30',
        icon: 'bg-gradient-to-br from-summer-aqua to-summer-aqua/80 text-primary-foreground',
        hover: 'hover:bg-summer-aqua/20 hover:border-summer-aqua/50 hover:shadow-summer-glow',
        glow: 'hover:shadow-glow-primary',
      },
      destructive: {
        bg: 'bg-destructive/15 backdrop-blur-md',
        border: 'border-destructive/30',
        icon: 'bg-gradient-to-br from-destructive to-destructive/80 text-destructive-foreground shadow-glow-destructive',
        hover: 'hover:bg-destructive/20 hover:border-destructive/50 hover:shadow-summer-glow',
        glow: 'hover:shadow-glow-destructive',
      },
    };
    return colorMap[color] || colorMap.primary;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 relative overflow-hidden">
      {/* Decorative circles with glassmorphism */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float-delayed" />
      <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-accent/20 rounded-full blur-3xl animate-float-slow" />

      <div className="relative z-10 container mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-summer-lg glow-pulse">
              <span className="text-primary-foreground font-bold text-2xl sm:text-3xl">W</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              WorkflowHub
            </h1>
          </div>
          <p className="text-lg sm:text-xl text-muted-foreground font-medium">
            Choose a module to get started
          </p>
        </div>

        {/* Navigation Grid - Responsive */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {navigationItems.filter(item => item.available).map((item) => {
            const colors = getColorClasses(item.color);
            const Icon = item.icon;

            return (
              <Card
                key={item.id}
                className={`${colors.bg} ${colors.border} ${colors.hover} shadow-elegant cursor-pointer transition-all duration-300 hover:shadow-elegant-lg hover:scale-105 ${colors.glow}`}
                onClick={() => onNavigate(item.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-xl ${colors.icon} flex items-center justify-center`}>
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                  </div>
                  <CardTitle className="text-lg sm:text-xl">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {item.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Stats or Info Section */}
        <div className="max-w-4xl mx-auto mt-12 sm:mt-16 text-center">
          <p className="text-muted-foreground text-sm">
            Navigate between modules using the cards above. Your work is automatically saved.
          </p>
        </div>
      </div>
    </div>
  );
}
