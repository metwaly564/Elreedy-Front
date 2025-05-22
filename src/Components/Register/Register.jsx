import React, { useContext, useState } from "react";
import { useFormik } from "formik";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { UserContext } from '../../Context/UserContext';
import toast from "react-hot-toast";
import logo from "../../assets/Alreedy.png";

export default function Register() {
  let { TempPhone, setTempPhone } = useContext(UserContext);
  let navigate = useNavigate();
  const [Apierror, setApierror] = useState("");
  const [isLoading, setisLoading] = useState(false);
  let { userlogin, setuserlogin } = useContext(UserContext);

  async function handleregister(values) {
    setisLoading(true);
    try {
      const response = await axios.post(
        "http://127.0.0.1:3000/api/v1/auth/signup",
        {
          name: values.name,
          email: values.email,
          phone: values.phone,
          password: values.password
        }
      );
  
      console.log("Registration response:", response.data);
      setTempPhone(values.phone);
      toast.success("Registration successful! Please verify your account.");
      navigate("/VerifyOtp");
    } catch (error) {
      console.error("Registration error:", error.response?.data?.message || error.message);
      const errorMessage = error.response?.data?.message || "Registration failed. Please try again.";
      setApierror(errorMessage);
      toast.error(errorMessage);
    } finally {
      setisLoading(false);
    }
  }

  let myvalidation = Yup.object().shape({
    name: Yup.string()
      .min(3, "Name must be at least 3 characters")
      .max(20, "Name must be at most 20 characters")
      .required("Name is required"),
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    phone: Yup.string()
      .matches(/^01[0125][0-9]{8}$/, "Invalid Egyptian phone number")
      .required("Phone number is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
    rePassword: Yup.string()
      .oneOf([Yup.ref("password")], "Passwords must match")
      .required("Please confirm your password"),
  });

  let formik = useFormik({
    initialValues: {
      name: "", 
      email: "",
      phone: "",
      password: "",
      rePassword: "",
    },
    validationSchema: myvalidation,
    onSubmit: handleregister,
  });

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 space-y-6 lg:min-w-[450px] md:min-w-[380px] z-10">
        <div className="flex flex-col items-center">
          <img src={logo} className="w-24 h-auto mb-4" alt="Company Logo" />
          <h2 className="text-center text-base font-semibold tracking-tight text-gray-900">
            Create your account
          </h2>
        </div>

        {Apierror && (
          <div className="p-3 rounded-lg w-full text-white font-bold text-sm sm:text-base bg-red-600 text-center">
            {Apierror}
          </div>
        )}

        <form onSubmit={formik.handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-5">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                required
              />
              {formik.errors.name && formik.touched.name && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                required
              />
              {formik.errors.email && formik.touched.email && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.email}</p>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formik.values.phone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                required
              />
              {formik.errors.phone && formik.touched.phone && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.phone}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                required
              />
              {formik.errors.password && formik.touched.password && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="rePassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                id="rePassword"
                name="rePassword"
                type="password"
                value={formik.values.rePassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                required
              />
              {formik.errors.rePassword && formik.touched.rePassword && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.rePassword}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 transform hover:-translate-y-0.5"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner animate-spin mr-2"></i>
                Registering...
              </>
            ) : (
              "Register"
            )}
          </button>
        </form>

        <div className="text-center text-sm">
          <Link
            to="/login"
            className="font-medium text-red-600 hover:text-red-700 transition-colors duration-200"
          >
            Already have an account? Login now
          </Link>
        </div>
      </div>
    </div>
  );
}