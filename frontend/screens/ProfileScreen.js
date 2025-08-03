import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import api from '../api/client';
import { AuthContext } from '../context/AuthContext';

export default function ProfileScreen() {
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { signOut } = useContext(AuthContext);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const [doctorRes, appointmentsRes] = await Promise.all([
        api.get('/doctors/me'),
        api.get('/appointments')
      ]);
      
      setDoctor(doctorRes.data);
      setFormData(doctorRes.data);
      
      // Filter appointments where doctor matches
      const filteredAppointments = appointmentsRes.data.filter(a => a.doctor === doctorRes.data.id);
      setAppointments(filteredAppointments);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const updateFormData = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await api.put('/doctors/me', formData);
      setDoctor(response.data);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadSignature = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera roll is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setIsUploading(true);
        
        const formData = new FormData();
        formData.append('signature', {
          uri: result.assets[0].uri,
          type: 'image/jpeg',
          name: 'signature.jpg',
        });

        const response = await api.post('/doctors/me/signature', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        setDoctor(prev => ({ ...prev, signatureUrl: response.data.signatureUrl }));
        Alert.alert('Success', 'Signature uploaded successfully');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload signature');
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            // Navigation will be handled by RootNavigator
          },
        },
      ]
    );
  };

  const renderAppointment = ({ item }) => (
    <View style={styles.appointmentItem}>
      <Text style={styles.appointmentTitle}>{item.title}</Text>
      <Text style={styles.appointmentDate}>
        {new Date(item.date).toLocaleDateString()}
      </Text>
    </View>
  );

  if (!doctor) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Profile</Text>
            <TouchableOpacity 
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.profileCard}>
            {isEditing ? (
              <View style={styles.editForm}>
                <Text style={styles.sectionTitle}>Edit Profile</Text>
                
                <View style={styles.nameRow}>
                  <TextInput
                    style={[styles.input, styles.nameInput]}
                    placeholder="First Name"
                    value={formData.firstName}
                    onChangeText={(value) => updateFormData('firstName', value)}
                  />
                  <TextInput
                    style={[styles.input, styles.nameInput]}
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChangeText={(value) => updateFormData('lastName', value)}
                  />
                </View>
                
                <TextInput
                  style={styles.input}
                  placeholder="Profession"
                  value={formData.profession}
                  onChangeText={(value) => updateFormData('profession', value)}
                />
                
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Consultation Note Template"
                  value={formData.template}
                  onChangeText={(value) => updateFormData('template', value)}
                  multiline
                  numberOfLines={6}
                />
                
                <View style={styles.buttonRow}>
                  <TouchableOpacity 
                    style={styles.cancelButton}
                    onPress={() => {
                      setIsEditing(false);
                      setFormData(doctor);
                    }}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.saveButton, isLoading && styles.disabledButton]}
                    onPress={handleSave}
                    disabled={isLoading}
                  >
                    <Text style={styles.saveButtonText}>
                      {isLoading ? 'Saving...' : 'Save'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.profileInfo}>
                <Text style={styles.sectionTitle}>Profile Information</Text>
                
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Name:</Text>
                  <Text style={styles.infoValue}>{doctor.firstName} {doctor.lastName}</Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Email:</Text>
                  <Text style={styles.infoValue}>{doctor.email}</Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Profession:</Text>
                  <Text style={styles.infoValue}>{doctor.profession}</Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Template:</Text>
                  <Text style={styles.infoValue} numberOfLines={3}>
                    {doctor.template}
                  </Text>
                </View>
                
                {doctor.signatureUrl && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Signature:</Text>
                    <Text style={styles.infoValue}>✓ Uploaded</Text>
                  </View>
                )}
                
                <TouchableOpacity 
                  style={styles.editButton}
                  onPress={() => setIsEditing(true)}
                >
                  <Text style={styles.editButtonText}>Edit Profile</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.uploadButton, isUploading && styles.disabledButton]}
                  onPress={handleUploadSignature}
                  disabled={isUploading}
                >
                  <Text style={styles.uploadButtonText}>
                    {isUploading ? 'Uploading...' : 'Upload Signature'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.appointmentsSection}>
            <Text style={styles.sectionTitle}>Authored Appointments</Text>
            <FlatList
              data={appointments}
              renderItem={renderAppointment}
              keyExtractor={(item) => item._id}
              scrollEnabled={false}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No appointments authored yet</Text>
              }
            />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#64B6AC',
  },
  logoutButton: {
    backgroundColor: '#FF6B6B',
    padding: 10,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#64B6AC',
    marginBottom: 16,
  },
  infoRow: {
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#666',
  },
  editForm: {
    gap: 16,
  },
  input: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#BFE0DC',
  },
  nameRow: {
    flexDirection: 'row',
    gap: 12,
  },
  nameInput: {
    flex: 1,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#BFE0DC',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#64B6AC',
    fontSize: 18,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#64B6AC',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  editButton: {
    backgroundColor: '#64B6AC',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  editButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  uploadButton: {
    backgroundColor: '#64B6AC',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  appointmentsSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  appointmentItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  appointmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  appointmentDate: {
    fontSize: 14,
    color: '#666',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
}); 