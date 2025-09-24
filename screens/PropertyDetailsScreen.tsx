import React, { useState } from 'react';
import { useInternetConnection } from '../hooks/useInternetConnection';
import { View, Text, StyleSheet, ScrollView, Image, Dimensions, TouchableOpacity, Modal } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { mockAgents } from '../data/mockAgents';

const { width } = Dimensions.get('window');

type PropertyDetailsScreenRouteProp = RouteProp<RootStackParamList, 'PropertyDetails'>;

type Props = {
  route: PropertyDetailsScreenRouteProp;
};

const PropertyDetailsScreen = ({ route }: Props) => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { property } = route.params;
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ url: string; name: string } | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const isConnected = useInternetConnection();

  const openImageModal = (image: { url: string; name: string }) => {
    setSelectedImage(image);
    setModalVisible(true);
  };

  const closeImageModal = () => {
    setModalVisible(false);
    setSelectedImage(null);
  };

  const handleContactAgent = () => {
    // Handle contact action
  };

  const handleScroll = (event: any) => {
    const slideSize = width;
    const offset = event.nativeEvent.contentOffset.x;
    const index = Math.round(offset / slideSize);
    setCurrentImageIndex(index);
  };

  // Add this function
  const handleAgentPress = () => {
    const agent = mockAgents[0]; // For demo, linking to first agent
    navigation.navigate('Agent Profile', { agent });
  };

  const noImage = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/624px-No-Image-Placeholder.svg.png';

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.galleryContainer}>
        <ScrollView 
          horizontal 
          pagingEnabled 
          showsHorizontalScrollIndicator={false} 
          style={styles.gallery}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {property.gallery.slice(0, 3).map((image, index) => (
            <TouchableOpacity key={index} onPress={() => openImageModal(image)}>
              <View style={styles.galleryImageContainer}>
                <Image source={{ uri: image.url || noImage }} style={styles.galleryImage} />
                <View style={styles.imageNameContainer}>
                  <Text style={styles.imageName}>{image.name}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        <TouchableOpacity style={styles.bookmarkButton}>
          <Ionicons name="bookmark-outline" size={24} color="white" />
        </TouchableOpacity>

        <View style={styles.paginationDots}>
          {property.gallery.slice(0, 3).map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                { backgroundColor: index === currentImageIndex ? colors.primary : colors.textMuted }
              ]}
            />
          ))}
        </View>
      </View>
      
      <View style={[  styles.detailsContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>{property.title}</Text>
        <Text style={[styles.location, { color: colors.text }]}>
          <Ionicons name="location-sharp" size={16} color={colors.text} /> {property.location}
        </Text>
        <Text style={[styles.price, { color: colors.primary }]}>
          {property.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
          {property.type.includes('Apartment') || property.type.includes('Space') ? ' / month' : ''}
        </Text>

        {/* Amenities section  */}

        <View style={styles.amenitiesContainer}>
          {property.bedrooms && (
            <View style={styles.amenity}>
              <FontAwesome5 name="bed" size={20} color={colors.text} />
              <Text style={[styles.amenityText, { color: colors.text }]}>{property.bedrooms} Beds</Text>
            </View>
          )}
          {property.bathrooms && (
            <View style={styles.amenity}>
              <MaterialCommunityIcons name="shower" size={20} color={colors.text} />
              <Text style={[styles.amenityText, { color: colors.text }]}>{property.bathrooms} Baths</Text>
            </View>
          )}
          {property.area && (
            <View style={styles.amenity}>
              <Ionicons name="expand-outline" size={20} color={colors.text} />
              <Text style={[styles.amenityText, { color: colors.text }]}>{property.area} sqft</Text>
            </View>
          )}
        </View>
{/* Description */}
        <Text style={[styles.description, { color: colors.text }]}>{property.description}</Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Features</Text>
        <View style={styles.otherImagesContainer}>
          {property.gallery.map((image, index) => (
            <TouchableOpacity key={index} onPress={() => openImageModal(image)} style={styles.otherImageContainer}>
              <Image source={{ uri: image.url || noImage }} style={styles.otherImage} />
              <Text style={[styles.otherImageName, { color: colors.text }]}>{image.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

      </View>
{/* Agent tab */}
      <TouchableOpacity 
        style={[styles.agentContainer, { backgroundColor: colors.card }]}
        onPress={handleAgentPress}
      >
        <Text style={{ color: colors.primary, position: 'absolute', right: 10, top: 5 }}>View Profile</Text>
        <View style={styles.agentInfo}>
          <View style={[styles.agentImageContainer, { borderColor: colors.primary }]}>
            <Image
              source={{ uri: 'https://www.shutterstock.com/image-vector/default-avatar-photo-placeholder-grey-600nw-2007531536.jpg' }}
              style={styles.agentImage}
            />
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={16} color="white" />
            </View>
          </View>
          <View style={styles.agentDetails}>
            <Text style={[styles.agentName, { color: colors.text }]}>John Doe</Text>
            <View style={styles.agentStats}>
              <Text style={[styles.agentStatus, { color: colors.primary }]}>
                <Ionicons name="shield-checkmark" size={12} color={colors.primary} /> Verified Agent
              </Text>
              <Text style={{ color: colors.textMuted }}>•</Text>
              <Text style={{ color: colors.textMuted }}>15 properties</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity 
          style={[styles.contactButton, { backgroundColor: colors.primary }]}
          disabled={!isConnected}
          onPress={handleContactAgent}
        >
          <Ionicons name="chatbubble-ellipses" size={20} color="white" />
          <Text style={styles.contactButtonText}>Contact</Text>
        </TouchableOpacity>
      </TouchableOpacity>

      {!isConnected && (
        <View style={{ alignItems: 'center', marginVertical: 10 }}>
          <Text style={{ color: 'red' }}>No internet connection detected. Some features may be unavailable.</Text>
        </View>
      )}
      <View>
        <Text style={{ textAlign: 'center', color: colors.textMuted, marginBottom: 20 }}>
          © 2024 Real Estate App. All rights reserved.
        </Text>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeImageModal}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={closeImageModal}>
            <Ionicons name="close" size={30} color="white" />
          </TouchableOpacity>
          {selectedImage && (
            <View style={styles.modalContent}>
              <Image source={{ uri: selectedImage.url }} style={styles.modalImage} />
              <Text style={styles.modalImageName}>{selectedImage.name}</Text>
            </View>
          )}
        </View>
      </Modal>


    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gallery: {
    width: width,
    height: 320,
    
  },
  galleryImageContainer: {
    width: width,
    height: 320,
    position: 'relative',
  },
  galleryImage: {
    width: width,
    height: 320,
  },
  imageNameContainer: {
    position: 'absolute',
    bottom: 20,
    left: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  imageName: {
    color: 'white',
    fontSize: 16,
  },
  detailsContainer: {
    padding: 10, 
    borderTopLeftRadius:20,
    borderTopRightRadius:20,
     zIndex:1,top:-15,  
     flex: 1,
     width: '100%',
      
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  location: {
    fontSize: 16,
    marginVertical: 5,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  amenity: {
    alignItems: 'center',
  },
  amenityText: {
    marginTop: 5,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  otherImagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  otherImageContainer: {
    width: '48%',
    marginBottom: 15,
  },
  otherImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
  },
  otherImageName: {
    marginTop: 5,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
  },
  modalContent: {
    width: '100%',
    height: '80%',
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    height: '80%',
    resizeMode: 'contain',
  },
  modalImageName: {
    color: 'white',
    fontSize: 20,
    marginTop: 15,
  },
  agentContainer: {
    marginHorizontal: 20,
    marginVertical: 15,
    borderRadius: 12,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    gap: 15,
    position: 'relative',
  },
  agentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  agentImageContainer: {
    position: 'relative',
    borderWidth:1.5,borderRadius:50
  },
  agentImage: {
    width: 60,
    height: 60,
    borderRadius: 25,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    padding: 2,
  },
  agentDetails: {
    marginLeft: 12,
    flex: 1,
  },
  agentName: {
    fontSize: 16,
    fontWeight: '600',
  },
  agentStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  agentStatus: {
    fontSize: 12,
    fontWeight: '500',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 20,
    gap: 8,
  },
  contactButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 280,
    width: '100%',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  galleryContainer: {
    position: 'relative',
    height: 320,
  },
  bookmarkButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
});

 
 
export default PropertyDetailsScreen;
