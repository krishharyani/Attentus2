import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import api from '../api/client';

export default function AddPatientScreen() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: new Date(),
    sex: 'Male',
    weight: '',
    height: '',
    contactInfo: {
      phone: '',
      email: ''
    }
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();

  const updateFormData = (key, value) => {
    if (key.includes('.')) {
      const [parent, child] = key.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [key]: value }));
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      updateFormData('dateOfBirth', selectedDate);
    }
  };

  const handleSave = async () => {
    if (!formData.firstName || !formData.lastName) {
      Alert.alert('Error', 'Please fill in first and last name');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/patients', formData);
      Alert.alert('Success', 'Patient saved successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to save patient');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Add Patient</Text>
          
          <View style={styles.form}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <TextInput
              style={styles.input}
              placeholder="First Name"
              value={formData.firstName}
              onChangeText={(value) => updateFormData('firstName', value)}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Last Name"
              value={formData.lastName}
              onChangeText={(value) => updateFormData('lastName', value)}
            />
            
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateButtonText}>
                Date of Birth: {formData.dateOfBirth.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
            
            {showDatePicker && (
              <DateTimePicker
                value={formData.dateOfBirth}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
              />
            )}
            
            <View style={styles.sexContainer}>
              <Text style={styles.label}>Sex:</Text>
              <View style={styles.sexButtons}>
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
              value={formData.contactInfo.phone}
              onChangeText={(value) => updateFormData('contactInfo.phone', value)}
              keyboardType="phone-pad"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={formData.contactInfo.email}
              onChangeText={(value) => updateFormData('contactInfo.email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.disabledButton]}
              onPress={handleSave}
              disabled={isLoading}
            >
              <Text style={styles.submitButtonText}>
                {isLoading ? 'Saving...' : 'Save Patient'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCFFF7',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#64B6AC',
    marginBottom: 20,
  },
  form: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#64B6AC',
    marginTop: 20,
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#BFE0DC',
  },
  dateButton: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BFE0DC',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  sexContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BFE0DC',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  sexButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  sexButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#BFE0DC',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  sexButtonActive: {
    backgroundColor: '#64B6AC',
    borderColor: '#64B6AC',
  },
  sexButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  sexButtonTextActive: {
    color: 'white',
  },
  submitButton: {
    backgroundColor: '#64B6AC',
    padding: 16,
    borderRadius: 16,
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