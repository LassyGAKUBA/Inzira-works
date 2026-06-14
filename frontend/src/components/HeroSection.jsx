function HeroSection() {
  return (
    <section className="bg-white">

      <div className="max-w-7xl mx-auto px-6 py-24">

        <h1 className="text-5xl font-bold text-gray-900 leading-tight">
          Connecting Skilled Women
          <br />
          to New Opportunities
        </h1>

        <p className="mt-6 text-xl text-gray-600 max-w-2xl">
          Discover trusted local service providers
          across Kigali City and help women grow
          their businesses.
        </p>

        <div className="mt-8 flex gap-4">

          <button className="bg-[#0F766E] text-white px-6 py-3 rounded-lg">
            Find Services
          </button>

          <button className="border border-[#0F766E] text-[#0F766E] px-6 py-3 rounded-lg">
            Become a Provider
          </button>

        </div>

      </div>
    </section>
  );
}

export default HeroSection;