import { createBrowserRouter } from "react-router-dom";
import { MainRoutes, AuthRoutes, NotFoundRoute } from "./MainRoutes.jsx";

const router = createBrowserRouter([MainRoutes, AuthRoutes, NotFoundRoute]);

export default router;
