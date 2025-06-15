import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaHotel, FaSignOutAlt, FaEdit, FaBriefcase, FaMapMarkerAlt, FaUser, FaPhone, FaEnvelope } from "react-icons/fa";
import axios from 'axios';
import ManageListing from './ManageListings';
const VendorDashboard = () => {
  const navigate = useNavigate();
  const [vendorProfile, setVendorProfile] = useState({
    name: "",
    email: "",
    phone: "",
    businessName: "",
    country: "India",
    address: "",
    city: ""
  });

  const [editMode, setEditMode] = useState(false);
  const [errors, setErrors] = useState({});
  
  const countries = ['India', 'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France'];

  useEffect(() => {
    const vendorData = JSON.parse(localStorage.getItem("vendorData")) || {};
    const vendorProfileData = JSON.parse(localStorage.getItem("vendorProfile")) || {};
    
    if (vendorData.email) {
      setVendorProfile({
        name: vendorData.name || "",
        email: vendorData.email || "",
        phone: vendorData.phone || "",
        ...vendorProfileData
      });
    } else {
      navigate("/");
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVendorProfile(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: "" }));
  };

  
  const validateForm = () => {
    const newErrors = {};
    // Personal Info Validation
    if (!vendorProfile.name.trim()) newErrors.name = "Name is required";
    if (!/^\d{10}$/.test(vendorProfile.phone)) newErrors.phone = "Invalid phone number";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(vendorProfile.email)) newErrors.email = "Invalid email address";

    // Business Info Validation
    if (!vendorProfile.businessName.trim()) newErrors.businessName = "Business name is required";
    if (!vendorProfile.address.trim()) newErrors.address = "Address is required";
    if (!vendorProfile.city.trim()) newErrors.city = "City is required";
    if (!vendorProfile.country) newErrors.country = "Country is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
  
    const personalData = {
      name: vendorProfile.name,
      email: vendorProfile.email,
      phone: vendorProfile.phone,
    };
  
    const businessData = {
      businessName: vendorProfile.businessName,
      address: vendorProfile.address,
      city: vendorProfile.city,
      country: vendorProfile.country,
    };
  
    // Retrieve the current vendorData, including the token
    const storedVendorData = JSON.parse(localStorage.getItem("vendorData")) || {};
    const token = storedVendorData.token;
  
    if (!token) {
      console.error("Token not found, redirecting to login.");
      navigate("/");
      return;
    }
  
    try {
      const response = await axios.put(
        "http://localhost:5001/api/Edit/vendorProfile",
        { ...personalData, ...businessData },
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );
  
      if (response.status === 200) {
        // Keep token intact while updating stored vendor data
        localStorage.setItem("vendorProfile", JSON.stringify(businessData));
        localStorage.setItem("vendorData", JSON.stringify({ ...storedVendorData, ...personalData }));
  
        setEditMode(false); // Exit edit mode
      } else {
        console.error("Error: Could not update profile.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("vendorData");
    
   
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FaHotel className="text-blue-600" />
            Dashboard
          </h1>
          <button onClick={handleLogout} className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
            <FaSignOutAlt className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {editMode ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <FaEdit className="text-blue-600" />
              Edit Profile
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <FaUser className="text-blue-600" />
                  Personal Information
                </h3>
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <input
                    name="name"
                    value={vendorProfile.name}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-400 rounded-lg"
                  />
                  {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    name="email"
                    type="email"
                    value={vendorProfile.email}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-400 rounded-lg"
                  />
                  {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Phone</label>
                  <input
                    name="phone"
                    value={vendorProfile.phone}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-400  rounded-lg"
                  />
                  {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
                </div>
              </div>

              {/* Business Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <FaBriefcase className="text-blue-600" />
                  Business Information
                </h3>
                <div>
                  <label className="block text-sm font-medium mb-2">Business Name</label>
                  <input
                    name="businessName"
                    value={vendorProfile.businessName}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-400 rounded-lg"
                  />
                  {errors.businessName && <p className="text-red-500 text-sm">{errors.businessName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Address</label>
                  <input
                    name="address"
                    value={vendorProfile.address}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-400 rounded-lg"
                  />
                  {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">City</label>
                    <input
                      name="city"
                      value={vendorProfile.city}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-400 rounded-lg"
                    />
                    {errors.city && <p className="text-red-500 text-sm">{errors.city}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Country</label>
                    <select
                      name="country"
                      value={vendorProfile.country}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-400 rounded-lg"
                    >
                      {countries.map(country => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-4">
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Changes
              </button>
              <button
                onClick={() => setEditMode(false)}
                className="px-6 py-2 border border-gray-400 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                
                Profile Overview
              </h2>
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <FaEdit />
                Edit Profile
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Info Display */}
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 h-full rounded-lg">
                  <h3 className="font-medium mb-4 flex items-center gap-2">
                    <FaUser className="text-blue-600" />
                    Personal Information
                  </h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm text-gray-500">Full Name</dt>
                      <dd className="font-medium">{vendorProfile.name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Email</dt>
                      <dd className="font-medium">{vendorProfile.email}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Phone</dt>
                      <dd className="font-medium">{vendorProfile.phone}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* Business Info Display */}
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 h-full rounded-lg ">
                  <h3 className="font-medium mb-4 flex items-center gap-2">
                    <FaBriefcase className="text-blue-600" />
                    Business Information
                  </h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm text-gray-500">Business Name</dt>
                      <dd className="font-medium">{vendorProfile.businessName}</dd>
                    </div>
                    <div>
                  
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Location</dt>
                      <dd className="font-medium">
                        <span className="flex items-center gap-1">
                          <FaMapMarkerAlt className="text-blue-600" />
                          {`${vendorProfile.address}, ${vendorProfile.city}, ${vendorProfile.country}`}
                        </span>
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        )}
        <ManageListing/>
      </main>
      
    </div>
  );
};

export default VendorDashboard;