import React, { useContext, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { UserContext } from "../../Context/UserContext";
import toast from "react-hot-toast";
import logo from "../../assets/White-Alreedy.png";

export default function Login() {
  let { setuserlogin } = useContext(UserContext);
  let navigate = useNavigate();
  const [Apierror, setApierror] = useState("");
  const [isLoading, setisLoading] = useState(false);

  let Validation = Yup.object().shape({
    identifier: Yup.string()
      .required("Phone number is required")
      .matches(/^01[0125][0-9]{8}$/, "Enter a valid Egyptian phone number"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
  });

  async function handleLogin(values) {
    setisLoading(true);
    try {
      const response = await axios.post(
        "http://127.0.0.1:3000/api/v1/auth/admin-login",
        {
          identifier: values.identifier,
          password: values.password,
        }
      );

      localStorage.setItem("userToken", response.data.accessToken);
      setuserlogin(response.data.accessToken);

      toast.success("Login successful!");
      navigate("/AdminDashboard");
      window.dispatchEvent(new Event("auth-change"));
    } catch (error) {
      console.error(
        "Login error:",
        error.response?.data?.message || error.message
      );
      const errorMessage =
        error.response?.data?.message || "Login failed. Please try again.";
      setApierror(errorMessage);
      toast.error(errorMessage);
    } finally {
      setisLoading(false);
    }
  }

  let formik = useFormik({
    initialValues: {
      identifier: "",
      password: "",
    },
    onSubmit: handleLogin,
    validationSchema: Validation,
  });

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-purple-400 to-purple-600 flex justify-center items-center p-4 font-alexandria font-light">
        <div className="flex justify-center items-center rounded-full bg-purple-500 absolute self-start justify-self-center p-0 m-0 mt-5 w-16 h-16 z-10 top-[16vh]">
          <img className="w-[80%]" src={logo} alt="" />
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl shadow-lg p-8 w-full max-w-md relative">
          <div className="absolute -top-16 left-1/2 transform -translate-x-1/2">
            <div className="w-16 h-16 rounded-full bg-purple-300/80 backdrop-blur-sm flex items-center justify-center shadow-md">
              <img
                src={logo}
                className="w-12 h-12 object-contain"
                alt="Company Logo"
              />
            </div>
          </div>

          <div className="mt-4 mb-6 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-purple-300 mx-auto mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <h2 className="text-white text-xl font-semibold">
              Welcome to Admin Panel
            </h2>
          </div>

          {Apierror && (
            <div className="mb-4 p-3 rounded-lg w-full text-white font-bold text-sm bg-red-500/90 text-center backdrop-blur-sm">
              {Apierror}
            </div>
          )}

          <form onSubmit={formik.handleSubmit} className="space-y-4">
            <div>
              <input
                id="identifier"
                name="identifier"
                type="text"
                placeholder="Phone Number"
                value={formik.values.identifier}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full px-4 py-2 rounded-md border border-purple-300 bg-white/20 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent"
              />
              {formik.errors.identifier && formik.touched.identifier && (
                <p className="mt-1 text-sm text-red-200">
                  {formik.errors.identifier}
                </p>
              )}
            </div>

            <div>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full px-4 py-2 rounded-md border border-purple-300 bg-white/20 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent"
              />
              {formik.errors.password && formik.touched.password && (
                <p className="mt-1 text-sm text-red-200">
                  {formik.errors.password}
                </p>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-purple-500 text-white py-2 rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-300 flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
