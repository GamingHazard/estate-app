import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import {
  Ionicons,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

const HomeScreen = () => {
  const { colors, theme, toggleTheme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Tab */}
      <View
        style={{
          height: 70,
          backgroundColor: colors.card,
          paddingHorizontal: 16,
          elevation: 4,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1,
        }}
      >
        <Text
          style={{
            color: colors.text,
            fontSize: 20,
            fontWeight: "bold",
            flex: 1,
          }}
        >
          <Ionicons
            name="home"
            size={24}
            color={colors.text}
            style={[styles.icon, { marginRight: 10 }]}
          />
          Property Consultants
        </Text>
        <TouchableOpacity
          style={[styles.themeToggle, { backgroundColor: colors.background }]}
          onPress={toggleTheme}
        >
          <Ionicons
            name={theme === "dark" ? "moon" : "sunny"}
            size={24}
            color={colors.text}
            style={styles.icon}
          />
          <Text style={[styles.toggleText, { color: colors.text }]}>
            {theme === "dark" ? "Dark Mode" : "Light Mode"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <ScrollView
        contentContainerStyle={{
          paddingTop: 80,
          paddingHorizontal: 16,
          paddingBottom: 16,

          alignItems: "center",
          flex: 1,
        }}
      >
        {/* Search Bar */}
        <View
          style={{
            width: "100%",
            backgroundColor: "transparent",

            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            marginVertical: 16,
            height: 60,
          }}
        >
          <View
            style={{
              width: "75%",
              backgroundColor: colors.card,
              borderRadius: 8,
              padding: 16,
              height: 60,
              flex: 1,
            }}
          >
            <TextInput
              placeholder="Search properties, locations, agents..."
              placeholderTextColor={colors.text}
              style={{
                flex: 1,
                color: colors.text,
              }}
            />
          </View>
          <TouchableOpacity
            style={{
              backgroundColor: colors.card,
              borderRadius: 8,
              padding: 16,
              height: 60,
              marginHorizontal: 8,
            }}
          >
            <FontAwesome5 name="sliders-h" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/*Property action btns */}
        <View
          style={{
            width: "100%",
            flexDirection: "row",
            justifyContent: "space-evenly",
            alignItems: "center",
            backgroundColor: "transparent",
          }}
        >
          {/* Residents Btn */}
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              marginHorizontal: 4,
              flexDirection: "column",
              elevation: 5,
            }}
          >
            <TouchableOpacity
              style={{
                backgroundColor: colors.card,
                borderRadius: 40,
                padding: 10,
                height: 70,
                width: 70,

                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <FontAwesome5 name="home" size={30} color={colors.text} />
            </TouchableOpacity>
            <Text style={{ color: colors.text }}>Residents</Text>
          </View>

          {/* Commercial Btn */}
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              marginHorizontal: 4,
              flexDirection: "column",
              elevation: 5,
            }}
          >
            <TouchableOpacity
              style={{
                backgroundColor: colors.card,
                borderRadius: 40,
                padding: 10,
                height: 70,
                width: 70,

                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <FontAwesome5 name="building" size={30} color={colors.text} />
            </TouchableOpacity>
            <Text style={{ color: colors.text }}>Commercial</Text>
          </View>

          {/* Industrial Btn */}
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              marginHorizontal: 4,
              flexDirection: "column",
              elevation: 5,
            }}
          >
            <TouchableOpacity
              style={{
                backgroundColor: colors.card,
                borderRadius: 40,
                padding: 10,
                height: 70,
                width: 70,

                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <MaterialCommunityIcons
                name="factory"
                size={30}
                color={colors.text}
              />
            </TouchableOpacity>
            <Text style={{ color: colors.text }}>Industrial</Text>
          </View>

          {/* Agricultural Btn */}
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              marginHorizontal: 4,
              flexDirection: "column",
              elevation: 5,
            }}
          >
            <TouchableOpacity
              style={{
                backgroundColor: colors.card,
                borderRadius: 40,
                padding: 10,
                height: 70,
                width: 70,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <MaterialCommunityIcons
                name="barn"
                size={30}
                color={colors.text}
              />
            </TouchableOpacity>
            <Text style={{ color: colors.text }}>Agricultural</Text>
          </View>

          {/* land Btn */}
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              marginHorizontal: 4,
              flexDirection: "column",
              elevation: 5,
            }}
          >
            <TouchableOpacity
              style={{
                backgroundColor: colors.card,
                borderRadius: 40,
                padding: 10,
                height: 70,
                width: 70,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <MaterialCommunityIcons
                name="beach"
                size={30}
                color={colors.text}
              />
            </TouchableOpacity>
            <Text style={{ color: colors.text }}>Land</Text>
          </View>
        </View>

        <View style={{ height: 100 }}></View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  themeToggle: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    width: 150,
    alignSelf: "flex-end",
  },
  icon: {
    marginRight: 8,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: "500",
  },
});

export default HomeScreen;
