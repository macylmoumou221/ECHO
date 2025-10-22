"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { useContext, createContext, useEffect, useMemo, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import LogoutModal from "./LogoutModal"
// icons.png
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
// import dashboardIcon from "/assets/chart.png"
// import dashboardActiveIcon = "/assets/chart-2.png"
import { LayoutDashboard } from "lucide-react"
const logo = "/assets/logo3.png"
const SidebarContext = createContext()

export default function Sidebar({ expanded, setExpanded, userRole = "student" }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [userImage, setUserImage] = useState("/placeholder.svg") // Default placeholder
  const [userName, setUserName] = useState("MACYL MOUMOU") // Default name
  const [unreadMessages, setUnreadMessages] = useState(0) // Add this state

  useEffect(() => {
    localStorage.setItem("sidebarOpen", expanded)
  }, [expanded])

  const menuItems = useMemo(() => {
    // Base menu items for all users
    const items = []

    // Add Dashboard only for admin users
    if (userRole === "admin") {
      items.push({
        icon: <LayoutDashboard className="w-6 h-6" />,
        activeIcon: <LayoutDashboard className="w-6 h-6" />,
        text: "Dashboard",
        path: "/dashboard",
        isReactIcon: true,
      })
    }

    // Common items for all users
    items.push(
      { icon: homeIcon, activeIcon: homeActiveIcon, text: "Accueil", path: "/acceuil" },
      { icon: bellIcon, activeIcon: bellActiveIcon, text: "Notification", path: "/notification" },
      {
        icon: mailIcon,
        activeIcon: mailActiveIcon,
        text: "Messagerie",
        path: "/messagerie",
        notification: unreadMessages > 0 ? (
          <div className="absolute -top-1 -right-1 bg-[#3DDC97] text-white text-xs font-bold 
            rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
            {unreadMessages}
          </div>
        ) : null,
      },
      { icon: alertIcon, activeIcon: alertActiveIcon, text: "Réclamations", path: "/reclamations" },
    )

    // Add Lost Found page only for students and admins
    if (userRole === "student" || userRole === "admin") {
      items.push({ icon: packageIcon, activeIcon: packageActiveIcon, text: "Objets Perdus & Trouvés", path: "/objet-trouver" })
    }

    // Settings for all users
    items.push({ icon: settingsIcon, activeIcon: settingsActiveIcon, text: "Paramètres", path: "/parametre" })

    return items
  }, [userRole, unreadMessages])

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
              src={logo} loading="lazy"
              className={`transition-[width] duration-300 ${expanded ? "w-20" : "w-0"}`}
              alt="Echo Logo"
            />
            <button onClick={() => setExpanded((p) => !p)} className="p-2 rounded-lg">
              {expanded ? <ChevronLeft /> : <ChevronRight />}
            </button>
          </div>

          <ul className="flex-1 px-3 mt-4 space-y-2">
            {menuItems.map(({ icon, activeIcon, text, path, isReactIcon, notification }, i) => (
              <SidebarItem
                key={i}
                icon={icon}
                activeIcon={activeIcon}
                text={text}
                active={location.pathname === path}
                onClick={() => navigate(path)}
                isReactIcon={isReactIcon}
                notification={notification}
              />
            ))}
          </ul>
          <div className="px-3 mb-4">
            <SidebarItem icon={logoutIcon} text="Déconnexion" isLogout onClick={() => setShowLogoutModal(true)} />
          </div>
        </nav>
      </aside>
      <LogoutModal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} onSubmit={handleLogout} />
    </SidebarContext.Provider>
  )
}

function SidebarItem({ icon, activeIcon, text, active, isLogout, onClick, isReactIcon, notification }) {
  const { expanded } = useContext(SidebarContext)

  return (
    <li
      className={`relative flex items-center gap-3 py-3 px-3 text-base font-medium
        cursor-pointer hover:bg-[#ffffff30] rounded-xl transition-all duration-200
        ${active ? "text-[#3ddc97]" : ""}`}
      onClick={onClick}
    >
      {isReactIcon ? (
        <div className={active ? "text-[#3ddc97]" : ""}>{active ? activeIcon : icon}</div>
      ) : (
        <img src={active ? activeIcon : icon} alt={text} className="w-6" />
      )}
      <span className={`transition-all duration-300 ${expanded ? "block" : "hidden"}`}>{text}</span>
      {notification}
    </li>
  )
}
