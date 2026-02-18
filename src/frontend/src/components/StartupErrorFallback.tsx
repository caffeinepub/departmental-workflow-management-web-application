import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { resetAndReload } from '../utils/pwaReset';

interface StartupErrorFallbackProps {
  error: Error;
  resetError?: () => void;
}

export default function StartupErrorFallback({ error, resetError }: StartupErrorFallbackProps) {
  const handleReload = () => {
    window.location.reload();
  };

  const handleResetAndReload = async () => {
    await resetAndReload();
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 p-4">
      <div className="w-full max-w-md">
        <div className="rounded-lg border border-destructive/20 bg-card p-6 shadow-lg backdrop-blur-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Application Error</h1>
              <p className="text-sm text-muted-foreground">WorkflowHub failed to start</p>
            </div>
          </div>

          <div className="mb-6 rounded-md bg-muted/50 p-4">
            <p className="mb-2 text-sm font-medium text-foreground">Error Details:</p>
            <p className="text-xs text-muted-foreground font-mono break-words">
              {error.message || 'Unknown error occurred'}
            </p>
            {error.stack && (
              <details className="mt-2">
                <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                  View stack trace
                </summary>
                <pre className="mt-2 max-h-40 overflow-auto text-xs text-muted-foreground">
                  {error.stack}
                </pre>
              </details>
            )}
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleReload} 
              className="w-full"
              variant="default"
            >
              Reload Page
            </Button>
            <Button 
              onClick={handleResetAndReload} 
              className="w-full"
              variant="outline"
            >
              Reset and Reload
            </Button>
            {resetError && (
              <Button 
                onClick={resetError} 
                className="w-full"
                variant="ghost"
              >
                Try Again
              </Button>
            )}
          </div>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            If the problem persists, please clear your browser cache and cookies.
          </p>
        </div>
      </div>
    </div>
  );
}
