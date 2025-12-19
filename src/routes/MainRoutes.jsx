import HomePage from "@/features/dashboard/HomePage";
import CategoryPage from "@/features/categories/CategoryPage";
import SupplierPage from "@/features/suppliers/SupplierPage";
import ProductPage from "@/features/products/ProductPage";
import WarehousePage from "@/features/warehouses/WarehousePage";
import UserPage from "@/features/user/UserPage";
import StockPage from "@/features/stocks/StockPage";
import ImportPage from "@/features/imports/ImportPage";
import ExportPage from "@/features/exports/ExportPage";
import NotFound from "@/features/other/NotFound";
import LoginPage from "@/features/auth/LoginPage";
import RegisterPage from "@/features/auth/RegisterPage";
import MainLayout from "@/components/layout/MainLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

const MainRoutes = {
  path: "/",
  element: (
    <ProtectedRoute>
      <MainLayout />
    </ProtectedRoute>
  ),
  children: [
    {
      index: true,
      element: <HomePage />,
    },
    {
      path: "categories",
      element: <CategoryPage />,
    },
    {
      path: "suppliers",
      element: <SupplierPage />,
    },
    {
      path: "products",
      element: <ProductPage />,
    },
    {
      path: "warehouses",
      element: <WarehousePage />,
    },
    {
      path: "users",
      element: <UserPage />,
    },
    {
      path: "stocks",
      element: <StockPage />,
    },
    {
      path: "imports",
      element: (
        <ProtectedRoute permission="canViewImports">
          <ImportPage />
        </ProtectedRoute>
      ),
    },
    {
      path: "exports",
      element: (
        <ProtectedRoute permission="canViewExports">
          <ExportPage />
        </ProtectedRoute>
      ),
    },
  ],
};

const AuthRoutes = {
  path: "/",
  children: [
    {
      path: "login",
      element: <LoginPage />,
    },
    {
      path: "register",
      element: <RegisterPage />,
    },
  ],
};

const NotFoundRoute = {
  path: "*",
  element: <NotFound />,
};

export { MainRoutes, AuthRoutes, NotFoundRoute };
