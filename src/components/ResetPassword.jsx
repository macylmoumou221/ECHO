"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation, Link } from "react-router-dom"
import axios from "axios"
import { BASE_URL } from '../config'
import { FiLock } from "react-icons/fi"
import PasswordInput from "./PasswordInput"
import { useLanguage } from "../context/LanguageContext"

const ResetPassword = () => {
  const { language } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Extract token from query string: ?token=...
  const searchParams = new URLSearchParams(location.search)
  const token = searchParams.get('token')

  useEffect(() => {
    // Clear messages on mount and trigger animations
    setMessage(null)
    setMounted(true)
  }, [])

  const showNotification = (text, success = true) => {
    const notification = document.createElement("div")
    notification.className = `fixed top-4 right-4 ${success ? "bg-[#3DDC97]" : "bg-[#FF6B6B]"} text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center`
    notification.innerHTML = `<span>${text}</span>`
    document.body.appendChild(notification)
    setTimeout(() => {
      notification.classList.add("opacity-0", "transition-opacity", "duration-500")
      setTimeout(() => document.body.removeChild(notification), 500)
    }, 3000)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!token) {
      setMessage('Token manquant dans le lien de réinitialisation')
      setIsSuccess(false)
      return
    }
    if (!password || !confirmPassword) {
      setMessage('Veuillez remplir les deux champs')
      setIsSuccess(false)
      return
    }
    if (password !== confirmPassword) {
      setMessage('Les mots de passe ne correspondent pas')
      setIsSuccess(false)
      return
    }

    setLoading(true)
    try {
      const url = `${BASE_URL}/api/auth/reset-password?token=${encodeURIComponent(token)}`
      const res = await axios.post(url, { password }, { headers: { 'Content-Type': 'application/json' } })
  const successMsg = res?.data?.message || 'Mot de passe réinitialisé avec succès'
  setIsSuccess(true)
  setMessage(successMsg)
  showNotification(successMsg, true)
  // stay on this success page; do not redirect automatically
    } catch (err) {
      console.error('Reset password error:', err)
      const errMsg = err.response?.data?.message || 'Erreur lors de la réinitialisation du mot de passe'
      setIsSuccess(false)
      setMessage(errMsg)
      showNotification(errMsg, false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col md:flex-row items-center justify-center w-full min-h-screen bg-dark relative p-6 overflow-hidden">
      {/* Background Waves (static) */}
      <div className="absolute inset-0 -z-10 bg-wave-pattern"></div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 -z-5 overflow-hidden">
        {/* Floating circles */}
        <div className="absolute w-32 h-32 rounded-full bg-[#3ddc97]/10 blur-xl top-[15%] left-[10%] floating-element"></div>
        <div className="absolute w-40 h-40 rounded-full bg-[#3ddc97]/15 blur-xl top-[60%] left-[75%] floating-element-slow"></div>
        <div className="absolute w-24 h-24 rounded-full bg-[#3ddc97]/10 blur-xl top-[80%] left-[20%] floating-element-reverse"></div>

        {/* Geometric shapes */}
        <div className="absolute w-40 h-40 rotate-45 bg-[#14553b]/10 blur-lg top-[30%] left-[65%] pulse-element"></div>
        <div className="absolute w-32 h-32 rotate-12 bg-[#28996a]/10 blur-lg top-[70%] left-[40%] pulse-element-slow"></div>

        {/* Sparkles */}
        {mounted &&
          Array.from({ length: 15 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full sparkle"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 7}s`,
              }}
            ></div>
          ))}

        {/* Light beams */}
        <div className="rounded-full absolute w-[150px] h-[150px] bg-gradient-to-b from-[#3ddc97]/20 to-transparent rotate-[30deg] top-[-100px] left-[20%] light-beam"></div>
        <div className="rounded-full absolute w-[100px] h-[100px] bg-gradient-to-b from-[#3ddc97]/15 to-transparent rotate-[-20deg] top-[-50px] right-[30%] light-beam-slow"></div>
        <div className="rounded-full absolute w-[150px] h-[150px] bg-gradient-to-b from-[#3ddc97]/20 to-transparent rotate-[30deg] top-[-250px] left-[50%] light-beam"></div>
        <div className="rounded-full absolute w-[100px] h-[100px] bg-gradient-to-b from-[#3ddc97]/15 to-transparent rotate-[-20deg] top-[-50px] right-[10%] light-beam-slow"></div>
      </div>

      {/* Reset Form with enhanced animation (same wrapper as Login) */}
      <div
        className={`bg-white/10 backdrop-blur-lg p-6 md:p-8 pr-10 rounded-lg shadow-lg w-full max-w-lg 
                    transform transition-all duration-1000 ${mounted ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"}`}
      >
        <div className="relative z-10">
          <div
            className={`transform transition-all duration-700 delay-300 ${mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
            <div className="space-y-6 text-center">
              <div className="flex justify-center">
                <div className="bg-[#3ddc97] rounded-full p-3">
                  <FiLock className="text-white text-2xl" />
                </div>
              </div>

              <h1 className="text-2xl text-[#3ddc97] font-bold">{language.resetPassword?.title || 'Réinitialiser le mot de passe'}</h1>
              <p className="text-gray-300 text-sm">{language.resetPassword?.description || 'Entrez votre nouveau mot de passe'}</p>

              {message && (
                <div className={`p-3 rounded ${isSuccess ? 'bg-[#3DDC97]/20 text-[#065f3a]' : 'bg-[#FF6B6B]/20 text-[#7a1919]'}`}>
                  {message}
                </div>
              )}

              {!isSuccess ? (
                <form onSubmit={handleSubmit} className="space-y-6 select-none">

                  <div className="relative border-b border-gray-400">
                    <PasswordInput
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      name="password"
                      label={language.resetPassword?.newPassword || 'Nouveau mot de passe'}
                      showForgot={false}
                    />
                  </div>

                  <div className="relative border-b border-gray-400">
                    <PasswordInput
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      name="confirmPassword"
                      label={language.resetPassword?.confirmPassword || 'Confirmer le mot de passe'}
                      showForgot={false}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#3ddc97] py-2 mt-1 rounded-lg text-white font-bold hover:bg-[#32c587] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'En cours...' : (language.resetPassword?.submit || 'Réinitialiser le mot de passe')}
                  </button>

                  <p className="text-center text-[#5E5E61]">
                    <Link to="/login" className="text-[#2A2A3B] font-bold hover:underline">{language.resetPassword?.backToLogin || 'Retour à la connexion'}</Link>
                  </p>
                </form>
              ) : (
                <div className="space-y-6 select-none">
                  <h2 className="text-xl font-semibold text-[#065f3a]">{language.resetPassword?.successTitle || 'Mot de passe réinitialisé'}</h2>
                  <p className="text-gray-300">{message}</p>
                  <Link to="/login" className="block w-full bg-[#3ddc97] py-2 mt-1 rounded-lg text-white font-bold text-center">{language.resetPassword?.loginButton || 'Se connecter'}</Link>
                </div>
              )}

              {/* single 'Retour à la connexion' link is inside the form or success block */}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
