"use client"
import { X } from "lucide-react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"

// Enhance DetailModal with animations and vibrant colors
export default function DetailModal({ isOpen, onClose, item }) {
  const navigate = useNavigate()
  const hasImage = !!item?.image // Check if there's an image
  const modalWidth = hasImage ? "w-[60%] max-w-3xl" : "w-[40%] max-w-md" // Adjust width

  if (!isOpen) return null

  const handleRepondre = () => {
    // Choose a friendly, varied message (random selection)
    const foundTemplates = [
      "Salut! Je pense avoir trouvé ton objet, regarde la photo ci-jointe.",
      "Bonjour, j'ai peut-être retrouvé ton objet — je t'envoie une photo.",
      "Hey, j'ai vu quelque chose qui ressemble à ton objet, je te partage l'image.",
      "Bonsoir, je crois que cet objet t'appartient. Je joins une photo pour confirmation.",
      "Coucou, j'ai trouvé cet objet — est-ce le tien? Voici une photo."
    ]
    const foundMessage = foundTemplates[Math.floor(Math.random() * foundTemplates.length)]

  // For ownership messages we send a phrased claim including the item title and location
  const belongingMessage = `Salut, je crois que ${item?.title || 'cet objet'} que vous avez trouvé dans ${item?.location || 'cet endroit'} m'appartient.`

    const message = item?.type === "perdu" ? foundMessage : belongingMessage

    // Prefer reporter id, fallback to author id/_id
    const reporterId = item?.reporter?._id || item?.author?.id || item?.author?._id
    const navState = {
      initialMessage: message,
      initialMedia: item?.image || null,
      itemReference: {
        id: item?.id,
        title: item?.title,
        type: item?.type,
      },
    }

    if (reporterId) {
      navigate(`/messagerie/${reporterId}`, { state: navState })
    } else {
      navigate(`/messagerie`, { state: { ...navState, contactUser: item?.author } })
    }

    onClose()
  }

  // Helper to get current logged-in user's id from localStorage
  const getCurrentUserInfo = () => {
    // Try multiple localStorage keys and token decode as fallback
    try {
      const candidates = ['user', 'currentUser', 'profile']
      for (const key of candidates) {
        const raw = localStorage.getItem(key)
        if (!raw) continue
        try {
          const parsed = JSON.parse(raw)
          if (parsed) return { id: parsed._id || parsed.id || parsed.userId || null, username: parsed.username || parsed.email || null }
        } catch (e) {
          // raw string, skip
        }
      }

      // Fallback: try to decode JWT token if present
      const token = localStorage.getItem('token') || localStorage.getItem('userToken')
      if (token) {
        const parts = token.split('.')
        if (parts.length === 3) {
          try {
            const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
            return { id: payload._id || payload.id || payload.sub || null, username: payload.username || payload.email || null }
          } catch (e) {
            // ignore
          }
        }
      }

      return { id: null, username: null }
    } catch (e) {
      return { id: null, username: null }
    }
  }

  const currentUser = getCurrentUserInfo()

  const ownerIdCandidates = [
    item?.reporter?._id,
    item?.reporter?.id,
    item?.author?.id,
    item?.author?._id,
  ].filter(Boolean)

  const ownerUsernameCandidates = [
    item?.reporter?.username,
    item?.author?.username,
  ].filter(Boolean)

  const isOwner = (() => {
    // Compare ids
    if (currentUser.id) {
      for (const oid of ownerIdCandidates) {
        if (oid && oid.toString() === currentUser.id.toString()) return true
      }
    }
    // Compare usernames
    if (currentUser.username) {
      for (const oun of ownerUsernameCandidates) {
        if (oun && oun.toString() === currentUser.username.toString()) return true
      }
    }
    return false
  })()

  // Debugging output to help trace ownership decisions
  console.debug('DetailModal ownership check', { currentUser, ownerIdCandidates, ownerUsernameCandidates, isOwner, item })

  return (
    <motion.div
      className="fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className={`bg-[#1e1e2e] rounded-2xl shadow-xl ${modalWidth} max-h-[80vh] flex overflow-hidden relative select-none`}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Side - Item Details */}
        <div className={`p-8 flex flex-col text-white space-y-4 ${hasImage ? "w-1/2" : "w-full"} overflow-auto`}>
          <div className="flex flex-col space-y-2">
            <motion.h2
              className="text-3xl font-bold uppercase text-[#3ddc97]"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {item?.title}
            </motion.h2>
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <button
                className="w-10 h-10 rounded-full overflow-hidden border-2 border-transparent hover:border-[#3ddc97] focus:outline-none"
                onClick={() => {
                  const reporterId = item?.reporter?._id || item?.author?.id || item?.author?._id
                  if (reporterId) navigate(`/profile/${reporterId}`)
                }}
                aria-label={`Voir le profil de ${item?.author?.firstName || ''}`}
              >
                <img
                  src={item?.author?.avatar || item?.reporter?.profilePicture || '/placeholder.svg'}
                  alt={item?.author?.firstName || 'Avatar'}
                  className="w-full h-full object-cover"
                />
              </button>

              <motion.p className="text-sm text-gray-300">
                {item?.author?.firstName} {item?.author?.lastName}
              </motion.p>
            </motion.div>
            <motion.p
              className="text-base text-gray-400 mb-4"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {item?.time} | {item?.location}
            </motion.p>
            <motion.p
              className="text-xl font-bold"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Description
            </motion.p>
            <motion.p
              className="text-lg leading-relaxed break-words whitespace-pre-wrap"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {item?.description}
            </motion.p>
          </div>
          <motion.button
            className="w-full bg-gradient-to-r from-[#3ddc97] to-white text-[#1e1e2e] py-2 rounded-lg text-lg font-semibold shadow-md hover:opacity-90 transition-all duration-300"
            whileHover={{ scale: 1.05, boxShadow: "0 5px 15px rgba(61, 220, 151, 0.4)" }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            onClick={() => {
              if (isOwner) {
                onClose()
              } else {
                handleRepondre()
              }
            }}
          >
              {isOwner ? 'FERMER' : 'Répondre'}
          </motion.button>
        </div>

        {/* Right Side - Image with Frame (Only if there's an image) */}
        {hasImage && (
          <motion.div
            className="w-1/2 flex items-center justify-center p-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="border-4 border-[#1e1e2e] rounded-lg overflow-hidden w-full h-full flex items-center justify-center">
              <img src={item?.image || "/placeholder.svg"} alt={item?.title} className="w-full h-full object-cover" />
            </div>
          </motion.div>
        )}

        {/* Close Button */}
        <motion.button
          onClick={onClose}
          className="absolute top-4 right-4 text-white bg-gray-700 p-1 rounded-full hover:bg-gray-600 cursor-pointer"
          whileHover={{ scale: 1.2, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
        >
          <X size={24} />
        </motion.button>
      </motion.div>
    </motion.div>
  )
}
