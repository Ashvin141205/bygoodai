"use client"

import React, { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import FingerprintJS from "@fingerprintjs/fingerprintjs"
import WeeklyPopupBgImg from "../../assets/image/weeklyPopupBgImg.png"
import { FaFacebook, FaInstagram, FaTwitter, FaPinterest } from "react-icons/fa"
import { toast } from "react-toastify"
import Modal from "react-modal"
import { EXTRA_ENDPOINTS } from "../../config/apiEndpoints"
Modal.setAppElement("#root") // Replace #root with your root element ID

const TaskModal = ({ taskModalOpen, closeTaskModal, isLoggedIn }) => {
  const lastClickTimes = JSON.parse(localStorage.getItem("lastClickTimes")) || {}
  const token = useSelector((state) => state.auth.token)
  const userId = useSelector((state) => state.auth.user?.id)
  const [fingerprint, setFingerprint] = React.useState(null)
  const [instagramModalOpen, setInstagramModalOpen] = useState(false)
  const [instagramCaption, setInstagramCaption] = useState("")
  // Define closeInstagramModal here, outside handleSocialReward
  const closeInstagramModal = () => {
    setInstagramModalOpen(false)
  }
  useEffect(() => {
    FingerprintJS.load().then((fp) => {
      fp.get().then((result) => {
        setFingerprint(result.visitorId)
      })
    })
  }, [])

  const tasks = [
    { id: 1, action: "facebook_share", reward: "$1", label: "Share on Facebook", icon: FaFacebook },
    { id: 2, action: "instagram_post", reward: "$1", label: "Post on Instagram", icon: FaInstagram },
    { id: 3, action: "twitter_tweet", reward: "$1", label: "Tweet on Twitter", icon: FaTwitter },
    { id: 4, action: "pinterest_pin", reward: "$1", label: "Pin on Pinterest", icon: FaPinterest },
  ]
  const [loading, setLoading] = useState(false)

  const generateUniqueUrl = (userId, action) => {
    const timestamp = new Date().getTime() // Current timestamp in milliseconds
    const firstEncodeUserId = btoa(userId)
    const reversedUserId = firstEncodeUserId.split("").reverse().join("")
    const doubleEncodedUserId = btoa(reversedUserId)
    const firstEncodeTimestamp = btoa(timestamp.toString())
    const reversedTimestamp = firstEncodeTimestamp.split("").reverse().join("")
    const doubleEncodedTimestamp = btoa(reversedTimestamp)

    return `https://luckycharmsweep.com/social-reward?user=${doubleEncodedUserId}&action=${action}&t=${doubleEncodedTimestamp}`
  }

  const handleSocialReward = async (action) => {
    if (!isLoggedIn) {
      toast.warn("Please sign in to complete this task.")
      return
    }

    const uniqueUrl = generateUniqueUrl(userId, action)

    switch (action) {
      case "facebook_share":
        const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(uniqueUrl)}&quote=Juwa - 100% Legit Payouts - Download Juwa - Lucky charm sweep\n\n100% Legit\nFast Payout and Deposit\n24/7 hours service\n#Luckycharmsweep`
        window.open(facebookShareUrl, "_blank")

        break

      case "instagram_post":
        {
          const imageUrl = "https://d1txq81lrc562k.cloudfront.net/luckycharm.jpg"
          const caption = `Check out this awesome site: ${uniqueUrl} #Luckycharmsweep`

          // 1. Download the image
          // 1. Download the image using the PHP file
          const downloadUrl = `${EXTRA_ENDPOINTS.DOWNLOAD_IMAGE}?url=https://d1txq81lrc562k.cloudfront.net/Luck_Charm_BANNER_dollar10.jpg`
          window.open(downloadUrl, "_blank") // Open the download link in a new tab

          // 2. Copy caption to clipboard
          navigator.clipboard
            .writeText(caption)
            .then(() => {
              // 3. Open the modal and set the caption
              setInstagramCaption(caption)
              setInstagramModalOpen(true)
            })
            .catch((err) => {
              console.error("Failed to copy: ", err)
              setInstagramCaption(caption) // Set caption even if copy fails
              setInstagramModalOpen(true)
            })
        }
        break

      case "twitter_tweet":
        const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this awesome site: ${uniqueUrl} #Luckycharmsweep`)}`
        window.open(twitterShareUrl, "_blank")
        break

      case "pinterest_pin":
        const pinterestShareUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(uniqueUrl)}&media=${encodeURIComponent("https://d1txq81lrc562k.cloudfront.net/Luck_Charm_BANNER_dollar10.jpg")}&description=${encodeURIComponent(`Check out this awesome site: ${uniqueUrl} #Luckycharmsweep`)}`
        window.open(pinterestShareUrl, "_blank")
        break

      default:
        window.open(`https://luckycharmsweep.com/`, "_blank")
    }
  }

  if (!taskModalOpen) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-80 p-4">
      <div className="relative bg-gradient-to-br from-gray-800 via-black to-gray-900 text-white rounded-lg w-full max-w-md p-6 shadow-2xl">
        <button className="absolute top-3 right-3 text-white text-2xl" onClick={closeTaskModal}>
          &times;
        </button>

        <div
          className="flex justify-center items-center h-28 bg-cover bg-center rounded-t-lg w-full"
          style={{
            backgroundImage: `url(${WeeklyPopupBgImg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            borderTopLeftRadius: "0.5rem",
            borderTopRightRadius: "0.5rem",
          }}
        >
          <h2 className="text-2xl font-bold text-yellow-400 tracking-wide">Earn Free Bonuses</h2>
        </div>

        <p className="text-center text-white font-bold text-sm mt-2">
          1. Click "Share" below. Share on your chosen platform.
          <br />
          2. *Click the link you just shared* to claim your reward!
        </p>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-3">
            <thead>
              <tr>
                <th className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-semibold p-3 rounded-tl-lg">
                  Reward Condition
                </th>
                <th className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-semibold p-3">Bonus</th>
                <th className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-semibold p-3 rounded-tr-lg">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => {
                const IconComponent = task.icon
                return (
                  <tr
                    key={task.id}
                    className="bg-purple-600 text-center rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
                  >
                    <td
                      className="flex items-center gap-2 p-3 justify-start rounded-lg border-l-4 border-yellow-500 pl-4"
                      style={{ borderRadius: "0.375rem" }}
                    >
                      <IconComponent className="text-yellow-400 text-lg" />
                      <span>{task.label}</span>
                    </td>
                    <td className="p-3 text-yellow-300">{task.reward}</td>
                    <td className="p-3 rounded-r-lg">
                      <button
                        className="w-full max-w-[100px] bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-500 text-black font-semibold py-2 rounded transition-transform transform hover:scale-105"
                        onClick={() => handleSocialReward(task.action)}
                      >
                        {task.label.split(" ")[0]}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {/* Trustpilot Widget */}
      </div>
      {/* Instagram Modal */}
      <Modal
        isOpen={instagramModalOpen}
        onRequestClose={closeInstagramModal}
        style={{
          content: {
            background: "rgba(0, 0, 0, 0.8)",
            color: "white",
            borderRadius: "8px",
            padding: "20px",
            maxWidth: "400px",
            margin: "0 auto",
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            transform: "translate(-50%, -50%)",
          },
          overlay: {
            background: "rgba(0, 0, 0, 0.5)",
            zIndex: 1000,
          },
        }}
      >
        <h2 className="text-lg font-bold mb-4">Instagram Instructions</h2>
        <p>1. An image has been downloaded to your device.</p>
        <p>2. Upload this image to Instagram.</p>
        <p>3. Click the button below to copy the caption:</p>
        {/* Clipboard copy button */}
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2"
          onClick={() => {
            navigator.clipboard.writeText(instagramCaption)
            toast.success("Caption copied to clipboard!") // Optional toast notification
          }}
        >
          Copy Caption
        </button>
        {/* Display caption (optional) */}
        <p className="mt-2">
          <span className="font-bold">Caption:</span> {instagramCaption}
        </p>
        <p>4. Share your post!</p>
        <p>5. *Click the link you just shared* to claim your reward!</p>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
          onClick={closeInstagramModal}
        >
          Close
        </button>
      </Modal>
    </div>
  )
}

export default TaskModal
