export type User = {
  name: string;
  role: string;
};

export type AuthContextType = {
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;

  user: User | null;

  loading: boolean;

  username: string | null;
  role: string | null;

  refreshAuth: () => Promise<void>;

  logout: () => Promise<void>;
};
