import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, FlatList } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../api/client';
import { useNavigation } from '@react-navigation/native';

export default function AddAppointmentScreen() {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [patientId, setPatientId] = useState('');
  const [patientName, setPatientName] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showPatientList, setShowPatientList] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await api.get('/patients');
      setPatients(response.data);
      setFilteredPatients(response.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
      Alert.alert('Error', 'Failed to load patients');
    }
  };

  const handlePatientSearch = (text) => {
    setPatientName(text);
    if (text.trim() === '') {
      setFilteredPatients(patients);
      setShowPatientList(false);
    } else {
      const filtered = patients.filter(patient => 
        `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredPatients(filtered);
      setShowPatientList(true);
    }
  };

  const selectPatient = (patient) => {
    setPatientId(patient._id);
    setPatientName(`${patient.firstName} ${patient.lastName}`);
    setShowPatientList(false);
  };

  const handleDateChange = (event, selectedDate) => {
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    if (selectedTime) {
      setDate(selectedTime);
    }
  };

  const openDatePicker = () => {
    setShowDatePicker(true);
    setShowTimePicker(false);
  };

  const openTimePicker = () => {
    setShowTimePicker(true);
    setShowDatePicker(false);
  };

  const closePickers = () => {
    setShowDatePicker(false);
    setShowTimePicker(false);
  };

  const save = async () => {
    if (!patientId || !title.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      await api.post('/appointments', { 
        patientId, 
        title: title.trim(), 
        date: date.toISOString() 
      });
      Alert.alert('Success', 'Appointment scheduled successfully', [
        { text: 'OK', onPress: () => navigation.navigate('Home') }
      ]);
    } catch (error) {
      console.error('Error saving appointment:', error);
      Alert.alert('Error', 'Failed to schedule appointment');
    }
  };

  const renderPatientItem = ({ item }) => (
    <TouchableOpacity
      style={styles.patientItem}
      onPress={() => selectPatient(item)}
    >
      <Text style={styles.patientName}>{item.firstName} {item.lastName}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Schedule Appointment</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Patient</Text>
        <TextInput
          placeholder="Search patient name..."
          value={patientName}
          onChangeText={handlePatientSearch}
          style={styles.input}
          onFocus={() => setShowPatientList(true)}
        />
        
        {showPatientList && filteredPatients.length > 0 && (
          <View style={styles.patientListContainer}>
            <FlatList
              data={filteredPatients}
              renderItem={renderPatientItem}
              keyExtractor={(item) => item._id}
              style={styles.patientList}
              nestedScrollEnabled={true}
            />
          </View>
        )}

        <Text style={styles.label}>Appointment Title</Text>
        <TextInput
          placeholder="Enter appointment title"
          value={title}
          onChangeText={setTitle}
          style={styles.input}
        />

        <Text style={styles.label}>Date & Time</Text>
        <View style={styles.dateTimeContainer}>
          <TouchableOpacity 
            style={styles.dateButton}
            onPress={openDatePicker}
          >
            <Text style={styles.dateButtonText}>
              Date: {date.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.timeButton}
            onPress={openTimePicker}
          >
            <Text style={styles.timeButtonText}>
              Time: {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </TouchableOpacity>
        </View>

        {(showDatePicker || showTimePicker) && (
          <View style={styles.pickerContainer}>
            <DateTimePicker
              value={date}
              mode={showDatePicker ? "date" : "time"}
              display="default"
              onChange={showDatePicker ? handleDateChange : handleTimeChange}
            />
            <TouchableOpacity style={styles.doneButton} onPress={closePickers}>
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={styles.saveButton}
          onPress={save}
        >
          <Text style={styles.saveButtonText}>Save Appointment</Text>
        </TouchableOpacity>
      </View>
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
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#64B6AC',
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#64B6AC',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: 'white',
    marginBottom: 16,
  },
  patientListContainer: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#64B6AC',
    borderRadius: 12,
    backgroundColor: 'white',
    marginBottom: 16,
  },
  patientList: {
    maxHeight: 200,
  },
  patientItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  patientName: {
    fontSize: 16,
    color: '#333',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dateButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#64B6AC',
    borderRadius: 12,
    padding: 16,
    backgroundColor: 'white',
    marginRight: 8,
  },
  timeButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#64B6AC',
    borderRadius: 12,
    padding: 16,
    backgroundColor: 'white',
    marginLeft: 8,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  timeButtonText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  doneButton: {
    backgroundColor: '#64B6AC',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 12,
  },
  doneButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#64B6AC',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
}); 