import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../Context";
import Loading from "./Loading";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-stone-100">
        <Loading />
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
