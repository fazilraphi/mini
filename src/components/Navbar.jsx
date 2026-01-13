import React, { useState } from "react";
import { NavLink } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-yellow-200 h-14 fixed top-0 left-0 w-full z-50 flex items-center px-6">
      {/* Logo */}
      <div className="font-semibold">LogoHere</div>

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center w-full">
        {/* Left spacer pushes menu right */}
        <div className="flex-1"></div>

        {/* Nav Links */}
        <ul className="flex gap-6">
          <li>
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? "font-semibold text-blue-600" : "text-gray-800"
              }
            >
              Home
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                isActive ? "font-semibold text-blue-600" : "text-gray-800"
              }
            >
              About
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/login"
              className={({ isActive }) =>
                isActive ? "font-semibold text-blue-600" : "text-gray-800"
              }
            >
              Login
            </NavLink>
          </li>
        </ul>

        {/* Right spacer */}
        <div className="flex-1"></div>

        {/* GitHub Button */}
        <button
          className="border-2 rounded-xl px-3 py-1 bg-orange-300 border-orange-100"
          onClick={() => window.open("https://github.com/fazilraphi", "_blank")}
        >
          GitHub
        </button>
      </div>

      {/* Hamburger (Mobile) */}
      <button
        className="ml-auto md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        ☰
      </button>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-14 left-0 w-full bg-yellow-200 md:hidden">
          <ul className="flex flex-col gap-4 p-6">
            <li>
              <NavLink to="/" onClick={() => setIsOpen(false)}>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/about" onClick={() => setIsOpen(false)}>
                About
              </NavLink>
            </li>
            <li>
              <NavLink to="/login" onClick={() => setIsOpen(false)}>
                Login
              </NavLink>
            </li>

            <button
              className="mt-4 border-2 rounded-xl px-3 py-2 bg-orange-300 border-orange-100"
              onClick={() =>
                window.open("https://github.com/fazilraphi", "_blank")
              }
            >
              GitHub
            </button>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
