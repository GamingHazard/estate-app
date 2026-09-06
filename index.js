import { AppRegistry } from "react-native";
import { registerRootComponent } from "expo";
import App from "./src/app/App";

AppRegistry.registerComponent("main", () => App);
registerRootComponent(App);
