"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { useContext, createContext, useEffect, useMemo, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import LogoutModal from "./LogoutModal"

// icons
const dashboardIcon = "/assets/chart.png"
const dashboardActiveIcon = "/assets/chart-2.png"
const homeIcon = "/assets/Home.png"
const homeActiveIcon = "/assets/HomeActive.png"
const bellIcon = "/assets/NotificationUnread.png"
const bellActiveIcon = "/assets/NotificationUnreadActive.png"
const mailIcon = "/assets/Inbox.png"
const mailActiveIcon = "/assets/InboxActive.png"
const alertIcon = "/assets/UserSpeak.png"
const alertActiveIcon = "/assets/UserSpeakActive.png"
const packageIcon = "/assets/Box.png"
const packageActiveIcon = "/assets/BoxActive.png"
const settingsIcon = "/assets/Settings.png"
const settingsActiveIcon = "/assets/SettingsActive.png"
const logoutIcon = "/assets/Logout.png"

const SidebarContext = createContext()

export default function Sidebar({ expanded, setExpanded }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  useEffect(() => {
    localStorage.setItem("sidebarOpen", expanded)
  }, [expanded])

  const menuItems = useMemo(
    () => [
      { icon: dashboardIcon, activeIcon: dashboardActiveIcon, text: "Dashboard", path: "/dashboard" },
      { icon: homeIcon, activeIcon: homeActiveIcon, text: "Accueil", path: "/accueil" },
      { icon: bellIcon, activeIcon: bellActiveIcon, text: "Notification", path: "/notification" },
      { icon: mailIcon, activeIcon: mailActiveIcon, text: "Messagerie", path: "/inbox" },
      { icon: alertIcon, activeIcon: alertActiveIcon, text: "Réclamations", path: "/reclamations" },
      { icon: packageIcon, activeIcon: packageActiveIcon, text: "Objet trouvé", path: "/objet-trouver" },
      { icon: settingsIcon, activeIcon: settingsActiveIcon, text: "Paramètre", path: "/parametre" },
    ],
    [],
  )

  const handleLogout = () => {
    localStorage.removeItem("userToken")
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    navigate("/login")
  }

  return (
    <SidebarContext.Provider value={{ expanded }}>
      {/* Mobile Overlay */}
      {expanded && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setExpanded(false)}
        />
      )}
      
      <aside
        className={`fixed left-0 top-0 h-screen transition-all duration-300 z-50
          bg-gradient-to-b from-[#1e1e2e] to-[#3ddc97]
          border-r-transparent rounded-r-xl shadow-md
          text-white overflow-hidden select-none
          ${expanded ? "w-[230px] translate-x-0" : "w-[80px] -translate-x-full lg:translate-x-0"}`}
      >
        <nav className="h-full flex flex-col">
          {/* Header */}
          <div className="p-3 flex justify-between items-center">
            <img
              src="src/assets/logo3.png"
              className={`transition-[width] duration-300 ${expanded ? "w-20" : "w-0"}`}
              alt="Echo Logo"
            />
            <button onClick={() => setExpanded((p) => !p)} className="p-2 rounded-lg">
              {expanded ? <ChevronLeft /> : <ChevronRight />}
            </button>
          </div>

          {/* Menu Items */}
          <ul className="flex-1 px-3 mt-4 space-y-2">
            {menuItems.map(({ icon, activeIcon, text, path }, i) => (
              <SidebarItem
                key={i}
                icon={icon}
                activeIcon={activeIcon}
                text={text}
                active={location.pathname === path}
                onClick={() => navigate(path)}
              />
            ))}
          </ul>

          {/* Logout */}
          <div className="px-3 mb-4">
            <SidebarItem icon={logoutIcon} text="Déconnexion" isLogout onClick={() => setShowLogoutModal(true)} />
          </div>
        </nav>

        <LogoutModal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} onSubmit={handleLogout} />
      </aside>
    </SidebarContext.Provider>
  )
}

function SidebarItem({ icon, activeIcon, text, active, isLogout, onClick }) {
  const { expanded } = useContext(SidebarContext)

  return (
    <li
      className={`relative flex items-center gap-3 py-3 px-3 text-base font-medium
        cursor-pointer hover:bg-[#ffffff30] rounded-xl transition-all duration-200
        ${active ? "text-[#3ddc97]" : ""}`}
      onClick={onClick}
    >
      <img src={active ? activeIcon : icon} alt={text} className="w-6" />
      <span className={`transition-all duration-300 ${expanded ? "block" : "hidden"}`}>{text}</span>
    </li>
  )
}
