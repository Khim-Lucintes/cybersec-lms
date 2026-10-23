import { supabase } from "./supabaseClient";
import { logAuditAction } from "./superAdminService";

const STORAGE_KEY = "cdi409_maintenance_mode";
const EVENT_NAME = "cdi409:maintenance-mode-changed";
const CHANNEL_NAME = "cdi409_maintenance_channel";

const DEFAULT_STATE = {
  active: false,
  title: "FSUU IT & Data Center • System Maintenance",
  message: "The CDI 409 Cybercrime Forensics Platform is currently under scheduled maintenance for official academic examinations and cloud database synchronization.",
  estimatedDuration: "15-30 Minutes",
  initiatedBy: "System Administrator",
  updatedAt: null
};

// Singleton persistent BroadcastChannel to avoid premature closure
let persistentChannel = null;
function getSharedBroadcastChannel() {
  if (typeof window !== "undefined" && typeof window.BroadcastChannel !== "undefined") {
    if (!persistentChannel) {
      try {
        persistentChannel = new BroadcastChannel(CHANNEL_NAME);
      } catch (e) {
        persistentChannel = null;
      }
    }
  }
  return persistentChannel;
}

/**
 * Retrieve current maintenance status from localStorage (instant synchronous check)
 */
export function getMaintenanceStatus() {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_STATE, ...parsed };
  } catch (e) {
    console.error("Error reading maintenance status from storage:", e);
    return DEFAULT_STATE;
  }
}

/**
 * Fetch latest maintenance status from Supabase cloud database
 * Enables cross-browser, incognito, and cross-device synchronization
 */
export async function fetchCloudMaintenanceStatus() {
  try {
    const { data, error } = await supabase
      .from("audit_logs")
      .select("*")
      .ilike("action", "%System Maintenance Mode%")
      .order("created_at", { ascending: false })
      .limit(1);

    if (error || !data || data.length === 0) {
      return null;
    }

    const latest = data[0];
    const isLockoutActive = latest.action.includes("ACTIVE") && !latest.action.includes("INACTIVE");
    return {
      active: isLockoutActive,
      title: "FSUU IT & Data Center • System Maintenance",
      message: isLockoutActive
        ? "The CDI 409 Cybercrime Forensics Platform is currently under scheduled maintenance for official academic examinations and cloud database synchronization."
        : "Normal operations active.",
      estimatedDuration: "15-30 Minutes",
      initiatedBy: latest.actor_name || "System Administrator",
      updatedAt: latest.created_at
    };
  } catch (err) {
    console.warn("Cloud maintenance status query notice:", err?.message || err);
    return null;
  }
}

/**
 * Update maintenance status both locally (immediate 0ms response) and in Supabase cloud
 */
export async function setMaintenanceStatus(active, options = {}) {
  const current = getMaintenanceStatus();
  const next = {
    ...current,
    ...options,
    active: Boolean(active),
    updatedAt: new Date().toISOString()
  };

  // 1. Instant local write & same-device broadcast
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: next }));
      const channel = getSharedBroadcastChannel();
      if (channel) {
        channel.postMessage(next);
      }
    } catch (e) {
      console.error("Error saving maintenance status locally:", e);
    }
  }

  // 2. Persist to Supabase cloud audit log for global cross-device synchronization
  try {
    await logAuditAction(
      null,
      options.initiatedBy || "System Administrator",
      `System Maintenance Mode toggled to ${active ? "ACTIVE (Lockout Initiated)" : "INACTIVE (Normal Operations Restored)"}`,
      active ? "Critical" : "Standard"
    );
  } catch (err) {
    console.warn("Audit logging notice:", err);
  }

  return next;
}

/**
 * Comprehensive real-time subscription
 * Synchronizes across:
 * 1. BroadcastChannel (inter-tab zero-lag)
 * 2. window storage event (cross-tab same browser)
 * 3. window custom event (in-tab state change)
 * 4. local 800ms poll (failsafe)
 * 5. Supabase Realtime channel + 2.5s cloud polling (cross-browser / cross-device)
 */
export function subscribeToMaintenanceStatus(callback) {
  if (typeof window === "undefined") return () => {};

  let lastActiveState = null;

  const notifyIfChanged = (status, force = false) => {
    if (!status) return;
    const isActive = Boolean(status.active);
    if (force || isActive !== lastActiveState) {
      lastActiveState = isActive;
      callback(status);
      // Keep localStorage in sync if cloud reported a change
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const storedActive = stored ? JSON.parse(stored).active : null;
        if (storedActive !== isActive) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(status));
        }
      } catch (e) {}
    }
  };

  // 1. Immediate local status notification
  const initial = getMaintenanceStatus();
  notifyIfChanged(initial, true);

  // 2. Cloud status check on subscription mount
  fetchCloudMaintenanceStatus().then((cloudStatus) => {
    if (cloudStatus) {
      notifyIfChanged(cloudStatus);
    }
  });

  // 3. Same-window custom event
  const handleCustomEvent = (e) => {
    if (e.detail) notifyIfChanged(e.detail);
  };

  // 4. Cross-tab storage event
  const handleStorageEvent = (e) => {
    if (e.key === STORAGE_KEY) {
      try {
        const parsed = e.newValue ? JSON.parse(e.newValue) : DEFAULT_STATE;
        notifyIfChanged({ ...DEFAULT_STATE, ...parsed });
      } catch (err) {}
    }
  };

  // 5. BroadcastChannel listener
  const channel = getSharedBroadcastChannel();
  const handleBroadcastMessage = (event) => {
    if (event.data) {
      notifyIfChanged({ ...DEFAULT_STATE, ...event.data });
    }
  };

  window.addEventListener(EVENT_NAME, handleCustomEvent);
  window.addEventListener("storage", handleStorageEvent);
  if (channel) {
    channel.addEventListener("message", handleBroadcastMessage);
  }

  // 6. Fast local poll every 800ms
  const localPollInterval = setInterval(() => {
    const current = getMaintenanceStatus();
    if (Boolean(current.active) !== lastActiveState) {
      notifyIfChanged(current);
    }
  }, 800);

  // 7. Cloud poll every 2500ms for cross-browser, incognito, and mobile sync
  const cloudPollInterval = setInterval(async () => {
    const cloudStatus = await fetchCloudMaintenanceStatus();
    if (cloudStatus && Boolean(cloudStatus.active) !== lastActiveState) {
      notifyIfChanged(cloudStatus);
    }
  }, 2500);

  // 8. Supabase Realtime channel for instant push on audit_logs insert
  let realtimeChannel = null;
  try {
    const chName = `maintenance-sync-${Math.random().toString(36).slice(2, 9)}`;
    const ch = supabase.channel(chName);
    ch.on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "audit_logs" },
      (payload) => {
        const action = payload.new?.action || "";
        if (action.includes("System Maintenance Mode")) {
          const isLockoutActive = action.includes("ACTIVE") && !action.includes("INACTIVE");
          notifyIfChanged({
            ...DEFAULT_STATE,
            active: isLockoutActive,
            updatedAt: payload.new.created_at,
            initiatedBy: payload.new.actor_name || "System Administrator"
          });
        }
      }
    );
    ch.subscribe();
    realtimeChannel = ch;
  } catch (e) {
    console.warn("Realtime maintenance channel notice:", e);
  }

  return () => {
    window.removeEventListener(EVENT_NAME, handleCustomEvent);
    window.removeEventListener("storage", handleStorageEvent);
    if (channel) {
      channel.removeEventListener("message", handleBroadcastMessage);
    }
    clearInterval(localPollInterval);
    clearInterval(cloudPollInterval);
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel);
    }
  };
}
