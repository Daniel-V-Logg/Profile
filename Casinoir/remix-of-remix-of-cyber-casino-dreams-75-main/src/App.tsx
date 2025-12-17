
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import Games from "./pages/Games";
import Baccarat from "./pages/Baccarat";
import Blackjack from "./pages/Blackjack";
import Plinko from "./pages/Plinko";
import Roulette from "./pages/Roulette";
import Slot from "./pages/Slot";
import Promotions from "./pages/Promotions";
import Support from "./pages/Support";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/games" element={<Games />} />
            <Route path="/games/baccarat" element={<Baccarat />} />
            <Route path="/games/blackjack" element={<Blackjack />} />
            <Route path="/games/plinko" element={<Plinko />} />
            <Route path="/games/roulette" element={<Roulette />} />
            <Route path="/games/slot" element={<Slot />} />
            <Route path="/promotions" element={<Promotions />} />
            <Route path="/support" element={<Support />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
