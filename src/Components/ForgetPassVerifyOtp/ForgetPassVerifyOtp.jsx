import React, { useState, useEffect, useContext } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { UserContext } from '../../Context/UserContext';
import logo from "../../assets/Alreedy.png";

export default function ForgetPassVerifyOtp() {
  let { TempPhone, TempOtp, setTempOtp } = useContext(UserContext);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [Apierror, setApierror] = useState("");
  const navigate = useNavigate();

  // Countdown timer for resend OTP
  useEffect(() => {
    let timer;
    if (resendDisabled && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      setResendDisabled(false);
      setCountdown(30);
    }
    return () => clearTimeout(timer);
  }, [resendDisabled, countdown]);

  const validationSchema = Yup.object().shape({
    otp: Yup.string()
      .matches(/^[0-9]{6}$/, 'OTP must be 6 digits')
      .required('OTP is required'),
  });

  const formik = useFormik({
    initialValues: {
      otp: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      
      try {
        await axios.post(
          'http://127.0.0.1:3000/api/v1/auth/forgetVerefy', 
          {
            phone: TempPhone,  // Using phone from context
            otp: values.otp
          }
        );
        
        // Store the OTP in TempOtp state before navigation
        setTempOtp(values.otp);
        toast.success('OTP verified successfully');
        navigate('/PasswordReset');
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to verify OTP';
        setApierror(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
  });

  const handleResendOTP = async () => {
    if (!TempPhone) {
      toast.error('Phone number not found');
      return;
    }

    setIsResending(true);
    
    try {
      await axios.post('http://127.0.0.1:3000/api/v1/auth/forgetSend', {
        phone: TempPhone  // Using phone from context
      });
      
      toast.success('New OTP sent to your phone');
      setResendDisabled(true);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to resend OTP';
      setApierror(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 space-y-6 lg:min-w-[450px] md:min-w-[380px] z-10">
        <div className="flex flex-col items-center">
          <img src={logo} className="w-32 h-auto mb-4" alt="Company Logo" />
         
          <p className="mt-2 text-sm text-gray-600 text-center">
            We've sent an OTP to {TempPhone || 'your phone number'}
          </p>
        </div>

        {Apierror && (
          <div className="p-3 rounded-lg w-full text-white font-bold text-sm sm:text-base bg-red-600 text-center">
            {Apierror}
          </div>
        )}

        <form onSubmit={formik.handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-5">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                OTP Code
              </label>
              <input
                id="otp"
                name="otp"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength="6"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                placeholder="Enter 6-digit OTP"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.otp}
              />
              {formik.touched.otp && formik.errors.otp ? (
                <p className="mt-1 text-sm text-red-600">{formik.errors.otp}</p>
              ) : null}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={resendDisabled || !TempPhone || isResending}
              className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors duration-200 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              {isResending ? (
                <>
                  <i className="fas fa-spinner animate-spin mr-2"></i>
                  Resending...
                </>
              ) : resendDisabled ? (
                `Resend OTP in ${countdown}s`
              ) : (
                'Resend OTP'
              )}
            </button>
          </div>

          <button
            type="submit"
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 transform hover:-translate-y-0.5"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner animate-spin mr-2"></i>
                Verifying...
              </>
            ) : (
              'Verify OTP'
            )}
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