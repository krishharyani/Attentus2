import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const ConsultNoteComponent = ({ consultNote, onPress }) => {
  return (
    <TouchableOpacity style={styles.consultNoteContainer} onPress={onPress}>
      <View style={styles.consultNoteHeader}>
        <Text style={styles.consultNoteIcon}>📋</Text>
        <Text style={styles.consultNoteTitle}>Consult Note</Text>
      </View>
      
      <View style={styles.consultNoteContent}>
        <Text style={styles.patientName}>{consultNote.patientName}</Text>
        <Text style={styles.appointmentDate}>
          {new Date(consultNote.date).toLocaleDateString()}
        </Text>
        <Text style={styles.consultNotePreview} numberOfLines={2}>
          {consultNote.preview}
        </Text>
      </View>
      
      <View style={styles.consultNoteFooter}>
        <Text style={styles.viewFullText}>Tap to view full consult note</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  consultNoteContainer: {
    backgroundColor: 'rgba(100, 182, 172, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#64B6AC',
  },
  consultNoteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  consultNoteIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  consultNoteTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64B6AC',
  },
  consultNoteContent: {
    marginBottom: 8,
  },
  patientName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  appointmentDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  consultNotePreview: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  consultNoteFooter: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(100, 182, 172, 0.3)',
    paddingTop: 8,
    alignItems: 'center',
  },
  viewFullText: {
    fontSize: 12,
    color: '#64B6AC',
    fontWeight: '500',
  },
});

export default ConsultNoteComponent; 