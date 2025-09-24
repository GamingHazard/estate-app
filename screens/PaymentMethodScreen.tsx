import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { RootStackParamList } from '../types/navigation';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

const PaymentMethodScreen = ({ navigation }: Props) => {
  const { colors } = useTheme();
  const [selectedMethod, setSelectedMethod] = useState('');

  const paymentMethods = [
    {
      id: 'card',
      title: 'Credit/Debit Card',
      icon: (color) => <MaterialCommunityIcons name="credit-card" size={24} color={color} />,
      description: 'Pay securely with Visa, Mastercard, or other cards'
    },
    {
      id: 'bank',
      title: 'Bank Transfer',
      icon: (color) => <MaterialCommunityIcons name="bank" size={24} color={color} />,
      description: 'Direct transfer from your bank account'
    },
    {
      id: 'mobile',
      title: 'Mobile Money',
      icon: (color) => <FontAwesome5 name="mobile-alt" size={24} color={color} />,
      description: 'Pay using M-Pesa, MTN Money, or other mobile wallets'
    },
    {
      id: 'crypto',
      title: 'Cryptocurrency',
      icon: (color) => <FontAwesome5 name="bitcoin" size={24} color={color} />,
      description: 'Pay with Bitcoin, Ethereum, or other cryptocurrencies'
    }
  ];

  const handleMethodSelect = (methodId) => {
    setSelectedMethod(methodId);
    // Navigate to specific payment flow based on selected method
    if (methodId === 'card') {
      navigation.navigate('AddCard');
    }
    // Add other payment method flows here
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Payment Methods</Text>
      
      <View style={styles.methodsContainer}>
        {paymentMethods.map((method) => (
          <TouchableOpacity
            key={method.id}
            style={[
              styles.methodCard,
              {
                backgroundColor: colors.card,
                borderColor: selectedMethod === method.id ? colors.primary : colors.border
              }
            ]}
            onPress={() => handleMethodSelect(method.id)}
          >
            <View style={styles.methodHeader}>
              {method.icon(selectedMethod === method.id ? colors.primary : colors.text)}
              <Text style={[styles.methodTitle, { color: colors.text }]}>{method.title}</Text>
            </View>
            <Text style={[styles.methodDescription, { color: colors.text }]}>
              {method.description}
            </Text>
            <View style={styles.checkContainer}>
              <View
                style={[
                  styles.radioOuter,
                  {
                    borderColor: selectedMethod === method.id ? colors.primary : colors.border
                  }
                ]}
              >
                {selectedMethod === method.id && (
                  <View
                    style={[styles.radioInner, { backgroundColor: colors.primary }]}
                  />
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('Add Card')}
      >
        <Ionicons name="add" size={24} color="white" />
        <Text style={styles.addButtonText}>Add New Payment Method</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  methodsContainer: {
    gap: 16,
  },
  methodCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  methodTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  methodDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  checkContainer: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -12 }],
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    marginBottom: 24,
    gap: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PaymentMethodScreen;