"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useLanguage } from "../context/LanguageContext"
import { FiCheckCircle } from "react-icons/fi"

const ResetPasswordSuccess = () => {
  const [mounted, setMounted] = useState(false)
  const { language } = useLanguage()

  useEffect(() => {
    setMounted(true)

    // Cleanup function
    return () => setMounted(false)
  }, [])

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

      {/* Success Message with enhanced animation */}
      <div
        className={`bg-white/10 backdrop-blur-lg p-6 md:p-8 pr-10 rounded-lg shadow-lg w-full max-w-lg 
                    transform transition-all duration-1000 ${mounted ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"}`}
      >
        <div className="relative z-10">
          <div
            className={`transform transition-all duration-700 delay-300 ${mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"} space-y-6 select-none text-center`}
          >
            {/* Success Icon */}
            <div className="flex justify-center">
              <div className="bg-[#3ddc97] rounded-full p-4">
                <FiCheckCircle className="text-white text-5xl" />
              </div>
            </div>

            {/* Success Title */}
            <h1 className="text-2xl text-[#3ddc97] font-bold">
              {language.resetPasswordSuccess?.title || "Email envoyé avec succès!"}
            </h1>

            {/* Success Message */}
            <p className="text-gray-300 text-sm">
              {language.resetPasswordSuccess?.message ||
                "Un email de réinitialisation a été envoyé à votre adresse. Veuillez vérifier votre boîte de réception et suivre les instructions pour réinitialiser votre mot de passe."}
            </p>

            {/* Additional Info */}
            <p className="text-gray-400 text-xs">
              {language.resetPasswordSuccess?.checkSpam || "Si vous ne voyez pas l'email, vérifiez votre dossier spam."}
            </p>

            {/* Back to Login Button */}
            <Link
              to="/login"
              className="block w-full bg-[#3ddc97] py-2 mt-4 rounded-lg text-white font-bold hover:bg-[#32c587] cursor-pointer text-center"
            >
              {language.resetPasswordSuccess?.backToLogin || "Retour à la connexion"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResetPasswordSuccess
