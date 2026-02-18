import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile, useIsCallerAdmin } from './hooks/useQueries';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { RouterProvider, createRouter, createRootRoute, createRoute, Outlet } from '@tanstack/react-router';
import LoginPage from './pages/LoginPage';
import NavigationHub from './pages/NavigationHub';
import ProfileSetup from './components/ProfileSetup';
import Dashboard from './pages/Dashboard';
import ServiceWorkerUpdatePrompt from './components/ServiceWorkerUpdatePrompt';
import { useEffect } from 'react';

// Root route component with layout
function RootLayout() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;

  // Show loading state while initializing
  if (isInitializing) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground text-lg">Loading WorkflowHub...</p>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Show profile setup if authenticated but no profile exists
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  if (showProfileSetup) {
    return <ProfileSetup />;
  }

  // Render children (routes)
  return <Outlet />;
}

// Navigation Hub Component
function NavigationHubRoute() {
  const { data: isAdmin } = useIsCallerAdmin();
  
  return (
    <NavigationHub 
      onNavigate={(section) => {
        router.navigate({ to: `/${section}` });
      }} 
      isAdmin={isAdmin || false} 
    />
  );
}

// Dashboard Route Components
function DashboardOverviewRoute() {
  return <Dashboard initialTab="overview" onBackToHub={() => router.navigate({ to: '/' })} />;
}

function TasksRoute() {
  return <Dashboard initialTab="tasks" onBackToHub={() => router.navigate({ to: '/' })} />;
}

function KanbanRoute() {
  return <Dashboard initialTab="tasks" onBackToHub={() => router.navigate({ to: '/' })} />;
}

function ScheduleRoute() {
  return <Dashboard initialTab="schedule" onBackToHub={() => router.navigate({ to: '/' })} />;
}

function RemindersRoute() {
  return <Dashboard initialTab="reminders" onBackToHub={() => router.navigate({ to: '/' })} />;
}

function MessagingRoute() {
  return <Dashboard initialTab="messaging" onBackToHub={() => router.navigate({ to: '/' })} />;
}

function ClientsRoute() {
  return <Dashboard initialTab="clients" onBackToHub={() => router.navigate({ to: '/' })} />;
}

function AppointmentsRoute() {
  return <Dashboard initialTab="appointments" onBackToHub={() => router.navigate({ to: '/' })} />;
}

function InvoicesRoute() {
  return <Dashboard initialTab="invoices" onBackToHub={() => router.navigate({ to: '/' })} />;
}

function AIAssistantRoute() {
  return <Dashboard initialTab="ai-assistant" onBackToHub={() => router.navigate({ to: '/' })} />;
}

function WorkflowAutomationRoute() {
  return <Dashboard initialTab="workflow-automation" onBackToHub={() => router.navigate({ to: '/' })} />;
}

function AdminDatabaseRoute() {
  return <Dashboard initialTab="admin-database" onBackToHub={() => router.navigate({ to: '/' })} />;
}

// Create root route
const rootRoute = createRootRoute({
  component: RootLayout,
});

// Create navigation hub route (home)
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: NavigationHubRoute,
});

// Create dashboard routes
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: DashboardOverviewRoute,
});

const tasksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tasks',
  component: TasksRoute,
});

const kanbanRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/kanban',
  component: KanbanRoute,
});

const scheduleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/schedule',
  component: ScheduleRoute,
});

const remindersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reminders',
  component: RemindersRoute,
});

const messagingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/messaging',
  component: MessagingRoute,
});

const clientsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/clients',
  component: ClientsRoute,
});

const appointmentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/appointments',
  component: AppointmentsRoute,
});

const invoicesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/invoices',
  component: InvoicesRoute,
});

const aiAssistantRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/ai-assistant',
  component: AIAssistantRoute,
});

const workflowAutomationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/workflow-automation',
  component: WorkflowAutomationRoute,
});

const adminDatabaseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin-database',
  component: AdminDatabaseRoute,
});

// Create route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  dashboardRoute,
  tasksRoute,
  kanbanRoute,
  scheduleRoute,
  remindersRoute,
  messagingRoute,
  clientsRoute,
  appointmentsRoute,
  invoicesRoute,
  aiAssistantRoute,
  workflowAutomationRoute,
  adminDatabaseRoute,
]);

// Create router instance
const router = createRouter({ 
  routeTree,
  defaultPreload: 'intent',
});

// Register router for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// PWA Install Prompt Component
function PWAInstallPrompt() {
  useEffect(() => {
    let deferredPrompt: any;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      deferredPrompt = e;
      
      // Show custom install prompt after a delay
      setTimeout(() => {
        if (deferredPrompt && !localStorage.getItem('pwa-install-dismissed')) {
          const shouldInstall = confirm('Install WorkflowHub as an app for a better experience?');
          if (shouldInstall) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult: any) => {
              if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt');
              }
              deferredPrompt = null;
            });
          } else {
            localStorage.setItem('pwa-install-dismissed', 'true');
          }
        }
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  return null;
}

// Main App component
export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <RouterProvider router={router} />
      <PWAInstallPrompt />
      <ServiceWorkerUpdatePrompt />
      <Toaster />
    </ThemeProvider>
  );
}
