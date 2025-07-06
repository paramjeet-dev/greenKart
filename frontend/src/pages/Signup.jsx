import { useForm } from "react-hook-form";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaLock,
  FaUsers,
  FaHandsHelping,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function SignupPage() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
    setValue,
  } = useForm();

  const [step, setStep] = useState(1);
  const [role, setRole] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [location, setLocation] = useState({
    city: "",
    state: "",
    pinCode: "",
    latitude: "",
    longitude: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          const address = data.address || {};
          const city =
            address.city || address.town || address.village || address.county || "";
          const state = address.state || "";
          const pinCode = address.postcode || "";

          setLocation({
            city,
            state,
            pinCode,
            latitude,
            longitude,
          });

          setValue("city", city);
          setValue("state", state);
          setValue("pinCode", pinCode);
        } catch (error) {
          console.error("Error fetching location:", error);
        }
      });
    }
  }, [setValue]);

  const onFormSubmit = () => {
    setStep(2);
  };

  const handleFinalSignup = async () => {
    if (!role) {
      toast.error("Please select a role.");
      return;
    }

    const fullData = {
      ...watch(),
      role,
      city: watch("city"),
      state: watch("state"),
      pinCode: watch("pinCode"),
      lat: location.latitude,
      lon: location.longitude,
    };

    try {
      setIsSubmitting(true);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fullData),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Something went wrong.");
      } else {
        toast.success("Registration successful! Redirecting to login...");
        reset();
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      }
    } catch (error) {
      toast.error("An error occurred during signup.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const RoleCard = ({ icon: Icon, title, value, description }) => (
    <div
      onClick={() => setRole(value)}
      className={`cursor-pointer border-2 p-4 rounded-lg text-center transition hover:border-green-500 ${
        role === value ? "border-green-600 bg-green-50" : "border-gray-300"
      }`}
    >
      <Icon className="mx-auto text-3xl text-green-600 mb-2" />
      <h4 className="font-semibold text-green-700">{title}</h4>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );

  return (
    <>
      <ToastContainer />
      <div className="min-h-screen bg-gradient-to-br from-green-300 to-green-100 flex items-center justify-center px-4">
        <div className="bg-white shadow-2xl rounded-3xl p-10 w-full max-w-md">
          <h2 className="text-3xl font-extrabold text-center text-green-800 mb-8">
            {step === 1 ? "Join GreenKart 🌱" : "Choose Your Role"}
          </h2>

          {step === 1 ? (
            <form className="space-y-6" onSubmit={handleSubmit(onFormSubmit)}>
              <div className="relative">
                <FaUser className="absolute top-3 left-3 text-green-600" />
                <input
                  type="text"
                  placeholder="Full Name"
                  {...register("name", { required: "Name is required." })}
                  className="w-full pl-10 p-3 border rounded-md"
                />
                {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
              </div>

              <div className="relative">
                <FaEnvelope className="absolute top-3 left-3 text-green-600" />
                <input
                  type="email"
                  placeholder="Email"
                  {...register("email", {
                    required: "Email is required.",
                    pattern: {
                      value: /\S+@\S+\.\S+/,
                      message: "Invalid email format.",
                    },
                  })}
                  className="w-full pl-10 p-3 border rounded-md"
                />
                {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
              </div>

              <div className="relative">
                <FaPhone className="absolute top-3 left-3 text-green-600" />
                <input
                  type="text"
                  placeholder="Phone Number"
                  {...register("phone", {
                    required: "Phone number is required.",
                    pattern: {
                      value: /^\d{10}$/,
                      message: "Phone must be 10 digits.",
                    },
                  })}
                  className="w-full pl-10 p-3 border rounded-md"
                />
                {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>}
              </div>

              <div className="relative">
                <FaLock className="absolute top-3 left-3 text-green-600" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  {...register("password", {
                    required: "Password is required.",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters.",
                    },
                  })}
                  className="w-full pl-10 pr-10 p-3 border rounded-md"
                />
                <div
                  className="absolute top-3 right-3 text-green-600 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </div>
                {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>}
              </div>

              <div className="relative">
                <FaLock className="absolute top-3 left-3 text-green-600" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  {...register("confirmPassword", {
                    required: "Please confirm your password.",
                    validate: (value) =>
                      value === watch("password") || "Passwords do not match.",
                  })}
                  className="w-full pl-10 pr-10 p-3 border rounded-md"
                />
                <div
                  className="absolute top-3 right-3 text-green-600 cursor-pointer"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <div>
                <input
                  type="text"
                  placeholder="City"
                  {...register("city", { required: "City is required." })}
                  className="w-full p-3 border rounded-md"
                />
                {errors.city && <p className="text-sm text-red-500 mt-1">{errors.city.message}</p>}
              </div>

              <div>
                <input
                  type="text"
                  placeholder="State"
                  {...register("state", { required: "State is required." })}
                  className="w-full p-3 border rounded-md"
                />
                {errors.state && <p className="text-sm text-red-500 mt-1">{errors.state.message}</p>}
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Pin Code"
                  {...register("pinCode", { required: "Pin code is required." })}
                  className="w-full p-3 border rounded-md"
                />
                {errors.pinCode && <p className="text-sm text-red-500 mt-1">{errors.pinCode.message}</p>}
              </div>

              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-2 rounded-md"
              >
                Create Account
              </button>
            </form>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <RoleCard
                  icon={FaUsers}
                  title="User"
                  value="user"
                  description="Buy or donate food items easily."
                />
                <RoleCard
                  icon={FaHandsHelping}
                  title="NGO"
                  value="ngo"
                  description="Coordinate food donations for communities."
                />
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="w-1/2 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-md"
                >
                  Back
                </button>
                <button
                  onClick={handleFinalSignup}
                  disabled={isSubmitting}
                  className="w-1/2 bg-green-600 hover:bg-green-700 text-white py-2 rounded-md flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Next"
                  )}
                </button>
              </div>
            </>
          )}

          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-green-600 font-semibold hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
