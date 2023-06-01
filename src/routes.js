import { Navigate, useRoutes } from 'react-router-dom';
// layouts
import DashboardLayout from './layouts/dashboard';
import SimpleLayout from './layouts/simple';
//
import Team from './pages/Team';
import Template from './pages/Template';
import LoginPage from './pages/LoginPage';
import Document from './pages/Document';
import Dashboard from './pages/Dashboard';
import Create from './pages/Create';
// ----------------------------------------------------------------------

export default function Router() {
  const routes = useRoutes([
    {
      path: '/dashboard',
      element: <DashboardLayout />,
      children: [
        { element: <Navigate to="/dashboard/app" />, index: true },
        { path: 'app', element: <Dashboard /> },
        { path: 'Template', element: <Template /> },
        { path: 'Document', element: <Document /> },
        { path: 'Team', element: <Team /> },
        { path: 'Create', element: <Create /> },
      ],
    },
    {
      path: 'login',
      element: <LoginPage />,
    },
    {
      path: 'Create',
      element: <Create />,
    },
    {
      element: <SimpleLayout />,
      children: [
        { element: <Navigate to="/dashboard/app" />, index: true },
      ],
    },
  ]);

  return routes;
}
