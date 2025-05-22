import React, { useContext, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { UserContext } from '../../Context/UserContext';
import logo from "../../assets/Alreedy.png";

export default function PasswordReset() {
  let { TempPhone, TempOtp } = useContext(UserContext);
  const [isLoading, setIsLoading] = useState(false);
  const [Apierror, setApierror] = useState("");
  const navigate = useNavigate();

  const validationSchema = Yup.object().shape({
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .required('Password is required'),
    rePassword: Yup.string()
      .oneOf([Yup.ref('password')], 'Passwords must match')
      .required('Please confirm your password'),
  });

  const formik = useFormik({
    initialValues: {
      password: '',
      rePassword: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      
      try {
        await axios.post(
          'http://127.0.0.1:3000/api/v1/auth/forgetReset', 
          {
            phone: TempPhone,  // Using phone from context
            otp: TempOtp,      // Using OTP from context
            password: values.password
          }
        );
        
        toast.success('Password reset successfully!');
        navigate('/login');
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to reset password';
        setApierror(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 space-y-6 lg:min-w-[450px] md:min-w-[380px] z-10">
        <div className="flex flex-col items-center">
          <img src={logo} className="w-32 h-auto mb-4" alt="Company Logo" />
          <h2 className="text-center text-xl font-bold tracking-tight text-gray-900">
            Reset Password
          </h2>
      
        </div>

        {Apierror && (
          <div className="p-3 rounded-lg w-full text-white font-bold text-sm sm:text-base bg-red-600 text-center">
            {Apierror}
          </div>
        )}

        <form onSubmit={formik.handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-5">
            {/* New Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                placeholder="New Password"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.password}
              />
              {formik.touched.password && formik.errors.password ? (
                <p className="mt-1 text-sm text-red-600">{formik.errors.password}</p>
              ) : null}
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
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                placeholder="Confirm New Password"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.rePassword}
              />
              {formik.touched.rePassword && formik.errors.rePassword ? (
                <p className="mt-1 text-sm text-red-600">{formik.errors.rePassword}</p>
              ) : null}
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
                Resetting...
              </>
            ) : 'Reset Password'}
          </button>
        </form>

        <div className="text-center text-sm">
          <Link
            to="/login"
            className="font-medium text-red-600 hover:text-red-700 transition-colors duration-200"
          >
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}