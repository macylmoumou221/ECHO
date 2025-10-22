"use client"

import { useState, useEffect } from "react"
import { FiUser } from "react-icons/fi"
import PasswordInput from "./PasswordInput"
import { Link, useNavigate } from "react-router-dom"
import { useLanguage } from "../context/LanguageContext"
import useApiRequest from "../hooks/useApiRequest"
import GoogleSignInButton from "./GoogleSignInButton"
import axios from "axios"

const LoginForm = () => {
  const { data, error, loading, refetch, BASE_URL } = useApiRequest()
  const [user, setUser] = useState()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()
  const { language } = useLanguage()

  const showNotification = (message, isSuccess = true) => {
    const notification = document.createElement("div")
    notification.className = `fixed top-4 right-4 ${isSuccess ? "bg-[#3DDC97]" : "bg-[#FF6B6B]"} text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center`
    notification.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        ${
          isSuccess
            ? '<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />'
            : '<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />'
        }
      </svg>
      <span>${message}</span>
    `
    document.body.appendChild(notification)
    setTimeout(() => {
      notification.classList.add("opacity-0", "transition-opacity", "duration-500")
      setTimeout(() => document.body.removeChild(notification), 500)
    }, 3000)
  }

  const handleGoogleLogin = () => {
    // Open the new window for Google login
    window.location.href = `${BASE_URL}/api/auth/google`
  }

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Prevent multiple submissions
    if (isSubmitting) {
      console.log("Already submitting, ignoring duplicate submission")
      return
    }
    
    setIsSubmitting(true)
    console.log("Form data submitted:", formData)
    console.log("Backend URL:", BASE_URL)

    try {
      // Make the POST request directly using axios
      console.log("Sending request to:", `${BASE_URL}/api/auth/login`)
      const response = await axios.post(`${BASE_URL}/api/auth/login`, formData, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 second timeout
      })

      console.log("Response received:", response)

      // If the response is successful, update the user state
      if (response && response.data) {
        const result = response.data
        setUser(result)

        console.log("User data received:", result)

        const token = result.token
        console.log("Token:", token, "User:", result)

        // Store the token in localStorage (both keys for compatibility)
        localStorage.setItem("token", token)
        localStorage.setItem("userToken", token)
        if (token) {
          showNotification("Connexion réussie!", true)
          setTimeout(() => navigate("/acceuil"), 200)
        }
        // Optionally store user data if returned
        if (result.user) {
          localStorage.setItem("user", JSON.stringify(result.user))
        }
      }
    } catch (error) {
      console.error("Login error FULL:", error)
      console.error("Error response:", error.response)
      console.error("Error message:", error.message)
      console.error("Error code:", error.code)
      
      let errorMessage = "Une erreur s'est produite lors de la connexion."
      
      if (error.code === 'ECONNABORTED') {
        errorMessage = "Le serveur met trop de temps à répondre. Réessayez."
      } else if (error.code === 'ERR_NETWORK') {
        errorMessage = "Impossible de se connecter au serveur. Vérifiez votre connexion."
      } else if (error.response) {
        errorMessage = error.response.data?.message || "Email ou mot de passe invalide."
      } else if (error.request) {
        errorMessage = "Le serveur ne répond pas. Vérifiez votre connexion."
      }
      
      showNotification(errorMessage, false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const checkAuth = () => {
    const token = localStorage.getItem("token")

    if (token) {
      navigate("/acceuil")
    } else {
      // stay on login
    }
  }

  // Run auth check once on mount to avoid heavy work during render
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) navigate('/acceuil')
  }, [])

  return (
    <form className="space-y-6 select-none" onSubmit={handleSubmit}>
      <h1 className="text-2xl text-[#3ddc97] font-bold text-center">{language.login.title}</h1>

      {/* Username Input */}
      <div className="relative border-b border-gray-400">
        <input
          type="text"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="peer w-full bg-transparent outline-none py-2 pr-8 text-white placeholder-transparent"
          placeholder=""
          required
        />
        <label
          className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-300 transition-all duration-200 
               peer-focus:top-0 peer-focus:text-sm peer-focus:text-[#3ddc97] 
               peer-not-placeholder-shown:top-0 peer-not-placeholder-shown:text-sm 
               peer-not-placeholder-shown:text-[#3ddc97]"
        >
          {language.login.username}
        </label>
        <FiUser className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300" />
      </div>

      {/* Password Input */}
      <PasswordInput value={formData.password} onChange={handleChange} />

      {/* Buttons */}
      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full bg-[#3ddc97] py-2 mt-1 rounded-lg text-white font-bold ${
          isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#32c587] cursor-pointer'
        }`}
      >
        {isSubmitting ? 'Connexion...' : language.login.loginButton}
      </button>
      <div className="flex justify-center">
        <GoogleSignInButton onClick={handleGoogleLogin} buttonText={language.signup.googleButton} />
      </div>
      <p className="text-center text-[#5E5E61]">
        {language.login.signupPrompt}{" "}
        <Link to="/signup" className="text-[#2A2A3B] font-bold hover:underline">
          {language.login.signupLink}
        </Link>
      </p>
    </form>
  )
}

export default LoginForm
