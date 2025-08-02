import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import client from '../api/client';

export default function AddPatientScreen() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    sex: '',
    weight: '',
    height: '',
    phone: '',
    email: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const updateFormData = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.firstName || !formData.lastName || !formData.dateOfBirth || !formData.sex) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const patientData = {
        ...formData,
        dateOfBirth: new Date(formData.dateOfBirth).toISOString(),
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        height: formData.height ? parseFloat(formData.height) : undefined,
        contactInfo: {
          phone: formData.phone || undefined,
          email: formData.email || undefined,
        },
      };

      await client.post('/patients', patientData);
      Alert.alert('Success', 'Patient added successfully', [
        { text: 'OK', onPress: () => resetForm() }
      ]);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to add patient');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      sex: '',
      weight: '',
      height: '',
      phone: '',
      email: '',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Add Patient</Text>
        
        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <TextInput
            style={styles.input}
            placeholder="First Name *"
            value={formData.firstName}
            onChangeText={(value) => updateFormData('firstName', value)}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Last Name *"
            value={formData.lastName}
            onChangeText={(value) => updateFormData('lastName', value)}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Date of Birth (YYYY-MM-DD) *"
            value={formData.dateOfBirth}
            onChangeText={(value) => updateFormData('dateOfBirth', value)}
          />
          
          <View style={styles.sexContainer}>
            <TouchableOpacity
              style={[
                styles.sexButton,
                formData.sex === 'Male' && styles.sexButtonActive
              ]}
              onPress={() => updateFormData('sex', 'Male')}
            >
              <Text style={[
                styles.sexButtonText,
                formData.sex === 'Male' && styles.sexButtonTextActive
              ]}>
                Male
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.sexButton,
                formData.sex === 'Female' && styles.sexButtonActive
              ]}
              onPress={() => updateFormData('sex', 'Female')}
            >
              <Text style={[
                styles.sexButtonText,
                formData.sex === 'Female' && styles.sexButtonTextActive
              ]}>
                Female
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.sexButton,
                formData.sex === 'Other' && styles.sexButtonActive
              ]}
              onPress={() => updateFormData('sex', 'Other')}
            >
              <Text style={[
                styles.sexButtonText,
                formData.sex === 'Other' && styles.sexButtonTextActive
              ]}>
                Other
              </Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.sectionTitle}>Vital Signs</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Weight (kg)"
            value={formData.weight}
            onChangeText={(value) => updateFormData('weight', value)}
            keyboardType="numeric"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Height (cm)"
            value={formData.height}
            onChangeText={(value) => updateFormData('height', value)}
            keyboardType="numeric"
          />
          
          <Text style={styles.sectionTitle}>Contact Information</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            value={formData.phone}
            onChangeText={(value) => updateFormData('phone', value)}
            keyboardType="phone-pad"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={formData.email}
            onChangeText={(value) => updateFormData('email', value)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <TouchableOpacity 
            style={[styles.submitButton, isLoading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <Text style={styles.submitButtonText}>
              {isLoading ? 'Adding Patient...' : 'Add Patient'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCFFF7',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#64B6AC',
    textAlign: 'center',
    marginBottom: 30,
  },
  form: {
    gap: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64B6AC',
    marginBottom: 10,
  },
  input: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  sexContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  sexButton: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  sexButtonActive: {
    backgroundColor: '#64B6AC',
    borderColor: '#64B6AC',
  },
  sexButtonText: {
    fontSize: 16,
    color: '#666',
  },
  sexButtonTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#64B6AC',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
}); 