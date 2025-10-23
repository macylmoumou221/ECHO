"use client"

import { useState, useEffect } from "react"
import { Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom"
import "./App.css"
import { GoogleOAuthProvider } from "@react-oauth/google"
import { ReportDialogProvider } from './contexts/ReportDialogContext';

// Pages
import Accueil from "./components/Accueil"
import Notification from "./components/Notification"
import Messagerie from "./components/Messagerie"
import Reclamation from "./components/Reclamation"
import SettingsPage from "./components/SettingsPage"
import SinglePost from "./components/SinglePost"
import LostFoundPage from "./components/LostFoundPage"
import SearchResults from "./components/SearchResults"
import UserProfile from "./components/UserProfile"
import ProfilePage from "./ProfilePage"
import LogIn from "./components/LogIn"
import Signup from "./components/Signup"
import ForgotPassword from "./components/ForgotPassword"
import ResetPasswordSuccess from "./components/ResetPasswordSuccess"
import ResetPassword from "./components/ResetPassword"
import Dashboard from "./components/dashboard"

// Composants globaux
import Sidebar from "./components/Sidebar"
import Searchbar from "./components/searchbar"
import ReportDialog from "./components/ReportDialog"

import GoogleRedirect from "./components/GoogleRedirect"
import useApiRequest from "./hooks/useApiRequest"

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem("sidebarOpen")
    return saved !== null ? saved === "true" : window.innerWidth >= 1024
  })
  const [currentUser , setCurrentUser] = useState()
  const navigate = useNavigate()
  const location = useLocation()
  const [reportDialogOpen, setReportDialogOpen] = useState(false)
  const [reportPostId, setReportPostId] = useState(null)
  const {data, error, loading , refetch,BASE_URL} = useApiRequest()
  const userToken = localStorage.getItem("token")
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const result = await refetch(`/api/auth/me`, 'GET')
        if (result) setCurrentUser(result)
      } catch (err) {
        console.error('Error fetching user:', err)
        // fallback: try to read cached user from localStorage so UI can show profile pic immediately
        try {
          const cached = localStorage.getItem('user')
          if (cached) setCurrentUser(JSON.parse(cached))
        } catch (e) {
          /* ignore */
        }
      }
    }
  
    fetchUser()
    // Listen for user updates from other components (e.g. profile updates)
    const handleUserUpdated = (e) => {
      if (e?.detail) setCurrentUser(e.detail)
    }
    window.addEventListener('userUpdated', handleUserUpdated)

    // Cleanup
    return () => {
      window.removeEventListener('userUpdated', handleUserUpdated)
    }
  }, [])
  
  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 1024)
    }
    window.addEventListener("resize", handleResize)
    handleResize()
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    localStorage.setItem("sidebarOpen", sidebarOpen)
  }, [sidebarOpen])

  const handleOpenReportDialog = (postId) => {
    setReportPostId(postId)
    setReportDialogOpen(true)
  }

  const handleCloseReportDialog = () => {
    setReportDialogOpen(false)
    setReportPostId(null)
  }

  const handleSubmitReport = (postId, reason) => {
    alert(`Signalement envoyé pour le post ${postId}: "${reason}"`)
    handleCloseReportDialog()
  }

  useEffect(() => {
    window.openReportDialog = handleOpenReportDialog
  }, [])

  const handleLogout = () => {
    // remove any token variants and user info
    localStorage.removeItem("userToken")
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    navigate("/login")
  }

  // Auth routes
  const authRoutes = ["/login", "/signup", "/forgotpassword", "/reset-password-success", "/reset-password"]
  const isAuthRoute = authRoutes.includes(location.pathname.toLowerCase())

  // Redirection logique au tout premier accès
  useEffect(() => {
    // Check the canonical 'token' value (some older code used 'userToken')
    const token = localStorage.getItem("token")
    const isAtRoot = location.pathname === "/"

    if (!token && isAtRoot) {
      navigate("/login")
    } else if (token && isAtRoot) {
      navigate("/acceuil")
    }
  }, [location.pathname, navigate])

  return (
    <GoogleOAuthProvider clientId="801840850984-s0ofqjs8bprb4kr4l5amh2g8p4ebpd3j.apps.googleusercontent.com">
      <ReportDialogProvider>
      {isAuthRoute || location.pathname === '/api/auth/success' ? (
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<LogIn />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          <Route path="/reset-password-success" element={<ResetPasswordSuccess />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/api/auth/success" element={<GoogleRedirect />} />
        </Routes>
      ) : (
        <div className="flex h-screen bg-[#f6f6f6] text-[#2A2A3B] overflow-hidden">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden fixed top-4 left-4 z-50 bg-[#3DDC97] text-white p-2 rounded-lg shadow-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {sidebarOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
          
          <Sidebar expanded={sidebarOpen} setExpanded={setSidebarOpen} userRole={currentUser?.role} />

          <main className={`flex-1 flex flex-col transition-all duration-300 h-screen overflow-hidden
            ${sidebarOpen ? "lg:ml-[230px]" : "lg:ml-[80px]"}`}>
            
            {/* Searchbar - Fixed at top */}
            <div className="flex-shrink-0 bg-white border-b border-gray-200">
              <Searchbar
                isOpen={sidebarOpen}
                username={currentUser?.firstName}
                darkMode={false}
                userType={currentUser?.role}
                name={currentUser?.firstName}
                lastName={currentUser?.lastName}
                photoUrl={currentUser?.profilePicture}
              />
            </div>

            {/* Scrollable content area */}
            <div className="flex-1 overflow-y-auto bg-[#f6f6f6] p-4 md:p-6">
              <Routes>
                <Route path="/acceuil" element={<Accueil />} />
                <Route path="/notification" element={<Notification />} />
                <Route path="/messagerie" element={<Messagerie />} />
                <Route path="/messagerie/:userId" element={<Messagerie />} />
                <Route
                  path="/reclamations"
                  element={<Reclamation userRole={currentUser?.role} userId={currentUser?._id} />}
                />
                <Route path="/objet-trouver" element={<LostFoundPage darkMode={false} />} />
                {currentUser?.role === "admin" && <Route path="/dashboard" element={<Dashboard />} />}
                <Route path="/parametre" element={<SettingsPage />} />
                <Route path="/post/:postId" element={<SinglePost />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/profile" element={<ProfilePage user={!loading ? currentUser : '' } />} />
                <Route path="/profile/:userId" element={<UserProfile />} />
              </Routes>
            </div>
          </main>

          <ReportDialog
            isOpen={reportDialogOpen}
            onClose={handleCloseReportDialog}
            onSubmit={handleSubmitReport}
            postId={reportPostId}
          />
        </div>
      )}
      </ReportDialogProvider>
    </GoogleOAuthProvider>
  )
}
