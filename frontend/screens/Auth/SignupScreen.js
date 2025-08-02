import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import client from '../../api/client';

export default function SignupScreen({ navigation }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    profession: '',
    password: '',
    template: '',
  });
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const updateFormData = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    setIsRecording(false);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setRecording(uri);
  };

  const handleSignup = async () => {
    if (!formData.name || !formData.email || !formData.profession || !formData.password || !formData.template) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('profession', formData.profession);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('template', formData.template);

      if (recording) {
        const filename = recording.split('/').pop();
        formDataToSend.append('voiceSample', {
          uri: recording,
          type: 'audio/m4a',
          name: filename,
        });
      }

      const response = await client.post('/auth/signup', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('doctor', JSON.stringify(response.data.doctor));
      
      // Navigate to main app (handled by RootNavigator)
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <View style={styles.step}>
      <Text style={styles.stepTitle}>Basic Information</Text>
      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={formData.name}
        onChangeText={(value) => updateFormData('name', value)}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={formData.email}
        onChangeText={(value) => updateFormData('email', value)}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Profession"
        value={formData.profession}
        onChangeText={(value) => updateFormData('profession', value)}
      />
      <TouchableOpacity style={styles.nextButton} onPress={() => setStep(2)}>
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.step}>
      <Text style={styles.stepTitle}>Security & Template</Text>
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={formData.password}
        onChangeText={(value) => updateFormData('password', value)}
        secureTextEntry
      />
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Consultation Note Template (e.g., Chief Complaint: ...\nHistory: ...\nPhysical Exam: ...\nAssessment: ...\nPlan: ...)"
        value={formData.template}
        onChangeText={(value) => updateFormData('template', value)}
        multiline
        numberOfLines={6}
      />
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.backButton} onPress={() => setStep(1)}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.nextButton} onPress={() => setStep(3)}>
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.step}>
      <Text style={styles.stepTitle}>Voice Profile (Optional)</Text>
      <Text style={styles.stepDescription}>
        Record a 5-minute voice sample to help with transcription accuracy
      </Text>
      
      <TouchableOpacity 
        style={[styles.recordButton, isRecording && styles.recordingButton]}
        onPress={isRecording ? stopRecording : startRecording}
      >
        <Text style={styles.recordButtonText}>
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </Text>
      </TouchableOpacity>

      {recording && !isRecording && (
        <Text style={styles.recordingStatus}>Voice sample recorded ✓</Text>
      )}

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.backButton} onPress={() => setStep(2)}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.signupButton, isLoading && styles.disabledButton]}
          onPress={handleSignup}
          disabled={isLoading}
        >
          <Text style={styles.signupButtonText}>
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Sign Up</Text>
        
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
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
    flexGrow: 1,
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#64B6AC',
    textAlign: 'center',
    marginBottom: 40,
  },
  step: {
    gap: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#64B6AC',
    marginBottom: 10,
  },
  stepDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  nextButton: {
    backgroundColor: '#64B6AC',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: '#BFE0DC',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
  },
  backButtonText: {
    color: '#64B6AC',
    fontSize: 18,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  recordButton: {
    backgroundColor: '#64B6AC',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  recordingButton: {
    backgroundColor: '#FF6B6B',
  },
  recordButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  recordingStatus: {
    textAlign: 'center',
    color: '#64B6AC',
    fontSize: 16,
    fontWeight: '600',
  },
  signupButton: {
    backgroundColor: '#64B6AC',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
  },
  signupButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  cancelButton: {
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  cancelButtonText: {
    color: '#64B6AC',
    fontSize: 16,
  },
}); 