import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaGoogle } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = ({ onClose, onLoginSuccess }) => {
    const [accountType, setAccountType] = useState("personal");
    const [formData, setFormData] = useState({ email: "", password: "", username: "", mobile: "" });
    const [errors, setErrors] = useState({ email: "", password: "", general: "" });
    const navigate = useNavigate();

    // Validation functions
    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validatePassword = (password) => /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/.test(password);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        let newValue = value;

        if (name === "mobile") {
            newValue = value.replace(/\D/g, "").slice(0, 10); // Only allow numbers & max 10 digits
        }

        setFormData((prev) => ({ ...prev, [name]: newValue }));

        // Validation
        if (name === "email") {
            setErrors((prev) => ({ ...prev, email: validateEmail(value) ? "" : "Invalid email format." }));
        }
        if (name === "password") {
            setErrors((prev) => ({ ...prev, password: validatePassword(value) ? "" : "Password must be 8+ characters, 1 capital & 1 special character." }));
        }
    };

    const handleLogin = async () => {
        setErrors({ email: "", password: "", general: "" });
    
        // Validate email
        if (!validateEmail(formData.email)) {
            setErrors((prev) => ({ ...prev, email: "Invalid email format." }));
            return;
        }
    
        // Check required fields
        if (accountType === "personal" && (!formData.email || !formData.password || !formData.username)) {
            alert("Please fill in all fields.");
            return;
        }
    
        if (accountType === "business" && (!formData.email || !formData.password || !formData.username || formData.mobile.length !== 10)) {
            alert("Please fill in all fields correctly.");
            return;
        }
    
        try {
            const url = `http://localhost:5001/api/auth/${accountType === "personal" ? "user-email-auth" : "vendor-emailauth"}`;
            const requestData = {
                email: formData.email,
                password: formData.password,
                name: formData.username,
                mobile: formData.mobile
            };
    
            const response = await axios.post(url, requestData);
          
            if (response.status === 200) {
                if (accountType === "business") {
                    const { Username, token, vendorId, isProfileComplete } = response.data;
    
                    localStorage.setItem("vendorData", JSON.stringify({
                        name: Username,
                        email: formData.email,
                        phone: formData.mobile,
                        token,
                        vendorId,
                        isProfileComplete
                    }));
                    
                    // If we're in the booking flow, call onLoginSuccess instead of navigating
                    if (onLoginSuccess) {
                        onLoginSuccess();
                    } else {
                        if(isProfileComplete){
                            navigate('/vendor-dashboard');
                        } else {
                            navigate('/vendor-setup');
                        }
                    }
                } else {
                    // Store username directly as a string for personal accounts
                    const { Username, token } = response.data;

                    localStorage.setItem("userData", JSON.stringify({
                        name: Username || formData.username,
                        email: formData.email,
                        phone: formData.mobile || "",
                        token,
                    }));

                    
                    // If we're in the booking flow, call onLoginSuccess instead of navigating
                    if (onLoginSuccess) {
                        onLoginSuccess();
                    } else {
                        navigate("/");
                    }
                }
            } else {
                alert("Unexpected response: " + response.status);
            }
        } catch (error) {
            console.error("Login failed:", error.response || error);
            alert("Login failed: " + (error.response?.data?.message || "Unknown error"));
        }
    };
    
    const isDisabled =
        errors.email ||
        errors.password ||
        !formData.email ||
        !formData.password ||
        !formData.username ||
         formData.mobile.length !== 10;

    // Handle close modal - either through button or when clicking outside the modal
    const handleCloseModal = () => {
        if (onClose) {
            onClose();
        } else {
            navigate(-1);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
            <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="bg-white/95 backdrop-blur-md p-6 rounded-2xl shadow-2xl w-[420px] relative border border-gray-200"
            >
                <button onClick={handleCloseModal} className="absolute top-4 right-4 text-gray-500 hover:text-black text-2xl">
                    <IoClose className="cursor-pointer" />
                </button>

                <div className="flex justify-between bg-gray-200 p-2 m-3 rounded-full mb-5">
                    {["personal", "business"].map((type) => (
                        <button
                            key={type}
                            className={`flex-1 py-2 text-sm font-semibold rounded-full transition-all duration-300 cursor-pointer ${
                                accountType === type ? "bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-lg" : "text-gray-600"
                            }`}
                            onClick={() => {
                                setAccountType(type);
                                // Reset form data and errors when switching account types
                                setFormData({ email: "", password: "", username: "", mobile: "" });
                                setErrors({ email: "", password: "", general: "" });
                            }}
                        >
                            {type.toUpperCase()} ACCOUNT
                        </button>
                    ))}
                </div>

                <div className="space-y-4">
                    {["email", "username", "password"].map((field) => (
                        <div key={field}>
                            <label className="block text-sm font-medium text-gray-700">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                            <input
                                type={field === "password" ? "password" : "text"}
                                name={field}
                                placeholder={`Enter ${field}`}
                                className="w-full border border-gray-300 rounded-lg p-2 shadow-md outline-none text-sm"
                                value={formData[field]}
                                onChange={handleChange}
                            />
                            {errors[field] && <p className="text-red-500 text-xs mt-1">{errors[field]}</p>}
                        </div>
                    ))}

                   
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
                            <input
                                type="tel"
                                name="mobile"
                                placeholder="Enter Mobile Number"
                                className="w-full border border-gray-300 rounded-lg p-2 shadow-md outline-none text-sm"
                                value={formData.mobile}
                                onChange={handleChange}
                                maxLength={10}
                            />
                        </div>
                 
                </div>

                <button
                    className={`w-full mt-5 py-3 rounded-lg text-sm font-bold transition-all duration-300 ${
                        isDisabled
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-lg hover:scale-105"
                    }`}
                    onClick={handleLogin}
                    disabled={isDisabled}
                >
                    CONTINUE
                </button>

                {/* {accountType === "personal" && (
                    <>
                        <div className="text-center mt-4 text-sm text-gray-500 font-medium">Or Login/Signup With</div>
                        <div className="flex justify-center space-x-5 mt-3">
                            <button className="flex items-center justify-center p-2 border rounded-full shadow-lg hover:scale-110 transition-all duration-300">
                                <FaGoogle className="text-blue-500 text-lg" />
                            </button>
                        </div>
                    </>
                )} */}

                <p className="text-xs text-gray-500 text-center mt-4">
                    By proceeding, you agree to our <span className="text-blue-500 cursor-pointer">Privacy Policy</span>, <span className="text-blue-500 cursor-pointer">User Agreement</span>, and <span className="text-blue-500 cursor-pointer">T&Cs</span>.
                </p>
            </motion.div>
        </div>
    );
};

export default Login;