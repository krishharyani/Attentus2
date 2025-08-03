import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import api from '../api/client';

export default function ConsultNoteViewScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { appointmentId } = route?.params || {};
  
  console.log('ConsultNoteViewScreen - route params:', route?.params);
  console.log('ConsultNoteViewScreen - appointmentId:', appointmentId);
  
  const [appointment, setAppointment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (appointmentId) {
      fetchAppointment();
    }
  }, [appointmentId]);

  const fetchAppointment = async () => {
    try {
      console.log('Fetching appointment with ID:', appointmentId);
      const response = await api.get(`/appointments/${appointmentId}`);
      console.log('Appointment response:', response.data);
      setAppointment(response.data);
    } catch (error) {
      console.error('Error fetching appointment:', error);
      console.error('Error response:', error.response);
      Alert.alert('Error', 'Failed to load consult note');
    } finally {
      setIsLoading(false);
    }
  };

  if (!appointmentId) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Consult note not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading consult note...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!appointment) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Consult note not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Consult Note</Text>
        <Text style={styles.headerSubtitle}>
          {appointment.patient?.firstName} {appointment.patient?.lastName}
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.appointmentInfo}>
          <Text style={styles.appointmentTitle}>{appointment.title}</Text>
          <Text style={styles.appointmentDate}>
            {new Date(appointment.date).toLocaleDateString()}
          </Text>
          <Text style={styles.doctorName}>
            Dr. {appointment.doctor?.firstName} {appointment.doctor?.lastName}
          </Text>
        </View>

        <View style={styles.consultNoteContainer}>
          <Text style={styles.consultNoteLabel}>Consultation Notes</Text>
          <Text style={styles.consultNoteText}>
            {appointment.consultNote || 'No consult note available'}
          </Text>
        </View>

        {appointment.weight && appointment.height && (
          <View style={styles.vitalsContainer}>
            <Text style={styles.vitalsLabel}>Vitals</Text>
            <View style={styles.vitalsRow}>
              <Text style={styles.vitalItem}>Weight: {appointment.weight} kg</Text>
              <Text style={styles.vitalItem}>Height: {appointment.height} cm</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCFFF7',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#64B6AC',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  appointmentInfo: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
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
  appointmentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  appointmentDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  doctorName: {
    fontSize: 14,
    color: '#64B6AC',
    fontWeight: '500',
  },
  consultNoteContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
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
  consultNoteLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  consultNoteText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  vitalsContainer: {
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
  vitalsLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  vitalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  vitalItem: {
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
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
}); 