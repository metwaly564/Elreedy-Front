import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { UserContext } from "../../Context/UserContext";
import { useNavigate } from "react-router-dom";

const Checkout = () => {
  const navigate = useNavigate();
  const { userlogin } = useContext(UserContext);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedOnlinePayment, setSelectedOnlinePayment] = useState(null);
  const [cities, setCities] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [extraPhones, setExtraPhones] = useState([]);
  const [paymentType, setPaymentType] = useState("");

  // Form data with values from localStorage
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    phone: "",
    address: "",
    promocode: localStorage.getItem("promoCode") || "",
    cityId: localStorage.getItem("selectedCity") || "",
    zoneId: localStorage.getItem("selectedZone") || "",
    paymentMethod: "",
    onlinePaymentMethod: null,
  });

  const [deliveryFee, setDeliveryFee] = useState(0);

  useEffect(() => {
    if (!userlogin) {
      toast.error("Please login to proceed to checkout");
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const [paymentResponse, citiesResponse, zonesResponse] = await Promise.all([
          axios.get("http://127.0.0.1:3000/api/v1/orders/payment-methods"),
          axios.get("http://127.0.0.1:3000/api/v1/places/city"),
          axios.get("http://127.0.0.1:3000/api/v1/places/zone"),
        ]);

        setPaymentMethods(paymentResponse.data);
        setCities(citiesResponse.data);
        setZones(zonesResponse.data);

        // Set delivery fee if zone is already selected
        const savedZoneId = localStorage.getItem("selectedZone");
        if (savedZoneId) {
          const zone = zonesResponse.data.find(z => z.id.toString() === savedZoneId);
          if (zone) setDeliveryFee(zone.deliveryFee);
        }

        setLoading(false);
      } catch (error) {
        toast.error("Failed to load checkout data");
        console.error("Error:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [userlogin, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCityChange = (e) => {
    const cityId = e.target.value;
    setFormData(prev => ({ ...prev, cityId, zoneId: "" }));
    localStorage.setItem("selectedCity", cityId);
  };

  const handleZoneChange = (e) => {
    const zoneId = e.target.value;
    setFormData(prev => ({ ...prev, zoneId }));
    localStorage.setItem("selectedZone", zoneId);
    
    const zone = zones.find(z => z.id.toString() === zoneId);
    if (zone) setDeliveryFee(zone.deliveryFee);
  };

  const handlePaymentTypeChange = (type) => {
    setPaymentType(type);
    setSelectedOnlinePayment(null);
  };

  const handleOnlinePaymentSelect = (methodId) => {
    setSelectedOnlinePayment(methodId === selectedOnlinePayment ? null : methodId);
  };

  const addExtraPhone = () => {
    setExtraPhones([...extraPhones, ""]);
  };

  const removeExtraPhone = (index) => {
    const updatedPhones = [...extraPhones];
    updatedPhones.splice(index, 1);
    setExtraPhones(updatedPhones);
  };

  const handleExtraPhoneChange = (index, value) => {
    const updatedPhones = [...extraPhones];
    updatedPhones[index] = value;
    setExtraPhones(updatedPhones);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!paymentType) {
      toast.error("Please select a payment type");
      return;
    }

    if (paymentType === "online" && !selectedOnlinePayment) {
      toast.error("Please select a payment method");
      return;
    }

    try {
      const orderData = {
        ...formData,
        extraPhones: extraPhones.filter(phone => phone.trim() !== ""),
        cityId: parseInt(formData.cityId),
        zoneId: parseInt(formData.zoneId),
        paymentMethod: paymentType,
        onlinePaymentMethod: paymentType === "online" ? parseInt(selectedOnlinePayment) : null
      };

      const response = await axios.post(
        "http://127.0.0.1:3000/api/v1/orders/order",
        orderData,
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Token": userlogin,
          },
        }
      );

      toast.success("Order placed successfully!");
      
      // Clear stored data
      localStorage.removeItem("promoCode");
      localStorage.removeItem("selectedCity");
      localStorage.removeItem("selectedZone");
      
      if (response.data.data?.url) {
        window.location.href = response.data.data.url;
      } else {
        toast.success("Your Order has been placed successfully!");
        navigate("/");
      }
    } catch (error) {
      console.error("Order error:", error);
      toast.error(error.response?.data?.message || "Failed to place order");
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-xl font-bold text-right mb-4">Checkout</h2>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="lg:w-2/3 lg:order-2">
          <div className="bg-white rounded-lg shadow-sm p-4 border">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-right text-sm text-gray-600 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstname"
                    value={formData.firstname}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-right"
                    required
                  />
                </div>
                <div>
                  <label className="block text-right text-sm text-gray-600 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastname"
                    value={formData.lastname}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-right"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-right text-sm text-gray-600 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-right"
                  pattern="[0-9]{10,15}"
                  required
                />
              </div>

              <div>
                <label className="block text-right text-sm text-gray-600 mb-1">
                  Extra Phones
                </label>
                <div className="space-y-2">
                  {extraPhones.map((phone, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => handleExtraPhoneChange(index, e.target.value)}
                        className="flex-1 border border-gray-300 rounded px-3 py-2 text-right"
                        pattern="[0-9]{10,15}"
                      />
                      <button
                        type="button"
                        onClick={() => removeExtraPhone(index)}
                        className="bg-red-500 text-white px-3 py-2 rounded text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addExtraPhone}
                    className="bg-gray-200 text-gray-800 px-3 py-2 rounded text-sm"
                  >
                    Add More Phones
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-right text-sm text-gray-600 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-right"
                  required
                />
              </div>

              <div>
                <label className="block text-right text-sm text-gray-600 mb-1">
                  Promo Code
                </label>
                <input
                  type="text"
                  name="promocode"
                  value={formData.promocode}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-right bg-gray-100"
                  readOnly
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-right text-sm text-gray-600 mb-1">
                    City
                  </label>
                  <select
                    name="cityId"
                    value={formData.cityId}
                    onChange={handleCityChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-right bg-gray-100"
                    required
                    disabled={!!formData.cityId}
                  >
                    <option value="">Select City</option>
                    {cities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-right text-sm text-gray-600 mb-1">
                    Zone
                  </label>
                  <select
                    name="zoneId"
                    value={formData.zoneId}
                    onChange={handleZoneChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-right bg-gray-100"
                    required
                    disabled={!formData.cityId || !!formData.zoneId}
                  >
                    <option value="">Select Zone</option>
                    {zones
                      .filter((zone) => zone.cityId.toString() === formData.cityId)
                      .map((zone) => (
                        <option key={zone.id} value={zone.id}>
                          {zone.name} - {zone.deliveryFee} جنيه
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div>
                <label className="block text-right text-sm text-gray-600 mb-1">
                  Payment Type
                </label>
                <div className="flex gap-4 mb-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="paymentType"
                      value="cod"
                      checked={paymentType === "cod"}
                      onChange={() => handlePaymentTypeChange("cod")}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                    />
                    Cash on Delivery
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="paymentType"
                      value="online"
                      checked={paymentType === "online"}
                      onChange={() => handlePaymentTypeChange("online")}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                    />
                    Online Payment
                  </label>
                </div>

                {paymentType === "online" && (
                  <>
                    <label className="block text-right text-sm text-gray-600 mb-1">
                      Select Payment Method
                    </label>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {paymentMethods.map((method) => (
                        <div
                          key={method.paymentId}
                          className={`p-3 border rounded cursor-pointer flex flex-col items-center ${
                            selectedOnlinePayment === method.paymentId.toString()
                              ? "border-red-600 bg-red-50"
                              : "border-gray-200"
                          }`}
                          onClick={() => handleOnlinePaymentSelect(method.paymentId.toString())}
                        >
                          <img
                            src={method.logo}
                            alt={method.name_en}
                            className="h-12 object-contain mb-2"
                          />
                          <span className="text-sm text-center">
                            {method.name_ar}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-between border-t pt-2 font-bold">
                <span className="text-left">{deliveryFee} جنيه</span>
                <span className="text-right">Delivery Fee:</span>
              </div>

              <button
                type="submit"
                className="w-full bg-red-600 text-white py-2 rounded text-sm font-bold hover:bg-red-700 mt-4"
              >
                Submit Order
              </button>
            </form>
          </div>
        </div>

        <div className="lg:w-1/3 lg:order-1">
          <div className="bg-white rounded-lg shadow-sm p-4 border">
            <h3 className="text-lg font-bold text-right mb-3">Order Summary</h3>
            {/* Add order summary details here */}
            <div className="mt-4">
              <h3 className="text-right text-sm font-medium mb-2">
                Payment Security
              </h3>
              <p className="text-right text-xs text-gray-600">
                Your payment information is processed securely.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;