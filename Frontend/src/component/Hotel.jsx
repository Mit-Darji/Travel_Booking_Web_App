import React, { useState, useEffect, useRef } from "react";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { FiCalendar, FiUsers } from "react-icons/fi";

const Hotel = () => {
  const [showRoomsDropdown, setShowRoomsDropdown] = useState(false);
  const [toQuery, setToQuery] = useState("Goa");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [activeField, setActiveField] = useState(null);
  const dropdownRef = useRef(null);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);
  const navigate = useNavigate();

  const maxGuestsPerRoom = 4;
  
  const validateRooms = (newRooms) => {
    const totalGuests = adults + children;
    const maxAllowedGuests = newRooms * maxGuestsPerRoom;

    if (totalGuests > maxAllowedGuests) {
      const remainingCapacity = maxAllowedGuests;
      setAdults(Math.min(adults, remainingCapacity));
      setChildren(Math.max(remainingCapacity - adults, 0));
    }
    setRooms(newRooms);
  };

  const validateGuests = (type, value) => {
    const totalGuests = adults + children + value;
    const maxAllowedGuests = rooms * maxGuestsPerRoom;

    if (totalGuests > maxAllowedGuests) return;

    if (type === 'adults') {
      setAdults(Math.max(1, adults + value));
    } else {
      setChildren(Math.max(0, children + value));
    }
  };
  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  const fetchLocations = async (query) => {
    try {
      const response = await axios.post('http://localhost:5001/api/search/search-location', { city: query });
      setSuggestions(response.data.cities || []);
    } catch (error) {
      console.error('Error fetching locations:', error);
      setSuggestions([]);
    }
  };

  const debouncedFetch = debounce(fetchLocations, 300);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setSuggestions([]);
        setActiveField(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (value, field) => {
    setActiveField(field);
    if (field === 'to') {
      setToQuery(value);
      if (value.length > 2) {
        debouncedFetch(value);
      } else {
        setSuggestions([]);
      }
    }
  };

  const handleSelectLocation = (location) => {
    setToQuery(location);
    setSuggestions([]);
    setActiveField(null);
  };

  // Function to set minimum checkout date based on check-in selection
  const getMinCheckoutDate = () => {
    if (!checkInDate) return "";
    return checkInDate;
  };

  const handleSearch = () => {
    if (!toQuery || !checkInDate || !checkOutDate) {
      alert("Please enter all details (destination & dates)");
      return;
    }
    navigate(`/search-hotels?city=${toQuery}&checkInDate=${checkInDate}&checkOutDate=${checkOutDate}&rooms=${rooms}`);
  };

  return (
    <div className="relative bg-white rounded-2xl bottom-12 z-0 w-full p-6 shadow-xl py-18 transition-all duration-300 hover:shadow-2xl">
      <div className="grid grid-cols-4 divide-x divide-gray-100 border border-gray-200 rounded-2xl">
        {/* To City */}
        <div className="px-6 py-5 hover:bg-gray-50 transition-colors cursor-pointer group relative">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-2 font-medium">To City/Country</p>
          <div className="space-y-1">
            <input
              type="text"
              className="text-xl font-bold text-gray-900 bg-transparent border-none focus:outline-none w-full"
              value={toQuery}
              onChange={(e) => handleInputChange(e.target.value, 'to')}
              onClick={() => setActiveField('to')}
            />
          </div>
          {activeField === 'to' && (
            <div ref={dropdownRef} className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-xl shadow-2xl z-[1000] max-h-60 overflow-y-auto w-5/5">
              {suggestions.length > 0 ? (
                suggestions.map((location, index) => (
                  <div
                    key={index}
                    className="p-3 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleSelectLocation(location)}
                  >
                    {location}
                  </div>
                ))
              ) : (
                <div className="p-3 text-gray-500">No results found</div>
              )}
            </div>
          )}
        </div>
        
        {/* Check-in Date */}
        <div className="relative px-6 py-5 hover:bg-gray-50 transition-colors">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-2 font-medium">Check-in Date</p>
          <input
            type="date"
            className="w-full bg-transparent text-xl font-bold focus:outline-none"
            value={checkInDate}
            min={new Date().toISOString().split('T')[0]} // Set minimum date to today
            onChange={(e) => {
              setCheckInDate(e.target.value);
              // If checkout date is before new check-in date, reset it
              if (checkOutDate && e.target.value > checkOutDate) {
                setCheckOutDate('');
              }
            }}
          />
        </div>
        
        {/* Check-out Date */}
        <div className="relative px-6 py-5 hover:bg-gray-50 transition-colors">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-2 font-medium">Check-out Date</p>
          <input
            type="date"
            className="w-full bg-transparent text-xl font-bold focus:outline-none"
            value={checkOutDate}
            min={getMinCheckoutDate()} // Set minimum date to check-in date
            onChange={(e) => setCheckOutDate(e.target.value)}
            disabled={!checkInDate} // Disable until check-in date is selected
          />
        </div>
        <div className="relative px-6 py-5 hover:bg-gray-50 transition-colors">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-2 font-medium">Rooms & Guests</p>
          <button
            className="w-full text-left flex items-center justify-between"
            onClick={() => setShowRoomsDropdown(!showRoomsDropdown)}
          >
            <span className="text-xl font-bold text-gray-900">
              {rooms} Room{rooms !== 1 ? 's' : ''} • {adults + children} Guest{adults + children !== 1 ? 's' : ''}
            </span>
            <FiUsers className="text-gray-400 ml-2" />
          </button>
          {showRoomsDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl p-4 space-y-4 animate-fade-in z-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-700">Adults</p>
                  <p className="text-sm text-gray-500">Age 18+</p>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                    onClick={() => validateGuests('adults', -1)}
                    disabled={adults === 1}
                  >
                    -
                  </button>
                  <span className="w-6 text-center">{adults}</span>
                  <button 
                    className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                    onClick={() => validateGuests('adults', 1)}
                    disabled={adults + children >= rooms * maxGuestsPerRoom}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-700">Children</p>
                  <p className="text-sm text-gray-500">Age 12-17</p>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                    onClick={() => validateGuests('children', -1)}
                    disabled={children === 0}
                  >
                    -
                  </button>
                  <span className="w-6 text-center">{children}</span>
                  <button 
                    className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                    onClick={() => validateGuests('children', 1)}
                    disabled={adults + children >= rooms * maxGuestsPerRoom}
                  >
                    +
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-700">Rooms</p>
                  <p className="text-sm text-gray-500">Max {maxGuestsPerRoom} guests/room</p>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                    onClick={() => validateRooms(Math.max(1, rooms - 1))}
                    disabled={rooms === 1}
                  >
                    -
                  </button>
                  <span className="w-6 text-center">{rooms}</span>
                  <button 
                    className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                    onClick={() => validateRooms(rooms + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-5 flex justify-center">
        <button
          onClick={handleSearch}
          className="px-5 py-1 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold rounded-full hover:scale-105 transition-all duration-300 w-2/11 h-11 text-[1.4rem]"
        >
          SEARCH
        </button>
      </div>
    </div>
  );
};

export default Hotel;