# Trace

**Lightweight event tracking for JavaScript & TypeScript apps.**  
Easily track and sync user interactions anywhere in your app, with optional **auto-syncing, user data collection, and unique event tracking**.

## Features
**Track events** anywhere in your app.  
**Auto-sync tracked events** whenever they occur.  
**Prevent duplicate event tracking** with `onlyTrackUniqueEvents`.  
**Collect user data** (OS, browser, location) if enabled.  
**Query previous events** using `trace.query()`.  
**Clear all stored events** when needed.  

---

## Installation

```bash
npm install trace-everything
```

or

```bash
yarn add trace-everything
```

or

```bash
bun add trace-everything
```

---

## Usage

### **Initialize Trace**

```tsx
import { createTrace } from "trace-everything";

// Create a trace instance
const trace = createTrace({
  onlyTrackUniqueEvents: true, // Prevent duplicate event tracking
  collectUserData: true, // Capture OS, browser, location, etc.
});
```

---

### **Track & Sync Page Visits**

```tsx
useEffect(() => {
  trace
    .track("page_visit", {
      path: window.location.href,
    })
    .sync(async (event) => {
      // Automatically send analytics when a user visits a page
      await sendToAnalyticsService({
        browser: event.browser,
        location: event.location,
        device: event.deviceType,
        os: event.os,
        path: event.properties.path,
      });
    });
}, []);
```

---

### **Track Button Click & Sync**

```tsx
<button
  onClick={() => {
    trace
      .track("product_saved", {
        productId: "123",
        category: "electronics",
        price: 299.99,
        saveMethod: "manual",
      })
      .sync(async (event) => {
        // Notify user when they save a product
        await sendProductSaveNotification(event);
      });
  }}
>
  {trace.query("product_saved") ? "Saved" : "Save"} Product
</button>
```

---

### **Track Scroll Progress**

```tsx
<button
  onClick={() => {
    trace.track("scroll_depth", { scroll: "75%" });
  }}
>
  Go to next page
</button>
```

---

## **How `.sync()` Works**

The `.sync()` function allows you to automatically send tracked events to a server, analytics tool, or any custom destination.

```tsx
trace.track("user_signup", { plan: "pro" }).sync(async (event) => {
  await sendToServer(event);
});
```

If `.sync()` is **not used**, the event is still **stored in localStorage** and can be retrieved later using:

```tsx
const lastSignup = trace.query("user_signup");
console.log(lastSignup);
```

---

## **Preventing Duplicate Event Tracking**

Setting `onlyTrackUniqueEvents` to `true` ensures that an event is only tracked once per session.  
If a user saves the same product multiple times, it will not trigger additional events.

```tsx
const trace = createTrace({ onlyTrackUniqueEvents: true });
trace.track("product_saved", { productId: "123" });
```

---

## **Query Events**

You can retrieve stored events using `trace.query()`:

```tsx
const savedEvent = trace.query("product_saved");
console.log(savedEvent ? "User has saved a product" : "No saved products yet");
```

---

## **Clear All Events**

To reset the event log:

```tsx
trace.clear();
console.log("All events cleared!");
```

---



