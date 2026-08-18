import Link from 'next/link';
import { ShieldX } from 'lucide-react';

export const metadata = {
  title: 'Unauthorized · EllipMart',
};

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground gap-6 px-4">
      <div className="size-20 rounded-3xl bg-destructive/10 flex items-center justify-center">
        <ShieldX className="size-10 text-destructive" />
      </div>
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold font-serif">Access Denied</h1>
        <p className="text-sm text-muted-foreground max-w-sm">
          You do not have permission to view this page. Please log in with an account that has the required access level.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Link
          href="/auth/login"
          className="px-6 py-2.5 bg-foreground text-background text-sm font-bold rounded-full hover:opacity-80 transition-opacity"
        >
          Sign In
        </Link>
        <Link
          href="/"
          className="px-6 py-2.5 border border-border text-sm font-bold rounded-full hover:bg-muted/50 transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
