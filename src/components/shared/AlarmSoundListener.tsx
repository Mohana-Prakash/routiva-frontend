"use client";

import { useEffect } from "react";
import { playAlarmSound } from "@/lib/alarm-sound";

/**
 * A push notification's system chime is entirely OS/browser-controlled — the Notifications
 * API has no way to attach a custom sound. When the app is open in a tab, this plays an
 * actual audible alarm instead, triggered by a postMessage from the service worker's push
 * handler (worker/index.js) the moment a reminder arrives.
 */
export function AlarmSoundListener() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    function handleMessage(event: MessageEvent) {
      if (event.data?.type === "ALARM_SOUND") {
        playAlarmSound();
      }
    }

    navigator.serviceWorker.addEventListener("message", handleMessage);
    return () => navigator.serviceWorker.removeEventListener("message", handleMessage);
  }, []);

  return null;
}
