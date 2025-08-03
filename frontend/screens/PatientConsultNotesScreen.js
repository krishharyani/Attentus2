import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import api from '../api/client';

export default function PatientConsultNotesScreen() {
  const { patientId, patientName } = useRoute().params;
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    fetchPatientAppointments();
  }, []);

  const fetchPatientAppointments = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/appointments');
      // Filter appointments for this specific patient
      const patientAppointments = response.data.filter(appt => 
        appt.patient?._id === patientId || appt.patient === patientId
      );
      setAppointments(patientAppointments);
    } catch (error) {
      console.error('Error fetching patient appointments:', error);
      Alert.alert('Error', 'Failed to load patient appointments');
    } finally {
      setIsLoading(false);
    }
  };

  const renderConsultNoteItem = ({ item }) => {
    const hasConsultNote = item.consultNote && item.consultNote.trim().length > 0;
    
    return (
      <TouchableOpacity
        style={styles.consultNoteCard}
        onPress={() => {
          if (hasConsultNote) {
            navigation.navigate('AppointmentDetail', { appointmentId: item._id });
          } else {
            Alert.alert('No Consult Note', 'This appointment does not have a consult note yet.');
          }
        }}
      >
        <View style={styles.consultNoteHeader}>
          <Text style={styles.appointmentTitle}>{item.title}</Text>
          <Text style={styles.appointmentDate}>
            {new Date(item.date).toLocaleDateString()}
          </Text>
        </View>
        
        <Text style={styles.doctorName}>
          Dr. {item.doctor?.firstName} {item.doctor?.lastName}
        </Text>
        
        {hasConsultNote ? (
          <Text style={styles.consultNotePreview} numberOfLines={2}>
            {item.consultNote.split('\n')[0]}
          </Text>
        ) : (
          <Text style={styles.noNoteText}>No consult note available</Text>
        )}
        
        <View style={styles.statusContainer}>
          <Text style={[
            styles.statusText,
            { color: item.status === 'Completed' ? '#4CAF50' : '#FF9800' }
          ]}>
            {item.status}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Consult Notes</Text>
        <Text style={styles.patientName}>{patientName}</Text>
      </View>

      <FlatList
        data={appointments}
        keyExtractor={(item) => item._id}
        renderItem={renderConsultNoteItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No appointments found for this patient</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCFFF7',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#64B6AC',
    marginBottom: 8,
  },
  patientName: {
    fontSize: 18,
    color: '#666',
  },
  listContainer: {
    padding: 20,
  },
  consultNoteCard: {
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
  consultNoteHeader: {
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
  appointmentDate: {
    fontSize: 14,
    color: '#666',
  },
  doctorName: {
    fontSize: 14,
    color: '#64B6AC',
    fontWeight: '500',
    marginBottom: 8,
  },
  consultNotePreview: {
    fontSize: 14,
    color: '#333',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  noNoteText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  statusContainer: {
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
}); 