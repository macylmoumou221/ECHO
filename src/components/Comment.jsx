"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Shield, Briefcase, GraduationCap } from "lucide-react"
import "./Comment.css"
import axios from 'axios'
import { BASE_URL } from '../config'

const formatTimeAgo = (timestamp) => {
  if (!timestamp) return ""; // Handle undefined timestamp
  
  const now = new Date();
  const past = new Date(timestamp);
  
  // Check if the date is valid
  if (isNaN(past.getTime())) {
    return "Date invalide";
  }

  const diffInSeconds = Math.floor((now - past) / 1000);

  if (diffInSeconds < 60) return 'À l\'instant';
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `Il y a ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `Il y a ${hours} ${hours === 1 ? 'heure' : 'heures'}`;
  }
  if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `Il y a ${days} ${days === 1 ? 'jour' : 'jours'}`;
  }
  if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return `Il y a ${months} ${months === 1 ? 'mois' : 'mois'}`;
  }
  const years = Math.floor(diffInSeconds / 31536000);
  return `Il y a ${years} ${years === 1 ? 'an' : 'ans'}`;
};

const userRoleConfig = {
  student: {
    icon: <GraduationCap size={14} className="mr-1" />,
    label: "Étudiant"
  },
  teacher: {
    icon: <Briefcase size={14} className="mr-1" />,
    label: "Enseignant"
  },
  admin: {
    icon: <Shield size={14} className="mr-1" />,
    label: "Administrateur"
  }
}

const Comment = ({ comment, onReply, onVote, currentUserId, currentUser, postId }) => {
  const navigate = useNavigate()
  const [replyText, setReplyText] = useState("")
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [showReplies, setShowReplies] = useState(false)
  const [showReplyUserInfo, setShowReplyUserInfo] = useState(null)

  // Update initial vote state to use comment's vote status
  const [voteState, setVoteState] = useState({
    upvoted: comment.hasUpvoted || false,
    downvoted: comment.hasDownvoted || false,
    voteCount: (comment.upvotes?.length || 0) - (comment.downvotes?.length || 0)
  });

  // Local copy of replies so we can update UI immediately without relying on parent refresh
  const [localReplies, setLocalReplies] = useState(() => (comment.replies || []).map(r => ({
    ...r,
    hasUpvoted: r.hasUpvoted || false,
    hasDownvoted: r.hasDownvoted || false,
    upvotes: Array.isArray(r.upvotes) ? r.upvotes : [],
    downvotes: Array.isArray(r.downvotes) ? r.downvotes : [],
  })));

  const calculateVoteCount = (upvotes = [], downvotes = []) => {
    // Ensure we're working with arrays and get their lengths
    return (Array.isArray(upvotes) ? upvotes.length : 0) - 
           (Array.isArray(downvotes) ? downvotes.length : 0);
  };

  // Fetch the authoritative comment object from server for reconciliation
  const fetchLatestComment = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;
      const res = await axios.get(`${BASE_URL}/api/posts/${postId}`, { headers: { Authorization: `Bearer ${token}` } });
      const serverComment = res.data.comments.find(c => c._id === comment.id || c.id === comment.id);
      return serverComment || null;
    } catch (err) {
      console.error('Error fetching latest comment for reconciliation', err);
      return null;
    }
  }

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (replyText.trim() === "") return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Authentication required");
        return;
      }

      // optimistic reply: insert a temporary reply so the UI shows the user's text immediately
      const tempId = `temp-${Date.now()}`;
      const tempReply = {
        id: tempId,
        text: replyText,
        author: {
          id: currentUser?.id || currentUser?._id || currentUserId,
          name: (currentUser?.firstName ? `${currentUser.firstName} ${currentUser.lastName}` : currentUser?.name) || "Vous",
          username: currentUser?.username || "",
          avatar: currentUser?.profilePicture || ""
        },
        createdAt: new Date().toISOString(),
        upvotes: [],
        downvotes: [],
        hasUpvoted: false,
        hasDownvoted: false,
        voteCount: 0,
        optimistic: true
      };

      // show the optimistic reply immediately
      setLocalReplies(prev => [...prev, tempReply]);
      setReplyText("");
      setShowReplyForm(false);
      setShowReplies(true);

      // send to server
      await axios.post(
        `${BASE_URL}/api/posts/${postId}/comments/${comment.id}/replies`,
        { text: replyText },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // reconcile: fetch updated comment data after posting reply
      const response = await axios.get(
        `${BASE_URL}/api/posts/${postId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Find the updated comment in the response
      const updatedComment = response.data.comments.find(c => c._id === comment.id || c.id === comment.id);
      if (updatedComment && Array.isArray(updatedComment.replies)) {
        // Format the reply data
        const formattedReplies = updatedComment.replies.map(reply => ({
          id: reply._id || reply.id,
          text: reply.text || reply.content || "",
          author: {
            id: reply.user?._id || reply.user?.id || reply.author?._id || reply.author?.id,
            name: reply.user ? `${reply.user.firstName || ''} ${reply.user.lastName || ''}`.trim() : (reply.author?.name || ""),
            username: reply.user?.username || reply.author?.username || "",
            avatar: reply.user?.profilePicture || reply.author?.profilePicture || reply.user?.avatar || reply.author?.avatar || ""
          },
          createdAt: reply.createdAt || reply.timestamp,
          upvotes: reply.upvotes || [],
          downvotes: reply.downvotes || [],
          hasUpvoted: Array.isArray(reply.upvotes) ? reply.upvotes.includes(currentUserId) : false,
          hasDownvoted: Array.isArray(reply.downvotes) ? reply.downvotes.includes(currentUserId) : false,
          voteCount: (Array.isArray(reply.upvotes) ? reply.upvotes.length : 0) - (Array.isArray(reply.downvotes) ? reply.downvotes.length : 0)
        }));

        // update localReplies to authoritative server replies
        setLocalReplies(formattedReplies);

        // notify parent if provided
        if (typeof onReply === 'function') onReply(comment.id, formattedReplies);
      }
    } catch (err) {
      console.error("Error adding reply:", err);
      console.error(err);
      // remove any optimistic reply we inserted
      setLocalReplies(prev => prev.filter(r => !String(r.id).startsWith('temp-')));
      alert("Erreur lors de l'ajout de la réponse");
    }
  };

  const toggleReplyForm = () => {
    setShowReplyForm(!showReplyForm)
    if (!showReplyForm && !showReplies && (localReplies?.length > 0)) {
      setShowReplies(true)
    }
  }

  const toggleReplies = () => {
    setShowReplies(!showReplies)
  }

  const handleVote = async (type) => {
    const prevState = { ...voteState };
    // optimistic update
    let nextState = { ...voteState };
    if (type === 'upvote') {
      if (voteState.upvoted) {
        nextState.upvoted = false;
        nextState.voteCount = prevState.voteCount - 1;
      } else if (voteState.downvoted) {
        nextState.upvoted = true;
        nextState.downvoted = false;
        nextState.voteCount = prevState.voteCount + 2;
      } else {
        nextState.upvoted = true;
        nextState.voteCount = prevState.voteCount + 1;
      }
    } else if (type === 'downvote') {
      if (voteState.downvoted) {
        nextState.downvoted = false;
        nextState.voteCount = prevState.voteCount + 1;
      } else if (voteState.upvoted) {
        nextState.downvoted = true;
        nextState.upvoted = false;
        nextState.voteCount = prevState.voteCount - 2;
      } else {
        nextState.downvoted = true;
        nextState.voteCount = prevState.voteCount - 1;
      }
    }

    setVoteState(nextState);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Authentication required");
        setVoteState(prevState);
        return;
      }

      const endpoint = `${BASE_URL}/api/posts/${postId}/comments/${comment.id}/${type}`;
      console.log('Vote endpoint:', endpoint);

      await axios.post(
        endpoint,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Reconcile optimistic UI with authoritative server values
      const serverComment = await fetchLatestComment();
      if (serverComment) {
        const upvotesArr = Array.isArray(serverComment.upvotes) ? serverComment.upvotes : [];
        const downvotesArr = Array.isArray(serverComment.downvotes) ? serverComment.downvotes : [];
        setVoteState({
          upvoted: upvotesArr.includes(currentUserId),
          downvoted: downvotesArr.includes(currentUserId),
          voteCount: upvotesArr.length - downvotesArr.length
        });

        // update localReplies from server's replies if present
        if (Array.isArray(serverComment.replies)) {
          setLocalReplies(serverComment.replies.map(r => {
            const upvotesArr = Array.isArray(r.upvotes) ? r.upvotes : [];
            const downvotesArr = Array.isArray(r.downvotes) ? r.downvotes : [];
            const user = r.user || r.author || {};
            return {
              id: r._id || r.id,
              text: r.text || r.content || "",
              author: {
                id: user._id || user.id,
                name: user.firstName ? `${user.firstName} ${user.lastName}` : (user.name || ""),
                username: user.username || user.handle || "",
                avatar: user.profilePicture || user.avatar || ""
              },
              createdAt: r.createdAt || r.timestamp,
              upvotes: upvotesArr,
              downvotes: downvotesArr,
              hasUpvoted: upvotesArr.includes(currentUserId),
              hasDownvoted: downvotesArr.includes(currentUserId),
              voteCount: upvotesArr.length - downvotesArr.length
            }
          }));
        }
      }
    } catch (err) {
      console.error("Error voting:", err);
      // revert optimistic change
      setVoteState(prevState);
    }
  };

  const handleReplyVote = async (replyId, type) => {
    const prevReplies = localReplies.map(r => ({ ...r }));
    const idx = prevReplies.findIndex(r => r.id === replyId);
    if (idx === -1) return;

    const prevReply = prevReplies[idx];
    const nextReply = { ...prevReply };

    // simple +1/-1 logic
    if (type === 'upvote') {
      if (prevReply.hasUpvoted) {
        nextReply.hasUpvoted = false;
        nextReply.voteCount = (nextReply.voteCount || calculateVoteCount(nextReply.upvotes, nextReply.downvotes)) - 1;
      } else if (prevReply.hasDownvoted) {
        nextReply.hasUpvoted = true;
        nextReply.hasDownvoted = false;
        nextReply.voteCount = (nextReply.voteCount || calculateVoteCount(nextReply.upvotes, nextReply.downvotes)) + 2;
      } else {
        nextReply.hasUpvoted = true;
        nextReply.voteCount = (nextReply.voteCount || calculateVoteCount(nextReply.upvotes, nextReply.downvotes)) + 1;
      }
    } else if (type === 'downvote') {
      if (prevReply.hasDownvoted) {
        nextReply.hasDownvoted = false;
        nextReply.voteCount = (nextReply.voteCount || calculateVoteCount(nextReply.upvotes, nextReply.downvotes)) + 1;
      } else if (prevReply.hasUpvoted) {
        nextReply.hasDownvoted = true;
        nextReply.hasUpvoted = false;
        nextReply.voteCount = (nextReply.voteCount || calculateVoteCount(nextReply.upvotes, nextReply.downvotes)) - 2;
      } else {
        nextReply.hasDownvoted = true;
        nextReply.voteCount = (nextReply.voteCount || calculateVoteCount(nextReply.upvotes, nextReply.downvotes)) - 1;
      }
    }

    // update UI
    const newReplies = prevReplies.map((r, i) => (i === idx ? nextReply : r));
    setLocalReplies(newReplies);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Authentication required");
        setLocalReplies(prevReplies);
        return;
      }

      const endpoint = `${BASE_URL}/api/posts/${postId}/comments/${comment.id}/replies/${replyId}/${type}`;
      await axios.post(endpoint, {}, { headers: { Authorization: `Bearer ${token}` } });

      // success: reconcile with authoritative server values
      const serverComment = await fetchLatestComment();
      if (serverComment && Array.isArray(serverComment.replies)) {
        const serverReply = serverComment.replies.find(r => (r._id || r.id) === replyId);
        if (serverReply) {
          const upvotesArr = Array.isArray(serverReply.upvotes) ? serverReply.upvotes : [];
          const downvotesArr = Array.isArray(serverReply.downvotes) ? serverReply.downvotes : [];
          const user = serverReply.user || serverReply.author || {};
          const mapped = {
            id: serverReply._id || serverReply.id,
            text: serverReply.text || serverReply.content || "",
            author: {
              id: user._id || user.id,
              name: user.firstName ? `${user.firstName} ${user.lastName}` : (user.name || ""),
              username: user.username || user.handle || "",
              avatar: user.profilePicture || user.avatar || ""
            },
            createdAt: serverReply.createdAt || serverReply.timestamp,
            upvotes: upvotesArr,
            downvotes: downvotesArr,
            hasUpvoted: upvotesArr.includes(currentUserId),
            hasDownvoted: downvotesArr.includes(currentUserId),
            voteCount: upvotesArr.length - downvotesArr.length
          };

          setLocalReplies(prev => prev.map(r => r.id === replyId ? mapped : r));
        }
      }
    } catch (err) {
      console.error('Error voting reply:', err);
      // revert
      setLocalReplies(prevReplies);
    }
  };

  return (
    <div className="comment">
      <div className="comment-main">
        <div 
          className="cursor-pointer group relative"
          onClick={() => navigate(`/profile/${comment.author.id}`)}
        >
          {comment.author?.avatar ? (
            <img 
              src={comment.author.avatar || "/placeholder.svg"} 
              alt={comment.author.name} 
              className="w-8 h-8 rounded-full object-cover ring-2 ring-offset-2 ring-[#3ddc97] transition-all duration-300 group-hover:ring-4"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center ring-2 ring-offset-2 ring-[#3ddc97] transition-all duration-300 group-hover:ring-4">
              {comment.author?.name?.charAt(0) || "U"}
            </div>
          )}
        </div>

        <div className="comment-content">
          <div className="comment-header flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="comment-author font-medium">{comment.author?.name}</span>
              <span className="text-sm text-[#3DDC97]">@{comment.author?.username}</span>
            </div>
            <span className="comment-timestamp text-gray-500 text-sm">
              {formatTimeAgo(comment.createdAt)}
            </span>
          </div>

          <p className="comment-text">{comment.text}</p>

          <div className="comment-actions">
            <div className="flex items-center gap-4">
              <div className="vote-buttons flex items-center gap-2">
                <button 
                  className={`vote-button transform transition-transform hover:scale-110`}
                  onClick={() => handleVote('upvote')} // Changed from 'like' to 'upvote'
                >
                  <img
                    src={voteState.upvoted ? "/src/icons/DoubleAltArrowUp2.png" : "/src/icons/DoubleAltArrowUp.png"}
                    alt="Upvote"
                    className="w-5 h-5"
                  />
                </button>

                <span className={`vote-count font-medium ${
                  voteState.upvoted ? 'text-[#3DDC97]' : 
                  voteState.downvoted ? 'text-red-500' : 'text-gray-600'
                }`}>
                  {voteState.voteCount}
                </span>

                <button 
                  className={`vote-button transform transition-transform hover:scale-110`}
                  onClick={() => handleVote('downvote')} // Changed from 'dislike' to 'downvote'
                >
                  <img
                    src={voteState.downvoted ? "/src/icons/DoubleAltArrowDown2.png" : "/src/icons/DoubleAltArrowDown.png"}
                    alt="Downvote"
                    className="w-5 h-5"
                  />
                </button>
              </div>
              
              <button 
                className="reply-button text-gray-500 hover:text-[#3DDC97] transition-colors"
                onClick={toggleReplyForm}
              >
                Répondre
              </button>
            </div>
          </div>
        </div>
      </div>

      {showReplyForm && (
        <form className="reply-form" onSubmit={handleSubmitReply}>
          {currentUser?.profilePicture ? (
            <img
              src={currentUser.profilePicture || "/placeholder.svg"}
              alt={currentUser.firstName}
              className="reply-avatar"
            />
          ) : (
            <div className="reply-avatar flex items-center justify-center bg-gray-200 text-gray-600 font-semibold">
              {currentUser?.firstName?.charAt(0) || "U"}
            </div>
          )}
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Écrire une réponse..."
            className="reply-input"
            autoFocus
          />
          <div className="reply-buttons">
            <button type="button" className="reply-cancel" onClick={() => setShowReplyForm(false)}>
              Annuler
            </button>
            <button type="submit" className="reply-submit" disabled={!replyText.trim()}>
              Répondre
            </button>
          </div>
        </form>
      )}

      {localReplies?.length > 0 && (
        <div className="replies-section">
          <button className="toggle-replies" onClick={toggleReplies}>
            {showReplies ? "Masquer" : "Afficher"} les réponses ({localReplies.length})
          </button>

          {showReplies && (
            <div className="replies-list">
              {localReplies.map(reply => (
                <div key={reply.id} className="reply">
                  <div 
                    className="cursor-pointer group relative"
                    onClick={() => navigate(`/profile/${reply.author.id}`)}
                  >
                    {reply.author?.avatar ? (
                      <img 
                        src={reply.author.avatar} 
                        alt={reply.author.name} 
                        className="w-6 h-6 rounded-full object-cover ring-2 ring-offset-1 ring-[#3ddc97] transition-all duration-300 group-hover:ring-4"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center ring-2 ring-offset-1 ring-[#3ddc97] transition-all duration-300 group-hover:ring-4">
                        {reply.author?.name?.charAt(0) || "U"}
                      </div>
                    )}
                  </div>

                  <div className="reply-content">
                    <div className="reply-header flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="reply-author font-medium">{reply.author?.name}</span>
                        <span className="text-sm text-[#3DDC97]">@{reply.author?.username}</span>
                      </div>
                      <span className="reply-timestamp text-gray-500 text-sm">
                        {formatTimeAgo(reply.createdAt)} {/* Use createdAt instead of timestamp */}
                      </span>
                    </div>

                    <p className="reply-text">{reply.text}</p>

                    <div className="reply-actions">
                      <div className="vote-buttons flex items-center gap-2">
                        <button 
                          className={`vote-button transform transition-transform hover:scale-110 ${
                            reply.hasUpvoted ? 'active-vote' : ''
                          }`}
                          onClick={() => handleReplyVote(reply.id, 'upvote')} // Changed from 'like' to 'upvote'
                        >
                          <img
                            src={reply.hasUpvoted ? "/src/icons/DoubleAltArrowUp2.png" : "/src/icons/DoubleAltArrowUp.png"}
                            alt="Upvote"
                            className="w-4 h-4"
                          />
                        </button>

                        <span className={`vote-count text-xs font-medium ${
                          reply.hasUpvoted ? 'text-[#3DDC97]' : 
                          reply.hasDownvoted ? 'text-red-500' : 'text-gray-600'
                        }`}>
                          {reply.voteCount ?? calculateVoteCount(reply.upvotes, reply.downvotes)}
                        </span>

                        <button 
                          className={`vote-button transform transition-transform hover:scale-110 ${
                            reply.hasDownvoted ? 'text-red-500' : 'text-gray-500'
                          }`}
                          onClick={() => handleReplyVote(reply.id, 'downvote')} // Changed from 'dislike' to 'downvote'
                        >
                          <img
                            src={reply.hasDownvoted ? "/src/icons/DoubleAltArrowDown2.png" : "/src/icons/DoubleAltArrowDown.png"}
                            alt="Downvote"
                            className="w-4 h-4"
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Comment
