import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckSquare, Calendar, Bell, MessageSquare, Users } from 'lucide-react';

export default function LoginPage() {
  const { login, loginStatus } = useInternetIdentity();

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: any) {
      console.error('Login error:', error);
    }
  };

  const isLoggingIn = loginStatus === 'logging-in';

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 relative overflow-hidden">
      {/* Decorative circles with glassmorphism */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float-delayed" />
      <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-accent/20 rounded-full blur-3xl animate-float-slow" />

      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-summer-lg glow-pulse">
              <span className="text-primary-foreground font-bold text-3xl">W</span>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              WorkflowHub
            </h1>
          </div>
          <p className="text-xl text-muted-foreground font-medium">
            Streamline your team's workflow with our comprehensive management platform
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-start">
          {/* Login Card */}
          <Card className="bg-card/60 backdrop-blur-xl border-primary/20 shadow-elegant-lg hover-glow">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-base">Sign in to access your dashboard</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleLogin}
                disabled={isLoggingIn}
                className="w-full h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground text-lg font-semibold shadow-glow-primary transition-all duration-300 hover:scale-105 hover:shadow-summer-glow"
              >
                {isLoggingIn ? 'Signing in...' : 'Sign In'}
              </Button>
            </CardContent>
          </Card>

          {/* Features */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-6">
              Key Features
            </h2>
            <Card className="bg-primary/15 backdrop-blur-md border-primary/30 shadow-elegant hover:shadow-elegant-lg transition-all duration-300 hover:scale-[1.02] hover:border-primary/50">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-glow-primary">
                    <CheckSquare className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-lg">Task Management</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>Organize and track tasks with priority levels and completion tracking</CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-secondary/15 backdrop-blur-md border-secondary/30 shadow-elegant hover:shadow-elegant-lg transition-all duration-300 hover:scale-[1.02] hover:border-secondary/50">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center shadow-glow-secondary">
                    <Calendar className="h-5 w-5 text-secondary-foreground" />
                  </div>
                  <CardTitle className="text-lg">Smart Scheduling</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>Calendar integration with conflict detection and participant management</CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-accent/15 backdrop-blur-md border-accent/30 shadow-elegant hover:shadow-elegant-lg transition-all duration-300 hover:scale-[1.02] hover:border-accent/50">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center shadow-glow-accent">
                    <Bell className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <CardTitle className="text-lg">Reminders & Notifications</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>Stay on top of deadlines with real-time notifications and reminders</CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-summer-seafoam/15 backdrop-blur-md border-summer-seafoam/30 shadow-elegant hover:shadow-elegant-lg transition-all duration-300 hover:scale-[1.02] hover:border-summer-seafoam/50">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-summer-seafoam to-summer-seafoam/80 flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-lg">Team Messaging</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>Collaborate with direct and group messaging capabilities</CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-summer-aqua/15 backdrop-blur-md border-summer-aqua/30 shadow-elegant hover:shadow-elegant-lg transition-all duration-300 hover:scale-[1.02] hover:border-summer-aqua/50">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-summer-aqua to-summer-aqua/80 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-lg">Client Management</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>Manage client contacts, intake forms, and appointments in one place</CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

