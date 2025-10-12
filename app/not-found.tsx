import Link from "next/link";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-accent/20 via-primary/10 to-info/20 p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-full mb-6">
            <span className="text-5xl">404</span>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-3">
            Page Not Found
          </h1>
          <p className="text-lg text-muted-foreground mb-2">
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved.
          </p>
          <p className="text-sm text-muted-foreground/80">
            Don&apos;t worry, it happens to the best of us!
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/feed"
            className="block w-full px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
          >
            Go to Feed
          </Link>
          <Link
            href="/"
            className="block w-full px-6 py-3 bg-card border border-border text-foreground rounded-md hover:bg-accent/10 transition-colors font-medium"
          >
            Back to Home
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Need help?{" "}
            <Link href="/feed" className="text-primary hover:underline">
              Check out the feed
            </Link>{" "}
            or{" "}
            <Link href="/write" className="text-primary hover:underline">
              start writing
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
