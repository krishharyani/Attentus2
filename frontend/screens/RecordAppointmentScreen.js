import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/client';

export default function RecordAppointmentScreen() {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [showAppointmentList, setShowAppointmentList] = useState(false);
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [consultNote, setConsultNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    fetchAppointments();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/appointments');
      // Sort appointments: upcoming first, then past, with pending status first
      const sortedAppointments = response.data.sort((a, b) => {
        const now = new Date();
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        
        // First, prioritize pending appointments
        if (a.status === 'Pending' && b.status !== 'Pending') return -1;
        if (a.status !== 'Pending' && b.status === 'Pending') return 1;
        
        // Then sort by date (upcoming first)
        const isAUpcoming = dateA >= now;
        const isBUpcoming = dateB >= now;
        
        if (isAUpcoming && !isBUpcoming) return -1;
        if (!isAUpcoming && isBUpcoming) return 1;
        
        // If both are upcoming or both are past, sort by date
        return dateA - dateB;
      });
      
      setAppointments(sortedAppointments);
      setFilteredAppointments(sortedAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const handleSearch = (text) => {
    setSearchText(text);
    if (text.trim() === '') {
      setFilteredAppointments(appointments);
      setShowAppointmentList(false);
    } else {
      const filtered = appointments.filter(appointment => 
        appointment.title.toLowerCase().includes(text.toLowerCase()) ||
        appointment.patient?.firstName?.toLowerCase().includes(text.toLowerCase()) ||
        appointment.patient?.lastName?.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredAppointments(filtered);
      setShowAppointmentList(true);
    }
  };

  const selectAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setWeight(appointment.weight?.toString() || '');
    setHeight(appointment.height?.toString() || '');
    setShowAppointmentList(false);
    setSearchText(`${appointment.title} - ${new Date(appointment.date).toLocaleDateString()}`);
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
      setRecordingTime(0);
      
      // Start timer
      const interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      // Store interval to clear later
      recording._interval = interval;
    } catch (err) {
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    setIsRecording(false);
    clearInterval(recording._interval);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setRecording(uri);
    
    // Load the recording for playback
    await loadRecordingForPlayback(uri);
  };

  const loadRecordingForPlayback = async (uri) => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }
      
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: false },
        onPlaybackStatusUpdate
      );
      
      setSound(newSound);
      const status = await newSound.getStatusAsync();
      setPlaybackDuration(status.durationMillis / 1000);
    } catch (error) {
      console.error('Error loading recording for playback:', error);
    }
  };

  const onPlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      setIsPlaying(status.isPlaying);
      setPlaybackPosition(status.positionMillis / 1000);
      setPlaybackDuration(status.durationMillis / 1000);
    }
  };

  const playRecording = async () => {
    if (sound) {
      try {
        await sound.playAsync();
      } catch (error) {
        console.error('Error playing recording:', error);
      }
    }
  };

  const pauseRecording = async () => {
    if (sound) {
      try {
        await sound.pauseAsync();
      } catch (error) {
        console.error('Error pausing recording:', error);
      }
    }
  };

  const stopPlayback = async () => {
    if (sound) {
      try {
        await sound.stopAsync();
        await sound.setPositionAsync(0);
      } catch (error) {
        console.error('Error stopping playback:', error);
      }
    }
  };

  const handleSubmit = async () => {
    if (!selectedAppointment) {
      Alert.alert('Error', 'Please select an appointment');
      return;
    }
    if (!recording) {
      Alert.alert('Error', 'Please record audio first');
      return;
    }

    setIsSubmitting(true);
    try {
      // Get the token using the proper AsyncStorage import
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const formData = new FormData();
      formData.append('audio', {
        uri: recording,
        type: 'audio/m4a',
        name: 'recording.m4a',
      });
      formData.append('weight', weight);
      formData.append('height', height);

      console.log('Submitting recording for appointment:', selectedAppointment._id);
      console.log('Recording URI:', recording);
      console.log('Weight:', weight);
      console.log('Height:', height);

      const response = await fetch(
        `${api.defaults.baseURL}/appointments/${selectedAppointment._id}/record`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        }
      );

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to submit recording: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('Success response:', data);
      
      setConsultNote(data.consultNote || '');
      Alert.alert('Success', 'Recording submitted successfully. Transcription and AI processing completed.');
    } catch (error) {
      console.error('Error submitting recording:', error);
      Alert.alert('Error', error.message || 'Failed to submit recording');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveNote = async () => {
    if (!selectedAppointment) return;

    setIsSaving(true);
    try {
      await api.put(`/appointments/${selectedAppointment._id}`, {
        consultNote: consultNote,
        weight: weight ? parseFloat(weight) : undefined,
        height: height ? parseFloat(height) : undefined,
      });
      Alert.alert('Success', 'Note saved successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save note');
    } finally {
      setIsSaving(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderAppointmentItem = ({ item }) => {
    const isUpcoming = new Date(item.date) >= new Date();
    const isPending = item.status === 'Pending';
    
    return (
      <TouchableOpacity
        style={[
          styles.appointmentItem,
          selectedAppointment?._id === item._id && styles.selectedAppointmentItem
        ]}
        onPress={() => selectAppointment(item)}
      >
        <View style={styles.appointmentHeader}>
          <Text style={styles.appointmentTitle}>{item.title}</Text>
          <View style={styles.appointmentBadges}>
            {isUpcoming && (
              <View style={styles.upcomingBadge}>
                <Text style={styles.upcomingBadgeText}>Upcoming</Text>
              </View>
            )}
            {isPending && (
              <View style={styles.pendingBadge}>
                <Text style={styles.pendingBadgeText}>Pending</Text>
              </View>
            )}
          </View>
        </View>
        <Text style={styles.appointmentDate}>
          {new Date(item.date).toLocaleString()}
        </Text>
        <Text style={styles.appointmentPatient}>
          Patient: {item.patient?.firstName} {item.patient?.lastName}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Record Appointment</Text>
        
        <View style={styles.form}>
          <Text style={styles.label}>Select Appointment:</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search appointments by title or patient name..."
            value={searchText}
            onChangeText={handleSearch}
            onFocus={() => setShowAppointmentList(true)}
          />
          
          {showAppointmentList && filteredAppointments.length > 0 && (
            <View style={styles.appointmentListContainer}>
              <FlatList
                data={filteredAppointments}
                renderItem={renderAppointmentItem}
                keyExtractor={(item) => item._id}
                style={styles.appointmentList}
                nestedScrollEnabled={true}
                maxHeight={300}
              />
            </View>
          )}

          {selectedAppointment && (
            <View style={styles.selectedAppointmentInfo}>
              <Text style={styles.selectedAppointmentTitle}>
                Selected: {selectedAppointment.title}
              </Text>
              <Text style={styles.selectedAppointmentDate}>
                {new Date(selectedAppointment.date).toLocaleString()}
              </Text>
              <Text style={styles.selectedAppointmentPatient}>
                Patient: {selectedAppointment.patient?.firstName} {selectedAppointment.patient?.lastName}
              </Text>
            </View>
          )}

          <Text style={styles.label}>Weight (kg):</Text>
          <TextInput
            style={styles.input}
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
            placeholder="Enter weight"
          />

          <Text style={styles.label}>Height (cm):</Text>
          <TextInput
            style={styles.input}
            value={height}
            onChangeText={setHeight}
            keyboardType="numeric"
            placeholder="Enter height"
          />

          <View style={styles.recordingSection}>
            <TouchableOpacity
              style={[styles.recordButton, isRecording && styles.recordingButton]}
              onPress={isRecording ? stopRecording : startRecording}
            >
              <Text style={styles.recordButtonText}>
                {isRecording ? '⏹️' : '🎤'}
              </Text>
            </TouchableOpacity>
            
            {isRecording && (
              <Text style={styles.recordingTime}>
                Recording: {formatTime(recordingTime)}
              </Text>
            )}
            
            {recording && !isRecording && (
              <View style={styles.playbackSection}>
                <Text style={styles.recordingStatus}>✓ Recording complete</Text>
                <Text style={styles.recordingDuration}>
                  Duration: {formatTime(playbackDuration)}
                </Text>
                
                <View style={styles.playbackControls}>
                  <TouchableOpacity
                    style={styles.playButton}
                    onPress={isPlaying ? pauseRecording : playRecording}
                  >
                    <Text style={styles.playButtonText}>
                      {isPlaying ? '⏸️' : '▶️'}
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.stopButton}
                    onPress={stopPlayback}
                  >
                    <Text style={styles.stopButtonText}>⏹️</Text>
                  </TouchableOpacity>
                  
                  <Text style={styles.playbackTime}>
                    {formatTime(playbackPosition)} / {formatTime(playbackDuration)}
                  </Text>
                </View>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[styles.submitButton, (!selectedAppointment || !recording) && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={!selectedAppointment || !recording || isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Processing...' : 'Submit Recording'}
            </Text>
          </TouchableOpacity>

          {consultNote && (
            <>
              <Text style={styles.label}>Generated Consult Note:</Text>
              <TextInput
                style={styles.noteInput}
                value={consultNote}
                onChangeText={setConsultNote}
                multiline
                scrollEnabled={true}
                placeholder="Edit the generated consult note..."
              />
              
              <TouchableOpacity
                style={[styles.saveButton, isSaving && styles.disabledButton]}
                onPress={handleSaveNote}
                disabled={isSaving}
              >
                <Text style={styles.saveButtonText}>
                  {isSaving ? 'Saving...' : 'Save Note'}
                </Text>
              </TouchableOpacity>
            </>
          )}
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
    marginBottom: 20,
  },
  form: {
    gap: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  searchInput: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#64B6AC',
  },
  appointmentListContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#64B6AC',
    maxHeight: 300,
  },
  appointmentList: {
    maxHeight: 300,
  },
  appointmentItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  selectedAppointmentItem: {
    backgroundColor: '#E8F5E8',
    borderLeftWidth: 4,
    borderLeftColor: '#64B6AC',
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  appointmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  appointmentBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  upcomingBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  upcomingBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  pendingBadge: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pendingBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  appointmentDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  appointmentPatient: {
    fontSize: 14,
    color: '#64B6AC',
  },
  selectedAppointmentInfo: {
    backgroundColor: '#E8F5E8',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#64B6AC',
  },
  selectedAppointmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64B6AC',
    marginBottom: 4,
  },
  selectedAppointmentDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  selectedAppointmentPatient: {
    fontSize: 14,
    color: '#64B6AC',
  },
  input: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#BFE0DC',
  },
  recordingSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#64B6AC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  recordingButton: {
    backgroundColor: '#FF6B6B',
  },
  recordButtonText: {
    fontSize: 32,
  },
  recordingTime: {
    fontSize: 18,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  recordingStatus: {
    fontSize: 16,
    color: '#64B6AC',
    fontWeight: '600',
    marginBottom: 8,
  },
  recordingDuration: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  playbackSection: {
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  playbackControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  playButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#64B6AC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonText: {
    fontSize: 20,
  },
  stopButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FF6B6B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopButtonText: {
    fontSize: 20,
  },
  playbackTime: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#64B6AC',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  noteInput: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#BFE0DC',
    height: 400,
    textAlignVertical: 'top',
  },
  saveButton: {
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
  disabledButton: {
    opacity: 0.6,
  },
}); 