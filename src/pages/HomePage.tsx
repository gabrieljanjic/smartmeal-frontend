import { NavLink } from "react-router-dom";
import {
  FiArrowRight,
  FiShoppingCart,
  FiBarChart2,
  FiCalendar,
  FiCheck,
} from "react-icons/fi";

const HomePage = () => {
  return (
    <section className="w-full h-full flex items-center justify-center bg-stone-100 px-8 py-12">
      <div className="w-full max-w-6xl  flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="flex flex-col justify-center px-4 sm:px-8 lg:px-4 py-8">
            <div className="inline-flex items-center gap-2 w-fit rounded-full bg-white border border-stone-200 px-4 py-2 text-sm text-stone-600 shadow-sm mb-6">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Pametnije planiranje. Bolje cijene.
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-stone-900 leading-[1.05]">
              Planiraj obroke.
              <br />
              <span className="text-green-700">Usporedi cijene.</span>
            </h1>
            <p className="mt-6 text-base sm:text-lg text-stone-600 leading-relaxed max-w-xl">
              Organiziraj svoje obroke, prati kalorije i makronutrijente te
              usporedi cijene proizvoda u različitim trgovačkim lancima. Sve na
              jednom mjestu.
            </p>
            <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-white border border-stone-200 shrink-0">
                  <FiBarChart2 className="w-4 h-4 text-green-700" />
                </div>
                <span className="text-sm text-stone-700">Usporedba cijena</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-white border border-stone-200 shrink-0">
                  <FiCalendar className="w-4 h-4 text-green-700" />
                </div>
                <span className="text-sm text-stone-700">
                  Planiranje obroka
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-white border border-stone-200 shrink-0">
                  <FiCheck className="w-4 h-4 text-green-700" />
                </div>
                <span className="text-sm text-stone-700">
                  Praćenje kalorija
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-white border border-stone-200 shrink-0">
                  <FiShoppingCart className="w-4 h-4 text-green-700" />
                </div>

                <span className="text-sm text-stone-700">Shopping lista</span>
              </div>
            </div>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <NavLink
                to="/shopping-cart"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-700 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-green-800 transition-colors"
              >
                Istraži proizvode
                <FiArrowRight className="w-4 h-4" />
              </NavLink>

              <NavLink
                to="/meals"
                className="inline-flex items-center justify-center rounded-lg border border-stone-300 bg-white px-6 py-3 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors"
              >
                Planiraj obrok
              </NavLink>
            </div>
          </div>
          <div className="relative px-4 sm:px-8 lg:px-0">
            <div className="relative overflow-hidden rounded-3xl shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=85"
                alt="Fresh groceries and vegetables"
                className="w-full h-[320px] sm:h-[420px] lg:h-[560px] object-cover hidden md:flex"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5">
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 sm:p-5 shadow-lg">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs text-stone-500 uppercase tracking-wide">
                        Tvoja košarica
                      </p>

                      <p className="mt-1 text-lg font-semibold text-stone-900">
                        Usporedi prije kupnje
                      </p>

                      <p className="mt-1 text-sm text-stone-500">
                        Pronađi povoljniju opciju za svoje proizvode.
                      </p>
                    </div>

                    <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-green-100 shrink-0">
                      <FiShoppingCart className="w-5 h-5 text-green-700" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -left-2 sm:-left-6 lg:-left-8 top-8 sm:top-12 bg-white rounded-2xl shadow-lg border border-stone-100 p-4 w-44 sm:w-48 hidden md:inline">
              <p className="text-xs text-stone-500">Dnevni unos</p>
              <p className="mt-1 text-2xl font-bold text-stone-900">
                2,140
                <span className="text-sm font-medium text-stone-500 ml-1">
                  kcal
                </span>
              </p>
              <div className="mt-3 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-stone-500">Protein</span>
                  <span className="font-medium text-stone-700">112g</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-stone-500">Ugljikohidrati</span>
                  <span className="font-medium text-stone-700">245g</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-stone-500">Masti</span>
                  <span className="font-medium text-stone-700">68g</span>
                </div>
              </div>
            </div>
            <div className="absolute -right-2 sm:-right-5 lg:-right-6 bottom-16 sm:bottom-20 bg-white rounded-2xl shadow-lg border border-stone-100 p-4 w-44 sm:w-48 hidden md:inline">
              <p className="text-xs text-stone-500">Najpovoljnija košarica</p>
              <div className="flex items-end justify-between mt-1">
                <p className="text-2xl font-bold text-green-700">24.80 €</p>
                <span className="text-xs text-green-700 font-medium mb-1">
                  -18%
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-xs text-stone-500">Najbolja cijena</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomePage;
