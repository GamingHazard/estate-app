import React from 'react';
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { ThemeProvider } from "./context/ThemeContext";
import ThemedNavigation from './components/ThemedNavigation';

const App = () => {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <ThemedNavigation />
        
        <StatusBar hidden={true} />
      </NavigationContainer>
    </ThemeProvider>
  );
};

export default App;
