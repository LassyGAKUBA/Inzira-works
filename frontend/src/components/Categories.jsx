import {
  FaCut,
  FaPaintBrush,
  FaTshirt,
  FaUtensils,
  FaHome
} from "react-icons/fa";

function Categories() {
  const categories = [
    "Tailoring",
    "Hairdressing",
    "Handcrafts",
    "Beauty",
    "Catering",
    "Home Services"
  ];

  return (
    <section className="py-20 bg-gray-50">

      <div className="max-w-7xl mx-auto px-6">

        <h2 className="text-3xl font-bold text-center mb-12">
          Browse Categories
        </h2>

        <div className="grid md:grid-cols-3 gap-6">

          {categories.map((category, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-xl shadow hover:shadow-lg transition"
            >
              <h3 className="font-semibold text-lg">
                {category}
              </h3>
            </div>
          ))}

        </div>

      </div>

    </section>
  );
}

export default Categories;