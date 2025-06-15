import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MapPin, ArrowLeft, Star, ChevronLeft, ChevronRight, Wifi, Coffee, Utensils, Car, Tv, Snowflake } from 'lucide-react';
import Login from './Login'; // Import the Login component

const HotelDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [hotelData, setHotelData] = useState(location.state?.hotelDetails || null);
  const [reviewSummary, setReviewSummary] = useState(null);
  const [loading, setLoading] = useState(!hotelData);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [processedImages, setProcessedImages] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { checkInDate, checkOutDate,rooms } = location.state || {};
  
  const startDate = new Date(checkInDate);
  const endDate = new Date(checkOutDate);
  const nights = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  // Check if user is logged in
  const isLoggedIn = () => {
    const userName = (localStorage.getItem("userData") && JSON.parse(localStorage.getItem("userData")).name);
    return userName;
  };

  // Load Razorpay SDK
  useEffect(() => {
    const loadRazorpayScript = () => {
      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => {
          resolve(true);
        };
        script.onerror = () => {
          resolve(false);
        };
        document.body.appendChild(script);
      });
    };
    
    loadRazorpayScript();
  }, []);

  useEffect(() => {
    // If we don't have the hotel details (e.g., direct URL access), fetch them
    if (!hotelData && id) {
      fetchHotelDetails(id);
    }
  }, [id, hotelData]);

  useEffect(() => {
    // Process images whenever hotelData changes
    if (hotelData) {
      processpackageImages();
    }
  }, [hotelData]);

  const processpackageImages = () => {
    if (!hotelData.packageImages) {
      setProcessedImages([]);
      return;
    }
   
  
    // Handle when packageImages is a string (could be a single URL or comma-separated URLs)
    if (typeof hotelData.packageImages === 'string') {
      // Check if it's a comma-separated string
      if (hotelData.packageImages.includes(',')) {
        setProcessedImages(hotelData.packageImages.split(',').map(url => url.trim()));
      } else {
        // Single image URL
        setProcessedImages([hotelData.packageImages]);
      }
    } 
    // Handle when packageImages is already an array
    else if (Array.isArray(hotelData.packageImages)) {
      setProcessedImages(hotelData.packageImages);
    }
    // Handle any other unexpected format
    else {
      setProcessedImages([]);
    }
  };

  const fetchHotelDetails = async (hotelId) => {
    setLoading(true);
    try {
      // Change to GET request with parameter in URL
      const response = await axios.get(
        `http://localhost:5001/api/SearchListing/hotelViewDetails/${hotelId}`
      );
      
      if (response.data) { // Check if response.data exists
        setHotelData(response.data.hotelDetails);
        setReviewSummary(response.data.reviewSummary);
        // Set the first room as selected by default if rooms are available
        if (response.data.hotelDetails.rooms && response.data.hotelDetails.rooms.length > 0) {
          setSelectedRoom(response.data.hotelDetails.rooms[0]);
        }
      } else {
        setError("Failed to load hotel details. Invalid server response.");
      }
    } catch (error) {
      console.error("Error fetching hotel details:", error);
      setError("Failed to load hotel details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Function to handle booking button click
  const handleBookNowClick = () => {
    if (isLoggedIn()) {
      // User is logged in, proceed with booking
      handlePaymentProcess();
    } else {
      // User is not logged in, show login modal
      setShowLoginModal(true);
    }
  };
  
  // Function to handle payment process after login
  const handlePaymentProcess = async () => {
    try {
      // Check if Razorpay is loaded
      if (!window.Razorpay) {
        alert("Razorpay SDK failed to load. Please try again later.");
        return;
      }
      
      // Calculate amount based on hotel price and stay duration
      const price = hotelData.isdiscount 
        ? (hotelData.pricePerNight - hotelData.discountPerNight)
        : hotelData.pricePerNight;
        
      // Calculate number of nights
      const startDate = new Date(checkInDate);
      const endDate = new Date(checkOutDate);
      const nights = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
      const amount = price * nights * rooms; // Convert to paise for Razorpay
      
      // Get user token
      const getToken = () => {
        const userData = localStorage.getItem("userData");
        if (!userData) return "";
        try {
          const parsed = JSON.parse(userData);
          return parsed.token || "";
        } catch (e) {
          return "";
        }
      };
      
      const token = getToken();
      
      if (!token) {
        alert("Authentication error. Please login again.");
        setShowLoginModal(true);
        return;
      }

      // Create an order
      const orderResponse = await axios.post(
        "http://localhost:5001/api/paymentGatway/create_OrderId",
        {
          amount: amount,
          receipt: "receipt_order_1",
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const { id } = orderResponse.data.order;

      // Initiate Razorpay checkout
      const options = {
        key: "rzp_test_SsUyBnn55ouHMZ",
        // Replace with your Razorpay Key ID
        amount: amount,
        currency: "INR",
        name: "Vishwa Vista Vacations",
        description: "Secure & Easy Online Booking Payment",
        order_id: id,
        handler: async (response) => {
          const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = response;
          
          // Handle payment success
          console.log("Response of payment", response);
          const itemId = hotelData.id; // Using the hotel ID as the item ID
          const listingType = "hotel";
          // Verify payment
          const verifyResponse = await axios.post(
            "http://localhost:5001/api/paymentGatway/verify_Payment",
            {
              razorpay_order_id,
              razorpay_payment_id,
              razorpay_signature,
              itemId,
              listingType
            },
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          
          if (verifyResponse.data.success) {
            alert("Payment verified successfully");
            // Additional logic after successful payment (e.g., create booking record)
          } else {
            alert("Payment verification failed");
          }
        },
        prefill : {
          name:
            (localStorage.getItem("userData") && JSON.parse(localStorage.getItem("userData")).name),
          email:
            (localStorage.getItem("userData") && JSON.parse(localStorage.getItem("userData")).email),
          contact:
            (localStorage.getItem("userData") && JSON.parse(localStorage.getItem("userData")).phone),
        },
        theme: {
          color: "#0D9488",
        },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (error) {
      console.error(error);
      alert("Failed to initiate payment: " + (error.response?.data?.message || error.message));
    }
  };

  // Function to handle login success
  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    // Proceed with booking after successful login
    handlePaymentProcess();
  };

  // Render functions remain the same as in your original code
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

  // Function to render amenity icons
  const renderAmenityIcon = (amenity) => {
    switch(amenity.toLowerCase()) {
      case 'wifi':
      case 'free wifi':
        return <Wifi size={18} />;
      case 'breakfast':
      case 'free breakfast':
        return <Coffee size={18} />;
      case 'restaurant':
        return <Utensils size={18} />;
      case 'parking':
      case 'free parking':
        return <Car size={18} />;
      case 'tv':
      case 'television':
        return <Tv size={18} />;
      case 'ac':
      case 'air conditioning':
        return <Snowflake size={18} />;
      default:
        return null;
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-blue-50 py-12">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center bg-white rounded-2xl p-8 shadow-md animate-pulse">
            <div className="inline-flex items-center gap-2 text-indigo-600">
              <div className="animate-spin h-6 w-6 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
              <p className="text-lg font-medium">Loading hotel details...</p>
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

  if (!hotelData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-blue-50 py-12">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="bg-red-50 rounded-2xl p-8 shadow-md text-center">
            <p className="text-red-600 font-medium">Hotel details not found</p>
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
      {/* Show login modal if needed */}
      {showLoginModal && (
        <Login 
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
      
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
          {/* Hotel Header with Image Carousel */}
          <div className="relative">
            {/* Image Carousel */}
            <div className="relative h-96">
              {processedImages && processedImages.length > 0 ? (
                <>
                  <div className="h-full w-full">
                    <img
                      src={processedImages[currentImageIndex]}
                      alt={`${hotelData.name} - image ${currentImageIndex + 1}`}
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
            
            {/* Overlay with hotel info */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
              <h1 className="text-3xl font-bold mb-2">{hotelData.name}</h1>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <MapPin size={18} />
                  <span>{hotelData.Listing?.city || 'N/A'}, {hotelData.Listing?.country || 'N/A'}</span>
                </div>
    
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {renderRatingStars(hotelData.rating || 0)}
                  </div>
                  <span>{hotelData.rating ? hotelData.rating.toFixed(1) : "No rating"}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Hotel Content */}
          <div className="p-6 md:p-8">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Main details column */}
              <div className="md:col-span-2 space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold mb-4">About this hotel</h2>
                  <p className="text-gray-700">
                    {hotelData.description || "Experience comfort and luxury in this amazing hotel. Enjoy top-notch amenities, excellent service, and create unforgettable memories during your stay."}
                  </p>
                </div>
                
                {/* Amenities Section */}
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Amenities</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {hotelData.amenities ? (
                      typeof hotelData.amenities === 'string' ? 
                        hotelData.amenities.split(',').map((amenity, index) => (
                          <div key={index} className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
                            {renderAmenityIcon(amenity.trim())}
                            <span className="text-gray-700">{amenity.trim()}</span>
                          </div>
                        )) : 
                        Array.isArray(hotelData.amenities) ? 
                          hotelData.amenities.map((amenity, index) => (
                            <div key={index} className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
                              {renderAmenityIcon(amenity)}
                              <span className="text-gray-700">{amenity}</span>
                            </div>
                          )) :
                          <p className="text-gray-500 italic col-span-3">Amenities information not available</p>
                    ) : (
                      <p className="text-gray-500 italic col-span-3">Amenities information not available</p>
                    )}
                  </div>
                </div>
                
                {/* Review Summary Section */}
                {reviewSummary && (
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h2 className="text-2xl font-semibold mb-4">Guest Reviews</h2>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="bg-blue-600 text-white text-2xl font-bold rounded-lg p-3 flex items-center justify-center w-16 h-16">
                        {hotelData.rating ? hotelData.rating.toFixed(1) : "N/A"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {renderRatingStars(hotelData.rating || 0)}
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
                  <h2 className="text-2xl font-semibold mb-4">Vendor Information</h2>
                  <p className="text-gray-700">
                    <span className="font-medium mb-2">Provider:</span> {hotelData.Listing?.Vendor?.name || "Information not available"}<br/>
                    <span className="font-medium">Contact:</span> {hotelData.Listing?.Vendor?.email || "Information not available"}
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
                        {hotelData.isdiscount ? (
                          <span>₹{((hotelData.pricePerNight - hotelData.discountPerNight)*rooms * nights).toFixed(2)}</span>
                        ) : (
                          <span>₹{hotelData.pricePerNight.toFixed(2)}/Night</span>
                        )}
                      </span>
                    </div>
                    {hotelData.isdiscount && (
                      <div className="flex justify-between py-2 border-b border-blue-100">
                        <span className="text-gray-600">Original Price:</span>
                        <span className="line-through text-gray-500">₹{(hotelData.pricePerNight * rooms * nights).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-2 border-b border-blue-100">
                      <span className="text-gray-600">Start Date:</span>
                      <span className="font-medium">{new Date(checkInDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-blue-100">
                      <span className="text-gray-600">End Date:</span>
                      <span className="font-medium">{new Date(checkOutDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-blue-100">
                      <span className="text-gray-600">Check In:</span>
                      <span className="font-medium">{hotelData.checkInTime && new Date(`1970-01-01T${hotelData.checkInTime}`).toLocaleTimeString('en-US', { 
                              hour: '2-digit', minute: '2-digit', hour12: true 
                            })}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-blue-100">
                      <span className="text-gray-600">Check Out:</span>
                      <span className="font-medium">{hotelData.checkOutTime && new Date(`1970-01-01T${hotelData.checkOutTime}`).toLocaleTimeString('en-US', { 
                              hour: '2-digit', minute: '2-digit', hour12: true 
                            })}</span>
                    </div>
                  </div>
                  <button 
                    onClick={handleBookNowClick}
                    className="w-full mt-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-lg transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 font-medium">
                    Book Now
                  </button>
                  {hotelData.isdiscount && (
                    <p className="mt-4 text-green-600 text-sm font-medium text-center">
                      Save {hotelData.percentageDiscountPerNight}% with this special offer!
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

export default HotelDetail;