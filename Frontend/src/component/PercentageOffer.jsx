import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MapPin, Star, ArrowRight, Percent, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PercentageOffer = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('all'); 
  const [percentageFilter, setPercentageFilter] = useState(1); 
  const scrollContainerRef = useRef(null);
  const navigate = useNavigate();

  // Fetch offers based on filter type
  useEffect(() => {
    const fetchOffers = async () => {
      setLoading(true);
      try {
        let endpoint;
        
        switch (filterType) {
          case 'domestic':
            endpoint = 'http://localhost:5001/api/Offers/domesticOffers';
            break;
          case 'international':
            endpoint = 'http://localhost:5001/api/Offers/internationalOffers';
            break;
          case 'percentage':
            endpoint = 'http://localhost:5001/api/Offers/percentageOffers';
            break;
          default:
            endpoint = 'http://localhost:5001/api/Offers/allOffers';
        }

        // Handle special case for percentage filter
        let response;
        if (filterType === 'percentage') {
          console.log(`Fetching offers with discount up to: ${percentageFilter}%`);
          response = await axios.get(endpoint, {
            params: { percentageDiscount: percentageFilter }
          });
        } else {
          response = await axios.get(endpoint);
        }

        // Check the exact structure of the response
        console.log('API Response:', response.data);
        
        // Make sure we're handling the data structure correctly
        const responseData = response.data.data || response.data;
        setOffers(Array.isArray(responseData) ? responseData : []);
        setError(null);
      } catch (err) {
        console.error('Error fetching offers:', err);
        setError('Failed to load offers. Please try again.');
        setOffers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, [filterType, percentageFilter]);

  const handleCardClick = (offer) => {
    // Navigate to detail page with all necessary data
    navigate(`/package/${offer.id}`, { 
      state: { 
        packageDetails : offer,
      }
    });
  };

  // Scroll functions for horizontal scrolling
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  // Process images helper function
  const processImages = (imagesData) => {
    if (!imagesData) return [];
    
    if (typeof imagesData === 'string') {
      return imagesData.includes(',') ? 
        imagesData.split(',').map(url => url.trim()) : 
        [imagesData];
    } 
    
    if (Array.isArray(imagesData)) {
      return imagesData;
    }
    
    return [];
  };

  // Render star rating
  const renderRatingStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={`star-${i}`} size={16} className="fill-yellow-400 text-yellow-400" />
        );
      } else {
        stars.push(
          <Star key={`star-${i}`} size={16} className="text-gray-300" />
        );
      }
    }
    
    return stars;
  };

  return (
    <div className="py-16 bg-gradient-to-b from-indigo-50 via-white to-blue-50">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Special Offers</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover amazing deals on holiday packages across the globe. Limited time offers available now!
          </p>
        </div>

        {/* Filter Controls */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-10 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Filter Offers</h2>
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={() => setFilterType('all')}
                  className={`px-5 py-2.5 rounded-lg transition-all duration-300 font-medium ${
                    filterType === 'all' 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All Offers
                </button>
                <button 
                  onClick={() => setFilterType('domestic')}
                  className={`px-5 py-2.5 rounded-lg transition-all duration-300 font-medium ${
                    filterType === 'domestic' 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Domestic
                </button>
                <button 
                  onClick={() => setFilterType('international')}
                  className={`px-5 py-2.5 rounded-lg transition-all duration-300 font-medium ${
                    filterType === 'international' 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  International
                </button>
                <button 
                  onClick={() => setFilterType('percentage')}
                  className={`px-5 py-2.5 rounded-lg transition-all duration-300 font-medium ${
                    filterType === 'percentage' 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  By Discount %
                </button>
              </div>
            </div>

            {/* Percentage slider - only visible when percentage filter is active */}
            {filterType === 'percentage' && (
              <div className="w-full md:w-64">
                <label className="text-sm font-medium text-gray-700 mb-2 flex justify-between">
                  <span>Discount up to:</span>
                  <span className="text-blue-600 font-bold">{percentageFilter}%</span>
                </label>
                <input 
                  type="range" 
                  min="1" 
                  max="90" 
                  value={percentageFilter}
                  onChange={(e) => setPercentageFilter(Number(e.target.value))}
                  className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
            )}
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex justify-end mb-2">
          <div className="flex gap-2">
            <button 
              onClick={scrollLeft} 
              className="p-2 bg-white rounded-full shadow-md text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-300"
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              onClick={scrollRight} 
              className="p-2 bg-white rounded-full shadow-md text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-300"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center my-16">
            <div className="inline-flex items-center gap-3 text-indigo-600">
              <div className="animate-spin h-8 w-8 border-3 border-indigo-500 border-t-transparent rounded-full"></div>
              <p className="text-lg font-medium">Loading offers...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 my-8 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => setFilterType('all')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Try Again
            </button>
          </div>
        )}

        {/* No Results State */}
        {!loading && !error && offers.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-10 text-center my-12">
            <h3 className="text-xl font-semibold text-yellow-800 mb-3">No Offers Found</h3>
            <p className="text-yellow-700 mb-6">
              There are currently no offers available with the selected filters.
            </p>
            <button 
              onClick={() => setFilterType('all')}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              View All Offers
            </button>
          </div>
        )}

        {/* Horizontally Scrollable Offers */}
        {!loading && !error && offers.length > 0 && (
          <div className="relative">
            {/* Scrollable container */}
            <div 
              ref={scrollContainerRef}
              className="flex overflow-x-auto py-6 px-2 gap-6 scrollbar-hide snap-x snap-mandatory pb-8"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {/* Hide scrollbar for Chrome, Safari and Opera */}
              <style jsx="true">{`
                .scrollbar-hide::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              
              {offers.map((offer) => {
                const images = processImages(offer.images);
                const discount = offer.HolidayPackages?.[0]?.percentageDiscount || 0;
                return (
                  <div 
                    key={offer.id} 
                    className="flex-none w-80 snap-start bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 group border border-gray-100"
                    onClick={() => handleCardClick(offer)}
                  >
                    {/* Image with overlaid text */}
                    <div className="relative h-56">
                      {images.length > 0 ? (
                        <img 
                          src={images[0]} 
                          alt={`${offer.city} Package`} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center">
                          <span className="text-gray-500">No Image Available</span>
                        </div>
                      )}
                      
                      {/* Gradient overlay for better text visibility */}
                      <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/70"></div>
                      
                      {/* Country and City info overlaid on image */}
                      <div className="absolute bottom-0 left-0 p-5 w-full">
                        <div className="flex items-center gap-1.5 text-sm text-white/90 mb-1.5">
                          <MapPin size={14} className="text-blue-200" />
                          <span>{offer.country}</span>
                        </div>
                        
                        <h3 className="text-2xl font-bold text-white mb-3">
                          {offer.city} 
                        </h3>
                        
                        {/* View Details button */}
                        <button className="inline-flex items-center gap-1.5 text-white font-medium bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full hover:bg-blue-600 transition-all duration-300 group-hover:bg-blue-600">
                          View Details
                          <ArrowRight size={16} />
                        </button>
                      </div>
                      
                      {/* Discount Badge */}
                      {discount > 0 && (
                        <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                          {discount}% OFF
                        </div>
                      )}
                    </div>

                    {/* Rating display - only if available */}
                    {offer.rating && (
                      <div className="px-5 py-3 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            {renderRatingStars(offer.rating)}
                          </div>
                          <span className="text-sm text-gray-600 font-medium">
                            {offer.rating}/5
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PercentageOffer;