import React from 'react';
import { RouterProvider, useRouter } from './context/RouterContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import TopProgressBar from './components/TopProgressBar';

// Pages
import HomePage from './pages/HomePage';
import ClientLoginPage from './pages/ClientLoginPage';
import CareersLoginPage from './pages/CareersLoginPage';
import ClientPortalPage from './pages/ClientPortalPage';
import DriverPortalPage from './pages/DriverPortalPage';
import QuotePage from './pages/QuotePage';
import ContactPage from './pages/ContactPage';
import CarriersPage from './pages/CarriersPage';
import CareersApplyPage from './pages/CareersApplyPage';
import AboutPage from './pages/AboutPage';
import LeadershipPage from './pages/LeadershipPage';
import ServicesPage from './pages/ServicesPage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminPortalPage from './pages/AdminPortalPage';

function AppContent() {
  const { path } = useRouter();
  const { user, role, isAdmin, loading } = useAuth();

  // Route matching logic
  const renderRoute = () => {
    // 0. Master Admin Access
    if (path === '/login/admin') {
      return <AdminLoginPage />;
    }
    if (path === '/portal/admin' || path === '/admin') {
      if (!loading && !isAdmin) {
        return <AdminLoginPage />;
      }
      return <AdminPortalPage />;
    }

    // 1. Core Auth Pages
    if (path === '/login/client') {
      return <ClientLoginPage />;
    }
    if (path === '/login/careers') {
      return <CareersLoginPage />;
    }

    // 2. Operational Self-Service Portals
    if (path === '/portal/client') {
      if (!loading && !user) {
        return <ClientLoginPage />;
      }
      return <ClientPortalPage />;
    }
    if (path === '/portal/driver') {
      if (!loading && !user) {
        return <CareersLoginPage />;
      }
      return <DriverPortalPage />;
    }

    // 3. Public Features & Forms
    if (path === '/quote') {
      return <QuotePage />;
    }
    if (path === '/contact') {
      return <ContactPage />;
    }
    if (path === '/carriers' || path === '/careers') {
      return <CarriersPage />;
    }
    if (path === '/careers/apply') {
      return <CareersApplyPage />;
    }

    // 4. About & Governance
    if (path === '/about') {
      return <AboutPage />;
    }
    if (path === '/about/leadership') {
      return <LeadershipPage />;
    }

    // 5. Services
    if (path === '/services' || path === '/services/services') {
      return <ServicesPage />;
    }
    if (path.startsWith('/services/')) {
      const slug = path.replace('/services/', '').split('/')[0];
      return <ServiceDetailPage slug={slug} />;
    }

    // 6. Legal notices
    if (path === '/privacy' || path === '/terms') {
      return (
        <div className="max-w-4xl mx-auto py-24 px-6">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-6">
            {path === '/privacy' ? 'Privacy Policy' : 'Terms of Service'}
          </h1>
          <p className="text-slate-600 leading-relaxed text-sm mb-4">
            Gallant Line Haul Corp is committed to protecting the proprietary cargo data, GPS telemetry, customs records, and commercial credentials of our shippers and carrier partners.
          </p>
          <p className="text-slate-600 leading-relaxed text-sm">
            All electronic transmission of Bills of Lading, PARS/PAPRS manifests, and settlement documents complies with Canadian PIPEDA and applicable US cross-border transport security statutes.
          </p>
        </div>
      );
    }

    // Default to Homepage
    return <HomePage />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-teal-500 selection:text-white transition-colors duration-300">
      <TopProgressBar />
      <Navbar />
      <main key={path} className="flex-1 section-fade">
        {renderRoute()}
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RouterProvider>
          <AppContent />
        </RouterProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
