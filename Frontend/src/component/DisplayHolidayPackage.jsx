import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DisplayHolidayPackage = () => {
  const [holidayPackages, setHolidayPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHolidayPackages = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          'http://localhost:5001/api/allListing/allHolidayPackages'
        );
        setHolidayPackages(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load holiday packages');
        setLoading(false);
        console.error('Error fetching holiday packages:', err);
      }
    };
  
    fetchHolidayPackages();
  }, []);

  if (loading) return <div className="text-center py-8">Loading holiday packages...</div>;
  if (error) return <div className="text-center py-8 text-red-600">{error}</div>;
  if (holidayPackages.length === 0) return <div className="text-center py-8">No holiday packages available</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Holiday Packages</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {holidayPackages.map((listing) => (
          <div key={listing.id}>
            {listing.HolidayPackages.map((pkg) => (
              <div key={pkg.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                {pkg.images && pkg.images.length > 0 ? (
                  <img 
                    src={pkg.images} 
                    alt={pkg.name} 
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">No image available</span>
                  </div>
                )}
                
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl font-semibold">{pkg.name}</h2>
                    <div className="flex flex-col items-end">
                      {pkg.isdiscount ? (
                        <>
                          <span className="text-lg font-bold text-green-600">
                            ${(pkg.price - pkg.discount).toFixed(2)}
                          </span>
                          <span className="text-sm text-gray-500 line-through">
                            ${pkg.price.toFixed(2)}
                          </span>
                          <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                            {pkg.percentageDiscount}% OFF
                          </span>
                        </>
                      ) : (
                        <span className="text-lg font-bold">${pkg.price.toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-2">
                    <div><span className="font-medium">Location:</span> {listing.city}, {listing.country}</div>
                    <div><span className="font-medium">Duration:</span> {pkg.duration}</div>
                    <div className="flex justify-between">
                      <div><span className="font-medium">Start:</span> {new Date(pkg.startTime).toLocaleDateString()}</div>
                      <div><span className="font-medium">End:</span> {new Date(pkg.leavingTime).toLocaleDateString()}</div>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-4 line-clamp-3">{pkg.description}</p>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                      For {pkg.visitors} visitors
                    </span>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DisplayHolidayPackage;