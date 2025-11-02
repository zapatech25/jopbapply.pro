import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Pricing from "@/pages/pricing";
import Login from "@/pages/login";
import Register from "@/pages/register";
import ForgotPassword from "@/pages/forgot-password";
import ResetPassword from "@/pages/reset-password";
import Profile from "@/pages/profile";
import Dashboard from "@/pages/dashboard";
import Admin from "@/pages/admin";
import Resources from "@/pages/resources";
import Blog from "@/pages/blog";
import Notifications from "@/pages/notifications";
import NotificationPreferences from "@/pages/notification-preferences";
import CVOptimizer from "@/pages/cv-optimizer";
import CoverLetterGenerator from "@/pages/cover-letter-generator";
import AIHistory from "@/pages/ai-history";
import CVUploadPage from "@/pages/cv-upload";
import JobPreferencesPage from "@/pages/job-preferences";
import SubscriptionPage from "@/pages/subscription";
import BillingHistoryPage from "@/pages/billing-history";
import AdminFinancialDashboard from "@/pages/admin-financial-dashboard";
import AdminPromoCodesPage from "@/pages/admin-promo-codes";
import TermsPage from "@/pages/terms";
import PrivacyPage from "@/pages/privacy";
import AboutPage from "@/pages/about";
import Footer from "@/components/Footer";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/resources" component={Resources} />
      <Route path="/resources/:slug" component={Resources} />
      <Route path="/blog" component={Blog} />
      <Route path="/blog/:slug" component={Blog} />
      <Route path="/terms" component={TermsPage} />
      <Route path="/privacy" component={PrivacyPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/profile" component={Profile} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/dashboard/notifications" component={Notifications} />
      <Route path="/dashboard/notification-preferences" component={NotificationPreferences} />
      <Route path="/dashboard/cv-optimizer" component={CVOptimizer} />
      <Route path="/dashboard/cover-letter-generator" component={CoverLetterGenerator} />
      <Route path="/dashboard/ai-history" component={AIHistory} />
      <Route path="/dashboard/cv-upload" component={CVUploadPage} />
      <Route path="/dashboard/job-preferences" component={JobPreferencesPage} />
      <Route path="/dashboard/subscription" component={SubscriptionPage} />
      <Route path="/dashboard/billing" component={BillingHistoryPage} />
      <Route path="/admin" component={Admin} />
      <Route path="/admin/financial-dashboard" component={AdminFinancialDashboard} />
      <Route path="/admin/promo-codes" component={AdminPromoCodesPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="flex flex-col min-h-screen">
          <div className="flex-1">
            <Router />
          </div>
          <Footer />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
