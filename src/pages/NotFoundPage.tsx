import { NavLink } from "react-router-dom";

import { FiHome, FiSearch } from "react-icons/fi";

const NotFoundPage = () => {
  return (
    <section className="w-full h-full flex items-center justify-center px-4 sm:px-6 bg-stone-100">
      <div className="w-full max-w-4xl h-full max-h-[850px] flex items-center justify-center">
        <div className="w-full flex items-center">
          <div className="flex flex-col justify-center px-4 sm:px-8 lg:px-4 py-8">
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold tracking-tight text-stone-900 leading-none">
              404
            </h1>
            <h2 className="mt-5 text-3xl sm:text-4xl font-bold tracking-tight text-stone-900">
              Ups, ova stranica
              <br />
              <span className="text-green-700">ne postoji.</span>
            </h2>
            <p className="mt-6 text-base sm:text-lg text-stone-600 leading-relaxed max-w-xl">
              Izgleda da si pokušao otvoriti stranicu koja ne postoji ili je
              premještena. Bez brige — možeš se vratiti na početnu i nastaviti
              planirati svoje obroke.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <NavLink
                to="/"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-700 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-green-800 transition-colors"
              >
                <FiHome className="w-4 h-4" />
                Povratak na početnu
              </NavLink>
              <NavLink
                to="/shopping-cart"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-stone-300 bg-white px-6 py-3 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors"
              >
                <FiSearch className="w-4 h-4" />
                Istraži proizvode
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NotFoundPage;
