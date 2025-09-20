import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { Dimensions } from "react-native";
import {
  Ionicons,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { mockProperties } from "../data/mockData";
import { LinearGradient } from 'expo-linear-gradient';

const HomeScreen = () => {
  const { colors, theme, toggleTheme } = useTheme();
  const { width } = Dimensions.get("window");
  const latestProperties = mockProperties.slice(6);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={[styles.container, { backgroundColor: colors.background }]}>
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
                padding: 5,
                height: 50,
                elevation: 5,
                width: 50,

                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <FontAwesome5 name="home" size={23} color={colors.text} />
            </TouchableOpacity>
            <Text style={{ color: colors.text,fontSize:11 }}>Residents</Text>
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
                padding: 5,
                height: 50,
                elevation: 5,
                width: 50,

                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <FontAwesome5 name="building" size={23} color={colors.text} />
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
              style={{
                backgroundColor: colors.card,
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
                color={colors.text}
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
              style={{
                backgroundColor: colors.card,
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
                color={colors.text}
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
              style={{
                backgroundColor: colors.card,
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
                color={colors.text}
              />
            </TouchableOpacity>
            <Text style={{ color: colors.text,fontSize:11 }}>Land</Text>
          </View>
        </View>

        {/* advert tab */}
        <View
          style={{
            width: "100%", height: 140, backgroundColor: colors.card,
            marginVertical: 10,
            borderRadius:8
          }}>

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
            style={{
              flexDirection: 'row',
              borderRadius: 25,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: colors.card,
              paddingHorizontal: 15,
              height:35,
              elevation:3
              
            }}>
           <Text style={{color: colors.text }}>For Rent</Text>
          </TouchableOpacity>

          {/* Sale Btn */}
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              borderRadius: 25,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: colors.card,
              paddingHorizontal: 15,
              height:35,
              elevation:3
              
            }}>
           <Text style={{color:colors.text}}>For Sale</Text>
          </TouchableOpacity>
        </View>


          {/* sort Btn */}
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              borderRadius: 25,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: colors.card,
              paddingHorizontal: 15,
              height:35,
              elevation:3
             
              
              
              
            }}>
            <Ionicons name='swap-vertical-outline' size={16} style={{marginRight:5}} color={colors.text} />
           <Text style={{color:colors.text}}>Sort</Text>
          </TouchableOpacity>

        </View>

        {/* Featured Properties */}
        <View style={{ marginVertical: 16 }}>
          <Text style={{ fontSize: 20, fontWeight: "bold", color: colors.text, marginBottom: 16 }}>
            Featured Properties
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
    paddingVertical: 5,
    flexDirection: "row",
              alignItems: "center",
    paddingHorizontal: 5,
  }}
          >
            
            {mockProperties.map((property) => (
              <View key={property.id} style={[styles.card, { backgroundColor: colors.card, width: width * 0.7 }]}>
                <Image source={{ uri: property.image }} style={{ width: '100%', height: "100%", borderRadius: 8 }} />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.9)']}
                  style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '50%', borderRadius: 8 }}
                />
                <Text style={{ position: "absolute", top: 10, left: 10, backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, fontSize: 12, zIndex: 1 }}>{property.status}</Text>
                <Text style={{ position: "absolute", top: 10, left: 10, backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, fontSize: 12, zIndex: 1 }}>{property.status}</Text>
                <Text style={{ position: "absolute", top: 10, left: 10, backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, fontSize: 12, zIndex: 1 }}>{property.status}</Text>
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
              </View>
            ))}
          </ScrollView>
        </View>

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
        {latestProperties.map((property) => (
          <TouchableOpacity key={property.id} style={{ width: "100%", height: 200, backgroundColor: colors.card, borderRadius: 10, marginBottom: 10, flexDirection: "row", position: "relative", overflow: "hidden", elevation: 3 }}>
            <Text style={{ position: "absolute", top: 10, left: 10, backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, fontSize: 12, zIndex: 1 }}>{property.status}</Text>
            <Image
              source={{ uri: property.image }}
              style={{ width: "50%", height: "100%" }}
              resizeMode="cover"
            />
            <View style={{ flex: 1, padding: 10, justifyContent: "space-between" }}>
              <View>
                <Text style={{ color: colors.text, fontSize: 16, fontWeight: "bold" }}>{property.title}</Text>
                <Text style={{ color: colors.text, fontSize: 14, marginVertical: 5 }}>{property.description}</Text>
                {property.bedrooms && <Text style={{ color: colors.text, fontSize: 14, marginVertical: 5 }}>{property.bedrooms} Beds • {property.bathrooms} Baths</Text>}
                <Text style={{ color: colors.text, fontSize: 14 }}>{property.location}</Text>
              </View>
              <Text style={{ color: '#007BFF', fontSize: 16, fontWeight: "bold" }}>
                {property.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                {property.type === 'Apartment' || property.type === 'Co-working Space' || property.type === 'Office Space' || property.type === 'Commercial' ? ' / month' : ''}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
        <View style={{ height: 100 }} />



        {/* <View style={{ height: 100 }}></View> */}
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
