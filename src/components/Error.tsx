import { FiAlertTriangle } from "react-icons/fi";

type ErrorStateProps = {
  title?: string;
  message?: string;
};

const Error = ({
  title = "Nešto je pošlo po zlu",
  message = "Nismo uspjeli učitati podatke. Pokušaj ponovno kasnije.",
}: ErrorStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-6 text-center">
      <span className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100">
        <FiAlertTriangle className="w-6 h-6 text-red-600" />
      </span>

      <h2 className="text-lg font-semibold text-stone-900">{title}</h2>

      <p className="max-w-md text-sm text-stone-500">{message}</p>
    </div>
  );
};

export default Error;
