import React, { useState, useEffect, useRef } from "react";
import axios from 'axios';
import { useLocation, useNavigate } from "react-router-dom";
import { Search, MapPin, Calendar, ArrowRight, X, Star } from 'lucide-react';

const SearchResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const initialCity = searchParams.get("city");
  const initialDepartureDate = searchParams.get("date");
  
  const [holidayPackages, setHolidayPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toQuery, setToQuery] = useState(initialCity || "");
  const [selectedDate, setSelectedDate] = useState(initialDepartureDate || "");
  const [suggestions, setSuggestions] = useState([]);
  const [activeField, setActiveField] = useState(null);
  const dropdownRef = useRef(null);
  const [isSearchSticky, setIsSearchSticky] = useState(false);
  const [packageDetail, setPackageDetail] = useState(null);
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
    const dateParam = searchParams.get("date");
    if (cityParam && dateParam) {
      setToQuery(cityParam);
      setSelectedDate(dateParam);
      fetchPackages();
    }
  }, [location.search]);

  const fetchPackages = async () => {
    setLoading(true);
    setError(null);
    setHolidayPackages([]);
    try {
      if (!toQuery || !selectedDate) {
        setError("Please enter both destination and departure date");
        setLoading(false);
        return;
      }
      const response = await axios.get("http://localhost:5001/api/allListing/searchHolidayPackages", {
        params: { cityOrCountry: toQuery, departureDate: selectedDate }
      });
      const packages = response.data?.holidayPackages || [];
      setHolidayPackages(packages);
      if (packages.length === 0) {
        setError("No holiday packages found for the selected criteria.");
      }
    } catch (error) {
      setError(error.response?.data?.message || "An error occurred while fetching packages");
      setHolidayPackages([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPackageDetails = async (holidayPackageId) => {
  setDetailsLoading(true);
  setPackageDetail(null);
  
  try {
    const response = await axios.get(`http://localhost:5001/api/SearchListing/packageViewDetails`, {
      params: { holidayPackageId }
    });
    console.log(response.data);
    setPackageDetail(response.data.packageDetails);
    navigate(`/package/${holidayPackageId}`, { 
      state: { packageDetails: response.data.packageDetails }
    });
  } catch (error) {
    console.error("Error fetching package details:", error);
    alert("Failed to load package details. Please try again.");
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
    setToQuery(value);
    setActiveField('to');
    if (value.length > 2) debouncedFetch(value);
    else setSuggestions([]);
  };

  const handleSelectLocation = (location) => {
    setToQuery(location);
    setSuggestions([]);
    setActiveField(null);
  };

  const handleSearch = () => {
    if (!toQuery || !selectedDate) {
      alert("Please enter destination and departure date");
      return;
    }
    navigate(`/search-packages?city=${toQuery}&date=${selectedDate}`, { replace: true });
    fetchPackages();
  };

  const handleExplore = (packageId) => {
    fetchPackageDetails(packageId);
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
            <div className="grid md:grid-cols-3 gap-4">
              {/* Destination Input */}
              <div className="relative group">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="text-indigo-500" size={20} />
                  <label className="text-m font-medium text-gray-700">Where to?</label>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition-all duration-300"
                    value={toQuery}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onClick={() => setActiveField('to')}
                    placeholder="Enter destination"
                  />
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  {toQuery && (
                    <button 
                      onClick={() => setToQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
                {activeField === 'to' && (
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
                      activeField === 'to' && toQuery.length > 2 && (
                        <div className="px-4 py-3 text-gray-500 text-center">No matches found</div>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* Date Input */}
              <div className="group">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="text-indigo-500" size={20} />
                  <label className="text-m font-medium text-gray-700">When?</label>
                </div>
                <div className="relative">
                  <input
                    type="date"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition-all duration-300"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              {/* Search Button */}
              <div className="flex items-end">
                <button
                  onClick={handleSearch}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  disabled={loading || !toQuery || !selectedDate}
                >
                  <Search size={20} />
                  <span className="font-medium">Find Packages</span>
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
              <p className="text-lg font-medium">Finding your perfect getaway...</p>
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

        {/* Holiday Packages */}
        {holidayPackages.length > 0 && (
          <div className="space-y-12">
            <h2 className="text-3xl md:text-4xl font-bold text-center bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
              Holiday packages
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {holidayPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="relative overflow-hidden">
                    {pkg.images && pkg.images.length > 0 ? (
                      <img
                        src={pkg.images}
                        alt={pkg.name}
                        className="w-full h-64 object-cover transform group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-64 bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center">
                        <span className="text-gray-500 font-medium">No Preview</span>
                      </div>
                    )}
                    {pkg.isdiscount && (
                      <span className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        {pkg.percentageDiscount}% OFF
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">
                        {pkg.name}
                      </h3>
                      <div className="text-right">
                        {pkg.isdiscount ? (
                          <div className="space-y-1">
                            <p className="text-indigo-600 font-bold text-lg">
                              ₹{(pkg.price - pkg.discount).toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-400 line-through">
                              ₹{pkg.price.toFixed(2)}
                            </p>
                          </div>
                        ) : (
                          <p className="text-lg font-bold text-gray-800">
                            ₹{pkg.price.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Rating Field */}
                    <div className="flex items-center mb-3">
                      <div className="flex items-center mr-2">
                        {renderRatingStars(pkg.rating || 0)}
                      </div>
                      <span className="text-sm text-gray-600">
                        {pkg.rating ? pkg.rating.toFixed(1) : "No rating"} 
                      </span>
                    </div>
                    
                    <div className="space-y-3 text-sm text-gray-600">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <MapPin size={16} className="text-indigo-500" />
                          {pkg.Listing.city}, {pkg.Listing.country}
                        </span>
                        <span className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full text-xs">
                          {pkg.duration}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Start: {new Date(pkg.startTime).toLocaleDateString()}</span>
                        <span>End: {new Date(pkg.leavingTime).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                      <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
                        {pkg.visitors} Travelers
                      </span>
                      <button 
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300 flex items-center gap-2 text-sm"
                        onClick={() => handleExplore(pkg.id)}
                        disabled={detailsLoading}
                      >
                        {detailsLoading && pkg.id === (packageDetail?.id) ? 'Loading...' : 'Explore'}
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

export default SearchResult;