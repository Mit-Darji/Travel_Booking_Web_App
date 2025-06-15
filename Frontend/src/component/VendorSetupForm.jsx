import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const VendorSetupForm = () => {
    const [formData, setFormData] = useState({
        businessName: "",
        country: "India", // Default to India
        address: "",
        city: ""
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
   
    const countries = [
        'India',
        'United States',
        'United Kingdom',
        'Canada',
        'Australia',
        'Germany',
        'France'
    ];

    // useEffect(() => {
    //     try {
    //         const vendorData = localStorage.getItem("vendorData");
    //         const vendorProfile = localStorage.getItem("vendorProfile");
        
            
    //         if (!vendorData) {
             
    //             navigate("/");
                
    //         }

    //         if(vendorData && vendorProfile){
    //             navigate('/vendor-dashboard');
    //         }
            
    //         // Try to parse the profile to verify it's valid JSON
           
    //     } catch (error) {
    //         console.error("Error in useEffect:", error);
    //         // If there's an error parsing the profile, stay on setup form
    //     }
    // },);

    const validateForm = () => {
        const newErrors = {};
        if (!formData.businessName.trim()) newErrors.businessName = "Business name is required";
        if (!formData.country) newErrors.country = "Country is required";
        if (!formData.address.trim()) newErrors.address = "Address is required";
        if (!formData.city.trim()) newErrors.city = "City is required";
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validateForm();
    
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
    
        setIsSubmitting(true);
    
        try {
            const vendorData = JSON.parse(localStorage.getItem("vendorData"));
            
            const response = await axios.post(
                "http://localhost:5001/api/auth/vendor-setup",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${vendorData.token}`
                    }
                }
            );
    
            console.log("Axios post request complete, response:", response);
    
            if (response.status === 200) {
                // Create a complete profile object
                const profileData = {
                    businessName: formData.businessName,
                    country: formData.country,
                    address: formData.address,
                    city: formData.city,
                   
                };
                
                // Save it to localStorage
                localStorage.setItem("vendorProfile", JSON.stringify(profileData));
                
                // Verify it was properly saved 
                // Small delay to ensure localStorage is updated
                
                    navigate("/vendor-dashboard");
                
            }
        } catch (error) {
            console.error("Submission failed:", error);
            alert("Error submitting form: " + (error.response?.data?.message || "Unknown error"));
        } finally {
            setIsSubmitting(false);
        }
    };
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: "" }));
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
            <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/95 backdrop-blur-md p-6 rounded-2xl shadow-2xl w-[420px] relative border border-gray-200"
            >
                <h2 className="text-2xl font-bold mb-6 text-center">Business Details Setup</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Business Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Business Name *
                        </label>
                        <input
                            type="text"
                            name="businessName"
                            className={`w-full border ${
                                errors.businessName ? "border-red-500" : "border-gray-300"
                            } rounded-lg p-2 shadow-md outline-none text-sm bg-white`}
                            value={formData.businessName}
                            onChange={handleChange}
                            placeholder="Enter business name"
                        />
                        {errors.businessName && (
                            <p className="text-red-500 text-xs mt-1">{errors.businessName}</p>
                        )}
                    </div>

                    {/* Country */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Country *
                        </label>
                        <select
                            name="country"
                            className={`w-full border ${
                                errors.country ? "border-red-500" : "border-gray-300"
                            } rounded-lg p-2 shadow-md outline-none text-sm bg-white`}
                            value={formData.country}
                            onChange={handleChange}
                        >
                            {countries.map((country) => (
                                <option key={country} value={country}>
                                    {country}
                                </option>
                            ))}
                        </select>
                        {errors.country && (
                            <p className="text-red-500 text-xs mt-1">{errors.country}</p>
                        )}
                    </div>

                    {/* Address */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Address *
                        </label>
                        <input
                            type="text"
                            name="address"
                            className={`w-full border ${
                                errors.address ? "border-red-500" : "border-gray-300"
                            } rounded-lg p-2 shadow-md outline-none text-sm bg-white`}
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="Street address, landmark"
                        />
                        {errors.address && (
                            <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                        )}
                    </div>

                    {/* City */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            City *
                        </label>
                        <input
                            type="text"
                            name="city"
                            className={`w-full border ${
                                errors.city ? "border-red-500" : "border-gray-300"
                            } rounded-lg p-2 shadow-md outline-none text-sm bg-white`}
                            value={formData.city}
                            onChange={handleChange}
                            placeholder="Enter city"
                        />
                        {errors.city && (
                            <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full mt-6 py-3 rounded-lg text-sm font-bold text-white shadow-lg transition-all duration-300 ${
                            isSubmitting
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 hover:shadow-xl"
                        }`}
                    >
                        {isSubmitting ? "Submitting..." : "Complete Setup"}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default VendorSetupForm;