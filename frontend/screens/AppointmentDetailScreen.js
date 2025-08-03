import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../api/client';

export default function AppointmentDetailScreen() {
  const { appointmentId } = useRoute().params;
  const [appointment, setAppointment] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editedNote, setEditedNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    fetchAppointment();
  }, []);

  const fetchAppointment = async () => {
    try {
      const response = await api.get(`/appointments/${appointmentId}`);
      setAppointment(response.data);
      setEditedNote(response.data.consultNote || '');
    } catch (error) {
      console.error('Error fetching appointment:', error);
      Alert.alert('Error', 'Failed to load appointment details');
    }
  };

  const saveNote = async () => {
    if (!editedNote.trim()) {
      Alert.alert('Error', 'Please enter a note');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.put(`/appointments/${appointmentId}`, { consultNote: editedNote });
      setAppointment(response.data);
      setEditing(false);
      Alert.alert('Success', 'Note saved successfully');
    } catch (error) {
      console.error('Error saving note:', error);
      Alert.alert('Error', 'Failed to save note');
    } finally {
      setIsLoading(false);
    }
  };

  const cancelAppointment = async () => {
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              console.log('Attempting to cancel appointment:', appointmentId);
              const response = await api.delete(`/appointments/${appointmentId}`);
              console.log('Cancel response:', response);
              Alert.alert('Success', 'Appointment cancelled successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
            } catch (error) {
              console.error('Error cancelling appointment:', error);
              console.error('Error response:', error.response);
              console.error('Error message:', error.message);
              Alert.alert('Error', `Failed to cancel appointment: ${error.response?.data?.message || error.message}`);
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const startRecording = () => {
    navigation.navigate('Record', { appointmentId });
  };

  if (!appointment) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading appointment details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>{appointment.title}</Text>
          <Text style={styles.date}>{new Date(appointment.date).toLocaleString()}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Patient Information</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              <Text style={styles.label}>Name: </Text>
              {appointment.patient?.firstName} {appointment.patient?.lastName}
            </Text>
            <Text style={styles.infoText}>
              <Text style={styles.label}>Date of Birth: </Text>
              {appointment.patient?.dateOfBirth ? new Date(appointment.patient.dateOfBirth).toLocaleDateString() : 'N/A'}
            </Text>
            <Text style={styles.infoText}>
              <Text style={styles.label}>Sex: </Text>
              {appointment.patient?.sex || 'N/A'}
            </Text>
            <Text style={styles.infoText}>
              <Text style={styles.label}>Weight: </Text>
              {appointment.weight ? `${appointment.weight} kg` : 'N/A'}
            </Text>
            <Text style={styles.infoText}>
              <Text style={styles.label}>Height: </Text>
              {appointment.height ? `${appointment.height} cm` : 'N/A'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Doctor Information</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              <Text style={styles.label}>Name: </Text>
              {appointment.doctor?.name || 'N/A'}
            </Text>
            <Text style={styles.infoText}>
              <Text style={styles.label}>Email: </Text>
              {appointment.doctor?.email || 'N/A'}
            </Text>
            <Text style={styles.infoText}>
              <Text style={styles.label}>Profession: </Text>
              {appointment.doctor?.profession || 'N/A'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status</Text>
          <View style={styles.statusContainer}>
            <Text style={[
              styles.statusText,
              { color: appointment.status === 'Completed' ? '#4CAF50' : '#FF9800' }
            ]}>
              {appointment.status}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Consultation Note</Text>
          {!editing ? (
            <View style={styles.noteContainer}>
              <Text style={styles.noteText}>
                {appointment.consultNote || 'No notes yet'}
              </Text>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setEditing(true)}
              >
                <Text style={styles.editButtonText}>Edit Note</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.editContainer}>
              <TextInput
                multiline
                value={editedNote}
                onChangeText={setEditedNote}
                style={styles.noteInput}
                scrollEnabled={true}
                placeholder="Enter consultation notes..."
              />
              <View style={styles.editButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setEditing(false);
                    setEditedNote(appointment.consultNote || '');
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={saveNote}
                  disabled={isLoading}
                >
                  <Text style={styles.saveButtonText}>
                    {isLoading ? 'Saving...' : 'Save Note'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        <View style={styles.actionButtons}>
          {appointment.status === 'Pending' && (
            <TouchableOpacity
              style={styles.recordButton}
              onPress={startRecording}
            >
              <Text style={styles.recordButtonText}>Record Appointment</Text>
            </TouchableOpacity>
          )}
          
          {appointment.status === 'Pending' && (
            <TouchableOpacity
              style={styles.cancelAppointmentButton}
              onPress={cancelAppointment}
              disabled={isLoading}
            >
              <Text style={styles.cancelAppointmentButtonText}>
                {isLoading ? 'Cancelling...' : 'Cancel Appointment'}
              </Text>
            </TouchableOpacity>
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
  scrollView: {
    flex: 1,
    padding: 16,
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
  header: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#64B6AC',
    marginBottom: 8,
  },
  date: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64B6AC',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  label: {
    fontWeight: '600',
    color: '#64B6AC',
  },
  statusContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  noteContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  noteText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 16,
  },
  editButton: {
    backgroundColor: '#64B6AC',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  editContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  noteInput: {
    borderWidth: 1,
    borderColor: '#64B6AC',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    height: 400,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    backgroundColor: '#FF6B6B',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#64B6AC',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtons: {
    marginTop: 20,
    marginBottom: 40,
  },
  recordButton: {
    backgroundColor: '#64B6AC',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  recordButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  cancelAppointmentButton: {
    backgroundColor: '#FF6B6B',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cancelAppointmentButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
}); 