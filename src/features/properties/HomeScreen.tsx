import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  RefreshControl,
  Modal,
  Pressable,
  Animated,
} from "react-native";
import { useInternetConnection } from "../../shared/hooks/useInternetConnection";
import { useTheme } from "../../shared/theme/ThemeContext";
import { Dimensions } from "react-native";
import {
  Ionicons,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { mockProperties } from "../../data/mockData";
import { mockAdverts } from "../../data/mockAdverts";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import SkeletonLoader from "../../shared/components/SkeletonLoader";
import { useAuth } from "../../../src/features/auth/AuthContext";

import { NavigationProp } from "../../shared/types";
// ...existing code...

// Move constants outside the component so they're not recreated on every render
const sortOptions = [
  { label: "Price", value: "price" },
  { label: "Verified", value: "verified" },
  { label: "New", value: "new" },
  { label: "Used", value: "used" },
  { label: "Near Me", value: "nearMe" },
];

const NO_IMAGE =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/624px-No-Image-Placeholder.svg.png";

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon: "home-outline" | "chatbubble-outline" | "pricetag-outline";
};

const initialNotifications: NotificationItem[] = [
  {
    id: "property-match",
    title: "New property match",
    message: "A new apartment matching your saved search is available.",
    time: "10 min ago",
    read: false,
    icon: "home-outline",
  },
  {
    id: "price-drop",
    title: "Price drop alert",
    message: "A saved property has just reduced its asking price.",
    time: "1 hour ago",
    read: false,
    icon: "pricetag-outline",
  },
  {
    id: "message",
    title: "New message",
    message: "An agent sent you a message about your viewing request.",
    time: "3 hours ago",
    read: false,
    icon: "chatbubble-outline",
  },
  {
    id: "welcome",
    title: "Welcome to Estate App",
    message: "Your account is ready. Start exploring properties today.",
    time: "Yesterday",
    read: true,
    icon: "home-outline",
  },
];

// Add / tighten types for helpers
const sortProperties = (properties: any[], sortBy: string): any[] => {
  switch (sortBy) {
    case "price":
      return [...properties].sort((a, b) => a.price - b.price);
    case "verified":
      return [...properties].sort((a, b) => (b.verified ? 1 : -1));
    case "new":
      return [...properties].sort(
        (a, b) =>
          new Date(b.listedDate).getTime() - new Date(a.listedDate).getTime(),
      );
    case "used":
      return [...properties].sort(
        (a, b) =>
          new Date(a.listedDate).getTime() - new Date(b.listedDate).getTime(),
      );
    case "nearMe":
      return properties;
    default:
      return properties;
  }
};

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { colors, theme, toggleTheme } = useTheme();
  const { width } = Dimensions.get("window");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const isConnected = useInternetConnection();
  const [activeBtn, setActiveBtn] = useState<string>("All");
  const [status, setStatus] = useState<string>("All");
  const [selectedSort, setSelectedSort] = useState<string>("");
  // ADD: state to hold filtered properties
  const [filteredProperties, setFilteredProperties] =
    useState<any[]>(mockProperties);

  const { user } = useAuth(); // Access the authenticated user from AuthContext
  // Slideshow state
  const [currentAdvertIndex, setCurrentAdvertIndex] = useState(0);

  // Sort modal state
  const [showSortModal, setShowSortModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] =
    useState<NotificationItem[]>(initialNotifications);
  const notificationTranslateX = useRef(new Animated.Value(width)).current;

  const unreadNotificationCount = notifications.filter(
    (notification) => !notification.read,
  ).length;

  const openNotifications = () => {
    setShowNotifications(true);
    notificationTranslateX.setValue(width);
    Animated.timing(notificationTranslateX, {
      toValue: 0,
      duration: 280,
      useNativeDriver: true,
    }).start();
  };

  const closeNotifications = () => {
    Animated.timing(notificationTranslateX, {
      toValue: width,
      duration: 240,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setShowNotifications(false);
      }
    });
  };

  // add: featured properties memo
  const featuredProperties = useMemo(
    () => mockProperties.filter((p) => Boolean(p.featured)),
    [],
  );

  // centralized filter application helper
  const applyFilters = useCallback(
    (typeParam?: string, statusParam?: string, sortParam?: string) => {
      const t = typeParam ?? activeBtn;
      const s = statusParam ?? status;
      const sort = sortParam ?? selectedSort;

      let result = [...mockProperties];

      if (t && t !== "All") {
        result = result.filter((p) => p.type === t);
      }

      if (s && s !== "All") {
        result = result.filter((p) => p.status === s);
      }

      if (sort) {
        result = sortProperties(result, sort);
      }

      setFilteredProperties(result);
    },
    [activeBtn, status, selectedSort],
  );

  // initialize and keep filteredProperties in sync when mock data or filters change
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const clearFilters = useCallback(() => {
    setActiveBtn("All");
    setStatus("All");
    setSelectedSort("");
    setFilteredProperties(mockProperties);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    clearFilters();
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, [clearFilters]);

  const handleSortSelect = useCallback(
    (option: string) => {
      setSelectedSort(option);
      setShowSortModal(false);
      // apply immediately with new sort
      applyFilters(undefined, undefined, option);
    },
    [applyFilters],
  );

  // Type & status handlers now use applyFilters so UI updates immediately
  const selectType = useCallback(
    (type: string) => {
      setActiveBtn(type);
      applyFilters(type, undefined, undefined);
    },
    [applyFilters],
  );

  const selectStatus = useCallback(
    (opt: string) => {
      setStatus(opt);
      applyFilters(undefined, opt, undefined);
    },
    [applyFilters],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (featuredProperties.length > 0) {
        setCurrentAdvertIndex((prev) => (prev + 1) % featuredProperties.length);
      } else {
        setCurrentAdvertIndex((prev) => (prev + 1) % mockAdverts.length);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [featuredProperties]);

  const noImage = NO_IMAGE; // replace inline noImage with NO_IMAGE

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
          titleColor={colors.primary}
          title="Pull to refresh"
          progressBackgroundColor={theme === "dark" ? "#fff" : "#fff"}
        />
      }
    >
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
        <Image
          source={{
            uri: "https://t3.ftcdn.net/jpg/08/38/58/42/360_F_838584205_dDGwNQ1xJ8GsilZONeQwwM260WoyjNx2.jpg",
          }}
          style={{
            width: 50,
            height: 50,
            // aspectRatio: 1,
            alignSelf: "center",
          }}
          resizeMode="contain"
        />
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: colors.text,
              fontSize: 20,
              fontWeight: "bold",
            }}
          >
            Welcome back
          </Text>
          <Text
            style={{
              color: colors.text,
              fontSize: 20,
              fontWeight: "300",
            }}
          >
            {user ? `${user?.firstName} ${user?.lastName}` : "Guest User"}
          </Text>
        </View>

        <TouchableOpacity
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onPress={openNotifications}
          accessibilityLabel="Open notifications"
        >
          {unreadNotificationCount > 0 && (
            <View
              style={{
                width: 10,
                height: 10,
                backgroundColor: "red",
                borderRadius: 5,
                position: "absolute",
                top: 0,
                right: 0,
                zIndex: 2,
              }}
            />
          )}
          <Ionicons
            name="notifications-outline"
            size={28}
            color={colors.text}
          />
        </TouchableOpacity>
        {/* <TouchableOpacity
          style={{
            padding: 2,
            borderRadius: 50,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "white",
            width: 60,
            height: 60,
            marginHorizontal: 5,
          }}
        >
          <Image
            source={{
              uri: "https://www.pngitem.com/pimgs/m/146-1468479_my-profile-icon-blank-profile-picture-circle-hd.png",
            }}
            style={{
              width: "100%",
              height: "100%",
              // aspectRatio: 1,
              alignSelf: "center",
              borderRadius: 50,
            }}
            resizeMode="contain"
          />
        </TouchableOpacity> */}
      </View>

      <Modal
        visible={showNotifications}
        transparent
        animationType="none"
        onRequestClose={closeNotifications}
      >
        <View style={styles.notificationModalRoot}>
          <Pressable
            style={styles.notificationBackdrop}
            onPress={closeNotifications}
          />
          <Animated.View
            style={[
              styles.notificationPanel,
              { backgroundColor: colors.card },
              { transform: [{ translateX: notificationTranslateX }] },
            ]}
          >
            <View style={styles.notificationHeader}>
              <View>
                <Text
                  style={[styles.notificationTitle, { color: colors.text }]}
                >
                  Notification Center
                </Text>
                <Text
                  style={[
                    styles.notificationSubtitle,
                    { color: colors.textMuted },
                  ]}
                >
                  {unreadNotificationCount} unread
                </Text>
              </View>
              <TouchableOpacity
                onPress={closeNotifications}
                accessibilityLabel="Close notifications"
                style={styles.notificationCloseButton}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.notificationList}
            >
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <TouchableOpacity
                    key={notification.id}
                    style={[
                      styles.notificationItem,
                      {
                        backgroundColor: notification.read
                          ? "transparent"
                          : theme === "dark"
                            ? "rgba(255,255,255,0.08)"
                            : "rgba(0,123,255,0.08)",
                      },
                    ]}
                    onPress={() =>
                      setNotifications((current) =>
                        current.map((item) =>
                          item.id === notification.id
                            ? { ...item, read: true }
                            : item,
                        ),
                      )
                    }
                  >
                    <View
                      style={[
                        styles.notificationIcon,
                        { backgroundColor: colors.primary },
                      ]}
                    >
                      <Ionicons
                        name={notification.icon}
                        size={19}
                        color="#fff"
                      />
                    </View>
                    <View style={styles.notificationCopy}>
                      <View style={styles.notificationItemHeading}>
                        <Text
                          style={[
                            styles.notificationItemTitle,
                            { color: colors.text },
                          ]}
                        >
                          {notification.title}
                        </Text>
                        {!notification.read && (
                          <View style={styles.unreadDot} />
                        )}
                      </View>
                      <Text
                        style={[
                          styles.notificationMessage,
                          { color: colors.textMuted },
                        ]}
                      >
                        {notification.message}
                      </Text>
                      <Text
                        style={[
                          styles.notificationTime,
                          { color: colors.textMuted },
                        ]}
                      >
                        {notification.time}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyNotifications}>
                  <Ionicons
                    name="notifications-off-outline"
                    size={34}
                    color={colors.textMuted}
                  />
                  <Text style={{ color: colors.textMuted, marginTop: 8 }}>
                    You are all caught up.
                  </Text>
                </View>
              )}
            </ScrollView>

            {notifications.length > 0 && (
              <TouchableOpacity
                style={styles.clearNotificationsButton}
                onPress={() => setNotifications([])}
              >
                <Ionicons name="trash-outline" size={17} color="#d64545" />
                <Text style={styles.clearNotificationsText}>
                  Clear all notifications
                </Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        </View>
      </Modal>

      {/* Main Content */}
      <View
        style={{
          paddingTop: 80,
          paddingHorizontal: 16,
          paddingBottom: 16,
        }}
      >
        {loading || refreshing ? (
          <View>
            <SkeletonLoader
              style={{
                width: "100%",
                height: 60,
                borderRadius: 8,
                marginBottom: 16,
              }}
            />
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-evenly",
                marginBottom: 16,
              }}
            >
              <SkeletonLoader
                style={{ width: 50, height: 50, borderRadius: 25 }}
              />
              <SkeletonLoader
                style={{ width: 50, height: 50, borderRadius: 25 }}
              />
              <SkeletonLoader
                style={{ width: 50, height: 50, borderRadius: 25 }}
              />
              <SkeletonLoader
                style={{ width: 50, height: 50, borderRadius: 25 }}
              />
              <SkeletonLoader
                style={{ width: 50, height: 50, borderRadius: 25 }}
              />
            </View>
            <SkeletonLoader
              style={{
                width: "100%",
                height: 140,
                borderRadius: 8,
                marginVertical: 10,
              }}
            />
            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-start",
                gap: 10,
                marginBottom: 16,
              }}
            >
              <SkeletonLoader
                style={{ width: 100, height: 35, borderRadius: 25 }}
              />
              <SkeletonLoader
                style={{ width: 100, height: 35, borderRadius: 25 }}
              />
            </View>
            <SkeletonLoader
              style={{
                width: "100%",
                height: 280,
                borderRadius: 8,
                marginBottom: 16,
              }}
            />
            <SkeletonLoader
              style={{ width: "100%", height: 200, borderRadius: 8 }}
            />
          </View>
        ) : (
          <>
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
                  borderRadius: 25,
                  padding: 16,
                  height: 50,
                  flex: 1,
                  elevation: 3,
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
                  borderRadius: 50,
                  padding: 12,
                  // height: 50,
                  marginHorizontal: 8,
                  justifyContent: "center",
                  alignItems: "center",
                  elevation: 3,
                }}
              >
                <MaterialCommunityIcons
                  name="magnify"
                  size={24}
                  color={colors.text}
                />
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
                  onPress={() => {
                    selectType("Residential");
                  }}
                  style={{
                    backgroundColor:
                      activeBtn === "Residential" ? colors.text : colors.card,
                    borderRadius: 40,
                    padding: 5,
                    height: 50,
                    elevation: 5,
                    width: 50,

                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Ionicons
                    name="home-outline"
                    size={23}
                    color={
                      activeBtn === "Residential" ? colors.card : colors.text
                    }
                  />
                </TouchableOpacity>
                <Text style={{ color: colors.text, fontSize: 11 }}>
                  Residents
                </Text>
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
                  onPress={() => {
                    selectType("Commercial");
                  }}
                  style={{
                    backgroundColor:
                      activeBtn === "Commercial" ? colors.text : colors.card,
                    borderRadius: 40,
                    padding: 5,
                    height: 50,
                    elevation: 5,
                    width: 50,

                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <FontAwesome5
                    name="building"
                    size={23}
                    color={
                      activeBtn === "Commercial" ? colors.card : colors.text
                    }
                  />
                </TouchableOpacity>
                <Text style={{ color: colors.text, fontSize: 11 }}>
                  Commercial
                </Text>
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
                  onPress={() => {
                    selectType("Industrial");
                  }}
                  style={{
                    backgroundColor:
                      activeBtn === "Industrial" ? colors.text : colors.card,
                    borderRadius: 40,
                    padding: 5,
                    height: 50,
                    elevation: 5,
                    width: 50,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <MaterialCommunityIcons
                    name="factory"
                    size={23}
                    color={
                      activeBtn === "Industrial" ? colors.card : colors.text
                    }
                  />
                </TouchableOpacity>
                <Text style={{ color: colors.text, fontSize: 11 }}>
                  Industrial
                </Text>
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
                  onPress={() => {
                    selectType("Agricultural");
                  }}
                  style={{
                    backgroundColor:
                      activeBtn === "Agricultural" ? colors.text : colors.card,
                    borderRadius: 40,
                    padding: 5,
                    height: 50,
                    elevation: 5,
                    width: 50,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <MaterialCommunityIcons
                    name="barn"
                    size={23}
                    color={
                      activeBtn === "Agricultural" ? colors.card : colors.text
                    }
                  />
                </TouchableOpacity>
                <Text style={{ color: colors.text, fontSize: 11 }}>
                  Agricultural
                </Text>
              </View>

              {/* Land Btn */}
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
                  onPress={() => {
                    selectType("Land");
                  }}
                  style={{
                    backgroundColor:
                      activeBtn === "Land" ? colors.text : colors.card,
                    borderRadius: 40,
                    padding: 5,
                    height: 50,
                    elevation: 5,
                    width: 50,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <MaterialCommunityIcons
                    name="beach"
                    size={23}
                    color={activeBtn === "Land" ? colors.card : colors.text}
                  />
                </TouchableOpacity>
                <Text style={{ color: colors.text, fontSize: 11 }}>Land</Text>
              </View>
            </View>

            {/* advert tab  */}
            <TouchableOpacity
              style={{
                width: "100%",
                height: 200,
                backgroundColor: colors.text,
                marginVertical: 10,
                borderRadius: 12,
                overflow: "hidden",
                justifyContent: "center",
                alignItems: "center",
              }}
              onPress={() =>
                navigation.navigate("PropertyDetails", {
                  property: featuredProperties[currentAdvertIndex],
                })
              }
            >
              {featuredProperties.length > 0 ? (
                // Show current featured property
                <>
                  <Image
                    source={{
                      uri:
                        featuredProperties[currentAdvertIndex].thumbnail ||
                        noImage,
                    }}
                    style={{
                      width: "100%",
                      height: "100%",
                      position: "absolute",
                    }}
                    resizeMode="cover"
                  />
                  <LinearGradient
                    colors={["rgba(0,0,0,0.7)", "transparent"]}
                    start={{ x: 0.5, y: 1 }}
                    end={{ x: 0.5, y: 0 }}
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      bottom: 0,
                      height: "50%",
                      padding: 16,
                      justifyContent: "flex-end",
                    }}
                  >
                    <Text
                      style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}
                    >
                      {featuredProperties[currentAdvertIndex].title}
                    </Text>
                    <Text style={{ color: "#fff", fontSize: 12, marginTop: 4 }}>
                      {featuredProperties[currentAdvertIndex].type} •{" "}
                      {featuredProperties[currentAdvertIndex].location}
                    </Text>
                  </LinearGradient>
                </>
              ) : (
                // Fallback to original mockAdverts carousel
                <>
                  <Image
                    source={{
                      uri: mockAdverts[currentAdvertIndex].url || noImage,
                    }}
                    style={{
                      width: "100%",
                      height: "100%",
                      position: "absolute",
                    }}
                    resizeMode="cover"
                  />
                  <LinearGradient
                    colors={["rgba(0,0,0,0.9)", "rgba(0,0,0,0.0)"]}
                    start={{ x: 0.5, y: 1 }}
                    end={{ x: 0.5, y: 0 }}
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      bottom: 0,
                      top: 0,
                      width: "100%",
                      height: "100%",
                      justifyContent: "flex-end",
                      alignItems: "flex-start",
                      padding: 16,
                    }}
                  >
                    <Text
                      style={{
                        color: "#fff",
                        fontSize: 16,
                        fontWeight: "bold",
                        marginBottom: 8,
                      }}
                    >
                      {mockAdverts[currentAdvertIndex].description}
                    </Text>
                  </LinearGradient>
                </>
              )}
            </TouchableOpacity>

            {/* Sorting options */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-start",
                height: 50,
                width: "100%",
                backgroundColor: "transparent",
                alignItems: "center",
              }}
            >
              <View style={{ flex: 1, flexDirection: "row", gap: 10 }}>
                {/* Rent button */}
                <TouchableOpacity
                  onPress={() => {
                    selectStatus("For Rent");
                  }}
                  style={{
                    flexDirection: "row",
                    borderRadius: 25,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor:
                      status === "For Rent" ? colors.text : colors.card,
                    paddingHorizontal: 15,
                    height: 35,
                    elevation: 3,
                  }}
                >
                  <Text
                    style={{
                      color: status === "For Rent" ? colors.card : colors.text,
                    }}
                  >
                    For Rent
                  </Text>
                </TouchableOpacity>

                {/* Sale Btn */}
                <TouchableOpacity
                  onPress={() => {
                    selectStatus("For Sale");
                  }}
                  style={{
                    flexDirection: "row",
                    borderRadius: 25,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor:
                      status === "For Sale" ? colors.text : colors.card,
                    paddingHorizontal: 15,
                    height: 35,
                    elevation: 3,
                  }}
                >
                  <Text
                    style={{
                      color: status === "For Sale" ? colors.card : colors.text,
                    }}
                  >
                    For Sale
                  </Text>
                </TouchableOpacity>
              </View>

              {/* sort Btn */}
              <View>
                <TouchableOpacity
                  style={{
                    flexDirection: "row",
                    borderRadius: 25,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: selectedSort ? colors.text : colors.card,
                    paddingHorizontal: 15,
                    height: 35,
                    elevation: 3,
                  }}
                  onPress={() => setShowSortModal((prev) => !prev)}
                >
                  <Ionicons
                    name="swap-vertical-outline"
                    size={16}
                    style={{ marginRight: 5 }}
                    color={selectedSort ? colors.card : colors.text}
                  />
                  <Text
                    style={{ color: selectedSort ? colors.card : colors.text }}
                  >
                    {selectedSort || "Sort"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            {showSortModal && (
              <View
                style={{
                  position: "absolute",
                  top: 510,
                  right: 0,
                  backgroundColor: colors.card,
                  borderRadius: 10,
                  padding: 10,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  elevation: 5,
                  zIndex: 100,
                  width: 200,
                  marginHorizontal: 10,
                }}
              >
                {sortOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={{
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      borderRadius: 6,
                      backgroundColor:
                        selectedSort === option.value
                          ? colors.text
                          : "transparent",
                      marginBottom: 4,
                    }}
                    onPress={() => handleSortSelect(option.value)}
                  >
                    <Text
                      style={{
                        color:
                          selectedSort === option.value
                            ? colors.card
                            : colors.text,
                      }}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {/* Featured Properties */}
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                color: colors.text,
                marginVertical: 16,
              }}
            >
              Featured Properties
            </Text>
            {filteredProperties.filter((f: any) => f.featured).length > 0 ? (
              <View style={{ marginVertical: 16 }}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{
                    paddingVertical: 5,
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 5,
                    position: "relative",
                  }}
                >
                  {filteredProperties
                    .filter((f: any) => f.featured)
                    .map((property) => (
                      <TouchableOpacity
                        key={property.id}
                        style={[
                          styles.card,
                          { backgroundColor: colors.card, width: width * 0.7 },
                        ]}
                        onPress={() =>
                          navigation.navigate("PropertyDetails", { property })
                        }
                      >
                        <Image
                          source={{ uri: property.thumbnail || noImage }}
                          style={{
                            width: "100%",
                            height: "100%",
                            borderRadius: 8,
                          }}
                        />
                        <LinearGradient
                          colors={["transparent", "rgba(0,0,0,0.9)"]}
                          style={{
                            position: "absolute",
                            left: 0,
                            right: 0,
                            bottom: 0,
                            height: "50%",
                            borderRadius: 8,
                          }}
                        />
                        <Text
                          style={{
                            position: "absolute",
                            top: 10,
                            left: 10,
                            backgroundColor: "rgba(0,0,0,0.6)",
                            color: "#fff",
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            borderRadius: 12,
                            fontSize: 12,
                            zIndex: 1,
                          }}
                        >
                          {property.status}
                        </Text>

                        {/* Room Icons */}
                        {property.type === "House" &&
                          property.bedrooms &&
                          property.bathrooms && (
                            <View
                              style={{
                                position: "absolute",
                                top: 10,
                                right: 10,
                                backgroundColor: "transparent",
                                gap: 5,
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                            >
                              <View
                                style={{
                                  position: "absolute",
                                  top: 10,
                                  right: 0,
                                  backgroundColor: "rgba(0,0,0,0.6)",
                                  paddingHorizontal: 8,
                                  paddingVertical: 4,
                                  borderRadius: 12,
                                  zIndex: 1,
                                  flexDirection: "row",
                                  gap: 5,
                                  justifyContent: "center",
                                  alignItems: "center",
                                }}
                              >
                                <Text style={{ color: "white" }}>
                                  {property.bedrooms}
                                </Text>
                                <FontAwesome5
                                  style={{ marginHorizontal: 5 }}
                                  name="bed"
                                  size={16}
                                  color={"white"}
                                />
                              </View>
                              <View
                                style={{
                                  position: "absolute",
                                  top: 50,
                                  right: 0,
                                  backgroundColor: "rgba(0,0,0,0.6)",
                                  paddingHorizontal: 8,
                                  paddingVertical: 4,
                                  borderRadius: 12,
                                  zIndex: 1,
                                  flexDirection: "row",
                                  gap: 5,
                                  justifyContent: "center",
                                  alignItems: "center",
                                }}
                              >
                                <Text style={{ color: "white" }}>
                                  {property.bathrooms}
                                </Text>
                                <MaterialCommunityIcons
                                  style={{ marginHorizontal: 5 }}
                                  name="shower"
                                  size={20}
                                  color={"white"}
                                />
                              </View>
                              <View
                                style={{
                                  position: "absolute",
                                  top: 90,
                                  right: 0,
                                  backgroundColor: "rgba(0,0,0,0.6)",
                                  paddingHorizontal: 8,
                                  paddingVertical: 4,
                                  borderRadius: 12,
                                  zIndex: 1,
                                  flexDirection: "row",
                                  gap: 5,
                                  justifyContent: "center",
                                  alignItems: "center",
                                }}
                              >
                                <Text style={{ color: "white" }}>
                                  {property.area}sqft
                                </Text>
                                <Ionicons
                                  style={{ marginHorizontal: 5 }}
                                  name="expand-outline"
                                  size={14}
                                  color={"white"}
                                />
                              </View>
                            </View>
                          )}

                        <View
                          style={{
                            position: "absolute",
                            bottom: 10,
                            left: 10,
                            right: 10,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 16,
                              fontWeight: "bold",
                              color: "#fff",
                            }}
                          >
                            {property.title}
                          </Text>
                          <Text
                            style={{
                              fontSize: 12,
                              color: "#fff",
                              marginVertical: 4,
                            }}
                          >
                            <Ionicons
                              name="location-sharp"
                              size={12}
                              color="#fff"
                            />
                            {property.type} in {property.location}
                          </Text>
                          <Text
                            style={{
                              fontSize: 14,
                              fontWeight: "bold",
                              color: "white",
                              marginTop: 8,
                            }}
                          >
                            {property.price.toLocaleString("en-US", {
                              style: "currency",
                              currency: "USD",
                            })}
                            {property.type === "Apartment" ||
                            property.type === "Co-working Space" ||
                            property.type === "Office Space"
                              ? " / month"
                              : ""}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                </ScrollView>
              </View>
            ) : (
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  marginVertical: 50,
                }}
              >
                <Text style={{ color: colors.textMuted }}>
                  No properties found for the selected category.
                </Text>
              </View>
            )}

            {/* Latest Property */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginVertical: 15,
              }}
            >
              <Text
                style={{
                  color: colors.text,
                  fontSize: 18,
                  fontWeight: "bold",
                }}
              >
                Latest Properties
              </Text>
              <TouchableOpacity
                style={{ flexDirection: "row", alignItems: "center" }}
              >
                <Text
                  style={{ color: "#007BFF", fontSize: 14, fontWeight: "500" }}
                >
                  See All
                </Text>
                <Ionicons
                  style={{ marginLeft: 10 }}
                  name="arrow-forward"
                  size={16}
                  color={"#007BFF"}
                />
              </TouchableOpacity>
            </View>

            {/* Property tabs */}
            {filteredProperties.length > 0 ? (
              filteredProperties.map((property) => (
                <TouchableOpacity
                  key={property.id}
                  style={{
                    width: "100%",
                    backgroundColor: colors.card,
                    borderRadius: 10,
                    marginBottom: 10,
                    flexDirection: "row",
                    position: "relative",
                    overflow: "hidden",
                    elevation: 3,
                  }}
                  onPress={() =>
                    navigation.navigate("PropertyDetails", { property })
                  }
                >
                  <Text
                    style={{
                      position: "absolute",
                      top: 10,
                      left: 10,
                      backgroundColor: "rgba(0,0,0,0.6)",
                      color: "#fff",
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 12,
                      fontSize: 12,
                      zIndex: 1,
                    }}
                  >
                    {property.status}
                  </Text>
                  <Image
                    source={{ uri: property.thumbnail || noImage }}
                    style={{ width: "50%", height: "100%" }}
                    resizeMode="cover"
                  />
                  <View
                    style={{
                      flex: 1,
                      padding: 10,
                      justifyContent: "space-between",
                    }}
                  >
                    <View>
                      <Text
                        style={{
                          color: colors.text,
                          fontSize: 16,
                          fontWeight: "bold",
                        }}
                      >
                        {property.title}
                      </Text>
                      <Text
                        numberOfLines={2}
                        style={{
                          color: colors.text,
                          fontSize: 14,
                          marginVertical: 5,
                        }}
                      >
                        {property.description}
                      </Text>
                      {property.bedrooms && (
                        <Text
                          style={{
                            color: colors.text,
                            fontSize: 14,
                            marginVertical: 5,
                          }}
                        >
                          {property.bedrooms} Beds • {property.bathrooms} Baths
                        </Text>
                      )}

                      <Text
                        style={{
                          color: colors.text,
                          fontSize: 12,
                          marginVertical: 3,
                        }}
                      >
                        <Ionicons
                          style={{ marginRight: 10 }}
                          name="location"
                          size={16}
                          color={colors.text}
                        />
                        {property.location}
                      </Text>
                    </View>
                    <Text
                      style={{
                        color: "#007BFF",
                        fontSize: 16,
                        fontWeight: "bold",
                      }}
                    >
                      {property.price.toLocaleString("en-US", {
                        style: "currency",
                        currency: "USD",
                      })}
                      {property.type === "Apartment" ||
                      property.type === "Co-working Space" ||
                      property.type === "Office Space" ||
                      property.type === "Commercial"
                        ? " / month"
                        : ""}
                    </Text>
                    {property.verified && (
                      <Ionicons
                        name="shield-checkmark"
                        size={20}
                        style={{ alignSelf: "flex-end" }}
                        color={colors.primary}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  marginVertical: 50,
                }}
              >
                <Text style={{ color: colors.textMuted }}>
                  No properties found for the selected category.
                </Text>
              </View>
            )}
          </>
        )}
      </View>
      <View style={{ height: 80 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  notificationModalRoot: {
    flex: 1,
    flexDirection: "row",
  },
  notificationBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
  },
  notificationPanel: {
    width: "86%",
    height: "100%",
    marginLeft: "14%",
    paddingTop: 20,
    paddingHorizontal: 18,
    paddingBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 12,
  },
  notificationHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(128, 128, 128, 0.25)",
  },
  notificationTitle: {
    fontSize: 22,
    fontWeight: "700",
  },
  notificationSubtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  notificationCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationList: {
    paddingVertical: 14,
  },
  notificationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  notificationIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  notificationCopy: {
    flex: 1,
  },
  notificationItemHeading: {
    flexDirection: "row",
    alignItems: "center",
  },
  notificationItemTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#e04444",
    marginLeft: 8,
  },
  notificationMessage: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  notificationTime: {
    fontSize: 11,
    marginTop: 7,
  },
  emptyNotifications: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  clearNotificationsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderTopWidth: 1,
    borderTopColor: "rgba(128, 128, 128, 0.25)",
    paddingTop: 16,
  },
  clearNotificationsText: {
    color: "#d64545",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 7,
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
  card: {
    // ✅ each card 70% of screen width
    height: 280,

    marginRight: 10,
    borderRadius: 8,
    elevation: 3,
  },
});

export default HomeScreen;
