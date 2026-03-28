import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense, ComponentType, useEffect } from "react";
import { HelmetProvider } from "react-helmet-async";
import { PermitProvider } from "./contexts/PermitContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { toast } from "sonner";

/**
 * Lazy-load with automatic retry on chunk load failure.
 */
function lazyWithRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  retries = 3
): React.LazyExoticComponent<T> {
  return lazy(() =>
    factory().catch((err) => {
      if (retries > 0) {
        return new Promise<{ default: T }>((resolve) =>
          setTimeout(() => resolve(lazyWithRetry(factory, retries - 1) as any), 1000)
        );
      }
      console.error('[LazyLoad] All retries failed, reloading page:', err);
      window.location.reload();
      return new Promise<{ default: T }>(() => {});
    })
  );
}

const Index = lazyWithRetry(() => import("./pages/Index"));
const Admin = lazyWithRetry(() => import("./pages/Admin"));
const Statistics = lazyWithRetry(() => import("./pages/Statistics"));
const NotFound = lazyWithRetry(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
  </div>
);

const App = () => {
  // Global unhandled promise rejection handler
  useEffect(() => {
    const handler = (event: PromiseRejectionEvent) => {
      console.error('[UnhandledRejection]', event.reason);
      toast.error('An unexpected error occurred. Please try again.');
    };
    window.addEventListener('unhandledrejection', handler);
    return () => window.removeEventListener('unhandledrejection', handler);
  }, []);

  // Network offline/online detection
  useEffect(() => {
    const handleOffline = () => toast.warning('You are offline. Some features may not work.');
    const handleOnline = () => toast.success('Back online.');
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <BrowserRouter>
            <PermitProvider>
              <LanguageProvider>
                <Toaster />
                <Sonner />
                <ErrorBoundary>
                  <Suspense fallback={<LoadingSpinner />}>
                    <Routes>
                      <Route path="/" element={<ErrorBoundary><Index /></ErrorBoundary>} />
                      <Route path="/admin" element={<ErrorBoundary><Admin /></ErrorBoundary>} />
                      <Route path="/statistics" element={<ErrorBoundary><Statistics /></ErrorBoundary>} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </ErrorBoundary>
              </LanguageProvider>
            </PermitProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;
