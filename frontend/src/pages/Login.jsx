import { useForm } from "react-hook-form";
import { FaEnvelope, FaLock, FaGoogle, FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast,ToastContainer } from "react-toastify";
import { useUser } from "../../context/UserContext.jsx";

export default function LoginPage() {
  const { register, reset, handleSubmit, formState: { errors } } = useForm();
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useUser();
  const { user } = useUser();

  const onSubmit = async (form) => {
    reset();
    console.log("Login Data:", form);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form),
        credentials: "include"
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Invalid credentials");
      } else {
        setUser({user:data.username,id:data.id});
        console.log(user);
        navigate(data.role == "user"? "/dashboard":"/ngo_dashboard");
    }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-300 to-green-100 flex items-center justify-center px-4">
      <div className="bg-white shadow-2xl rounded-3xl p-10 w-full max-w-md">
        <h2 className="text-3xl font-extrabold text-center text-green-800 mb-8">Welcome Back 👋</h2>
        
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="relative">
            <FaEnvelope className="absolute top-3 left-3 text-green-600" />
            <input
              type="email"
              placeholder="Email"
              className="w-full pl-10 p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
              {...register("email", { required: "Email is required." })}
            />
            {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
          </div>

          <div className="relative">
            <FaLock className="absolute top-3 left-3 text-green-600" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full pl-10 pr-10 p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
              {...register("password", { required: "Password is required." })}
            />
            <div
              className="absolute top-3 right-3 text-green-600 cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </div>
            {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-2 rounded-md transition"
          >
            Login
          </button>
        </form>

        <p className="text-center text-green-800 mt-6">
          Don't have an account?{" "}
          <button
            className="text-green-700 font-semibold hover:underline ml-1"
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </button>
        </p>
        <ToastContainer />
      </div>
    </div>
  );
}
