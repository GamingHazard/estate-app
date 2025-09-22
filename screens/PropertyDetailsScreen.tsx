import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Dimensions, TouchableOpacity, Modal } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';

import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';


const { width } = Dimensions.get('window');

type PropertyDetailsScreenRouteProp = RouteProp<RootStackParamList, 'PropertyDetails'>;

type Props = {
  route: PropertyDetailsScreenRouteProp;
};

const PropertyDetailsScreen = ({ route }: Props) => {
  const { colors } = useTheme();
  const { property } = route.params;
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ url: string; name: string } | null>(null);

  const openImageModal = (image: { url: string; name: string }) => {
    setSelectedImage(image);
    setModalVisible(true);
  };

  const closeImageModal = () => {
    setModalVisible(false);
    setSelectedImage(null);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.gallery}>
        {property.gallery.map((image, index) => (
          <TouchableOpacity key={index} onPress={() => openImageModal(image)}>
            <View style={styles.galleryImageContainer}>
              <Image source={{ uri: image.url }} style={styles.galleryImage} />
              <View style={styles.imageNameContainer}>
                <Text style={styles.imageName}>{image.name}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.detailsContainer}>
        <Text style={[styles.title, { color: colors.text }]}>{property.title}</Text>
        <Text style={[styles.location, { color: colors.text }]}>
          <Ionicons name="location-sharp" size={16} color={colors.text} /> {property.location}
        </Text>
        <Text style={[styles.price, { color: colors.primary }]}>
          {property.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
          {property.type.includes('Apartment') || property.type.includes('Space') ? ' / month' : ''}
        </Text>

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

        <Text style={[styles.description, { color: colors.text }]}>{property.description}</Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Gallery</Text>
        <View style={styles.otherImagesContainer}>
          {property.gallery.map((image, index) => (
            <TouchableOpacity key={index} onPress={() => openImageModal(image)} style={styles.otherImageContainer}>
              <Image source={{ uri: image.url }} style={styles.otherImage} />
              <Text style={[styles.otherImageName, { color: colors.text }]}>{image.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 6 ,width: '100%',marginVertical:15}}>
        <TouchableOpacity style={{ flexDirection: 'row', backgroundColor: colors.background, borderRadius: 30, justifyContent: 'center', alignItems: 'center', padding: 10 ,gap:10,elevation:8}}>
          
          <Image source={{uri:'https://www.shutterstock.com/image-vector/default-avatar-photo-placeholder-grey-600nw-2007531536.jpg'}} style={{ width: 40, height: 40, borderRadius:50 }} />
        <Text style={{ color: colors.textMuted }}>
          Contact Agent
        </Text>
        </TouchableOpacity>
        
      </View>
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
            <Ionicons name="close-circle" size={30} color="white" />
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
    height: 300,
  },
  galleryImageContainer: {
    width: width,
    height: 300,
    position: 'relative',
  },
  galleryImage: {
    width: width,
    height: 300,
  },
  imageNameContainer: {
    position: 'absolute',
    bottom: 10,
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
    padding: 20,
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
    width: '90%',
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
});

export default PropertyDetailsScreen;
