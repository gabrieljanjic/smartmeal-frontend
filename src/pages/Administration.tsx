import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import { FaUserShield, FaUserMinus, FaTrash } from "react-icons/fa";
import Loading from "../components/Loading";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

const GRID =
  "md:grid md:grid-cols-[2fr_3fr_1fr_1fr_80px] md:items-center md:gap-4";

const Administration = () => {
  const queryClient = useQueryClient();
  const [pendingId, setPendingId] = useState<number | null>(null);

  const {
    data: users = [],
    isLoading,
    isError,
  } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await axios.get<User[]>(
        `${import.meta.env.VITE_API_URL}/api/user`,
        { withCredentials: true },
      );
      return response.data;
    },
  });

  const handleToggleAdmin = async (user: User) => {
    if (pendingId !== null) return;
    const isAdmin = user.role === "Admin";
    setPendingId(user.id);

    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/user/${user.id}/toggle-admin`,
        null,
        { withCredentials: true },
      );
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(
        isAdmin
          ? `${user.name} više nije admin.`
          : `${user.name} je sada admin.`,
      );
    } catch (error) {
      toast.error(
        axios.isAxiosError(error) && typeof error.response?.data === "string"
          ? error.response.data
          : "Greška.",
      );
    } finally {
      setPendingId(null);
    }
  };

  const handleDelete = async (user: User) => {
    if (pendingId !== null) return;
    setPendingId(user.id);

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/user/${user.id}`,
        { withCredentials: true },
      );
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Korisnik obrisan.");
    } catch (error) {
      toast.error(
        axios.isAxiosError(error) && typeof error.response?.data === "string"
          ? error.response.data
          : "Greška.",
      );
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">
        Administracija
      </h1>

      {isLoading && (
        <div className="w-full flex justify-center mt-12">
          <Loading />
        </div>
      )}

      {isError && <p className="text-sm text-red-500">Greška.</p>}

      {!isLoading && !isError && (
        <div className="border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div
            className={`hidden ${GRID} bg-gray-100 text-gray-700 text-sm font-medium px-4 py-3`}
          >
            <div>Ime</div>
            <div>Email</div>
            <div>Uloga</div>
            <div>Registriran</div>
            <div className="text-right">Akcije</div>
          </div>

          {users.map((u) => {
            const isAdmin = u.role === "Admin";
            return (
              <div
                key={u.id}
                className={`relative ${GRID} flex flex-col gap-1 border-t border-gray-200 px-4 py-3 text-sm first:border-t-0 md:first:border-t`}
              >
                <div className="font-medium text-gray-900 truncate pr-24 md:pr-0">
                  {u.name}
                </div>
                <div className="text-gray-600 break-all">{u.email}</div>
                <div className="text-gray-600">{u.role}</div>
                <div className="text-gray-500 md:text-gray-600 whitespace-nowrap">
                  {new Date(u.createdAt).toLocaleDateString("hr-HR")}
                </div>
                <div className="absolute top-3 right-4 md:static flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleAdmin(u)}
                    disabled={pendingId !== null}
                    title={isAdmin ? "Makni admina" : "Postavi admina"}
                    aria-label={isAdmin ? "Makni admina" : "Postavi admina"}
                    className={`cursor-pointer flex items-center justify-center w-9 h-9 rounded-md text-stone-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      isAdmin
                        ? "bg-stone-600 hover:bg-stone-700"
                        : "bg-green-800 hover:bg-green-900"
                    }`}
                  >
                    {isAdmin ? (
                      <FaUserMinus size={16} />
                    ) : (
                      <FaUserShield size={16} />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(u)}
                    disabled={pendingId !== null}
                    title="Obriši"
                    aria-label="Obriši"
                    className="cursor-pointer flex items-center justify-center w-9 h-9 rounded-md bg-orange-700 text-stone-50 hover:bg-orange-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>
              </div>
            );
          })}

          {users.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-gray-500">
              Nema korisnika.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Administration;
