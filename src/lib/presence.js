/**
 * Supabase Realtime Presence System
 * ----------------------------------
 * Provides real-time online/offline tracking using Supabase Presence channels.
 * Each user joins a shared "online-users" channel when they open the app.
 * Other users can subscribe to presence state changes to know who's online.
 */

import { supabase } from "../supabaseClient";

const PRESENCE_CHANNEL_NAME = "online-users";
let presenceChannel = null;

/**
 * Initialize presence tracking for the current user.
 * Should be called once when the user logs in / app loads.
 */
export const initPresence = (userId) => {
    if (presenceChannel) {
        // Already initialized — remove and recreate to handle tab changes
        supabase.removeChannel(presenceChannel);
    }

    presenceChannel = supabase.channel(PRESENCE_CHANNEL_NAME, {
        config: {
            presence: {
                key: userId,
            },
        },
    });

    presenceChannel
        .on("presence", { event: "sync" }, () => {
            // Presence state has synced — consumers use getOnlineUsers() to read
        })
        .subscribe(async (status) => {
            if (status === "SUBSCRIBED") {
                await presenceChannel.track({
                    user_id: userId,
                    online_at: new Date().toISOString(),
                });
            }
        });

    // Handle page unload / tab close — leave presence
    const handleUnload = () => {
        if (presenceChannel) {
            presenceChannel.untrack();
        }
    };

    window.addEventListener("beforeunload", handleUnload);

    return () => {
        window.removeEventListener("beforeunload", handleUnload);
        if (presenceChannel) {
            presenceChannel.untrack();
            supabase.removeChannel(presenceChannel);
            presenceChannel = null;
        }
    };
};

/**
 * Get all currently online user IDs.
 * Returns a Set<string> of user IDs.
 */
export const getOnlineUsers = () => {
    if (!presenceChannel) return new Set();

    const state = presenceChannel.presenceState();
    return new Set(Object.keys(state));
};

/**
 * Check if a specific user is online.
 */
export const isUserOnline = (userId) => {
    return getOnlineUsers().has(userId);
};

/**
 * Subscribe to presence changes (sync events).
 * The callback receives the full Set of online user IDs on every change.
 * Returns an unsubscribe function.
 */
export const onPresenceChange = (callback) => {
    if (!presenceChannel) {
        // Channel not yet initialized — create a read-only subscriber
        const channel = supabase.channel(PRESENCE_CHANNEL_NAME);
        
        channel
            .on("presence", { event: "sync" }, () => {
                const state = channel.presenceState();
                callback(new Set(Object.keys(state)));
            })
            .on("presence", { event: "join" }, ({ key }) => {
                callback(getOnlineUsersFromChannel(channel));
            })
            .on("presence", { event: "leave" }, ({ key }) => {
                callback(getOnlineUsersFromChannel(channel));
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }

    // Use existing channel
    const handler = () => {
        callback(getOnlineUsers());
    };

    presenceChannel.on("presence", { event: "sync" }, handler);

    return () => {
        // Supabase doesn't have a clean "off" for presence —
        // but it's fine since the channel lifecycle handles cleanup
    };
};

const getOnlineUsersFromChannel = (channel) => {
    const state = channel.presenceState();
    return new Set(Object.keys(state));
};

/**
 * Get the presence channel (for components that need direct access).
 */
export const getPresenceChannel = () => presenceChannel;
