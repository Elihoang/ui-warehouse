
import HomePage from '@/features/dashboard/HomePage';
import NotFound from '@/features/other/NotFound';
import MainLayout from '@/components/layout/MainLayout';

const MainRoutes = {
  path: '/',
  element: <MainLayout />,
  children: [
    {
      index: true,
      element: <HomePage />,
    },
  ],
};
const NotFoundRoute = {
  path: '*',
  element: <NotFound />,
};

export { MainRoutes, NotFoundRoute };