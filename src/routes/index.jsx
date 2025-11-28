import { createBrowserRouter } from 'react-router-dom';
import { MainRoutes, NotFoundRoute } from './MainRoutes.jsx';

const router = createBrowserRouter([
  MainRoutes,
  NotFoundRoute, 
]);

export default router;