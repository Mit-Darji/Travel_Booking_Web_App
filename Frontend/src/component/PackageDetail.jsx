import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Calendar, MapPin, Users, Clock, ArrowLeft, Star, ChevronLeft, ChevronRight } from 'lucide-react';

const PackageDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [packageData, setPackageData] = useState(location.state?.packageDetails || null);
  const [reviewSummary, setReviewSummary] = useState(null);
  const [loading, setLoading] = useState(!packageData);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [processedImages, setProcessedImages] = useState([]);
  useEffect(() => {
    // If we don't have the package details (e.g., direct URL access), fetch them
    if (!packageData && id) {
      fetchPackageDetails(id);
    }
  }, [id, packageData]);

  useEffect(() => {
    // Process images whenever packageData changes
    if (packageData) {
      processPackageImages();
    }
  }, [packageData]);

  const processPackageImages = () => {
    if (!packageData.packageImages) {
      setProcessedImages([]);
      return;
    }

    // Handle when packageImages is a string (could be a single URL or comma-separated URLs)
    if (typeof packageData.packageImages === 'string') {
      // Check if it's a comma-separated string
      if (packageData.packageImages.includes(',')) {
        setProcessedImages(packageData.packageImages.split(',').map(url => url.trim()));
      } else {
        // Single image URL
        setProcessedImages([packageData.packageImages]);
      }
    } 
    // Handle when packageImages is already an array
    else if (Array.isArray(packageData.packageImages)) {
      setProcessedImages(packageData.packageImages);
    }
    // Handle any other unexpected format
    else {
      setProcessedImages([]);
    }
  };

  const fetchPackageDetails = async (packageId) => {
    setLoading(true);
    try {
      // Change to GET request with parameter in URL
      const response = await axios.get(
        `http://localhost:5001/api/SearchListing/packageViewDetails/${packageId}`
      );
      
     
      if (response.data) { // Check if response.data exists
        setPackageData(response.data.packageDetails);
        setReviewSummary(response.data.reviewSummary);
      } else {
        setError("Failed to load package details. Invalid server response.");
      }
    } catch (error) {
      console.error("Error fetching package details:", error);
      setError("Failed to load package details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Function to render rating stars
  const renderRatingStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    // Add filled stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={`star-${i}`} size={20} className="fill-yellow-400 text-yellow-400" />
      );
    }
    
    // Add half star if needed
    if (hasHalfStar) {
      stars.push(
        <span key="half-star" className="relative">
          <Star size={20} className="text-gray-300" />
          <Star size={20} className="absolute top-0 left-0 fill-yellow-400 text-yellow-400 w-1/2 overflow-hidden" />
        </span>
      );
    }
    
    // Add empty stars
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-star-${i}`} size={20} className="text-gray-300" />
      );
    }
    
    return stars;
  };

  // Function to render review summary bar
  const renderReviewBar = (type, count, total) => {
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
    
    return (
      <div className="flex items-center gap-3 mb-2">
        <span className="text-gray-700 w-24">{type}</span>
        <div className="flex-1 bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full" 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <span className="text-gray-600 text-sm">{count}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-blue-50 py-12">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center bg-white rounded-2xl p-8 shadow-md animate-pulse">
            <div className="inline-flex items-center gap-2 text-indigo-600">
              <div className="animate-spin h-6 w-6 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
              <p className="text-lg font-medium">Loading package details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-blue-50 py-12">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="bg-red-50 rounded-2xl p-8 shadow-md text-center">
            <p className="text-red-600 font-medium">{error}</p>
            <button
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              onClick={() => navigate(-1)}
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!packageData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-blue-50 py-12">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="bg-red-50 rounded-2xl p-8 shadow-md text-center">
            <p className="text-red-600 font-medium">Package details not found</p>
            <button
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              onClick={() => navigate('/search')}
            >
              Back to Search
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-blue-50 py-12">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to search results</span>
        </button>
        
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Package Header with Image Carousel */}
          <div className="relative">
            {/* Image Carousel */}
            <div className="relative h-96">
              {processedImages && processedImages.length > 0 ? (
                <>
                  <div className="h-full w-full">
                    <img
                      src={processedImages[currentImageIndex]}
                      alt={`${packageData.name} - image ${currentImageIndex + 1}`}
                      className="w-full h-96 object-cover"
                    />
                  </div>
                  {/* Carousel navigation buttons */}
                  {processedImages.length > 1 && (
                    <>
                      <button
                        onClick={() => setCurrentImageIndex(prev => prev === 0 ? processedImages.length - 1 : prev - 1)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                        aria-label="Previous image"
                      >
                        <ChevronLeft size={24} />
                      </button>
                      <button
                        onClick={() => setCurrentImageIndex(prev => (prev + 1) % processedImages.length)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                        aria-label="Next image"
                      >
                        <ChevronRight size={24} />
                      </button>
                      {/* Image indicators */}
                      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                        {processedImages.map((_, index) => (
                          <button
                            key={`indicator-${index}`}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-2.5 h-2.5 rounded-full transition-colors ${
                              index === currentImageIndex ? 'bg-white' : 'bg-white/50 hover:bg-white/80'
                            }`}
                            aria-label={`Go to image ${index + 1}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                // Fallback when no images are available
                <div className="w-full h-96 bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center">
                  <span className="text-gray-500 text-xl font-medium">No Images Available</span>
                </div>
              )}
            </div>
            
            {/* Overlay with package info */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
              <h1 className="text-3xl font-bold mb-2">{packageData.name}</h1>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <MapPin size={18} />
                  <span>{packageData.Listing?.city || 'N/A'}, {packageData.Listing?.country || 'N/A'}</span>
                </div>
    
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {renderRatingStars(packageData.rating || 0)}
                  </div>
                  <span>{packageData.rating ? packageData.rating.toFixed(1) : "No rating"}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Package Content */}
          <div className="p-6 md:p-8">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Main details column */}
              <div className="md:col-span-2 space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold mb-4">About this package</h2>
                  <p className="text-gray-700">
                    {packageData.description || "Experience an unforgettable journey with this amazing holiday package. Enjoy beautiful sights, delicious local cuisine, and create memories that will last a lifetime."}
                  </p>
                </div>
                
                {/* Review Summary Section */}
                {reviewSummary && (
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h2 className="text-2xl font-semibold mb-4">Guest Reviews</h2>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="bg-blue-600 text-white text-2xl font-bold rounded-lg p-3 flex items-center justify-center w-16 h-16">
                        {packageData.rating ? packageData.rating.toFixed(1) : "N/A"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {renderRatingStars(packageData.rating || 0)}
                        </div>
                        <p className="text-gray-600">Based on {reviewSummary.Total} reviews</p>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      {renderReviewBar("Excellent", reviewSummary.Excellent || 0, reviewSummary.Total || 0)}
                      {renderReviewBar("Very Good", reviewSummary.Very_Good || 0, reviewSummary.Total || 0)}
                      {renderReviewBar("Good", reviewSummary.Good || 0, reviewSummary.Total || 0)}
                      {renderReviewBar("Poor", reviewSummary.Poor || 0, reviewSummary.Total || 0)}
                    </div>
                  </div>
                )}
                
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Itinerary</h2>
                  <div className="space-y-4">
                    {packageData.itinerary ? (
                      <div dangerouslySetInnerHTML={{ __html: packageData.itinerary }} />
                    ) : (
                      <p className="text-gray-500 italic">Detailed itinerary not available</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Vendor Information</h2>
                  <p className="text-gray-700">
                    <span className="font-medium">Provider:</span> {packageData.Listing?.Vendor?.name || "Information not available"}<br/>
                    <span className="font-medium">Email:</span> {packageData.Listing?.Vendor?.email || "Information not available"}
                  </p>
                </div>
              </div>
              
              {/* Booking details sidebar */}
              <div>
                <div className="bg-blue-50 rounded-xl p-6 sticky top-6 shadow-md">
                  <h3 className="text-xl font-semibold mb-4 text-gray-800">Booking Information</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between py-2 border-b border-blue-100">
                      <span className="text-gray-600">Price:</span>
                      <span className="font-bold text-blue-600">
                      {packageData.isdiscount ? (
                          <span>₹{(packageData.price - packageData.discount).toFixed(2)}</span>
                        ) : (
                          <span>₹{packageData.price.toFixed(2)}</span>
                        )}  
                      </span>
                    </div>
                    {packageData.isdiscount && (
                      <div className="flex justify-between py-2 border-b border-blue-100">
                        <span className="text-gray-600">Original Price:</span>
                        <span className="line-through text-gray-500">₹{packageData.price.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-2 border-b border-blue-100">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">{packageData.duration}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-blue-100">
                      <span className="text-gray-600">Start Date:</span>
                      <span className="font-medium">{new Date(packageData.startTime).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-blue-100">
                      <span className="text-gray-600">End Date:</span>
                      <span className="font-medium">{new Date(packageData.leavingTime).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-blue-100">
                      <span className="text-gray-600">Travelers:</span>
                      <span className="font-medium">{packageData.visitors}</span>
                    </div>
                  </div>
                  <button className="w-full mt-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-lg transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 font-medium">
                    Book Now
                  </button>
                  {packageData.isdiscount && (
                    <p className="mt-4 text-green-600 text-sm font-medium text-center">
                      Save {packageData.percentageDiscount}% with this special offer!
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageDetail;