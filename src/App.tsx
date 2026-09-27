import Navbar from "./components/Navbar";
import { Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import MealsPage from "./pages/MealsPage";
import ShoppingCartPage from "./pages/ShoppingCartPage";
import { Toaster } from "react-hot-toast";
import ProductSpecs from "./components/ProductSpecs";
import NotFoundPage from "./pages/NotFoundPage";
import { useAuth } from "./Context";
import Administration from "./pages/Administration";

function App() {
  const { user } = useAuth();
  return (
    <div className="h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 min-h-0">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/product/:ean" element={<ProductSpecs />} />
            <Route path="/shopping-cart" element={<ShoppingCartPage />} />
            <Route path="/meals" element={<MealsPage />} />
            {user && user.role == "Admin" && (
              <Route path="/administration" element={<Administration />} />
            )}
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;
