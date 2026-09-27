import { useState } from "react";
import { NavLink } from "react-router-dom";

import { FaUtensils, FaSignOutAlt, FaBars, FaTimes } from "react-icons/fa";

import { useAuth } from "../Context";

function Navbar() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-1.5 rounded-sm text-sm font-medium transition-colors ${
      isActive
        ? "bg-green-800 text-stone-50"
        : "text-green-900 hover:text-stone-900"
    }`;

  const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block w-full px-4 py-3 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? "bg-green-800 text-stone-50"
        : "text-green-900 hover:bg-stone-200"
    }`;

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    closeMenu();
    logout();
  };

  return (
    <nav className="relative z-50 w-full bg-stone-100 border-b border-stone-300">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3">
        <NavLink to="/" onClick={closeMenu} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-sm flex items-center justify-center bg-green-800">
            <FaUtensils size={14} className="text-stone-50" />
          </div>

          <h1
            className="text-lg font-bold text-stone-900"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            FitMeals
          </h1>
        </NavLink>
        <div className="hidden md:flex items-center gap-1">
          {user && user.role == "Admin" && (
            <NavLink to="/administration" className={linkClass}>
              Administracija
            </NavLink>
          )}
          <NavLink to="/" className={linkClass}>
            Početna
          </NavLink>
          <NavLink to="/meals" className={linkClass}>
            Obroci
          </NavLink>
          <NavLink to="/shopping-cart" className={linkClass}>
            Košarica
          </NavLink>

          {user ? (
            <button
              onClick={logout}
              className="cursor-pointer flex items-center gap-1 px-3 py-1.5 rounded-sm text-sm font-medium transition-colors bg-orange-700 text-stone-50 hover:bg-orange-800"
            >
              <FaSignOutAlt size={13} />
              Odjava
            </button>
          ) : (
            <NavLink to="/login" className={linkClass}>
              Prijava
            </NavLink>
          )}
        </div>
        <button
          type="button"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-md text-green-900 hover:bg-stone-200 transition-colors cursor-pointer"
          aria-label={isMenuOpen ? "Zatvori izbornik" : "Otvori izbornik"}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>
      </div>
      {isMenuOpen && (
        <div className="md:hidden border-t border-stone-300 bg-stone-100 px-4 py-3">
          <div className="flex flex-col gap-1">
            <NavLink to="/" className={mobileLinkClass} onClick={closeMenu}>
              Početna
            </NavLink>
            <NavLink
              to="/meals"
              className={mobileLinkClass}
              onClick={closeMenu}
            >
              Obroci
            </NavLink>
            <NavLink
              to="/shopping-cart"
              className={mobileLinkClass}
              onClick={closeMenu}
            >
              Košarica
            </NavLink>
            <NavLink
              to="/my-profile"
              className={mobileLinkClass}
              onClick={closeMenu}
            >
              Profil
            </NavLink>
            {user ? (
              <button
                onClick={handleLogout}
                className="w-full cursor-pointer flex items-center gap-2 px-4 py-3 mt-1 rounded-md text-sm font-medium bg-orange-700 text-stone-50 hover:bg-orange-800 transition-colors"
              >
                <FaSignOutAlt size={13} />
                Odjava
              </button>
            ) : (
              <NavLink
                to="/login"
                className={mobileLinkClass}
                onClick={closeMenu}
              >
                Prijava
              </NavLink>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
