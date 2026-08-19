"use client"

import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"
import { initializeApp } from "firebase/app"
import { getMessaging, getToken, isSupported } from "firebase/messaging"
import { BellIcon } from "../utils/Icons"
import { ApiHandler } from "../helper/ApiHandler"
import { logger } from "../utils/logger"
import { EXTRA_ENDPOINTS } from "../config/apiEndpoints"

// Paste your firebaseConfig here
const firebaseConfig = {
  apiKey: "AIzaSyDSvzjWkcM9LzOBQPNsm82oREAZbYqSCLU",
  authDomain: "lucky-charm-sweep.firebaseapp.com",
  projectId: "lucky-charm-sweep",
  storageBucket: "lucky-charm-sweep.firebasestorage.app",
  messagingSenderId: "988486859123",
  appId: "1:988486859123:web:2bcdc2ed6679383d362d06",
  measurementId: "G-Q7WS348D6D",
}
// Initialize Firebase
const app = initializeApp(firebaseConfig)

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubscribedInDb, setIsSubscribedInDb] = useState(false)
  const [permission, setPermission] = useState(typeof Notification !== "undefined" ? Notification.permission : "default")
  const [isLoading, setIsLoading] = useState(true)
  const [messaging, setMessaging] = useState(null)
  const [isMessagingSupported, setIsMessagingSupported] = useState(false)

  const { token, user } = useSelector((state) => state.auth)
  const navigate = useNavigate()

  useEffect(() => {
    let isMounted = true

    const initMessaging = async () => {
      if (typeof window === "undefined" || typeof navigator === "undefined") {
        return
      }

      if (!("Notification" in window)) {
        return
      }

      try {
        const supported = await isSupported()
        if (!isMounted || !supported) {
          return
        }

        const messagingInstance = getMessaging(app)
        setMessaging(messagingInstance)
        setIsMessagingSupported(true)
      } catch (error) {
        logger.warn("Firebase messaging unsupported for this browser/device", error)
      }
    }

    initMessaging()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!token) {
      setIsLoading(false)
      return
    }

    const checkDb = async () => {
      try {
        const response = await ApiHandler(EXTRA_ENDPOINTS.CHECK_SUBSCRIPTION, "POST", {}, token, null, navigate)
        logger.log("Subscription status:", response)
        if (response.data.status === 1 && response.data.data.isSubscribed) {
          setIsSubscribedInDb(true)
        }
      } catch (error) {
        /* Handled by ApiHandler */
      }
      setIsLoading(false)
    }
    checkDb()
  }, [token, navigate])

  const handleEnableNotifications = async () => {
    setIsOpen(false)

    if (!isMessagingSupported || !messaging) {
      toast.error("Notifications are not supported on this browser.")
      return
    }

    try {
      const currentPermission = await Notification.requestPermission()
      setPermission(currentPermission)

      if (currentPermission === "granted") {
        // Get the token
        const fcmToken = await getToken(messaging, {
          vapidKey: "BFVPMi9ej9K2rwaiYaUTxqb-vxX2ezZQvD0Gpgwv_D2xmZgP-4mNrrCVkEx6JVy0_1pHe6n9yDAr3qQ56ZQIzUs",
        })

        if (fcmToken && user?.id) {
          const data = { fcmToken }
          const response = await ApiHandler(EXTRA_ENDPOINTS.SAVE_FCM_TOKEN, "POST", data, token, null, navigate)
          logger.log("FCM Token saved:", response)
          if (response.status === 200 && typeof response.data?.data === "string") {
            toast.success("Notifications enabled successfully!")
            setIsSubscribedInDb(true)
          } else {
            logger.warn("Unexpected response structure:", response)
            toast.error("Failed to enable notifications.")
          }
        }
      }
    } catch (error) {
      logger.error("An error occurred while enabling notifications:", error)
      toast.error("Failed to enable notifications.")
    }
  }

  if (isLoading || !token || !isMessagingSupported || permission === "granted" || isSubscribedInDb) {
    return null
  }

  return (
    <>
      <div className="notification-bell-container" onClick={() => setIsOpen(true)}>
        <BellIcon className="notification-bell-icon" />
      </div>
      {isOpen && (
        <div className="notification-popup-overlay">
          <div className="notification-popup">
            <h3>Enable Notifications</h3>
            <p>Get instant updates on your deposits, withdrawals, and exclusive free play offers.</p>
            <div className="notification-popup-buttons">
              <button onClick={() => setIsOpen(false)} className="popup-button-later">
                Maybe Later
              </button>
              <button onClick={handleEnableNotifications} className="popup-button-enable">
                Enable
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default NotificationBell
