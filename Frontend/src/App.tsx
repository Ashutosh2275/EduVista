import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout, MinimalLayout, AdminLayout } from './components/layout';
import { ScrollToTop } from './components/routing/ScrollToTop';
import { PublicRoute, ProtectedRoute, AdminRoute } from './guards';
import {
  LandingPage,
  CollegesPage,
  CoursesPage,
  InsightsPage,
  CollegeDetailsPage,
  CourseDetailsPage,
  InsightArticlePage,
  CareerDetailsPage,
  CareersListPage,
  ComparePage,
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  DashboardPage,
  ProfilePage,
  SavedCollegesPage,
  SettingsPage,
  AdminDashboardPage,
  AdminSectionPage,
  AboutPage,
  ContactPage,
  FAQPage,
  NotFoundPage,
  UnauthorizedPage,
  RankingsPage,
  ScholarshipsPage,
  PressPage,
  HelpPage,
  GuidesPage,
  ApiPage,
  PartnersPage,
  PrivacyPage,
  TermsPage,
  CookiesPage,
  DisclaimerPage,
} from './pages';

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="colleges" element={<CollegesPage />} />
          <Route path="courses" element={<CoursesPage />} />
          <Route path="insights" element={<InsightsPage />} />
          <Route path="insights/:id" element={<InsightArticlePage />} />
          <Route path="college/:id" element={<CollegeDetailsPage />} />
          <Route path="course/:id" element={<CourseDetailsPage />} />
          <Route path="careers" element={<CareersListPage />} />
          <Route path="careers/:id" element={<CareerDetailsPage />} />
          <Route path="compare" element={<ComparePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="faq" element={<FAQPage />} />
          <Route path="rankings" element={<RankingsPage />} />
          <Route path="scholarships" element={<ScholarshipsPage />} />
          <Route path="press" element={<PressPage />} />
          <Route path="help" element={<HelpPage />} />
          <Route path="guides" element={<GuidesPage />} />
          <Route path="api" element={<ApiPage />} />
          <Route path="partners" element={<PartnersPage />} />
          <Route path="privacy" element={<PrivacyPage />} />
          <Route path="terms" element={<TermsPage />} />
          <Route path="cookies" element={<CookiesPage />} />
          <Route path="disclaimer" element={<DisclaimerPage />} />
        </Route>

        {/* Auth pages — redirect if already logged in */}
        <Route element={<PublicRoute />}>
          <Route element={<MinimalLayout />}>
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
          </Route>
        </Route>

        <Route element={<MinimalLayout />}>
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="reset-password" element={<ResetPasswordPage />} />
        </Route>

        <Route path="unauthorized" element={<UnauthorizedPage />} />
        <Route path="saved" element={<Navigate to="/wishlist" replace />} />

        {/* Protected user routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="wishlist" element={<SavedCollegesPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>

        {/* Admin-only routes */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="colleges" element={<AdminSectionPage title="Manage Colleges" description="View and manage college listings on the platform." type="colleges" />} />
            <Route path="courses" element={<AdminSectionPage title="Manage Courses" description="View and manage course catalog entries." type="courses" />} />
            <Route path="categories" element={<AdminSectionPage title="Categories" description="Organize colleges and courses by category." type="categories" />} />
            <Route path="enquiries" element={<AdminSectionPage title="Enquiries" description="Review student and partner enquiries." type="enquiries" />} />
            <Route path="users" element={<AdminSectionPage title="Users" description="Manage registered user accounts." type="users" />} />
            <Route path="settings" element={<AdminSectionPage title="Admin Settings" description="Configure platform settings and integrations." type="settings" />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
