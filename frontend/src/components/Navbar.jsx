import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        <h1 className="text-2xl font-bold text-[#0F766E]">
          Inzira Works
        </h1>

        <div className="space-x-6 hidden md:flex">

          <Link to="/" className="hover:text-[#0F766E]">
            Home
          </Link>

          <Link
            to="/providers"
            className="hover:text-[#0F766E]"
          >
            Find Services
          </Link>

          <Link
            to="/login"
            className="hover:text-[#0F766E]"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="bg-[#0F766E] text-white px-5 py-2 rounded-lg"
          >
            Register
          </Link>

        </div>
      </div>
    </nav>
  );
}

export default Navbar;