import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import EnhancedCatalog from "./pages/EnhancedCatalog";
import EnhancedMovieDetail from "./pages/EnhancedMovieDetail";
import Auth from "./pages/Auth";
import ManualReview from "./pages/ManualReview";
import LiveReaction from "./pages/LiveReaction";
import MyCollections from "./pages/MyCollections";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/catalog" element={<EnhancedCatalog />} />
          <Route path="/movie/:id" element={<EnhancedMovieDetail />} />
          <Route path="/review/:id" element={<ManualReview />} />
          <Route path="/live-reaction/:id" element={<LiveReaction />} />
          <Route path="/my-collections" element={<MyCollections />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/settings" element={<Profile />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
