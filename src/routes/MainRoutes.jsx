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
import CreateTicketPage from "@/features/imports/CreateTicketPage";
import ProductBatchPage from "@/features/batches/ProductBatchPage";
import InventoryAuditPage from "@/features/audits/InventoryAuditPage";
import DemandForecastPage from "@/features/forecasts/DemandForecastPage";
import AutoReorderPage from "@/features/reorder/AutoReorderPage";

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
    {
      path: "imports/create",
      element: (
        <ProtectedRoute permission="canViewImports">
          <CreateTicketPage />
        </ProtectedRoute>
      ),
    },
    {
      path: "batches",
      element: <ProductBatchPage />,
    },
    {
      path: "audits",
      element: <InventoryAuditPage />,
    },
    {
      path: "forecasts",
      element: <DemandForecastPage />,
    },
    {
      path: "auto-reorder",
      element: <AutoReorderPage />,
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
