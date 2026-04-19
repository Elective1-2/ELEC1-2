//todo: frontend/src/auth/Signup.jsx or Signup.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

function Signup() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    email: "",
    google_sub: "",
    full_name: "",
    phone: "",
    role: "driver", // default role
    secret_code: "",  // ADD THIS LINE
  });

  // Extract Google data from URL on component mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const email = params.get("email");
    const googleSub = params.get("google_sub");
    const name = params.get("name");
    const verified = params.get("verified") === "true";

    if (email && googleSub) {
      setFormData({
        ...formData,
        email: email,
        google_sub: googleSub,
        full_name: name || "",
      });
      
      // Optional: Show toast that email is pre-verified by Google
      if (verified) {
        console.log("Email verified by Google");
      }
    } else {
      // No Google data - redirect to login
      navigate("/login");
    }
  }, [location, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation
    if (!formData.email || !formData.google_sub) {
      setError("Missing authentication data. Please try logging in again.");
      setLoading(false);
      return;
    }

    if (!formData.phone) {
      setError("Phone number is required");
      setLoading(false);
      return;
    }

    // Phone number validation (basic)
    const phoneRegex = /^[0-9+\-\s()]{10,15}$/;
    if (!phoneRegex.test(formData.phone)) {
      setError("Please enter a valid phone number");
      setLoading(false);
      return;
    }

    // Add this validation
    if (!formData.secret_code) {
      setError("Secret code is required for registration");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/register-google`,
        {
          email: formData.email,
          google_sub: formData.google_sub,
          full_name: formData.full_name,
          phone: formData.phone,
          role: formData.role,
          secret_code: formData.secret_code,
        }
      );

      if (response.data.success) {
        // Save JWT token
        localStorage.setItem("token", response.data.token);
        
        // Optionally set cookie if you prefer cookie-based auth
        // (your backend already sets HttpOnly cookie, but this is for frontend state)
        
        // Redirect to dashboard
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Signup error:", err);
      if (err.response?.status === 403) {
        setError(err.response.data.error || "Invalid secret code. Registration denied.");
      } else if (err.response?.status === 409) {
        setError("An account with this email already exists. Please login instead.");
        setTimeout(() => navigate("/login"), 3000);
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Failed to create account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Complete your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Google has verified your email. Just a few more details.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                readOnly
                disabled
                value={formData.email}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-500 bg-gray-100 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="full_name" className="sr-only">
                Full Name
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                autoComplete="name"
                value={formData.full_name}
                onChange={handleChange}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Full Name"
              />
            </div>
            <div>
              <label htmlFor="phone" className="sr-only">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                required
                value={formData.phone}
                onChange={handleChange}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Phone Number"
              />
            </div>
            <div>
              <label htmlFor="role" className="sr-only">
                Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              >
                <option value="driver">Driver</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="secret_code" className="sr-only">
              Secret Code
            </label>
            <input
              id="secret_code"
              name="secret_code"
              type="password"
              required
              value={formData.secret_code}
              onChange={handleChange}
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Secret Code (required)"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating account..." : "Complete Signup"}
            </button>
          </div>

          <div className="text-sm text-center">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Already have an account? Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;