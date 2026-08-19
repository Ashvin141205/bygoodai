import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ApiHandler } from "../../helper/ApiHandler";
import { API_ENDPOINTS } from "../../config/apiEndpoints";
import { toast } from "react-toastify";
import { setCouponCode } from "../../redux/slice/couponSlice";
import circle from "../../assets/circle.png";

// Use CloudFront URL for better performance and caching
const SpinnerAudio = "https://luckycharmsweep-images.s3.us-east-1.amazonaws.com/audiomass-output.mp3";

const WheelComponent = ({
  segments,
  segColors,
  winningSegment,
  onFinished,
  onRotate,
  primaryColor = "#000", // Default primary color
  primaryColoraround = "#fff", // Default outer circle color
  contrastColor = "#fff", // Default contrast color
  buttonText = "Spin", // Default button text
  isOnlyOnce = true,
  size = 180, // Adjusted spinner size for mobile
  upDuration = 50,
  downDuration = 650,
  fontFamily = "Arial",
  setShowPopup = false,
}) => {
  const token = useSelector((state) => state.auth.token);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  let currentSegment = "";
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setFinished] = useState(false);
  const [audio, setAudio] = useState(null);

  let timerHandle = 0;
  const timerDelay = segments.length;
  let angleCurrent = Math.random() * Math.PI * 2; // Random starting position
  let angleDelta = 0;
  let canvasContext = null;
  let maxSpeed = Math.PI / segments.length;
  const upTime = segments.length * upDuration;
  const downTime = segments.length * downDuration;
  let spinStart = 0;
  let frames = 0;
  const centerX = size;
  const centerY = size;

  useEffect(() => {
    wheelInit();
    
    // Pre-load audio on mount for better performance
    try {
      const preloadedAudio = new Audio(SpinnerAudio);
      preloadedAudio.load();
      preloadedAudio.volume = 0.5; // Set volume to 50%
      setAudio(preloadedAudio);
    } catch (error) {
      console.warn("Audio preload failed:", error);
    }
    
    // Cleanup function to prevent memory leaks
    return () => {
      if (timerHandle) {
        clearInterval(timerHandle);
        timerHandle = 0;
      }
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      // Remove event listener to prevent memory leaks
      const canvas = document.getElementById("canvas");
      if (canvas) {
        canvas.removeEventListener("click", spin, false);
      }
    };
  }, []);

  useEffect(() => {
    if (isFinished && audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }, [isFinished]);

  const wheelInit = () => {
    initCanvas();
    wheelDraw();
  };

  const initCanvas = () => {
    let canvas = document.getElementById("canvas");
    if (!canvas) {
      console.error("Canvas element not found");
      return;
    }
    
    // Remove existing listener to prevent duplicates
    canvas.removeEventListener("click", spin, false);
    canvas.addEventListener("click", spin, false);
    
    // Get context with error handling - enable transparency for circle background
    try {
      canvasContext = canvas.getContext("2d", { 
        willReadFrequently: true,
        alpha: true // Enable transparency to show circle image
      });
      
      if (!canvasContext) {
        console.error("Failed to get 2D context");
        return;
      }
    } catch (error) {
      console.error("Canvas context error:", error);
    }
  };

  const spin = async () => {
    // Prevent multiple spins
    if (isStarted || !canvasContext) {
      return;
    }
    
    // First, make the API call to check if the user can spin
    const canSpin = await checkSpinAPI();
    if (canSpin.message) {
      toast.error("No Spins Left Minimum 10$ deposit in 7 days requires to spin the wheel");
      return;
    } else if (!canSpin.spin) {
      setShowPopup(true);
      return;
    }

    setIsStarted(true);
    setFinished(false); // Reset finished state
    
    // Play audio with improved error handling
    if (audio) {
      try {
        audio.currentTime = 0; // Reset to start
        audio.loop = false;
        
        // Attempt to play audio
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log("Audio playing successfully");
            })
            .catch(err => {
              console.warn("Audio playback blocked by browser:", err);
              // User might need to interact with page first
              toast.info("Enable sound for the full experience!", { toastId: "audio-info", autoClose: 2000 });
            });
        }
      } catch (error) {
        console.warn("Audio playback error:", error);
      }
    } else {
      // Fallback: create new audio if preload failed
      try {
        const spinnerSound = new Audio(SpinnerAudio);
        spinnerSound.volume = 0.5;
        spinnerSound.loop = false;
        const playPromise = spinnerSound.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(err => {
            console.warn("Fallback audio failed:", err);
          });
        }
        
        setAudio(spinnerSound);
      } catch (error) {
        console.warn("Fallback audio initialization failed:", error);
      }
    }

    onRotate && onRotate();
    if (timerHandle === 0) {
      spinStart = new Date().getTime();
      // Add randomization to max speed for varied results
      maxSpeed = (Math.PI / segments.length) * (0.85 + Math.random() * 0.3); // Random speed between 0.85x and 1.15x
      frames = 0;
      timerHandle = setInterval(onTimerTick, timerDelay);
    }
  };

  const checkSpinAPI = async () => {
    try {
      const response = await ApiHandler(API_ENDPOINTS.SPIN.CHECK, 'POST', {}, token, dispatch, navigate, { enableRetry: false });
      if (response?.data?.status.code === 1) {
        const data = response.data.data;
        return data;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Error checking spin:", error);
      return false;
    }
  };


  const onTimerTick = async () => {
    frames++;
    draw();
    const duration = new Date().getTime() - spinStart;
    let progress = 0;
    let finished = false;
    if (duration < upTime) {
      progress = duration / upTime;
      angleDelta = maxSpeed * Math.sin((progress * Math.PI) / 2);
    } else {
      progress = duration / downTime;
      angleDelta =
        maxSpeed * Math.sin((progress * Math.PI) / 2 + Math.PI / 2);
      if (progress >= 1) finished = true;
    }

    angleCurrent += angleDelta;
    while (angleCurrent >= Math.PI * 2) angleCurrent -= Math.PI * 2;
    if (finished) {
      setFinished(true);
      setIsStarted(false); // Reset started state to allow next spin
      onFinished && onFinished(currentSegment);
      clearInterval(timerHandle);
      timerHandle = 0;
      angleDelta = 0;

      // Call the second API after the spin
      await handleSpinResult(currentSegment);
    }
  };

  const handleSpinResult = async (result) => {
    let body = {};
    const expiryTime = Date.now() + 24 * 60 * 60 * 1000; // Set expiry time to 24 hours from now

    // Check for "Try Again" result (consumes spin but no reward)
    if (result.includes("Try Again")) {
      body = { bounes: "", couponcode: "", discountPercentage: "", free_spin: "", try_again: true };
      toast.info("🎯 Better luck next time!", { autoClose: 3000 });
    }
    // Check if the result contains a Free Spin
    else if (result.includes("Free Spin")) {
      body = { bounes: "", couponcode: "", discountPercentage: "", free_spin: true, try_again: false };
    } else {
      const value = result.replace("$", ""); // Remove the dollar sign if present

      // Check if the result includes a percentage (indicating a discount)
      if (value.includes("%")) {
        const valuePercentage = value.replace("%", ""); // Remove the percentage sign
        const couponCode = generateCouponCode(); // Generate the coupon code
        body = { bounes: "", couponcode: couponCode, discountPercentage: valuePercentage, free_spin: false, try_again: false };

        // Dispatch the coupon code and expiry time to Redux store
        dispatch(setCouponCode({ couponCode, expiryTime, valuePercentage }));
      } else {
        // Otherwise, treat it as a cash prize (or other bonus)
        body = { bounes: value, couponcode: "", discountPercentage: "", free_spin: false, try_again: false };
      }
    }

    // Now, submit the spin result (including try_again to consume spin)
    await submitSpinResult(body);
  };

  const generateCouponCode = () => {
    // Generate highly unique coupon code using multiple entropy sources
    const timestamp = Date.now(); // Millisecond precision
    const microtime = performance.now().toString().replace('.', ''); // Microsecond precision
    const userId = token ? token.substring(0, 8) : 'GUEST'; // User identifier from token
    
    let cryptoRandom = '';
    try {
      if (window.crypto && window.crypto.getRandomValues) {
        // Use cryptographically secure random values
        const array = new Uint32Array(4);
        window.crypto.getRandomValues(array);
        cryptoRandom = Array.from(array, num => num.toString(36)).join('');
      } else {
        // Fallback to multiple Math.random calls
        cryptoRandom = Math.random().toString(36) + Math.random().toString(36);
      }
    } catch (e) {
      cryptoRandom = Math.random().toString(36) + Math.random().toString(36);
    }
    
    // Combine all entropy sources
    const combined = timestamp + microtime + userId + cryptoRandom + Math.random().toString(36);
    
    // Create hash-like string and take 10 characters for the code
    const hashCode = combined.split('').reduce((acc, char) => {
      return ((acc << 5) - acc) + char.charCodeAt(0);
    }, 0);
    
    // Convert to alphanumeric and ensure uppercase
    const finalCode = (Math.abs(hashCode).toString(36) + cryptoRandom)
      .replace(/[^A-Z0-9]/gi, '')
      .toUpperCase()
      .substring(0, 10);
    
    // Ensure minimum length and add timestamp suffix if needed
    if (finalCode.length < 8) {
      return (finalCode + timestamp.toString(36).toUpperCase()).substring(0, 10);
    }
    
    return finalCode;
  };

  const submitSpinResult = async (body) => {
    setFinished(true);
    try {
      const response = await ApiHandler(API_ENDPOINTS.SPIN.GET_DATA, 'POST', body, token, dispatch, navigate, { enableRetry: false });
      if (response?.data?.status.code === 1) {
        if (body.try_again) {
          // Try again - spin consumed, no reward
          setTimeout(() => navigate('/wheel'), 2000);
        } else if (body.bounes) {
          toast.success("Congratulations! You won $" + body.bounes);
          setTimeout(() => navigate('/wheel'), 2000);
        } else if (body.free_spin) {
          toast.success("🎊 Congratulations! You won a Free Spin!");
          setTimeout(() => navigate('/wheel'), 2000);
        } else if (body.couponcode) {
          toast.success("🎁 You won a " + body.discountPercentage + "% discount coupon! Code: " + body.couponcode, { autoClose: 6000 });
          setTimeout(() => navigate('/wheel'), 2000);
        }
      } else {
        console.error("Error checking spin:");
      }
    } catch (error) {
      console.error("Error checking spin:", error);
    }
  };

  const wheelDraw = () => {
    clear();
    drawWheel();
    drawNeedle();
  };

  const draw = () => {
    clear();
    drawWheel();
    drawNeedle();
  };

  const drawSegment = (key, lastAngle, angle) => {
    if (!canvasContext) return; // Safety check
    
    const ctx = canvasContext;
    const value = segments[key];

    // Begin the path for the segment
    ctx.save();
    
    try {
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, size, lastAngle, angle, false);
      ctx.lineTo(centerX, centerY);
      ctx.closePath();

      // Extract the linear-gradient stops - use modulo to cycle through colors if more segments than colors
      const colorIndex = key % segColors.length;
      const gradientStr = segColors[colorIndex];
      
      // Check if gradientStr is undefined (safety check)
      if (!gradientStr) {
        ctx.fillStyle = "#FF9529"; // Fallback color
        ctx.fill();
        ctx.stroke();
        ctx.restore();
        return;
      }
      
      const colorStops = gradientStr.match(/#[0-9A-Fa-f]{6}/g); // Extract hex codes
      const directionMatch = gradientStr.match(/(\d+\.?\d*)deg/);
      
      // Additional safety check for direction
      if (!directionMatch || !colorStops || colorStops.length < 3) {
        ctx.fillStyle = "#FF9529"; // Fallback color
        ctx.fill();
        ctx.stroke();
        ctx.restore();
        return;
      }
      
      const direction = parseFloat(directionMatch[1]); // Extract the angle

      // Create a canvas gradient based on the extracted direction and color stops
      const gradient = ctx.createLinearGradient(
        centerX + size * Math.cos((direction * Math.PI) / 180), // Start X
        centerY + size * Math.sin((direction * Math.PI) / 180), // Start Y
        centerX - size * Math.cos((direction * Math.PI) / 180), // End X
        centerY - size * Math.sin((direction * Math.PI) / 180)  // End Y
      );

      // Add color stops to the gradient
      gradient.addColorStop(0, colorStops[0]);  // First color stop
      gradient.addColorStop(0.2, colorStops[1]); // Middle color stop
      gradient.addColorStop(1, colorStops[2]);   // Last color stop

      // Set the gradient as the fill style
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.stroke();

      // Draw the text on the segment
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate((lastAngle + angle) / 2);
      ctx.fillStyle = "#ebebeb"; // Text color
      const fontSize = size / 10 + "px";
      ctx.font = `bold ${fontSize} ${fontFamily}`;
      ctx.fillText(value.substr(0, 9), size / 1.6, 0);  // Adjust the text positioning
      ctx.restore();
    } catch (error) {
      console.error("Error drawing segment:", error);
      // Fallback rendering
      ctx.fillStyle = "#FF9529";
      ctx.fill();
    } finally {
      ctx.restore();
    }
  };

  const drawWheel = () => {
    if (!canvasContext) return; // Safety check
    
    const ctx = canvasContext;
    let lastAngle = angleCurrent;
    const len = segments.length;
    const PI2 = Math.PI * 2;
    
    try {
      ctx.lineWidth = 2; // Reduced line width
      ctx.strokeStyle = "white";//line
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";

      for (let i = 1; i <= len; i++) {
        const angle = PI2 * (i / len) + angleCurrent;
        drawSegment(i - 1, lastAngle, angle);
        lastAngle = angle;
      }

      // Draw center button (small and readable)
      // Draw the button
      ctx.beginPath();
      ctx.arc(centerX, centerY, 40, 0, Math.PI * 2, false); // Slightly smaller center button
      ctx.closePath();
      ctx.fillStyle = "#290A47"; // Button fill color
      ctx.lineWidth = 11;
      ctx.strokeStyle = "#FF9529"; // Border color (frame)
      ctx.fill();
      ctx.stroke();

      // Set text properties and draw "Spin" text
      ctx.font = `bold ${size / 10}px ${fontFamily}`;
      ctx.fillStyle = "white"; // Text color for "Spin"
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Spin", centerX, centerY); // Centered on the button

      // Draw the arrow (triangle pointing upwards)
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - 60); // Top point of the arrow

      ctx.closePath();
      ctx.fillStyle = "#FF9529"; // Arrow fill color (matches text)
      ctx.fill();

      // Optionally outline the arrow with a border

      ctx.stroke();
    } catch (error) {
      console.error("Error drawing wheel:", error);
    }
  };

  const drawNeedle = () => {
    const ctx = canvasContext;
    ctx.lineWidth = 2;
    ctx.strokeStyle = contrastColor || "white";
    ctx.beginPath();
    ctx.moveTo(centerX + 8, centerY - 40);
    ctx.lineTo(centerX - 8, centerY - 40);
    ctx.lineTo(centerX, centerY - 60);
    ctx.closePath();
    ctx.fill();

    const change = angleCurrent + Math.PI / 2;
    let i = segments.length - Math.floor((change / (Math.PI * 2)) * segments.length) - 1;
    if (i < 0) i = i + segments.length;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "white";
    ctx.font = `bold ${size / 8}px ${fontFamily}`;
    currentSegment = segments[i];
    // ctx.fillText(currentSegment, centerX, centerY + size + 50);
  };

  const clear = () => {
    const ctx = canvasContext;
    ctx.clearRect(0, 0, size * 2, size * 2);
  };

  return (
    <>
      <div className="relative">
        <img src={circle} alt="circle image" width={380} height={370} className="absolute sm:relative" />
        <div
          id="wheel"
          className="relative sm:absolute top-5 left-7 xs:top-7 xs:left-8 sm:top-6 sm:left-6"
          style={{
            padding: "5px", // Reduced padding for small screens
            display: "flex",
            justifyContent: "center",
            width: "100%", // Ensure the wheel takes the full width of the screen
            maxWidth: "370px", // Cap the max width to fit a typical mobile screen size
          }}
        >
          <canvas
            id="canvas"
            width={350} // Adjusted width to fit mobile screens better
            height={400} // Set height to maintain the aspect ratio
            style={{
              pointerEvents: isFinished && isOnlyOnce ? "none" : "auto",
              maxWidth: "100%", // Make sure the canvas adjusts its size responsively
              height: "auto", // Adjust height responsively to fit small screens
              backgroundColor: "transparent", // Ensure transparent background
            }}
          />
        </div>
      </div>
    </>
  );
};

export default WheelComponent;
