import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const GoogleRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log("GoogleRedirect component mounted!")
    console.log("Current location:", location)
    console.log("Full URL:", window.location.href)
    console.log("Search params:", location.search)
    
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    
    console.log("Extracted token:", token)
    
    if (token) {
      console.log("Token found! Storing in localStorage...")
      localStorage.setItem("token", token);
      localStorage.setItem("userToken", token);
      console.log("Token stored. Navigating to /acceuil...")
      navigate("/acceuil");
    } else {
      console.log("No token found. Redirecting to login...")
      navigate('/login')
    }
  }, [location, navigate]);

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-[#1A1A2E]">
      <div className="flex flex-col items-center gap-4">
        <img src='/assets/logo3.png' alt="logo" className="w-[200px] h-[200px] animate-pulse" />
        <p className="text-[#3DDC97] text-xl font-semibold">Connexion en cours...</p>
      </div>
    </div>
  );
};

export default GoogleRedirect;
