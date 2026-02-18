import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import TimeManagement from '../components/TimeManagement';
import TaskList from '../components/TaskList';
import ScheduleView from '../components/ScheduleView';
import RemindersPanel from '../components/RemindersPanel';
import MessagingPanel from '../components/MessagingPanel';
import ClientManagement from '../components/ClientManagement';
import AppointmentManagement from '../components/AppointmentManagement';
import AIAssistantPanel from '../components/AIAssistantPanel';
import WorkflowAutomation from '../components/WorkflowAutomation';
import InvoiceManagement from '../components/InvoiceManagement';
import AdminDatabaseDashboard from '../components/AdminDatabaseDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsCallerAdmin } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

interface DashboardProps {
  initialTab?: string;
  onBackToHub?: () => void;
}

export default function Dashboard({ initialTab = 'overview', onBackToHub }: DashboardProps) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const { data: isAdmin } = useIsCallerAdmin();

  useEffect(() => {
    setActiveTab(initialTab);
    
    // Update page title based on active tab
    const tabTitles: Record<string, string> = {
      overview: 'Dashboard Overview',
      tasks: 'Tasks',
      kanban: 'Kanban Board',
      schedule: 'Schedule',
      reminders: 'Reminders',
      messaging: 'Messaging',
      clients: 'Client Management',
      appointments: 'Appointments',
      invoices: 'Invoice Management',
      'ai-assistant': 'AI Assistant',
      'workflow-automation': 'Workflow Automation',
      'admin-database': 'Admin Database',
    };
    
    document.title = `${tabTitles[initialTab] || 'Dashboard'} - WorkflowHub`;
  }, [initialTab]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        {onBackToHub && (
          <div className="mb-4">
            <Button
              onClick={onBackToHub}
              variant="outline"
              className="border-primary/30 hover:bg-primary/10 transition-all"
            >
              <Home className="h-4 w-4 mr-2" />
              Back to Hub
            </Button>
          </div>
        )}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-card/50 backdrop-blur-sm border border-primary/15 shadow-summer p-1 flex-wrap h-auto gap-1">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="tasks"
              className="data-[state=active]:bg-summer-coral data-[state=active]:text-primary-foreground transition-all"
            >
              Tasks
            </TabsTrigger>
            <TabsTrigger
              value="schedule"
              className="data-[state=active]:bg-summer-seafoam data-[state=active]:text-primary-foreground transition-all"
            >
              Schedule
            </TabsTrigger>
            <TabsTrigger
              value="reminders"
              className="data-[state=active]:bg-summer-aqua data-[state=active]:text-primary-foreground transition-all"
            >
              Reminders
            </TabsTrigger>
            <TabsTrigger
              value="messaging"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
            >
              Messaging
            </TabsTrigger>
            <TabsTrigger
              value="clients"
              className="data-[state=active]:bg-summer-coral data-[state=active]:text-primary-foreground transition-all"
            >
              Clients
            </TabsTrigger>
            <TabsTrigger
              value="appointments"
              className="data-[state=active]:bg-summer-seafoam data-[state=active]:text-primary-foreground transition-all"
            >
              Appointments
            </TabsTrigger>
            <TabsTrigger
              value="invoices"
              className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground transition-all"
            >
              Invoices
            </TabsTrigger>
            <TabsTrigger
              value="ai-assistant"
              className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground transition-all"
            >
              AI Assistant
            </TabsTrigger>
            <TabsTrigger
              value="workflow-automation"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
            >
              Automation
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger
                value="admin-database"
                className="data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground transition-all"
              >
                Admin Database
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <TimeManagement />
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6">
            <TaskList />
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <ScheduleView />
          </TabsContent>

          <TabsContent value="reminders" className="space-y-6">
            <RemindersPanel />
          </TabsContent>

          <TabsContent value="messaging" className="space-y-6">
            <MessagingPanel />
          </TabsContent>

          <TabsContent value="clients" className="space-y-6">
            <ClientManagement />
          </TabsContent>

          <TabsContent value="appointments" className="space-y-6">
            <AppointmentManagement />
          </TabsContent>

          <TabsContent value="invoices" className="space-y-6">
            <InvoiceManagement />
          </TabsContent>

          <TabsContent value="ai-assistant" className="space-y-6">
            <AIAssistantPanel />
          </TabsContent>

          <TabsContent value="workflow-automation" className="space-y-6">
            <WorkflowAutomation />
          </TabsContent>

          {isAdmin && (
            <TabsContent value="admin-database" className="space-y-6">
              <AdminDatabaseDashboard />
            </TabsContent>
          )}
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}
