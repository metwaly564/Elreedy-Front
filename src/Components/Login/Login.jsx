import React, { useContext, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { UserContext } from "../../Context/UserContext";
import toast from "react-hot-toast";
import logo from "../../assets/Alreedy.png";

export default function Login() {
  let { userlogin, setuserlogin } = useContext(UserContext);
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

  async function transferCartItems(token) {
    try {
      const guestCartItems = JSON.parse(
        localStorage.getItem("cartItems") || []
      );

      if (guestCartItems.length > 0) {
        // Convert cart items to required format
        const itemsToTransfer = guestCartItems.map((item) => {
          const productId = Object.keys(item)[0];
          return { [productId]: item[productId] };
        });

        await axios.post(
          "http://127.0.0.1:3000/api/v1/carts/cart",
          { productId: itemsToTransfer },
          { headers: { "Access-Token": token } }
        );

        // Clear guest cart after successful transfer
        localStorage.removeItem("cartItems");
        toast.success("Your cart items have been transferred!");
      }
    } catch (error) {
      console.error("Error transferring cart items:", error);
      toast.error("Failed to transfer cart items");
    }
  }

  async function handleLogin(values) {
    setisLoading(true);
    try {
      const response = await axios.post(
        "http://127.0.0.1:3000/api/v1/auth/login",
        {
          identifier: values.identifier,
          password: values.password,
        }
      );

      console.log("Access Token:", response.data.accessToken);

      localStorage.setItem("userToken", response.data.accessToken);
      setuserlogin(response.data.accessToken);

      // Transfer cart items after successful login
      await transferCartItems(response.data.accessToken);

      toast.success("Login successful!");
      navigate("/");
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
    <div className="flex items-center justify-center min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 overflow-hidden ">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 space-y-6 lg:min-w-[450px] md:min-w-[380px] z-10">
        <div className="flex flex-col items-center">
          <img src={logo} className="w-24 h-auto mb-4" alt="Company Logo" />
          <h2 className="text-center text-base font-semibold tracking-tight text-gray-900">
            Sign in to your account
          </h2>
        </div>

        {Apierror && (
          <div className="p-3 rounded-lg w-full text-white font-bold text-sm sm:text-base bg-red-600 text-center">
            {Apierror}
          </div>
        )}

        <form onSubmit={formik.handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-5">
            <div>
              <label
                htmlFor="identifier"
                className="block text-sm font-medium text-gray-700"
              >
                Phone Number
              </label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                value={formik.values.identifier}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="mt-1 font-medium block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[rgb(170,15,18)] focus:border-[rgb(170,15,18)] transition-all duration-200"
                required
              />
              {formik.errors.identifier && formik.touched.identifier && (
                <p
                  className="mt-1 font-semibold text-sm text-red-600"
                  style={{ fontFamily: "Alexandria", fontWeight: 500 }}
                >
                  {formik.errors.identifier}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[rgb(170,15,18)] focus:border-[rgb(170,15,18)] transition-all duration-200"
                required
              />
              {formik.errors.password && formik.touched.password && (
                <p className="mt-1 text-sm text-red-600">
                  {formik.errors.password}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center">
                <input
                  id="remember_me"
                  name="remember_me"
                  type="checkbox"
                  className="h-4 w-4 font-medium Alexandria-500 text-[rgb(170,15,18)] border-gray-300 rounded focus:ring-[rgb(170,15,18)] transition-colors duration-200 cursor-pointer"
                />
                <label
                  htmlFor="remember_me"
                  className="ml-2 block text-sm text-gray-700 cursor-pointer"
                >
                  Remember me
                </label>
              </div>

              <div className="text-sm z-10">
                <Link
                  to="/ForgetPassword"
                  className="font-medium text-[rgb(170,15,18)] hover:text-[rgb(200,15,18)] transition-colors duration-200"
                >
                  Forgot password?
                </Link>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="group font-medium relative w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 transform hover:-translate-y-0.5"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner animate-spin mr-2"></i>
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <button
              onClick={() => {
                navigate("http://127.0.0.1:3000/auth/google");
              }}
              type="button"
              className="w-full inline-flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200 transform hover:-translate-y-0.5"
            >
              <span className="sr-only">Sign in with Google</span>
              <i className="fa-brands fa-google text-xl"></i>
              <span className="ml-2">Google</span>
            </button>
          </div>
        </div>

        <div className="text-center text-sm">
          <Link
            to="/register"
            className="font-medium text-red-600 hover:text-red-700 transition-colors duration-200"
          >
            Don't have an account? Register now
          </Link>
        </div>
      </div>
    </div>
  );
}
