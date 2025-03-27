export interface TraceOptions {
  autoSync?: boolean;
  onlyTrackUniqueEvents?: boolean;
  sessionKey?: string;
}
export interface TraceEvent {
  sessionId: string;
  name: string;
  properties: Record<string, any>;
  timeStamp: number;
  browser: string | undefined;
  location: string | undefined;
  deviceType:
    | "mobile"
    | "tablet"
    | "console"
    | "smarttv"
    | "wearable"
    | "xr"
    | "embedded"
    | undefined;
  os: string | undefined;
  count: number | undefined;
}
