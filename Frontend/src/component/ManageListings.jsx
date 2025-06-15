import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  HomeIcon,
  GiftIcon,
  BuildingIcon,Star
} from 'lucide-react';

const ManageListings = () => {
  const [activeTab, setActiveTab] = useState('Hotels');
  const [listings, setListings] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [editingListingId, setEditingListingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  
  const token = JSON.parse(localStorage.getItem('vendorData'))?.token;

  const listingConfig = {
    Hotels: {
      icon: BuildingIcon,
      fields: [
        { name: 'city', type: 'text', label: 'City', required: true },
        { name: 'country', type: 'text', label: 'Country', required: true },
        { name: 'name', type: 'text', label: 'Hotel Name', required: true },
        { name: 'pricePerNight', type: 'number', label: 'Price per Night', required: true },
        { name: 'discountPerNight', type: 'number', label: 'Discount per Night' },
        { name: 'location', type: 'text', label: 'Hotel Location', required: true },
        { name: 'amenities', type: 'textarea', label: 'Key Amenities' },
        { name: 'description', type: 'textarea', label: 'Description'},
        { name: 'checkInTime', type: 'time', label: 'Check-in Time' , required: true},
        { name: 'checkOutTime', type: 'time', label: 'Check-out Time', required: true },
        { name: 'availableRooms', type: 'number', label: 'Total Rooms', required: true },
        { name: 'activeStatus', type: 'checkbox', label: 'Active Status', defaultValue: true },
        { name: 'Packagephotos', type: 'file', label: 'Thumbnail Image', required: true },
        { name: 'Packageimages', type: 'file', label: 'Hotel Images', required: true, multiple: true },
      ]
    },
    HomestayAndVilla: {
      icon: HomeIcon,
      fields: [
        { name: 'name', type: 'text', label: 'Homestay Name', required: true },
        { name: 'pricePerNight', type: 'number', label: 'Price per Night', required: true },
        { name: 'capacity', type: 'number', label: 'Guest Capacity', required: true },
        { name: 'location', type: 'text', label: 'Homestay Location', required: true },
        { name: 'amenities', type: 'textarea', label: 'Amenities & Facilities' },
        { name: 'checkInTime', type: 'date', label: 'Check-in Time' },
        { name: 'checkOutTime', type: 'date', label: 'Check-out Time' },
        { name: 'image', type: 'file', label: 'Property Image' }
      ]
    },
    HolidayPackage: {
      icon: GiftIcon,
      fields: [
        { name: 'city', type: 'text', label: 'City', required: true },
        { name: 'country', type: 'text', label: 'Country', required: true },
        { name: 'name', type: 'text', label: 'Package Name', required: true },
        { name: 'price', type: 'number', label: 'Total Price', required: true },
        { name: 'discount', type: 'number', label: 'Discount', required: false },
        { name: 'location', type: 'text', label: 'Location', required: true },
        { name: 'description', type: 'textarea', label: 'Description'},
        { name: 'itinerary', type: 'textarea', label: 'Detailed Itinerary' },
        { name: 'startTime', type: 'date', label: 'Start Date' },
        { name: 'leavingTime', type: 'date', label: 'End Date' },
        { name: 'activeStatus', type: 'checkbox', label: 'Active Status', defaultValue: true },
        { name: 'Packagephotos', type: 'file', label: 'Thumbnail Image', required: true },
        { name: 'Packageimages', type: 'file', label: 'Package Images', required: true, multiple: true },
      ]
    }
  };

  useEffect(() => {
    fetchListings();
  }, [activeTab]);

  const fetchListings = async () => {
    setIsLoading(true);
    try {
      const endpoint = `http://localhost:5001/api/Dashboard/Vendor_Dashboard/Display_${activeTab}`;
      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Handle different response structures
      const data = ['HolidayPackage', 'Hotels'].includes(activeTab)
        ? activeTab === 'HolidayPackage' 
          ? response.data.holidayPackages 
          : response.data.Hotels || response.data // Assuming the hotel data might have a similar structure
        : response.data;
        
      setListings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching listings:', error);
      setListings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files, type, checked } = e.target;
    
    if (type === 'file') {
      if (name === 'Packageimages') {
        // Multiple package images
        setFormData((prev) => ({
          ...prev,
          [name]: files
        }));
      } else if (name === 'Packagephotos') {
        // Single thumbnail image
        setFormData((prev) => ({
          ...prev,
          [name]: files?.[0]
        }));
      } else {
        // Handle other file inputs
        setFormData((prev) => ({
          ...prev,
          [name]: files?.[0]
        }));
      }
    } else if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === 'date') {
      setFormData((prev) => ({ ...prev, [name]: value }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    listingConfig[activeTab].fields.forEach(field => {
      if (field.required && !formData[field.name] && !editingId) {
        // Skip file validation on edit
        if (field.type === 'file' && editingId) return;
        newErrors[field.name] = `${field.label} is required`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      let endpoint, method, headers;
      const formDataToSend = new FormData();
      
      // Handle editing for hotels and holiday packages with consistent approach
      if (editingId && (activeTab === 'HolidayPackage' || activeTab === 'Hotels')) {
        const originalListing = listings.find(p => p.id === editingId);
        
        if (activeTab === 'HolidayPackage') {
          endpoint = `http://localhost:5001/api/EditListing/editHolidayPackage`;
          method = 'put';
          headers = {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
            'id': editingId,
            'listingId': editingListingId,
            'city': originalListing.city,
            'HolidayPackageName': originalListing.name || originalListing.holidayPackageName
          };
        } else if (activeTab === 'Hotels') {
          endpoint = `http://localhost:5001/api/EditListing/editHotel`;
          method = 'put';
          headers = {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
            'id': editingId,
            'listingId': editingListingId,
            'location': originalListing.location,
            'hotelName': originalListing.name || originalListing.hotelName
          };
        }
        
        // Append all form data to FormData
        for (const key in formData) {
          if (key === 'Packageimages' && formData[key]) {
            // Multiple package images
            Array.from(formData[key]).forEach(file => {
              formDataToSend.append('Packageimages', file);
            });
          }
          else if (key === 'Packagephotos' && formData[key]) {
            // Thumbnail image
            formDataToSend.append('Packagephotos', formData[key]);
          }
          else {
            // Append other form data
            formDataToSend.append(key, formData[key]);
          }
        }
        
        const response = await axios.put(endpoint, formDataToSend, {
          headers,
          // Ensure proper content type for file upload
          transformRequest: [formData => formData]
        });
        
        if (response.status === 200) {
          setIsModalOpen(false);
          setEditingId(null);
          setEditingListingId(null);
          fetchListings();
        }
        return;
      }
      
      // Handle creation of new listings
      if (editingId) {
        endpoint = `http://localhost:5001/api/${activeTab}/${editingId}`;
        method = 'put';
      } else {
        endpoint = `http://localhost:5001/api/addListing/add${activeTab}`;
        method = 'post';
      }
      
      for (const key in formData) {
        if (key === 'Packageimages' && formData[key]) {
          Array.from(formData[key]).forEach(file => {
            formDataToSend.append(key, file);
          });
        }
        else if (key === 'Packagephoto' && formData[key]) {
          // Thumbnail photo
          formDataToSend.append('Packagephotos', formData[key]);
        } else {
          formDataToSend.append(key, formData[key]);
        }
      }
      
      const response = await axios({
        method,
        url: endpoint,
        data: method === 'put' ? formData : formDataToSend,
        headers: {
          Authorization: `Bearer ${token}`,
          ...headers
        },
      });
      
      if ([200, 201].includes(response.status)) {
        setIsModalOpen(false);
        setEditingId(null);
        setEditingListingId(null);
        fetchListings();
      }
    } catch (error) {
      console.error('Error saving listing:', error);
      alert(`Error: ${error.response?.data?.message || 'Failed to save listing'}`);
    }
  };

  // Fetch details for both hotels and holiday packages
  const fetchListingDetails = async (id, listingId) => {
    try {
      let endpoint;
      
      if (activeTab === 'HolidayPackage') {
        endpoint = 'editPackageGetData';
      } else if (activeTab === 'Hotels') {
        endpoint = 'editHotelGetData';
      } else {
        // For other types, handle differently
        const listing = listings.find(item => item.id === id);
        setFormData(listing || {});
        setEditingId(id);
        setIsModalOpen(true);
        return;
      }
      
      const response = await axios.get(`http://localhost:5001/api/EditListing/${endpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'id': id,
          'listingId': listingId
        }
      });
      
      if (response.status === 200) {
        // Format data for form inputs
        const listingData = activeTab === 'HolidayPackage' 
          ? response.data.holidayPackage 
          : response.data.Hotel || response.data;
     
         
        setFormData({
          ...listingData,
          // Add common fields that might need formatting
          city: listingData.city || '',
          country: listingData.country || '',
          startTime: listingData.startTime?.split('T')[0] || '',
          leavingTime: listingData.leavingTime?.split('T')[0] || '',
          checkInTime: listingData.checkInTime || '',
          checkOutTime: listingData.checkOutTime || '',
          
        });
        
        setEditingId(id);
        setEditingListingId(listingId);
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error(`Error fetching ${activeTab} details:`, error);
      alert(`Failed to load ${activeTab} details`);
    }
  };
  
  const renderListingsTable = () => {
    if (isLoading) {
      return <div className="text-center py-8">Loading listings...</div>;
    }
    
    if (listings.length === 0) {
      return <div className="text-center py-8">No listings found. Add your first listing!</div>;
    }
    
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
          <span key="half-star" className="relative inline-block w-[16px]">
            <Star size={16} className="text-gray-300" />
            <span className="absolute top-0 left-0 w-1/2 overflow-hidden">
              <Star size={16} className="fill-yellow-400 text-yellow-400" />
            </span>
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
    
      return <div className="flex space-x-1">{stars}</div>;
    };
    
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {listings.map((listing) => (
              <tr key={listing.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  {listing.name || listing.holidayPackageName || listing.hotelName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {listing.city || listing.location}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    listing.status || listing.activeStatus ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {listing.status || listing.activeStatus ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {renderRatingStars(listing.rating || 0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap flex items-center space-x-2">
                  <button
                    onClick={() => {
                      if (['HolidayPackage', 'Hotels'].includes(activeTab)) {
                        fetchListingDetails(listing.id, listing.listingId);
                      } else {
                        setFormData(listing);
                        setEditingId(listing.id);
                        setIsModalOpen(true);
                      }
                    }}
                    className="text-blue-500 hover:text-blue-700 p-1 rounded transition-colors"
                    aria-label="Edit listing"
                  >
                    <PencilIcon size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(listing.id, listing)}
                    className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                    aria-label="Delete listing"
                  >
                    <TrashIcon size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const handleDelete = async (id, listing) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        // Consistent deletion approach for holiday packages and hotels
        if (activeTab === 'HolidayPackage') {
          await axios.delete(`http://localhost:5001/api/EditListing/DeleteHolidayPackage`, {
            headers: { Authorization: `Bearer ${token}` },
            data: {
              city: listing.city,
              HolidayPackageName: listing.holidayPackageName || listing.name
            }
          });
        } else if (activeTab === 'Hotels') {
          // Using the same pattern for hotels
          await axios.delete(`http://localhost:5001/api/EditListing/DeleteHotel`, {
            headers: { 
              Authorization: `Bearer ${token}`,
              'id': id,
              'listingId': listing.listingId
            }
          });
        } else {
          // For other types, just send the ID
          await axios.delete(`http://localhost:5001/api/EditListing/Delete${activeTab}/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
        }
        
        fetchListings();
      } catch (error) {
        console.error('Error deleting listing:', error);
        alert('Failed to delete listing. Please try again.');
      }
    }
  };

  const renderFormFields = () => {
    return listingConfig[activeTab].fields.map((field) => {
      // Skip file input when editing
      if (field.type === 'file' && editingId) {
        return (
          <div key={field.name} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
            </label>
            <input
              type="file"
              name={field.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-blue-600 hover:file:bg-blue-100"
              multiple={field.multiple}
            />
            <p className="text-xs text-gray-500 mt-1">Leave empty to keep current images</p>
          </div>
        );
      }
      
      return (
        <div key={field.name} className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {field.label}
          </label>
          
          {field.type === 'textarea' ? (
            <textarea
              name={field.name}
              value={formData[field.name] || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
            />
          ) : field.type === 'file' ? (
            <input
              type="file"
              name={field.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-blue-600 hover:file:bg-blue-100"
              multiple={field.multiple}
            />
          ) : field.type === 'checkbox' ? (
            <div className="flex items-center">
              <input
                type="checkbox"
                name={field.name}
                checked={formData[field.name] === undefined ? field.defaultValue : Boolean(formData[field.name])}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-600">
                {formData[field.name] === undefined ? (field.defaultValue ? 'Active' : 'Inactive') : (formData[field.name] ? 'Active' : 'Inactive')}
              </span>
            </div>
          ) : (
            <input
              type={field.type}
              name={field.name}
              value={formData[field.name] || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
          
          {errors[field.name] && (
            <p className="text-red-500 text-xs mt-1">{errors[field.name]}</p>
          )}
        </div>
      );
    });
  };

  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Manage Listings</h2>
          <button
            onClick={() => {
              setIsModalOpen(true);
              setEditingId(null);
              setEditingListingId(null);
              setFormData({});
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon size={20} /> Add New Listing
          </button>
        </div>
        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          {Object.keys(listingConfig).map((tab) => {
            const TabIcon = listingConfig[tab].icon;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2 pb-3 px-4 capitalize ${
                  activeTab === tab
                   ? 'border-b-2 border-blue-600 text-blue-600'
                   : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <TabIcon size={18} />
                {tab === 'HomestayAndVilla' ? 'Homestays & Villas' : tab === 'HolidayPackage' ? 'Holiday Packages' : tab}
              </button>
            );
          })}
        </div>
        {renderListingsTable()}
      </div>
      
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">
                {editingId ? 'Edit' : 'Add New'} {activeTab === 'HomestayAndVilla' ? 'Homestay & Villa' : activeTab === 'HolidayPackage' ? 'Holiday Package' : activeTab === 'Hotels' ? 'Hotel' : ''}
              </h3>
            </div>
            <div className="max-h-[70vh] overflow-y-auto p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {renderFormFields()}
                <div className="flex justify-end gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingId(null);
                      setEditingListingId(null);
                      setFormData({});
                    }}
                    className="px-4 py-2 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingId ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageListings;