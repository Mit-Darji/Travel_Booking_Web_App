import React, { useState } from 'react';

const FlightMode = () => {
  const [tripType, setTripType] = useState("roundtrip"); // Default is "roundtrip"

  return (
    <div className="flex-col h-80 relative bg-white rounded-2xl bottom-12 z-0 w-5/5 p-6 shadow-lg">
      
      {/* Trip Type Selection (One Way / Round Trip) */}
      <div className="flex gap-4 mb-4 border-b pb-4 pt-2 relative z-10">
        <button
          onClick={() => setTripType("oneway")}
          className={`px-4 py-2 rounded-full text-sm font-medium shadow-md cursor-pointer transition-all relative z-10 ${
            tripType === "oneway" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-200"
          }`}
        >
          One Way
        </button>

        <button
          onClick={() => setTripType("roundtrip")}
          className={`px-4 py-2 rounded-full text-sm font-medium shadow-md cursor-pointer transition-all relative z-10 ${
            tripType === "roundtrip" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-200"
          }`}
        >
          Round Trip
        </button>
      </div>

      {/* Main Form */}
      <div className={`grid ${tripType === "oneway" ? "grid-cols-4" : "grid-cols-5"} gap-4 mb-6`}>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">From</label>
          <input type="text" placeholder="DEL, Delhi Airport India" className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 cursor-pointer"/>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">To</label>
          <input type="text" placeholder="BLR, Bengaluru International Airport..." className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 cursor-pointer"/>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Departure</label>
          <input type="date" className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 cursor-pointer"/>
        </div>

        {tripType === "roundtrip" && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Return</label>
            <input type="date" className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 cursor-pointer"/>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Travellers & Class</label>
          <input value="4 Travellers" className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 cursor-pointer" readOnly/>
        </div>
      </div>

      {/* Special Fares */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Select a special fare</label>
        <div className="flex gap-4 flex-wrap">
          {["Regular", "Student", "Senior Citizen", "Armed Forces", "Doctor and Nurses"].map((fare, index) => (
            <label key={index} className="flex items-center gap-2 bg-white py-2 px-4 border rounded-lg cursor-pointer hover:bg-gray-300 transition">
              <input type="radio" name="fare" className="accent-blue-600" />
              <span>{fare}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FlightMode;