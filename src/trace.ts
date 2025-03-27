import { UAParser } from "ua-parser-js";
import { TraceEvent, TraceOptions } from "./types";


const ua = navigator.userAgent;
const { browser, os, device } = UAParser(ua);
export const createTrace = (options: TraceOptions = {}) => {
  const {
    autoSync = true,
    onlyTrackUniqueEvents = false,
    sessionKey = "trace_session",
  } = options;

  const context = {
    browser: browser.name,
    location: detectLocation(),
    deviceType: device.type,
    os: os.name,
  };

  const getSessionId = () => {
    let sessionId = localStorage.getItem(sessionKey);
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem(sessionKey, sessionId);
    }
    return sessionId;
  };
  const trackedEvents = new Set<string>();
  return {
    track: (name: string, properties: Record<string, any> = {}) => {
      const sessionId = getSessionId();
      const eventSignature = `${sessionId}_${name}`;
      const storedEvents: TraceEvent[] = JSON.parse(
        localStorage.getItem("trace_logs") || "[]"
      );
      const existingEvent = storedEvents.find((event) => event.name === name);
      if (onlyTrackUniqueEvents) {
        if (existingEvent) {
          existingEvent.count = (existingEvent.count || 1) + 1;
          localStorage.setItem("trace_logs", JSON.stringify(storedEvents));
          return;
        }
        trackedEvents.add(eventSignature);
      }

      // If not only tracking unique events, we always push a new event
      storedEvents.push({
        name,
        timeStamp: Date.now(),
        sessionId,
        properties,
        count: 1,
        ...context,
      });

      localStorage.setItem("trace_logs", JSON.stringify(storedEvents));
    },

    getLogs: () => JSON.parse(localStorage.getItem("trace_logs") || "[]"),
    clear: () => localStorage.removeItem("trace_logs"),
    sync: async (syncFn: (events: TraceEvent[]) => Promise<void>) => {
      const logs = JSON.parse(localStorage.getItem("trace_logs") || "[]");
      if (logs.length === 0) {
        console.warn("No events available, so we cant sync");
        return;
      }
      try {
        await syncFn(logs);
      } catch (error) {
        console.error("Sync failed:", error);
      }
    },
  };
};

const detectLocation = () => {
    // WORK TO DO HERE
  return "Lagos, Nigeria";
};
