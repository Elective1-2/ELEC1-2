import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "../css/Signup.css";

function Signup() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSecretCode, setShowSecretCode] = useState(false);
  
  const [formData, setFormData] = useState({
    email: "",
    google_sub: "",
    full_name: "",
    phone: "",
    role: "driver",
    secret_code: "",
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
      
      if (verified) {
        console.log("Email verified by Google");
      }
    } else {
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

    const phoneRegex = /^[0-9+\-\s()]{10,15}$/;
    if (!phoneRegex.test(formData.phone)) {
      setError("Please enter a valid phone number");
      setLoading(false);
      return;
    }

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
        localStorage.setItem("token", response.data.token);
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
    <div className="signup-root">
      <div className="signup-page">
        <div className="signup-card">
          <h1 className="signup-card-title">COMPLETE ACCOUNT</h1>
          <p className="signup-subtitle">
            Google has verified your email. Just a few more details.
          </p>

          {error && (
            <div className="signup-error">
              {error}
            </div>
          )}

          <form className="signup-form" onSubmit={handleSubmit}>
            {/* Email - Readonly */}
            <div className="signup-input-wrap">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                readOnly
                disabled
                value={formData.email}
                className="signup-input signup-input-readonly"
                placeholder="Email address"
              />
            </div>

            {/* Full Name */}
            <div className="signup-input-wrap">
              <input
                id="full_name"
                name="full_name"
                type="text"
                autoComplete="name"
                value={formData.full_name}
                onChange={handleChange}
                className="signup-input"
                placeholder="Full Name"
              />
            </div>

            {/* Phone Number */}
            <div className="signup-input-wrap">
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                required
                value={formData.phone}
                onChange={handleChange}
                className="signup-input"
                placeholder="Phone Number"
              />
            </div>

            {/* Role Selection */}
            <div className="signup-input-wrap">
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="signup-select"
              >
                <option value="driver">Driver</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Secret Code with Eye Button */}
            <div className="signup-input-wrap">
              <input
                id="secret_code"
                name="secret_code"
                type={showSecretCode ? "text" : "password"}
                required
                value={formData.secret_code}
                onChange={handleChange}
                className="signup-input"
                placeholder="Secret Code"
              />
              <button 
                type="button"
                className="signup-eye-btn" 
                onClick={() => setShowSecretCode(!showSecretCode)}
              >
                {showSecretCode ? "🙈" : "👁"}
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="signup-submit-btn"
            >
              {loading ? "Creating account..." : "COMPLETE SIGNUP"}
            </button>

            {/* Login Link */}
            <div className="signup-footer">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="signup-link"
              >
                Already have an account? Sign in
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Signup;