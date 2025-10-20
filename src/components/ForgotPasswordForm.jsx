"use client"

import { useState } from "react"
import { FiMail } from "react-icons/fi"
import { Link, useNavigate } from "react-router-dom"
import { useLanguage } from "../context/LanguageContext"
import useApiRequest from "../hooks/useApiRequest"
import axios from "axios"

const ForgotPasswordForm = () => {
  const { BASE_URL } = useApiRequest()
  const navigate = useNavigate()
  const { language } = useLanguage()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await axios.post(`${BASE_URL}/api/auth/forgot-password`, { email })

      if (response && response.data) {
        showNotification("Email de réinitialisation envoyé avec succès!", true)
        setTimeout(() => navigate("/reset-password-success"), 1500)
      }
    } catch (error) {
      console.error("Forgot password error:", error)
      const errorMessage = error.response?.data?.message || "Erreur lors de l'envoi de l'email"
      showNotification(errorMessage, false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="space-y-6 select-none" onSubmit={handleSubmit}>
      <h1 className="text-2xl text-[#3ddc97] font-bold text-center">
        {language.forgotPassword?.title || "Mot de passe oublié"}
      </h1>

      <p className="text-center text-gray-300 text-sm">
        {language.forgotPassword?.description || "Entrez votre email pour recevoir un lien de réinitialisation"}
      </p>

      {/* Email Input */}
      <div className="relative border-b border-gray-400">
        <input
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="peer w-full bg-transparent outline-none py-2 pr-8 text-white placeholder-transparent"
          placeholder="Email"
          required
        />
        <label
          className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-300 transition-all duration-200 
               peer-focus:top-0 peer-focus:text-sm peer-focus:text-[#3ddc97] 
               peer-not-placeholder-shown:top-0 peer-not-placeholder-shown:text-sm 
               peer-not-placeholder-shown:text-[#3ddc97]"
        >
          {language.forgotPassword?.email || "Email"}
        </label>
        <FiMail className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300" />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#3ddc97] py-2 mt-1 rounded-lg text-white font-bold hover:bg-[#32c587] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Envoi en cours..." : language.forgotPassword?.submitButton || "Envoyer"}
      </button>

      {/* Back to Login Link */}
      <p className="text-center text-[#5E5E61]">
        {language.forgotPassword?.backToLogin || "Retour à la"}{" "}
        <Link to="/login" className="text-[#2A2A3B] font-bold hover:underline">
          {language.forgotPassword?.loginLink || "connexion"}
        </Link>
      </p>
    </form>
  )
}

export default ForgotPasswordForm
