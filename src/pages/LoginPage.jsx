import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import api from "../api/axios";
import { LogIn } from "lucide-react";

const LoginPage = () => {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useUser();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/login", credentials);

      // Invalid credentials
      if (res.data.statusCode === 401) {
        setError(res.data.message || "Invalid email or password");
        setLoading(false);
        return;
      }

      // Account locked scenario
      if (res.data.statusCode === 403) {
        setError(
          res.data.message ||
            "Account locked after 3 failed login attempts. Please contact the administrator."
        );
        setLoading(false);
        return;
      }

      // No token returned
      if (!res.data.token) {
        setError("Invalid email or password");
        setLoading(false);
        return;
      }

      // Successful login
      login(res.data);
      setLoading(false);
      navigate("/");

    } catch (err) {

      // Handle locked account from backend
      if (err.response?.status === 403) {
        setError(
          "Account locked after 3 failed login attempts. Please contact the administrator."
        );
      } else {
        setError(err.response?.data?.message || "Login failed");
      }

      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md border border-gray-200">
        <div className="text-center mb-6">
          <LogIn className="w-12 h-12 mx-auto text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900 mt-4">Welcome Back</h1>
          <p className="text-gray-600">Log in to your PlatformHub account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={credentials.email}
              onChange={(e) =>
                setCredentials({ ...credentials, email: e.target.value })
              }
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2
                         focus:ring-blue-500 focus:outline-none transition"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={credentials.password}
              onChange={(e) =>
                setCredentials({ ...credentials, password: e.target.value })
              }
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2
                         focus:ring-blue-500 focus:outline-none transition"
              required
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-md
                       hover:bg-blue-700 transition disabled:opacity-50 flex
                       justify-center items-center"
          >
            {loading ? (
              <span className="animate-pulse">Logging in...</span>
            ) : (
              <>
                <LogIn className="w-5 h-5 mr-2" />
                Login
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;