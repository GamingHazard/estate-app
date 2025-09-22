import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

/**
 * useInternetConnection
 * Checks for active internet connection using React Native NetInfo.
 * Returns true if an active internet connection is detected, false otherwise.
 */
export function useInternetConnection() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });

    // Initial check
    NetInfo.fetch().then(state => {
      setIsConnected(state.isConnected);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return isConnected;
}
