import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

import LandingPage from "@/pages/landing";
import PublicProfile from "@/pages/public-profile";
import ProfilePage from "@/pages/dashboard/profile";
import LinksPage from "@/pages/dashboard/links";
import NFCPage from "@/pages/dashboard/nfc";
import NotFound from "@/pages/not-found";

// Protected Route Wrapper
function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return <div className="h-screen w-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (!user) {
    // Redirect to landing if not logged in
    // Note: In a real app we might redirect to /api/login or show a login modal
    setLocation("/");
    return null;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={LandingPage} />
      <Route path="/p/:slug" component={PublicProfile} />

      {/* Protected Dashboard Routes */}
      <Route path="/dashboard">
        <ProtectedRoute component={ProfilePage} />
      </Route>
      <Route path="/dashboard/links">
        <ProtectedRoute component={LinksPage} />
      </Route>
      <Route path="/dashboard/nfc">
        <ProtectedRoute component={NFCPage} />
      </Route>

      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
