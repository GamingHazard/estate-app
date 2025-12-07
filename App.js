import React, { useState, useEffect } from 'react';
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { ThemeProvider } from "./context/ThemeContext";
import ThemedNavigation from './components/ThemedNavigation';
import SplashScreen from './screens/SplashScreen';
import { preloadImages } from './utils/imagePreloader';
import AuthScreens from './screens/AccountScreens/AuthScreens';

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      await preloadImages();
    } catch (error) {
      console.error('Error during initialization:', error);
    }
  };

  const handleLoadComplete = () => {
    setIsLoading(false);
  };

  return (
    <ThemeProvider>
      <NavigationContainer>
        {isLoading ? (
          <SplashScreen onLoadComplete={handleLoadComplete} />
        ) : (
          <ThemedNavigation />
        )}
        <StatusBar hidden={true} />
      </NavigationContainer>
      {/* <AuthScreens /> */}
    </ThemeProvider>
  );
};

export default App;
