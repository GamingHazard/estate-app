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
import { mockAdverts } from "../../data/mockAdverts";
import {
  formatPropertyPrice,
  getPropertyDisplayLocation,
  getSpecificationValue,
  Property,
} from "../../data/property";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import SkeletonLoader from "../../shared/components/SkeletonLoader";
import { useAuth } from "../../../src/features/auth/AuthContext";
import { useProperties } from "./useProperties";

import { NavigationProp } from "../../shared/types";
// ...existing code...

// Move constants outside the component so they're not recreated on every render
const sortOptions = [
  { label: "Price", value: "price" },
  { label: "Newest", value: "new" },
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
const sortProperties = (properties: Property[], sortBy: string): Property[] => {
  switch (sortBy) {
    case "price":
      return [...properties].sort((a, b) => a.pricePerUnit - b.pricePerUnit);
    case "new":
      return [...properties].sort(
        (a, b) =>
          new Date(b.createdAt ?? "").getTime() -
          new Date(a.createdAt ?? "").getTime(),
      );
    default:
      return properties;
  }
};

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { colors, theme, toggleTheme } = useTheme();
  const { width } = Dimensions.get("window");
  const {
    data: properties = [],
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useProperties();
  const isConnected = useInternetConnection();
  const [activeBtn, setActiveBtn] = useState<string>("All");
  const [selectedSort, setSelectedSort] = useState<string>("");
  const [currentAdvertIndex, setCurrentAdvertIndex] = useState(0);

  const { user } = useAuth(); // Access the authenticated user from AuthContext

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

  const filteredProperties = useMemo(() => {
    let result = [...properties];

    if (activeBtn !== "All") {
      result = result.filter((property) => {
        const category = property.category.toLowerCase();
        const propertyType = property.propertyType.toLowerCase();

        switch (activeBtn) {
          case "Residential":
            return category === "residential";
          case "Commercial":
            return category === "commercial";
          case "Industrial":
            return category === "industrial" || propertyType === "industrial";
          case "Agricultural":
            return (
              category === "agricultural" ||
              propertyType.includes("agricultural")
            );
          case "Land":
            return category === "land" || propertyType.includes("land");
          default:
            return true;
        }
      });
    }

    return selectedSort ? sortProperties(result, selectedSort) : result;
  }, [properties, activeBtn, selectedSort]);

  const onRefresh = useCallback(() => {
    setActiveBtn("All");
    setSelectedSort("");
    void refetch();
  }, [refetch]);

  const handleSortSelect = useCallback((option: string) => {
    setSelectedSort(option);
    setShowSortModal(false);
  }, []);

  const selectType = useCallback((type: string) => setActiveBtn(type), []);

  useEffect(() => {
    if (mockAdverts.length === 0) {
      return;
    }

    if (properties.length) {
      setCurrentAdvertIndex(0);
    }

    const interval = setInterval(() => {
      setCurrentAdvertIndex((index) => (index + 1) % mockAdverts.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [properties]);

  const noImage = NO_IMAGE; // replace inline noImage with NO_IMAGE

  const browseSections = [
    {
      title: "Family Homes",
      subtitle: "Spacious and secure",
      icon: "home-outline",
      color: "#4f8ef7",
    },
    {
      title: "Luxury Living",
      subtitle: "Premium residences",
      icon: "diamond-outline",
      color: "#a855f7",
    },
    {
      title: "Investment",
      subtitle: "High rental yield",
      icon: "trending-up-outline",
      color: "#10b981",
    },
  ];

  const neighborhoods = [
    { name: "Westlands", price: "KSh 11.2M" },
    { name: "Kileleshwa", price: "KSh 14.8M" },
    { name: "Karen", price: "KSh 18.6M" },
    { name: "Thika Road", price: "KSh 9.5M" },
  ];

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl
          refreshing={isFetching}
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
          height: 460,
          backgroundColor: colors.bg,
          paddingHorizontal: 16,
          // elevation: 4,

          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          borderBottomRightRadius: 20,
          borderBottomLeftRadius: 20,
          overflow: "hidden",
          // zIndex: 1,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* <Image
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
          /> */}
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: "white",
                fontSize: 20,
                fontWeight: "bold",
                alignSelf: "flex-start",
                marginTop: 5,
              }}
            >
              Hi, {user ? `${user?.firstName} ${user?.lastName}` : "Guest User"}
            </Text>

            <Text
              style={{
                color: "white",
                fontSize: 20,
                fontWeight: "300",
                alignSelf: "flex-start",
                marginTop: 5,
              }}
            >
              What are we looking for today?
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
            <Ionicons name="notifications-outline" size={28} color="white" />
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
        {isLoading ? (
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
        ) : isError ? (
          <View style={{ alignItems: "center", paddingVertical: 48 }}>
            <Text style={{ color: colors.text, marginBottom: 12 }}>
              {error instanceof Error
                ? error.message
                : "Unable to load properties."}
            </Text>
            <TouchableOpacity onPress={() => void refetch()}>
              <Text style={{ color: colors.primary }}>Try again</Text>
            </TouchableOpacity>
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
                marginVertical: 8,
                height: 60,
              }}
            >
              <View
                style={{
                  width: "75%",
                  backgroundColor: colors.card,
                  borderRadius: 25,
                  paddingHorizontal: 16,
                  height: 50,
                  flex: 1,
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: colors.border,
                  elevation: 3,
                }}
              >
                <TextInput
                  placeholder="Search region, city, or street"
                  placeholderTextColor={colors.textMuted}
                  numberOfLines={1}
                  style={{
                    flex: 1,
                    color: colors.text,
                    padding: 0,
                    fontSize: 15,
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
                    borderColor: colors.card,
                    borderWidth: 2,
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
                    borderColor: colors.card,
                    borderWidth: 2,
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
                    borderColor: colors.card,
                    borderWidth: 2,
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
                    borderColor: colors.card,
                    borderWidth: 2,
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
                    borderColor: colors.card,
                    borderWidth: 2,
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

            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Explore more
              </Text>
              <TouchableOpacity>
                <Text style={styles.sectionLink}>View all</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickBrowseRow}
            >
              {browseSections.map((item) => (
                <TouchableOpacity
                  key={item.title}
                  style={[
                    styles.browseCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.browseIcon,
                      { backgroundColor: `${item.color}20` },
                    ]}
                  >
                    <Ionicons name={item.icon as any} size={20} color={item.color} />
                  </View>
                  <Text style={[styles.browseTitle, { color: colors.text }]}>
                    {item.title}
                  </Text>
                  <Text style={[styles.browseSubtitle, { color: colors.textMuted }]}>
                    {item.subtitle}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Popular neighborhoods
              </Text>
            </View>

            <View style={styles.neighborhoodGrid}>
              {neighborhoods.map((item) => (
                <TouchableOpacity
                  key={item.name}
                  style={[
                    styles.neighborhoodCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Image
                    source={{ uri: noImage }}
                    style={styles.neighborhoodImage}
                    resizeMode="cover"
                  />
                  <View style={styles.neighborhoodContent}>
                    <Text style={[styles.neighborhoodName, { color: colors.text }]}>
                      {item.name}
                    </Text>
                    <Text style={[styles.neighborhoodPrice, { color: colors.primary }]}>
                      {item.price}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {mockAdverts.length > 0 && (
              <View
                style={{
                  width: "100%",
                  height: 180,
                  marginVertical: 12,
                  borderRadius: 12,
                  overflow: "hidden",
                  backgroundColor: colors.card,
                }}
              >
                <Image
                  source={{
                    uri: mockAdverts[currentAdvertIndex]?.url || noImage,
                  }}
                  style={{
                    width: "100%",
                    height: "100%",
                    position: "absolute",
                  }}
                  resizeMode="cover"
                />
                <LinearGradient
                  colors={["transparent", "rgba(0,0,0,0.85)"]}
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: "60%",
                    padding: 16,
                    justifyContent: "flex-end",
                  }}
                >
                  <Text
                    style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}
                  >
                    {mockAdverts[currentAdvertIndex]?.description}
                  </Text>
                </LinearGradient>
              </View>
            )}

            {/* Sorting options */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                height: 50,
                width: "100%",
                backgroundColor: "transparent",
                alignItems: "center",
              }}
            >
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
                    borderWidth: 1.5,
                    borderColor: "white",
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
              filteredProperties.map((property) => {
                const specifications =
                  property.specifications.length > 0
                    ? property.specifications
                    : (property.units[0]?.specifications ?? []);
                const bedrooms = getSpecificationValue(
                  specifications,
                  "Bedrooms",
                  "BedRooms",
                );
                const bathrooms = getSpecificationValue(
                  specifications,
                  "Bathrooms",
                  "BathRooms",
                );
                const area = getSpecificationValue(
                  specifications,
                  "Square Feet",
                  "Area",
                  "Sqft",
                );

                return (
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
                    <Image
                      source={{ uri: property.images[0]?.url || noImage }}
                      style={{ width: "42%", height: 180 }}
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
                          {property.name}
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
                        {(bedrooms || bathrooms || area) && (
                          <Text
                            style={{
                              color: colors.text,
                              fontSize: 14,
                              marginVertical: 5,
                            }}
                          >
                            {[
                              bedrooms && `${bedrooms} beds`,
                              bathrooms && `${bathrooms} baths`,
                              area && `${area} sq ft`,
                            ]
                              .filter(Boolean)
                              .join(" • ")}
                          </Text>
                        )}
                        {property.unitsAvailable > 0 && (
                          <Text
                            style={{
                              color: colors.text,
                              fontSize: 13,
                              marginVertical: 3,
                            }}
                          >
                            {property.unitsAvailable} units available
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
                          {getPropertyDisplayLocation(property)}
                        </Text>
                      </View>
                      <Text
                        style={{
                          color: "#007BFF",
                          fontSize: 16,
                          fontWeight: "bold",
                        }}
                      >
                        {formatPropertyPrice(property.pricePerUnit)} / unit
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })
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
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 18,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  sectionLink: {
    color: "#007BFF",
    fontSize: 13,
    fontWeight: "600",
  },
  quickBrowseRow: {
    paddingBottom: 4,
  },
  browseCard: {
    width: 170,
    borderRadius: 16,
    padding: 14,
    marginRight: 12,
    borderWidth: 1,
    elevation: 2,
  },
  browseIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  browseTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  browseSubtitle: {
    fontSize: 12,
    lineHeight: 18,
  },
  neighborhoodGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  neighborhoodCard: {
    width: "48%",
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 12,
    borderWidth: 1,
    elevation: 2,
  },
  neighborhoodImage: {
    width: "100%",
    height: 110,
  },
  neighborhoodContent: {
    padding: 10,
  },
  neighborhoodName: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },
  neighborhoodPrice: {
    fontSize: 12,
    fontWeight: "600",
  },
});

export default HomeScreen;
