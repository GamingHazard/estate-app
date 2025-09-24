import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  RefreshControl,
} from "react-native";
import { useInternetConnection } from '../hooks/useInternetConnection';
import { useTheme } from "../context/ThemeContext";
import { Dimensions } from "react-native";
import {
  Ionicons,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { mockProperties } from "../data/mockData";
import { mockAdverts } from "../data/mockAdverts";
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import SkeletonLoader from '../components/SkeletonLoader';

import { NavigationProp } from '../types';

// Add these helper functions before the HomeScreen component
const sortProperties = (properties: any[], sortBy: string) => {
  switch (sortBy) {
    case 'price':
      return [...properties].sort((a, b) => a.price - b.price);
    case 'verified':
      return [...properties].sort((a, b) => (b.verified ? 1 : -1));
    case 'new':
      return [...properties].sort((a, b) => 
        new Date(b.listedDate).getTime() - new Date(a.listedDate).getTime()
      );
    case 'used':
      return [...properties].sort((a, b) => 
        new Date(a.listedDate).getTime() - new Date(b.listedDate).getTime()
      );
    case 'nearMe':
      // This would typically use the user's location and calculate distances
      // For now, we'll just return the original array
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
  const [activeBtn, setActiveBtn] = useState("All");
  const [status, setStatus] = useState("All");
  const [filteredProperties, setFilteredProperties] = useState(mockProperties);

  // Slideshow state
  const [currentAdvertIndex, setCurrentAdvertIndex] = useState(0);

  // Sort modal state
  const [showSortModal, setShowSortModal] = useState(false);
  const [selectedSort, setSelectedSort] = useState("");

  const sortOptions = [
    { label: "Price", value: "price" },
    { label: "Verified", value: "verified" },
    { label: "New", value: "new" },
    { label: "Used", value: "used" },
    { label: "Near Me", value: "nearMe" },
  ];

  const handleSortSelect = (option: string) => {
    setSelectedSort(option);
    setShowSortModal(false);
    
    let propertiesForSorting = [...filteredProperties];
    
    // If no properties are filtered (showing all), use mockProperties
    if (activeBtn === "All" && status === "All") {
      propertiesForSorting = [...mockProperties];
    }
    
    const sortedProperties = sortProperties(propertiesForSorting, option);
    setFilteredProperties(sortedProperties);
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    clearFilters();
    // Simulate a data refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAdvertIndex((prev) => (prev + 1) % mockAdverts.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);


  // clear all filters on refresh
const clearFilters = () => {
    setFilteredProperties(mockProperties);
    setActiveBtn("All");
    setStatus("All");
    setSelectedSort("");
  }


  // filter properties by type
  const filterProperties = (type: string,) => {

    if (status !== "All") {
      return mockProperties.filter(property => property.type === type && property.status === status)
    } else {
      return mockProperties.filter(property => property.type === type);
    }
  }

  // filter properties by status
  const propertyStatus = (option: string,) => {

    if (activeBtn !== "All") {
      return mockProperties.filter(property => property.status === option && property.type === activeBtn)
    } else {
      return mockProperties.filter(property => property.status === option);
    }
     
  }
   
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
      }>
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
      <View
        style={{
          paddingTop: 80,
          paddingHorizontal: 16,
          paddingBottom: 16,
        }}
      >
        {!isConnected && (
          <View style={{ alignItems: 'center', marginVertical: 10 }}>
            <Text style={{ color: 'red' }}>No internet connection detected. Some features may be unavailable.</Text>
          </View>
        )}
        {loading || refreshing ? (
          <View>
            <SkeletonLoader style={{ width: '100%', height: 60, borderRadius: 8, marginBottom: 16 }} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', marginBottom: 16 }}>
              <SkeletonLoader style={{ width: 50, height: 50, borderRadius: 25 }} />
              <SkeletonLoader style={{ width: 50, height: 50, borderRadius: 25 }} />
              <SkeletonLoader style={{ width: 50, height: 50, borderRadius: 25 }} />
              <SkeletonLoader style={{ width: 50, height: 50, borderRadius: 25 }} />
              <SkeletonLoader style={{ width: 50, height: 50, borderRadius: 25 }} />
            </View>
            <SkeletonLoader style={{ width: '100%', height: 140, borderRadius: 8, marginVertical: 10 }} />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-start', gap: 10, marginBottom: 16 }}>
                <SkeletonLoader style={{ width: 100, height: 35, borderRadius: 25 }} />
                <SkeletonLoader style={{ width: 100, height: 35, borderRadius: 25 }} />
            </View>
            <SkeletonLoader style={{ width: '100%', height: 280, borderRadius: 8, marginBottom: 16 }} />
            <SkeletonLoader style={{ width: '100%', height: 200, borderRadius: 8 }} />
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
                    onPress={() => {
                      setActiveBtn("Residential");
                          
                        setFilteredProperties(filterProperties("Residential"));
                         
                    }}
                  style={{
                    backgroundColor: activeBtn === "Residential"  ?  colors.text : colors.card,
                    borderRadius: 40,
                    padding: 5,
                    height: 50,
                    elevation: 5,
                    width: 50,

                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                    <Ionicons name="home-outline" size={23}
                      color={activeBtn === "Residential" ? colors.card :colors.text} />
                </TouchableOpacity>
                  <Text
                    style={{ color: colors.text,
                     fontSize: 11 }}>
                    Residents</Text>
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
                      setActiveBtn("Commercial");
                          
                        setFilteredProperties(filterProperties("Commercial"));
                         
                    }}
                  style={{
                    backgroundColor: activeBtn === "Commercial"  ?  colors.text : colors.card,
                    borderRadius: 40,
                    padding: 5,
                    height: 50,
                    elevation: 5,
                    width: 50,

                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                    <FontAwesome5 name="building" size={23} color={
                      activeBtn === "Commercial"  ?  colors.card : colors.text
                  } />
                </TouchableOpacity>
                <Text style={{ color: colors.text,fontSize:11 }}>Commercial</Text>
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
                      setActiveBtn("Industrial");
                          
                        setFilteredProperties(filterProperties("Industrial"));
                         
                    }}
                  style={{
                    backgroundColor: activeBtn === "Industrial"  ?  colors.text : colors.card,
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
                    color={activeBtn === "Industrial"  ?  colors.card : colors.text}
                  />
                </TouchableOpacity>
                <Text style={{ color: colors.text,fontSize:11 }}>Industrial</Text>
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
                      setActiveBtn("Agricultural");
                          
                        setFilteredProperties(filterProperties("Agricultural"));
                         
                    }}
                  style={{
                    backgroundColor: activeBtn === "Agricultural"  ?  colors.text : colors.card,
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
                    color={activeBtn === "Agricultural"  ?  colors.card : colors.text}
                  />
                </TouchableOpacity>
                <Text style={{ color: colors.text,fontSize:11 }}>Agricultural</Text>
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
                     onPress={() => {
                      setActiveBtn("Land");
                          
                        setFilteredProperties(filterProperties("Land"));
                         
                    }}
                  style={{
                    backgroundColor: activeBtn === "Land"  ?  colors.text : colors.card,
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
                    color={activeBtn === "Land"  ?  colors.card : colors.text}
                  />
                </TouchableOpacity>
                <Text style={{ color: colors.text,fontSize:11 }}>Land</Text>
              </View>
            </View>

            {/* advert tab */}

            <View
              style={{
                width: "100%", height: 200, backgroundColor: colors.text,
                marginVertical: 10,
                borderRadius: 12,
                overflow: 'hidden',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Image
                source={{ uri: mockAdverts[currentAdvertIndex].url }}
                style={{ width: '100%', height: '100%', resizeMode: 'cover', position: 'absolute' }}
                resizeMode="cover"
              />
              {/* Gradient overlay */}
              <LinearGradient
                colors={["rgba(0,0,0,0.9)", "rgba(0,0,0,0.0)"]}
                start={{ x: 0.5, y: 1 }}
                end={{ x: 0.5, y: 0 }}
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  top: 0,
                  width: '100%',
                  height: '100%',
                  justifyContent: 'flex-end',
                  alignItems: 'flex-start',
                  padding: 16,
                }}
              >
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
                  {mockAdverts[currentAdvertIndex].description}
                </Text>
              </LinearGradient>
            </View>


            {/* Sorting options */}
            <View style={{
              flexDirection: 'row',
              justifyContent:"flex-start",
              height: 50,
              width: '100%',
              backgroundColor: "transparent",
              alignItems: 'center',
            
            }}>

              <View style={{flex:1,flexDirection:"row",gap:10}}>
                  {/* Rent button */}
                  <TouchableOpacity
                    onPress={() => {
                      setStatus("For Rent");
                      setFilteredProperties(propertyStatus("For Rent"));
                    }}
                style={{
                  flexDirection: 'row',
                  borderRadius: 25,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: status === "For Rent" ? colors.text : colors.card,
                  paddingHorizontal: 15,
                  height:35,
                  elevation:3
                  
                }}>
               <Text style={{color: status === "For Rent" ? colors.card : colors.text, }}>For Rent</Text>
              </TouchableOpacity>

              {/* Sale Btn */}
                  <TouchableOpacity
                    onPress={() => {
                      setStatus("For Sale");
                      setFilteredProperties(propertyStatus("For Sale"));
                    }}
                style={{
                  flexDirection: 'row',
                  borderRadius: 25,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: status === "For Sale" ? colors.text : colors.card,
                  paddingHorizontal: 15,
                  height:35,
                  elevation:3
                  
                }}>
               <Text style={{color:status === "For Sale" ? colors.card : colors.text,}}>For Sale</Text>
              </TouchableOpacity>
            </View>



              {/* sort Btn */}
              <View>
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    borderRadius: 25,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: selectedSort ? colors.text : colors.card,
                    paddingHorizontal: 15,
                    height:35,
                    elevation:3 
                  }}
                  onPress={() => setShowSortModal((prev) => !prev)}
                >
                  <Ionicons name='swap-vertical-outline' size={16} style={{marginRight:5}} color={selectedSort ? colors.card : colors.text} />
                    <Text style={{ color: selectedSort ? colors.card : colors.text }}>{selectedSort || "Sort"}</Text>
                </TouchableOpacity>

                
              </View>

            </View>
               {showSortModal && (
                  <View style={{
                    position: 'absolute',
                    top:510,
                    right: 0,
                    backgroundColor: colors.card,
                    borderRadius: 10,
                    padding: 10,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 5,
                      zIndex: 100,
                  width: 200,
                    marginHorizontal:10
                  }}>
                    {sortOptions.map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        style={{
                          paddingVertical: 8,
                          paddingHorizontal: 12,
                          borderRadius: 6,
                          backgroundColor: selectedSort === option.value ? colors.text : 'transparent',
                          marginBottom: 4,
                        }}
                        onPress={() => handleSortSelect(option.value)}
                      >
                        <Text style={{ color: selectedSort === option.value ? colors.card : colors.text }}>
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              {/* Featured Properties */}
               <Text style={{ fontSize: 20, fontWeight: "bold", color: colors.text, marginVertical: 16 }}>
                Featured Properties
              </Text>
           {filteredProperties.length > 0 ?( <View style={{ marginVertical: 16 }}>
             
              <ScrollView horizontal showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
      paddingVertical: 5,
      flexDirection: "row",
                alignItems: "center",
                  paddingHorizontal: 5,
      position: "relative",
    }}
              >
                
                {filteredProperties.slice(0, 4).map((property) => (
                  <TouchableOpacity 
                    key={property.id} 
                    style={[styles.card, { backgroundColor: colors.card, width: width * 0.7 }]}
                    onPress={() => navigation.navigate('PropertyDetails', { property })}
                  >
                    <Image source={{ uri: property.thumbnail }} style={{ width: '100%', height: "100%", borderRadius: 8 }} />
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.9)']}
                      style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '50%', borderRadius: 8 }}
                    />
                    <Text style={{ position: "absolute", top: 10, left: 10, backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, fontSize: 12, zIndex: 1 }}>{property.status}</Text>

                    {/* Room Icons */}
                    {property.type === 'House' && property.bedrooms && property.bathrooms && (
                      <View style={{ position: "absolute", top: 10, right: 10, backgroundColor: 'transparent' ,gap:5,justifyContent:'center',alignItems:'center' }}>
                        <View style={{ position: "absolute", top: 10, right: 0, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, zIndex: 1,flexDirection:'row',gap:5,justifyContent:'center',alignItems:'center' }}>
                        <Text style={{color:'white'}}>{property.bedrooms}</Text>
                        <FontAwesome5 style={{marginHorizontal:5}} name="bed" size={16} color={"white"} /></View>
                      <View style={{ position: "absolute", top: 50, right: 0, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, zIndex: 1,flexDirection:'row',gap:5,justifyContent:'center',alignItems:'center' }}>
                        <Text style={{color:'white'}}>{property.bathrooms}</Text>
                        <MaterialCommunityIcons style={{marginHorizontal:5}} name="shower" size={20} color={"white"} /></View>
                      <View style={{ position: "absolute", top: 90, right: 0, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, zIndex: 1,flexDirection:'row',gap:5,justifyContent:'center',alignItems:'center' }}>
                        <Text style={{color:'white'}}>{property.area}sqft</Text>
                        <Ionicons style={{marginHorizontal:5}} name="expand-outline" size={14} color={"white"} /></View>
                      </View>
                   )}

                    


                    <View style={{ position: 'absolute', bottom: 10, left: 10, right: 10 }}>
                      <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#fff' }}>{property.title}</Text>
                      <Text style={{ fontSize: 12, color: '#fff', marginVertical: 4 }}>
                        <Ionicons name="location-sharp" size={12} color="#fff" />
                        {property.type} in {property.location}</Text>
                      <Text style={{ fontSize: 14, fontWeight: 'bold', color:"white", marginTop: 8 }}>
                        {property.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                        {property.type === 'Apartment' || property.type === 'Co-working Space' || property.type === 'Office Space' ? ' / month' : ''}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>):(
              <View style={{alignItems:'center',justifyContent:'center',marginVertical:50}}>
                <Text style={{color:colors.textMuted}}>No properties found for the selected category.</Text>
              </View>
            )}

            {/* Latest Property */}
            <View style={{ flexDirection: 'row', justifyContent: "space-between", alignItems: "center", marginVertical: 15 }}>
              <Text style={{
                color: colors.text,
                fontSize: 18, fontWeight: "bold"
              }}>
                Latest Properties
              </Text>
              <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ color: '#007BFF', fontSize: 14, fontWeight: '500' }}>See All</Text>
                <Ionicons style={{ marginLeft: 10 }} name="arrow-forward" size={16} color={'#007BFF'} />
              </TouchableOpacity>
            </View>

            {/* Property tabs */}
            {filteredProperties.length> 0 ? (filteredProperties.map((property) => (
              <TouchableOpacity 
                key={property.id} 
                style={{ width: "100%", backgroundColor: colors.card, borderRadius: 10, marginBottom: 10, flexDirection: "row", position: "relative", overflow: "hidden", elevation: 3 }}
                onPress={() => navigation.navigate('PropertyDetails', { property })}
              >
                <Text style={{ position: "absolute", top: 10, left: 10, backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, fontSize: 12, zIndex: 1 }}>{property.status}</Text>
                <Image
                  source={{ uri: property.thumbnail }}
                  style={{ width: "50%", height: "100%" }}
                  resizeMode="cover"
                />
                <View style={{ flex: 1, padding: 10, justifyContent: "space-between" }}>
                  <View>
                    <Text style={{ color: colors.text, fontSize: 16, fontWeight: "bold" }}>{property.title}</Text>
                    <Text numberOfLines={2} style={{ color: colors.text, fontSize: 14, marginVertical: 5 }}>{property.description}</Text>
                    {property.bedrooms &&
                      <Text style={{ color: colors.text, fontSize: 14, marginVertical: 5 }}>{property.bedrooms} Beds • {property.bathrooms} Baths</Text>}
                    
                    <Text style={{ color: colors.text, fontSize: 12,marginVertical:3 }}><Ionicons style={{marginRight:10}} name="location" size={16} color={colors.text}/>{property.location}</Text>
                  </View>
                  <Text style={{ color: '#007BFF', fontSize: 16, fontWeight: "bold" }}>
                    {property.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                    {property.type === 'Apartment' || property.type === 'Co-working Space' || property.type === 'Office Space' || property.type === 'Commercial' ? ' / month' : ''}
                  </Text>
                  {property.verified && (<Ionicons name="shield-checkmark" size={20} style={{alignSelf:"flex-end"}} color={colors.primary} />)}

                </View>
              </TouchableOpacity>
            ))):(
              <View style={{alignItems:'center',justifyContent:'center',marginVertical:50}}>
                <Text style={{color:colors.textMuted}}>No properties found for the selected category.</Text>
              </View>
            )}
         
  
     
          </>
        )}
      </View>
    </ScrollView>
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
  card:{   // ✅ each card 70% of screen width
      height: 280,
      
      marginRight: 10,
    borderRadius: 8,
      elevation: 3,}
});

export default HomeScreen;
