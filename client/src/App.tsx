import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import LandingPage from "@/pages/landing";
import PublicProfile from "@/pages/public-profile";
import ProfilePage from "@/pages/dashboard/profile";
import LinksPage from "@/pages/dashboard/links";
import NFCPage from "@/pages/dashboard/nfc";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={LandingPage} />
      <Route path="/p/:slug" component={PublicProfile} />

      {/* Dashboard Routes (Auth Disabled for Testing) */}
      <Route path="/dashboard" component={ProfilePage} />
      <Route path="/dashboard/links" component={LinksPage} />
      <Route path="/dashboard/nfc" component={NFCPage} />

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
