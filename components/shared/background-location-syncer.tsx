'use client';

import { useEffect, useRef } from 'react';
import { updateUserLocation } from '@/app/actions/user';

const SYNC_INTERVAL_MS = 1000 * 60 * 15; // Sync every 15 minutes to avoid battery drain
const STORAGE_KEY = 'last_location_sync';

export function BackgroundLocationSyncer() {
    // persistent ref to avoid stale closures if we used interval, 
    // though here we use simple effect logic.
    const mounted = useRef(false);

    useEffect(() => {
        if (mounted.current) return;
        mounted.current = true;

        if (!('geolocation' in navigator)) {
            console.warn('Geolocation not supported');
            return;
        }

        const syncLocation = () => {
            // Check throttle
            const lastSync = localStorage.getItem(STORAGE_KEY);
            const now = Date.now();

            // If synced less than 5 mins ago, skip (debouncing refreshes)
            if (lastSync && now - parseInt(lastSync) < 1000 * 60 * 5) {
                return;
            }

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude, accuracy } = position.coords;

                    try {
                        // Fire and forget - don't block UI
                        await updateUserLocation(latitude, longitude, accuracy);
                        localStorage.setItem(STORAGE_KEY, now.toString());
                        console.debug(`Location synced: ${latitude.toFixed(4)}, ${longitude.toFixed(4)} (±${accuracy}m)`);
                    } catch (err) {
                        console.error('Failed to sync location to server', err);
                    }
                },
                (error) => {
                    // Fail silently as requested (no UI)
                    // Code 1: Permission denied
                    // Code 2: Position unavailable
                    // Code 3: Timeout
                    if (error.code !== 1) { // Log warnings for technical failures, but ignore permission denied to keep console clean
                        console.warn('Location sync failed:', error.message);
                    }
                },
                {
                    enableHighAccuracy: true, // As requested
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        };

        // Run immediately on mount
        syncLocation();
    }, []);

    return null; // Headless
}
