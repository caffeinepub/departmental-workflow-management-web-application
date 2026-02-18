import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-primary/20 bg-card/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 transition-all duration-300 shadow-elegant">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center text-sm text-muted-foreground">
          © 2025. Built with <Heart className="inline h-4 w-4 text-secondary fill-secondary animate-elegant-pulse" /> using{' '}
          <a
            href="https://caffeine.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent hover:from-accent hover:to-primary transition-all duration-300"
          >
            caffeine.ai
          </a>
        </div>
      </div>
    </footer>
  );
}

