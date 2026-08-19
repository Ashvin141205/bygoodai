"use client"

import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import Slider from "react-slick"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { getImageUrl } from "../../utils/getImageUrl" // Make sure this path is correct
import HeroBox from "../HeroBox" // Make sure this path is correct
import { ApiHandler } from "../../helper/ApiHandler" // Make sure this path is correct
import { logger } from "../../utils/logger" // Make sure this path is correct
import { EXTRA_ENDPOINTS } from "../../config/apiEndpoints"

const Index = () => {
    const [recentWinners, setRecentWinners] = useState([])
    const [sliderImages, setSliderImages] = useState([])
    const [loadingWinners, setLoadingWinners] = useState(true)
    const [loadingSlider, setLoadingSlider] = useState(true)
    const [firstImageLoaded, setFirstImageLoaded] = useState(false)
    const [isBgLoaded, setIsBgLoaded] = useState(false)
    const token = useSelector((state) => state.auth.token)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const divRef = useRef(null)

    const backgroundImageUrl = getImageUrl("/assets/image/hero-bg.png")

    const sliderSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: firstImageLoaded,
        autoplaySpeed: 3000,
        arrows: false,
    }

    useEffect(() => {
        const fetchRecentWinners = async () => {
            try {
                const response = await ApiHandler(EXTRA_ENDPOINTS.GET_RECENT_WINNER, "GET", undefined, undefined, dispatch, navigate)
                // Limit to 15 most recent winners to reduce memory
                const limitedWinners = response.data.data?.slice(0, 15) || []
                setRecentWinners(limitedWinners)
                setLoadingWinners(false)
            } catch (error) {
                console.error("[HomeComp] Error fetching recent winners:", error)
                logger.error("Error fetching recent winners:", error)
                setLoadingWinners(false)
            }
        }

        const fetchSliderImages = async () => {
            try {
                const response = await ApiHandler(
                    EXTRA_ENDPOINTS.HOMEPAGE_SLIDER,
                    "POST",
                    undefined,
                    token,
                    dispatch,
                    navigate,
                )
                // Limit to 5 slider images to reduce memory
                const limitedSlides = response.data.data?.slice(0, 5) || []
                setSliderImages(limitedSlides)
                setLoadingSlider(false)
            } catch (error) {
                logger.error("Error fetching slider images:", error)
                setLoadingSlider(false)
            }
        }

        fetchRecentWinners()
        fetchSliderImages()
    }, [token, dispatch, navigate])

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setIsBgLoaded(true)
                    observer.disconnect()
                }
            },
            { threshold: 0.1 },
        )
        
        const currentDivRef = divRef.current
        if (currentDivRef) {
            observer.observe(currentDivRef)
        }

        return () => {
            if (currentDivRef) {
                observer.disconnect()
            }
        }
    }, [])

    const handleImageLoad = (index) => {
        if (index === 0) {
            setFirstImageLoaded(true)
        }
    }

    return (
        <div
            ref={divRef}
            style={{
                backgroundImage: isBgLoaded ? `url(${backgroundImageUrl})` : "none",
            }}
            className="flex items-center justify-center min-h-screen bg-cover w-full bg-top"
        >
            <div className="flex gap-24 lgs:gap-16 flex-col lgs:flex-row mt-6">
                {/* === SLIDER SECTION === */}
                <HeroBox title={"Get $10 FREE BONUS on first order!"}>
                    <div className="shadow-[0_0_20px_#FFD700] rounded-xl">
                        {loadingSlider ? (
                            <div className="animate-pulse h-[370px] bg-gray-700 rounded-2xl"></div>
                        ) : (
                            <Slider {...sliderSettings} className="custom-slick-slider">
                                {sliderImages.map((imageData, index) => (
                                    <div key={index} className="w-full h-[370px] flex justify-center items-center overflow-hidden">
                                        <img
                                            className="h-[370px] w-full object-cover rounded-2xl"
                                            src={imageData.image || "/placeholder.svg"}
                                            alt={`hero-${index + 1}`}
                                            width="600"
                                            height="370"
                                            onLoad={() => handleImageLoad(index)}
                                            loading="lazy"
                                            decoding="async"
                                        />
                                    </div>
                                ))}
                            </Slider>
                        )}
                    </div>
                </HeroBox>

                {/* === RECENT WINNERS SECTION === */}
                <HeroBox title={"Recent Winners"}>
                    <div className="shadow-[0_0_20px_#FFD700] rounded-xl relative bg-black overflow-hidden h-[370px] w-full">
                        {loadingWinners ? (
                            <div className="animate-pulse space-y-2 py-2">
                                {Array.from({ length: 5 }).map((_, index) => (
                                    <div key={index} className="flex bg-[#222222] justify-between px-4 pb-2 w-full items-center">
                                        <div className="h-4 bg-gray-700 rounded w-32"></div>
                                        <div className="h-4 bg-gray-700 rounded w-16"></div>
                                        <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
                                    </div>
                                ))}
                            </div>
                        ) : recentWinners.length > 0 ? (
                            <div className="animate-vertical-scroll space-y-2 py-2">
                                {recentWinners.slice(0, 10).map((winner, index) => (
                                    <div
                                        key={index}
                                        className="flex bg-[#222222] justify-between px-4 pb-2 w-full items-center"
                                    >
                                        <span className="winner-email text-white h-fit px-1 py-1 rounded-sm text-xs sm:text-base">
                                            {winner.email}
                                        </span>
                                        <span className="winner-amount text-white h-fit px-5 py-1 font-semibold rounded-sm text-xs sm:text-base">
                                            ${winner.amount}
                                        </span>
                                        <img
                                            src={winner.game_image || "/placeholder.svg"}
                                            alt={winner.game_name}
                                            className="winner-image rounded-full object-cover w-10 h-10"
                                            loading="lazy"
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-white text-sm">No winners yet.</div>
                        )}
                    </div>
                </HeroBox>
            </div>
        </div>
    )
}

export default Index

