import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  const navLinkClass = ({ isActive }) =>
    isActive
      ? "px-4 py-2 rounded-lg bg-orange-100 text-orange-600 font-medium"
      : "px-4 py-2 text-gray-700 hover:text-orange-600";

  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <div className="text-xl font-bold">
            Health<span className="text-orange-500">Sync</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-2">
            <NavLink to="/" className={navLinkClass}>Home</NavLink>
            <NavLink to="/about" className={navLinkClass}>About</NavLink>
            <NavLink to="/login" className={navLinkClass}>Login</NavLink>

            <NavLink
              to="/register"
              className="ml-2 bg-orange-500 text-white px-5 py-2 rounded-xl hover:bg-orange-600 transition"
            >
              Sign Up
            </NavLink>
          </div>

          {/* Mobile Button */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {open ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-white border-t">
          <div className="flex flex-col p-4 space-y-2">
            <NavLink onClick={() => setOpen(false)} to="/" className={navLinkClass}>Home</NavLink>
            <NavLink onClick={() => setOpen(false)} to="/about" className={navLinkClass}>About</NavLink>
            <NavLink onClick={() => setOpen(false)} to="/login" className={navLinkClass}>Login</NavLink>

            <NavLink
              onClick={() => setOpen(false)}
              to="/register"
              className="bg-orange-500 text-white text-center py-2 rounded-xl"
            >
              Sign Up
            </NavLink>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
