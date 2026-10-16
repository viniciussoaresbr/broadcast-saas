import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute, PublicOnlyRoute } from './components/RouteGuards';
import AppLayout from './layouts/AppLayout';
import BroadcastPage from './pages/BroadcastPage';
import ConnectionPage from './pages/ConnectionPage';
import ConnectionsPage from './pages/ConnectionsPage';
import ContactsPage from './pages/ContactsPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import RegisterPage from './pages/RegisterPage';

const App = () => (
  <Routes>
    <Route element={<PublicOnlyRoute />}>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
    </Route>

    <Route element={<ProtectedRoute />}>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/connections" replace />} />
        <Route path="/connections" element={<ConnectionsPage />} />
        <Route path="/connections/:connectionId" element={<ConnectionPage />}>
          <Route index element={<Navigate to="contacts" replace />} />
          <Route path="contacts" element={<ContactsPage />} />
          <Route path="messages" element={<BroadcastPage />} />
        </Route>
      </Route>
    </Route>

    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);

export default App;
