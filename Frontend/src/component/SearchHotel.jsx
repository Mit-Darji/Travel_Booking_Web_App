import React, { useState, useEffect, useRef } from "react";
import axios from 'axios';
import { useLocation, useNavigate } from "react-router-dom";
import { Search, MapPin, Calendar, ArrowRight, X, Star, Users, Plus, Minus } from 'lucide-react';
import { time } from "framer-motion";

const SearchHotel = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const initialCity = searchParams.get("city");
  const initialCheckInDate = searchParams.get("checkInDate");
  const initialCheckOutDate = searchParams.get("checkOutDate");
  const initialRooms = parseInt(searchParams.get("rooms") || "1");
  
  const [Hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cityQuery, setCityQuery] = useState(initialCity || "");
  const [checkInDate, setCheckInDate] = useState(initialCheckInDate || "");
  const [checkOutDate, setCheckOutDate] = useState(initialCheckOutDate || "");
  const [rooms, setRooms] = useState(initialRooms);
  const [suggestions, setSuggestions] = useState([]);
  const [activeField, setActiveField] = useState(null);
  const dropdownRef = useRef(null);
  const [isSearchSticky, setIsSearchSticky] = useState(false);
  const [hotelDetail, setHotelDetail] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsSearchSticky(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const cityParam = searchParams.get("city");
    const checkInParam = searchParams.get("checkInDate");
    const checkOutParam = searchParams.get("checkOutDate");
    const roomsParam = searchParams.get("rooms");
    if (cityParam && checkInParam && checkOutParam) {
      setCityQuery(cityParam);
      setCheckInDate(checkInParam);
      setCheckOutDate(checkOutParam);
      if (roomsParam) setRooms(parseInt(roomsParam, 10));
      fetchHotels();
    }
  }, [location.search]);

  const fetchHotels = async () => {
    setLoading(true);
    setError(null);
    setHotels([]);
    try {
      if (!cityQuery || !checkInDate || !checkOutDate) {
        setError("Please enter destination, check-in date, and check-out date");
        setLoading(false);
        return;
      }
      
      // Validate check-out date is after check-in date
      if (new Date(checkOutDate) <= new Date(checkInDate)) {
        setError("Check-out date must be after check-in date");
        setLoading(false);
        return;
      }
      
      const response = await axios.get("http://localhost:5001/api/allListing/searchHotels", {
        params: { 
          cityOrCountry: cityQuery, 
          checkIn: checkInDate, 
          checkOut: checkOutDate,
          rooms: rooms
        }
      });
      console.log(response.data);
      const hotelData = response.data?.Hotels || [];
      setHotels(hotelData);
      
      if (hotelData.length === 0) {
        setError("No Hotels found for the selected criteria.");
      }
    } catch (error) {
      setError(error.response?.data?.message || "An error occurred while fetching Hotels");
      setHotels([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchHotelDetails = async (hotelId) => {
    setDetailsLoading(true);
    setHotelDetail(null);
    
    try {
      const response = await axios.get(`http://localhost:5001/api/SearchListing/hotelViewDetails`, {
        params: { hotelId }
      });
      
      setHotelDetail(response.data.hotelDetails);
      navigate(`/hotel/${hotelId}`, { 
        state: { hotelDetails: response.data.hotelDetails,
          checkInDate: checkInDate,
          checkOutDate: checkOutDate,
          rooms: rooms
         }
      });
    } catch (error) {
      console.error("Error fetching hotel details:", error);
      alert("Failed to load hotel details. Please try again.");
    } finally {
      setDetailsLoading(false);
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

  const handleInputChange = (value) => {
    setCityQuery(value);
    setActiveField('city');
    if (value.length > 2) debouncedFetch(value);
    else setSuggestions([]);
  };

  const handleSelectLocation = (location) => {
    setCityQuery(location);
    setSuggestions([]);
    setActiveField(null);
  };

  const incrementRooms = () => {
    if (rooms < 10) {
      setRooms(rooms + 1);
    }
  };

  const decrementRooms = () => {
    if (rooms > 1) {
      setRooms(rooms - 1);
    }
  };

  const handleSearch = () => {
    if (!cityQuery || !checkInDate || !checkOutDate) {
      alert("Please enter destination, check-in date, and check-out date");
      return;
    }
    
    if (new Date(checkOutDate) <= new Date(checkInDate)) {
      alert("Check-out date must be after check-in date");
      return;
    }
    
    navigate(`/search-Hotels?city=${cityQuery}&checkInDate=${checkInDate}&checkOutDate=${checkOutDate}&rooms=${rooms}`, { replace: true });
    fetchHotels();
  };

  const handleViewHotel = (hotelId) => {
    fetchHotelDetails(hotelId);
  };

  // Function to calculate number of nights
  const calculateNights = () => {
    if (!checkInDate || !checkOutDate) return 0;
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Function to render rating stars
  const renderRatingStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    // Add filled stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={`star-${i}`} size={16} className="fill-yellow-400 text-yellow-400" />
      );
    }
    
    // Add half star if needed
    if (hasHalfStar) {
      stars.push(
        <span key="half-star" className="relative">
          <Star size={16} className="text-gray-300" />
          <Star size={16} className="absolute top-0 left-0 fill-yellow-400 text-yellow-400 w-1/2 overflow-hidden" />
        </span>
      );
    }
    
    // Add empty stars
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-star-${i}`} size={16} className="text-gray-300" />
      );
    }
    
    return stars;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-blue-50">
      {/* Sticky Search Container */}
      <div className={`w-full transition-all duration-500 ease-in-out z-50
        ${isSearchSticky 
          ? 'fixed top-0 left-0 bg-white/95 backdrop-blur-lg shadow-lg py-3' 
          : 'relative pt-6'}`}>
        <div className="container mx-auto max-w-6xl px-4">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="grid md:grid-cols-4 gap-4">
              {/* City Input */}
              <div className="relative group">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="text-indigo-500" size={20} />
                  <label className="text-m font-medium text-gray-700">Where to?</label>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition-all duration-300"
                    value={cityQuery}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onClick={() => setActiveField('city')}
                    placeholder="Enter city"
                  />
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  {cityQuery && (
                    <button 
                      onClick={() => setCityQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
                {activeField === 'city' && (
                  <div
                    ref={dropdownRef}
                    className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-xl border border-gray-100 max-h-64 overflow-y-auto"
                  >
                    {suggestions.length > 0 ? (
                      suggestions.map((location, index) => (
                        <div
                          key={index}
                          className="px-4 py-2 hover:bg-indigo-50 cursor-pointer transition-colors duration-200 text-gray-700"
                          onClick={() => handleSelectLocation(location)}
                        >
                          {location}
                        </div>
                      ))
                    ) : (
                      activeField === 'city' && cityQuery.length > 2 && (
                        <div className="px-4 py-3 text-gray-500 text-center">No matches found</div>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* Check-in and Check-out Dates */}
              <div className="grid grid-cols-2 gap-2 md:col-span-2">
                {/* Check-in Date */}
                <div className="group">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="text-indigo-500" size={20} />
                    <label className="text-m font-medium text-gray-700">Check-in</label>
                  </div>
                  <div className="relative">
                    <input
                      type="date"
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition-all duration-300"
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                {/* Check-out Date */}
                <div className="group">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="text-indigo-500" size={20} />
                    <label className="text-m font-medium text-gray-700">Check-out</label>
                  </div>
                  <div className="relative">
                    <input
                      type="date"
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition-all duration-300"
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      min={checkInDate || new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
              </div>

              {/* Rooms Input with + and - buttons */}
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="text-indigo-500" size={20} />
                  <label className="text-m font-medium text-gray-700">Rooms</label>
                </div>
                <div className="relative flex items-center bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                  <button 
                    onClick={decrementRooms}
                    disabled={rooms <= 1}
                    className={`flex-none p-3 text-gray-700 hover:bg-gray-200 transition-colors ${rooms <= 1 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    aria-label="Decrease rooms"
                  >
                    <Minus size={18} />
                  </button>
                  <div className="flex-grow px-4 py-3 text-center font-medium">
                    {rooms} {rooms === 1 ? 'Room' : 'Rooms'}
                  </div>
                  <button 
                    onClick={incrementRooms}
                    disabled={rooms >= 10}
                    className={`flex-none p-3 text-gray-700 hover:bg-gray-200 transition-colors ${rooms >= 10 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    aria-label="Increase rooms"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>

              {/* Search Button */}
              <div className="flex items-end justify-center md:col-span-4">
                <button
                  onClick={handleSearch}
                  className="w-full md:w-1/2 bg-gradient-to-r from-blue-500 to-cyan-400 text-white py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  disabled={loading || !cityQuery || !checkInDate || !checkOutDate}
                >
                  <Search size={20} />
                  <span className="font-medium">Find Hotels</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto max-w-6xl px-4 pt-12 pb-12">
        {/* Loading State */}
        {loading && (
          <div className="text-center bg-white rounded-2xl p-8 shadow-md animate-pulse">
            <div className="inline-flex items-center gap-2 text-indigo-600">
              <Search className="animate-spin" size={24} />
              <p className="text-lg font-medium">Finding your perfect hotel...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 rounded-2xl p-8 shadow-md text-center">
            <p className="text-red-600 font-medium">{error}</p>
            <p className="text-gray-600 mt-2">Try adjusting your search criteria</p>
          </div>
        )}

        {/* Hotels List */}
        {Hotels.length > 0 && (
          <div className="space-y-12">
            <h2 className="text-3xl md:text-4xl font-bold text-center bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
              Hotels
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Hotels.map((hotel) => (
                <div
                  key={hotel.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="relative overflow-hidden">
                    {hotel.image && hotel.image.length > 0 ? (
                      <img
                        src={hotel.image}
                        alt={hotel.name}
                        className="w-full h-64 object-cover transform group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-64 bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center">
                        <span className="text-gray-500 font-medium">No Preview</span>
                      </div>
                    )}
                    {hotel.isdiscount && (
                      <span className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        {hotel.percentageDiscountPerNight}% OFF
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">
                        {hotel.name}
                      </h3>
                      <div className="text-right">
                        {hotel.isdiscount ? (
                          <div className="space-y-1">
                            <p className="text-indigo-600 font-bold text-lg">
                              ₹{(hotel.pricePerNight - hotel.discountPerNight).toFixed(2)}
                              <span className="text-sm text-gray-500">/Night</span>
                            </p>
                            <p className="text-sm text-gray-400 line-through">
                              ₹{hotel.pricePerNight.toFixed(2)}
                              <span className="text-xs text-gray-500">/Night</span>
                            </p>
                          </div>
                        ) : (
                          <p className="text-lg font-bold text-gray-800">
                            ₹{hotel.pricePerNight.toFixed(2)}
                            <span className="text-sm text-gray-500">/Night</span>
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Rating Field */}
                    <div className="flex items-center mb-3">
                      <div className="flex items-center mr-2">
                        {renderRatingStars(hotel.rating || 0)}
                      </div>
                      <span className="text-sm text-gray-600">
                        {hotel.rating ? hotel.rating.toFixed(1) : "No rating"} 
                      </span>
                    </div>
                    
                    <div className="space-y-3 text-sm text-gray-600">
                        <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1">
                              <MapPin size={16} className="text-blue-600" />
                              {hotel.Listing.city}, {hotel.Listing.country}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users size={16} className="text-blue-600" />
                              {rooms} {rooms === 1 ? "Room" : "Rooms"}
                            </span>
                          </div>
                      <div className="flex justify-between text-sm">
                          <span>
                            Check-In:{hotel.checkInTime && new Date(`1970-01-01T${hotel.checkInTime}`).toLocaleTimeString('en-US', { 
                              hour: '2-digit', minute: '2-digit', hour12: true 
                            })}
                          </span>
                          <span>
                            Check-Out:{hotel.checkOutTime && new Date(`1970-01-01T${hotel.checkOutTime}`).toLocaleTimeString('en-US', { 
                              hour: '2-digit', minute: '2-digit', hour12: true 
                            })}
                          </span>
                        </div>
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                      <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
                        {calculateNights()} {calculateNights() === 1 ? 'Night' : 'Nights'}
                      </span>
                      <button 
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300 flex items-center gap-2 text-sm"
                        onClick={() => handleViewHotel(hotel.id)}
                        disabled={detailsLoading}
                      >
                        {detailsLoading && hotel.id === (hotelDetail?.id) ? 'Loading...' : 'View Hotel'}
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchHotel;