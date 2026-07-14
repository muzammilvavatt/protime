"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { clockInAction, clockOutAction } from "@/actions/attendance.actions";
import { Clock, LogIn, LogOut, CheckCircle, AlertTriangle, MapPin, Camera, X } from "lucide-react";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";
import { uploadFileToServerAction } from "@/actions/upload.actions";
import { Button } from "./ui/button";
import { toast } from "sonner";

interface AttendanceRecord {
  clockIn: string;
  clockOut?: string;
}

interface AttendanceUser {
  id: string;
  profilePictureUrl?: string | null;
}

export function AttendanceTracker({ todayRecord, user, requireSelfieVerification }: { todayRecord: any, user: any, requireSelfieVerification: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showClockOutModal, setShowClockOutModal] = useState(false);
  
  // Selfie State
  const [showCamera, setShowCamera] = useState(false);
  const [isModelsLoaded, setIsModelsLoaded] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const webcamRef = useRef<Webcam>(null);

  const loadModels = async () => {
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/models')
      ]);
      setIsModelsLoaded(true);
    } catch (err) {
      console.error("Failed to load models", err);
      setErrorMsg("Failed to load facial recognition models. Please contact IT.");
    }
  };

  useEffect(() => {
    if (showCamera && !isModelsLoaded) {
      loadModels();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showCamera, isModelsLoaded]);

  const handleInitialClockInClick = () => {
    if (requireSelfieVerification) {
      setShowCamera(true);
      setErrorMsg(null);
    } else {
      doClockIn();
    }
  };

  const captureAndClockIn = async () => {
    if (!webcamRef.current) return;
    setErrorMsg(null);
    setIsAnalyzing(true);
    
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) {
      setErrorMsg("Failed to capture image.");
      setIsAnalyzing(false);
      return;
    }

    try {
      let isMatch = false;
      let photoUrl = undefined;
      
      if (user.profilePictureUrl) {
        try {
          const referenceImage = await faceapi.fetchImage(user.profilePictureUrl);
          const refDetection = await faceapi.detectSingleFace(referenceImage, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();
          
          const capturedImage = await faceapi.fetchImage(imageSrc);
          const capturedDetection = await faceapi.detectSingleFace(capturedImage, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();
          
          if (refDetection && capturedDetection) {
            const distance = faceapi.euclideanDistance(refDetection.descriptor, capturedDetection.descriptor);
            console.log("Face Match Distance:", distance);
            
            // VERY STRICT threshold. Default is 0.6. 
            // 0.38 prevents almost all false positives.
            if (distance < 0.45) {
              isMatch = true; // AI matched!
            }
          }
        } catch (aiError) {
          console.warn("AI Comparison failed, falling back to manual review.", aiError);
        }
      }

      if (!isMatch) {
        const res = await fetch(imageSrc);
        const blob = await res.blob();
        
        const formData = new FormData();
        formData.append("file", blob, "selfie.jpeg");

        // eslint-disable-next-line react-hooks/purity
        const fileName = `attendance-${user.id}-${Date.now()}.jpeg`;
        const filePath = `attendance-photos/${fileName}`;

        photoUrl = await uploadFileToServerAction(formData, filePath);
      }

      setShowCamera(false);
      doClockIn(photoUrl, isMatch);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "An error occurred during verification.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const doClockIn = (photoUrl?: string, isPhotoApproved: boolean = false) => {
    if (!navigator.geolocation) {
      setErrorMsg("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        startTransition(async () => {
          const res = await clockInAction({ lat: latitude, lng: longitude }, photoUrl, isPhotoApproved);
          if (res?.error) {
            setErrorMsg(res.error);
            toast.error(res.error);
          } else {
            toast.success("Successfully clocked in! Have a great day at work.");
          }
        });
      },
      () => setErrorMsg("Failed to get location. Please allow location access."),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleClockOut = () => {
    setShowClockOutModal(true);
  };

  const confirmClockOut = () => {
    setShowClockOutModal(false);
    setErrorMsg(null);
    startTransition(async () => {
      const res = await clockOutAction();
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Successfully clocked out! Great work today.");
      }
    });
  };

  const hasClockedIn = !!todayRecord;
  const hasClockedOut = !!todayRecord?.clockOut;
  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="bg-white rounded-xl ring-1 ring-slate-200 shadow-sm overflow-hidden animate-fade-in-up">
      <div className="bg-gradient-to-r from-indigo-600 to-violet-700 px-5 py-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center">
          <Clock className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-white font-bold text-base leading-tight">Attendance</h2>
          <p className="text-indigo-200 text-xs">Today&apos;s punch record</p>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {errorMsg && (
          <div className="flex items-start gap-2.5 bg-rose-50 text-rose-700 ring-1 ring-rose-200 rounded-lg px-3.5 py-3 text-sm">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Camera View State */}
        {showCamera && !hasClockedIn && (
          <div className="space-y-4 animate-fade-in-up">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-slate-900 text-sm">Selfie Verification</h3>
              <button onClick={() => setShowCamera(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="relative rounded-xl overflow-hidden bg-slate-900 aspect-video ring-1 ring-slate-200">
              {!isModelsLoaded ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white/70">
                  <svg className="animate-spin w-8 h-8 mb-3 text-indigo-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span className="text-xs font-medium tracking-widest uppercase">Initializing AI</span>
                </div>
              ) : (
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{ facingMode: "user" }}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            
            <Button
              onClick={captureAndClockIn}
              disabled={!isModelsLoaded || isAnalyzing}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-5 shadow-sm font-semibold"
            >
              {isAnalyzing ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Verifying Face...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Camera className="w-5 h-5" /> Capture & Clock In
                </span>
              )}
            </Button>
            {!user.profilePictureUrl && isModelsLoaded && (
               <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg text-center">
                 You haven&apos;t uploaded a profile picture in Settings. Your selfie will be manually reviewed by Admin.
               </p>
            )}
          </div>
        )}

        {/* Default State: Not clocked in */}
        {!hasClockedIn && !showCamera && (
          <div className="flex flex-col items-center text-center py-4 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center ring-1 ring-indigo-100">
              <LogIn className="w-8 h-8 text-indigo-500" />
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-sm">You haven&apos;t clocked in yet</p>
              <p className="text-slate-500 text-xs mt-0.5 flex items-center justify-center gap-1">
                <MapPin className="w-3 h-3" /> Location will be recorded
              </p>
            </div>
            <button
              onClick={handleInitialClockInClick}
              disabled={isPending}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-lg px-4 py-2.5 transition-colors duration-150 flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Clocking in…
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" /> {requireSelfieVerification ? "Verify & Clock In" : "Clock In"}
                </>
              )}
            </button>
          </div>
        )}

        {/* State: Clocked in but not clocked out */}
        {hasClockedIn && !hasClockedOut && (
          <div className="space-y-4">
            <div className="bg-emerald-50 ring-1 ring-emerald-200 rounded-lg px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div>
                <p className="text-emerald-800 font-semibold text-sm">Currently clocked in</p>
                <p className="text-emerald-700 text-xs">
                  Since{" "}
                  <span className="font-bold">{formatTime(todayRecord.clockIn)}</span>
                </p>
              </div>
            </div>
            <button
              onClick={handleClockOut}
              disabled={isPending}
              className="w-full bg-rose-500 hover:bg-rose-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-lg px-4 py-2.5 transition-colors duration-150 flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Clocking out…
                </>
              ) : (
                <>
                  <LogOut className="w-4 h-4" /> Clock Out
                </>
              )}
            </button>
          </div>
        )}

        {/* State: Shift complete */}
        {hasClockedIn && hasClockedOut && (
          <div className="space-y-3">
            <div className="flex flex-col items-center text-center py-2 space-y-2">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center ring-1 ring-emerald-200">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <p className="font-bold text-slate-800 text-sm">Shift Complete!</p>
              <p className="text-slate-500 text-xs">Great work today 🎉</p>
            </div>
            <div className="bg-slate-50 ring-1 ring-slate-200 rounded-lg divide-y divide-slate-200">
              <div className="flex items-center justify-between px-4 py-2.5">
                <span className="text-slate-500 text-xs font-medium flex items-center gap-1.5">
                  <LogIn className="w-3.5 h-3.5 text-emerald-500" /> Clocked In
                </span>
                <span className="font-bold text-slate-800 text-sm">{formatTime(todayRecord.clockIn)}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-2.5">
                <span className="text-slate-500 text-xs font-medium flex items-center gap-1.5">
                  <LogOut className="w-3.5 h-3.5 text-rose-400" /> Clocked Out
                </span>
                <span className="font-bold text-slate-800 text-sm">{todayRecord.clockOut ? formatTime(todayRecord.clockOut as string) : ""}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {showClockOutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-fade-in-up">
            <div className="p-6">
              <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center mb-4 ring-1 ring-rose-100">
                <LogOut className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Confirm Clock Out</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Are you sure you want to clock out? You will not be able to clock back in today.
              </p>
            </div>
            <div className="bg-slate-50 p-4 border-t border-slate-100 flex gap-3">
              <button
                onClick={() => setShowClockOutModal(false)}
                className="flex-1 px-4 py-2 bg-white ring-1 ring-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition-colors focus:ring-2 focus:ring-slate-400 outline-none"
                disabled={isPending}
              >
                Cancel
              </button>
              <button
                onClick={confirmClockOut}
                className="flex-1 px-4 py-2 bg-rose-600 text-white rounded-xl font-medium hover:bg-rose-700 transition-colors flex justify-center items-center gap-2 focus:ring-2 focus:ring-rose-400 focus:ring-offset-1 outline-none shadow-sm"
                disabled={isPending}
              >
                {isPending ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Clock Out"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
