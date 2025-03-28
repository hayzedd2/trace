import { UAParser } from "ua-parser-js";
import { TraceEvent, TraceOptions } from "./types";

const ua = navigator.userAgent;
const { browser, os, device } = UAParser(ua);
const getLogs = () => {
  return JSON.parse(localStorage.getItem("trace_logs") || "[]");
};
export const createTrace = (options: TraceOptions = {}) => {
  const {
    onlyTrackUniqueEvents = false,
    collectUserData = false,
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
      const storedEvents: TraceEvent[] = getLogs();
      const existingEvent = storedEvents.find((event) => event.name === name);
      if (onlyTrackUniqueEvents) {
        if (existingEvent) {
          existingEvent.count = (existingEvent.count || 1) + 1;
          localStorage.setItem("trace_logs", JSON.stringify(storedEvents));
          return {
            event: null,
            sync: async () => console.warn("No new event to sync"),
          };
        }
        trackedEvents.add(eventSignature);
      }
      const newEvent = {
        name,
        timeStamp: Date.now(),
        sessionId,
        properties,
        count: 1,
        ...(collectUserData ? context : {}),
      };
      storedEvents.push(newEvent);
      localStorage.setItem("trace_logs", JSON.stringify(storedEvents));
      return {
        event: newEvent,
        sync: async (syncFn: (events: TraceEvent) => Promise<void>) => {
          try {
            await syncFn(newEvent);
          } catch (error) {
            console.error("Sync failed:", error);
          }
        },
      };
    },
    query: (name: string) => {
      const storedEvents: TraceEvent[] = getLogs();
      const eventFound = storedEvents.find((e) => e.name == name);
      return eventFound ?? null;
    },
    getLogs: () => getLogs(),
    clear: () => localStorage.removeItem("trace_logs"),
    syncEvents: async (syncFn: (events: TraceEvent[]) => Promise<void>) => {
      const logs = getLogs();
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
