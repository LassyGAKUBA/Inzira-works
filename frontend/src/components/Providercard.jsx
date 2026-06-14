import TrustScore from "./TrustScore";

function ProviderCard() {
  return (
    <div className="bg-white rounded-xl shadow p-5">

      <img
        src="https://via.placeholder.com/300"
        alt=""
        className="rounded-lg mb-4"
      />

      <h3 className="font-bold text-lg">
        Aline Mukamana
      </h3>

      <p className="text-gray-500">
        Tailor • Gasabo
      </p>

      <div className="mt-4">
        <TrustScore score={8.5} />
      </div>

      <button className="mt-4 bg-[#0F766E] text-white w-full py-2 rounded-lg">
        View Profile
      </button>

    </div>
  );
}

export default ProviderCard;