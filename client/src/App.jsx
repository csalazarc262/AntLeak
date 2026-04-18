import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard, { DashboardHome } from './pages/Dashboard';
import NewExpense from './pages/NewExpense';
import ExpenseHistory from './pages/ExpenseHistory';
import Profile from './pages/Profile';
import UserManagement from './pages/UserManagement';
import AdminSummary from './pages/AdminSummary';
import Tips from './pages/Tips';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardHome />} />
            <Route path="nuevo-gasto" element={<NewExpense />} />
            <Route path="historial" element={<ExpenseHistory />} />
            <Route path="perfil" element={<Profile />} />
            <Route path="consejos" element={<Tips />} />
            <Route
              path="usuarios"
              element={
                <ProtectedRoute adminOnly>
                  <UserManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="resumen"
              element={
                <ProtectedRoute adminOnly>
                  <AdminSummary />
                </ProtectedRoute>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
