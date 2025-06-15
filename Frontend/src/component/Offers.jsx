import React, { useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import i1 from '../assets/i1.jpg'
import i2 from '../assets/i2.jpeg'
import i3 from '../assets/i3.jpeg'
import i4 from '../assets/i4.jpg'
import i6 from '../assets/i6.jpg'
import i7 from '../assets/i7.jpeg'
const categories = [
  "All Offers", "Hotels", "Holidays"
];

const offers = [
  { category: "Holidays", title: "LIVE NOW: FLAT 25% OFF* on Holiday Packages.", description: "Grab & make your trip memorable.", image: i1 },
  { category: "Holidays", title: "NOW Gift ₹2500 & Get ₹2500 on Holiday Packages.", description: "Refer holiday packages to a friend & you both get a gift card.", image: i2 },
  { category: "Hotels", title: "Up to 25% OFF* on International Hotels and Holiday Packages", description: "Save big with HDFC Bank offers.", image: i3 },
  { category: "Hotels", title: "Bookings Open for Summer 2025 Holiday Packages.", description: "Plan your international vacation in advance.", image: i6 },
 
];

const Offers = () => {
  const [selectedCategory, setSelectedCategory] = useState("All Offers");
  const scrollRef = useRef(null);
  const CARD_WIDTH = 300; 
  const GAP = 20; 
  const scrollByAmount = (CARD_WIDTH + GAP) * 4 - GAP; 

  const filteredOffers = selectedCategory === "All Offers" 
    ? offers 
    : offers.filter((offer) => offer.category === selectedCategory);

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -scrollByAmount, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: scrollByAmount, behavior: "smooth" });
  };
  
  return (
    <div className="p-6 bg-white relative rounded-2xl shadow-xl mt-20 mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Exclusive Offers</h2>
      
      {/* Category Tabs */}
      <div className="flex space-x-3 overflow-x-auto no-scrollbar pb-3">
        {categories.map((category, index) => (
          <button 
            key={index} 
            onClick={() => setSelectedCategory(category)}
            className={`px-5 py-2 rounded-lg font-medium transition-all duration-300 whitespace-nowrap
              ${selectedCategory === category ? "bg-blue-600 text-white shadow-md" : "bg-gray-200 hover:bg-gray-300"}`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Scroll Buttons */}
      <div className="absolute top-10 right-10 flex space-x-1">
        <button 
          onClick={scrollLeft} 
          className="bg-white p-2 shadow-lg rounded-xl hover:bg-gray-100 border border-gray-300"
        >
          <ChevronLeft size={24} />
        </button>
        <button 
          onClick={scrollRight} 
          className="bg-white p-2 shadow-lg rounded-xl hover:bg-gray-100 border border-gray-300"
        >
          <ChevronRight size={24} />
        </button>
      </div>
      
      {/* Offers */}
      <div className="relative mt-6 ">
        <div ref={scrollRef} className="flex space-x-1 overflow-x-auto no-scrollbar py-3  " style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch"
          }}>
          {filteredOffers.map((offer, index) => (
            <div key={index} className="bg-white p-5 mx-2 rounded-lg shadow-lg w-80 flex-shrink-0 flex flex-col justify-between transform transition-all duration-300 hover:scale-105 border border-gray-300">
              <div>
                <img src={offer.image} alt={offer.title} className="w-full h-44 object-cover rounded-lg" />
                <h3 className="text-lg font-semibold mt-3 text-gray-800">{offer.title}</h3>
                <p className="text-gray-600 mt-1">{offer.description}</p>
              </div>
              <button className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg w-full hover:bg-blue-700 cursor-pointer ">BOOK NOW</button>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
};

export default Offers;