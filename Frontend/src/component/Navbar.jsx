import React from 'react';
import bgImage from '../assets/bg.jpg';
import logo from '../assets/loho.png';
import { MdFlight } from "react-icons/md";
import { RiHotelFill } from "react-icons/ri";
import { MdMapsHomeWork } from "react-icons/md";
import { FaUmbrellaBeach } from "react-icons/fa6";
import FlightMode from './FlightMode';
import { useState, useEffect } from 'react';
import Holiday from './Holiday';
import { useNavigate } from 'react-router-dom';
import  Hotel  from './Hotel';

const Navbar = () => {
  const [selectedTab, setSelectedTab] = useState("Flights");
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const parsedData = JSON.parse(userData);
        setUserName(parsedData?.name || "");
      } catch (e) {
        console.error("Failed to parse userData from localStorage", e);
      }
    }
  }, [localStorage.getItem('userData')]);

  const handleLogout = () => {
    localStorage.removeItem('userData');
    setUserName("");
    setShowDropdown(false);
    navigate('/');
  };

  const options = [
    { icon: <MdFlight />, label: "Flights" },
    { icon: <RiHotelFill />, label: "Hotels" },
    { icon: <MdMapsHomeWork />, label: "Homestays & Villas" },
    { icon: <FaUmbrellaBeach />, label: "Holiday Packages" },
  ];

  return (
    <>
      <div className="relative h-[700px] bg-cover bg-center bg-no-repeat px-50" style={{ backgroundImage: `url(${bgImage})` }}>
        <div className="absolute inset-0 bg-black/30"></div>
        
        {/* Top Navigation Bar */}
        <div className="relative z-10 py-3 flex items-center justify-between px-4">
          <img src={logo} alt="Logo" className="w-[60px] h-auto" />
          
          <div className="flex items-center space-x-2">
            <div className="relative">
              <button
                className="px-5 py-2 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold rounded-full hover:scale-105 transition-all duration-300"
                onClick={() => userName ? setShowDropdown(!showDropdown) : navigate('/login')}
              >
                {userName ? `${userName}` : "Login or Create Account"}
              </button>
              
              {userName && showDropdown && (
                <div className="absolute right-0 mt-2 w-full bg-white rounded-md shadow-lg overflow-hidden z-20">
                  <button
                    onClick={handleLogout}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-center"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4 px-2 py-2">
              {/* Country Dropdown */}
              <div className="relative">
                <select className="appearance-none bg-white/10 text-white border border-white/20 pl-2 pr-8 py-1.5 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-200 hover:bg-white/20 cursor-pointer">
                  <option className="bg-gray-800 text-white">India</option>
                  <option className="bg-gray-800 text-white">USA</option>
            
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                  <svg className="h-5 w-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Language Dropdown */}
              <div className="relative">
                <select className="appearance-none bg-white/10 text-white border border-white/20 pl-2 pr-8 py-1.5 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-200 hover:bg-white/20 cursor-pointer">
                  <option className="bg-gray-800 text-white">English</option>
                  <option className="bg-gray-800 text-white">Hindi</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                  <svg className="h-5 w-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Currency Dropdown */}
              <div className="relative">
                <select className="appearance-none bg-white/10 text-white border border-white/20 pl-2 pr-8 py-1.5 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-200 hover:bg-white/20 cursor-pointer">
                  <option className="bg-gray-800 text-white">INR</option>
                  <option className="bg-gray-800 text-white">USD</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                  <svg className="h-5 w-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-col mt-10 h-auto">
          <div className="flex justify-center items-center relative z-10 pt-20">
            <div className="rounded-xl w-2/6 text-center pb-3 pt-2 bg-white flex justify-evenly items-center text-sm text-gray-600 shadow-md">
              {options.map((service, index) => (
                <div
                  key={index}
                  className={`flex flex-col items-center cursor-pointer p-2 rounded-md transition-all ${
                    selectedTab === service.label
                      ? "text-blue-600 font-bold border-b-2 border-blue-600"
                      : "text-gray-600 hover:text-blue-400"
                  }`}
                  onClick={() => setSelectedTab(service.label)}
                >
                  <div className="text-[2rem] flex justify-center">{service.icon}</div>
                  <div className="h-10 w-16 text-center text-wrap">{service.label}</div>
                </div>
              ))}
            </div>
          </div>

          {selectedTab === "Flights" && (
            <div className="flex justify-center h-52 z-0 w-full">
              <FlightMode />
              <div className="mt-2 flex justify-center absolute z-10 bottom-24 w-full">
                <button className="px-5 py-1 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold rounded-full hover:scale-105 transition-all duration-300 w-1/7 h-11 text-[1.4rem] absolute bottom-1 cursor-pointer">
                  SEARCH
                </button>
              </div>
            </div>
          )}

          {selectedTab === "Holiday Packages" && (
            <div className="flex justify-center h-52 z-0 w-full">
              <Holiday />
            </div>
          )}
          {selectedTab === "Hotels" && (
            <div className="flex justify-center h-52 z-0 w-full">
             <Hotel/>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;