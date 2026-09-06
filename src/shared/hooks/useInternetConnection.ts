import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

/**
 * useInternetConnection
 * Checks for active internet connection using React Native NetInfo.
 * Returns true if an active internet connection is detected, false otherwise.
 * Defaults to true during initial load to avoid showing "no internet" flash.
 */
export function useInternetConnection() {
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    const checkConnection = async () => {
      try {
        const state = await NetInfo.fetch();
        if (isMounted) {
          setIsConnected(state.isConnected ?? true);
          setIsInitialized(true);
        }
      } catch (error) {
        console.error('Error checking connection:', error);
        if (isMounted) {
          setIsInitialized(true);
        }
      }
    };

    // Initial check
    checkConnection();

    // Listen for connection changes
    const unsubscribe = NetInfo.addEventListener(state => {
      if (isMounted) {
        setIsConnected(state.isConnected ?? true);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return isConnected;
}
