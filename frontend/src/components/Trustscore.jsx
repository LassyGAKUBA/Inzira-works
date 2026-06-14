function TrustScore({ score }) {
  return (
    <div>

      <h4 className="font-semibold mb-2">
        Trust Score
      </h4>

      <div className="w-full bg-gray-200 rounded-full h-3">

        <div
          className="bg-[#F59E0B] h-3 rounded-full"
          style={{
            width: `${score * 10}%`,
          }}
        ></div>

      </div>

      <p className="mt-2 text-sm">
        {score}/10
      </p>

    </div>
  );
}

export default TrustScore;