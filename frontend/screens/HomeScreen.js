import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import api from '../api/client';

export default function HomeScreen() {
  const [appointments, setAppointments] = useState([]);
  const navigation = useNavigation();

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/appointments');
      console.log('All appointments:', response.data);
      setAppointments(response.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  // Refresh appointments when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchAppointments();
    }, [])
  );

  // Filter appointments for next 24 hours and past 24 hours
  const now = new Date();
  const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const past24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  
  console.log('Current time:', now.toISOString());
  console.log('Next 24 hours:', next24Hours.toISOString());
  console.log('Past 24 hours:', past24Hours.toISOString());
  
  // Show all upcoming appointments (not just next 24 hours)
  const upcoming = appointments
    .filter(a => {
      const appointmentDate = new Date(a.date);
      const isUpcoming = appointmentDate.getTime() >= now.getTime();
      console.log(`Appointment ${a.title}: ${appointmentDate.toISOString()}, isUpcoming: ${isUpcoming}, appointment time: ${appointmentDate.getTime()}, current time: ${now.getTime()}`);
      return isUpcoming;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      console.log(`Sorting: ${a.title} (${dateA}) vs ${b.title} (${dateB})`);
      return dateA - dateB; // Earliest first
    });
  
  console.log('Upcoming appointments after sorting:', upcoming.map(a => ({ title: a.title, date: new Date(a.date).toISOString(), timestamp: new Date(a.date).getTime() })));
  
  // Next closest appointment (earliest upcoming)
  const next = upcoming[0];
  const otherUpcoming = upcoming.slice(1);
  
  // Show all past appointments (not just past 24 hours)
  const recent = appointments
    .filter(a => {
      const appointmentDate = new Date(a.date);
      const isRecent = appointmentDate.getTime() < now.getTime();
      console.log(`Appointment ${a.title}: ${appointmentDate.toISOString()}, status: ${a.status}, isRecent: ${isRecent}`);
      return isRecent;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Most recent first

  console.log('Recent appointments:', recent);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.appointmentCard}
      onPress={() => navigation.navigate('AppointmentDetail', { appointmentId: item._id })}
    >
      <Text style={styles.appointmentTitle}>{item.title}</Text>
      <Text style={styles.appointmentDate}>{new Date(item.date).toLocaleString()}</Text>
      
      {item.consultNote && item.consultNote.trim().length > 0 ? (
        <TouchableOpacity
          style={styles.consultNotePreview}
          onPress={() => navigation.navigate('ConsultNoteView', { appointmentId: item._id })}
        >
          <Text style={styles.consultNotePreviewText} numberOfLines={2}>
            📋 {item.consultNote.split('\n')[0]}
          </Text>
          <Text style={styles.consultNoteTapText}>Tap to view full consult note</Text>
        </TouchableOpacity>
      ) : (
        <Text style={styles.appointmentNote}>No notes yet</Text>
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

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.patientHistoryButton}
          onPress={() => navigation.navigate('PatientHistory')}
        >
          <Text style={styles.patientHistoryButtonText}>Patient History</Text>
        </TouchableOpacity>
      </View>
      
      {next && (
        <TouchableOpacity
          style={styles.nextAppointmentCard}
          onPress={() => navigation.navigate('AppointmentDetail', { appointmentId: next._id })}
        >
          <Text style={styles.nextAppointmentTitle}>Next: {next.title}</Text>
          <Text style={styles.nextAppointmentDate}>{new Date(next.date).toLocaleString()}</Text>
          <Text style={styles.nextAppointmentStatus}>Status: {next.status}</Text>
          <Text style={styles.nextAppointmentPatient}>
            Patient: {next.patient?.firstName} {next.patient?.lastName}
          </Text>
        </TouchableOpacity>
      )}
      
      {upcoming.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
          <FlatList 
            data={otherUpcoming} 
            keyExtractor={i => i._id} 
            renderItem={renderItem}
            scrollEnabled={false}
          />
        </>
      )}
      
      {recent.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Past Appointments ({recent.length})</Text>
          <FlatList 
            data={recent} 
            keyExtractor={i => i._id} 
            renderItem={renderItem}
            scrollEnabled={false}
          />
        </>
      )}
      
      {upcoming.length === 0 && recent.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No appointments found</Text>
          <Text style={styles.emptySubtext}>Schedule new appointments to see them here</Text>
          <Text style={styles.debugText}>Total appointments: {appointments.length}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FCFFF7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
    marginBottom: 10,
  },
  patientHistoryButton: {
    backgroundColor: '#64B6AC',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  patientHistoryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  nextAppointmentCard: {
    padding: 40,
    backgroundColor: '#64B6AC',
    borderRadius: 24,
    marginTop: 40,
    marginBottom: 32,
    minHeight: 240,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 12,
  },
  nextAppointmentTitle: {
    fontSize: 26,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 12,
  },
  nextAppointmentDate: {
    fontSize: 18,
    color: 'white',
    marginBottom: 8,
  },
  nextAppointmentStatus: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    marginBottom: 8,
  },
  nextAppointmentPatient: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#64B6AC',
    marginBottom: 8,
    marginTop: 16,
    fontWeight: '600',
  },
  appointmentCard: {
    padding: 16,
    marginBottom: 8,
    backgroundColor: 'white',
    borderRadius: 16,
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
    color: '#64B6AC',
    fontWeight: '500',
  },
  appointmentDate: {
    fontSize: 14,
    color: '#BFE0DC',
    marginTop: 4,
  },
  appointmentNote: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  consultNotePreview: {
    backgroundColor: 'rgba(100, 182, 172, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#64B6AC',
  },
  consultNotePreviewText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 18,
  },
  consultNoteTapText: {
    fontSize: 12,
    color: '#64B6AC',
    marginTop: 4,
    fontWeight: '500',
  },
  statusContainer: {
    marginTop: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
}); 