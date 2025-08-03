import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Modal, Alert, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/client';
import ConsultNoteComponent from '../components/ConsultNoteComponent';

export default function ChatDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  
  // Safe extraction of chatId with fallback
  const chatId = route?.params?.chatId || null;
  
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [showConsultNoteModal, setShowConsultNoteModal] = useState(false);
  const [patients, setPatients] = useState([]);
  const [selectedConsultNote, setSelectedConsultNote] = useState(null);
  const flatListRef = useRef(null);

  useEffect(() => {
    if (!chatId) {
      console.error('No chatId provided');
      Alert.alert('Error', 'No chat ID provided');
      return;
    }
    getCurrentUser();
    fetchChat();
  }, [chatId]);

  const getCurrentUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('doctor');
      console.log('User data from AsyncStorage:', userData);
      if (userData) {
        const user = JSON.parse(userData);
        console.log('Parsed user object:', user);
        setCurrentUserId(user.id);
        console.log('Set current user ID to:', user.id);
      }
    } catch (error) {
      console.error('Error getting current user:', error);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await api.get('/appointments');
      // Get unique patients with consult notes
      const patientsWithNotes = response.data
        .filter(appt => appt.consultNote && appt.consultNote.trim().length > 0)
        .reduce((acc, appt) => {
          const patientId = appt.patient?._id || appt.patient;
          if (!acc.find(p => p._id === patientId)) {
            acc.push({
              _id: patientId,
              firstName: appt.patient?.firstName,
              lastName: appt.patient?.lastName,
              consultNotes: []
            });
          }
          const patient = acc.find(p => p._id === patientId);
          patient.consultNotes.push({
            appointmentId: appt._id,
            title: appt.title,
            date: appt.date,
            consultNote: appt.consultNote,
            preview: appt.consultNote.split('\n')[0]
          });
          return acc;
        }, []);
      setPatients(patientsWithNotes);
    } catch (error) {
      console.error('Error fetching patients:', error);
      Alert.alert('Error', 'Failed to load patients');
    }
  };

  const openConsultNoteModal = () => {
    fetchPatients();
    setShowConsultNoteModal(true);
  };

  const selectConsultNote = (consultNote) => {
    setSelectedConsultNote(consultNote);
    setShowConsultNoteModal(false);
    // Add the consult note preview to the message
    const consultNoteText = `\n\n📋 Consult Note: ${consultNote.preview}\nPatient: ${consultNote.patientName}\nDate: ${new Date(consultNote.date).toLocaleDateString()}\nAppointment ID: ${consultNote.appointmentId}`;
    setNewMessage(prev => prev + consultNoteText);
  };

  const fetchChat = async () => {
    try {
      console.log('Fetching chat with ID:', chatId);
      const response = await api.get(`/chats/${chatId}`);
      console.log('Chat detail fetched:', response.data);
      console.log('Current user ID:', currentUserId);
      console.log('Messages from response:', response.data.messages);
      setChat(response.data);
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Error fetching chat:', error);
      console.error('Error response:', error.response);
      Alert.alert('Error', 'Failed to load chat');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    console.log('Sending message to chatId:', chatId);
    console.log('Message content:', newMessage.trim());

    setIsLoading(true);
    try {
      // Extract appointment ID if this is a consult note message
      let consultNoteId = null;
      if (newMessage.includes('📋 Consult Note:')) {
        const lines = newMessage.split('\n');
        const appointmentIdLine = lines.find(line => line.includes('Appointment ID:'));
        if (appointmentIdLine) {
          consultNoteId = appointmentIdLine.split('Appointment ID:')[1].trim();
        }
      }

      console.log('Making API call to:', `/chats/${chatId}/message`);
      console.log('Request payload:', {
        content: newMessage.trim(),
        consultNoteId: consultNoteId
      });

      const response = await api.post(`/chats/${chatId}/message`, {
        content: newMessage.trim(),
        consultNoteId: consultNoteId
      });
      
      console.log('Message response:', response.data);
      
      // Update the chat and messages with the new data
      setChat(response.data);
      setMessages(response.data.messages || []);
      setNewMessage('');
      setSelectedConsultNote(null);
      
      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Error sending message:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }) => {
    console.log('Rendering message item:', item);
    console.log('Current user ID:', currentUserId, 'type:', typeof currentUserId);
    console.log('Message sender ID:', item.sender?._id, 'type:', typeof item.sender?._id);
    
    // Convert both to strings for comparison
    const senderId = item.sender?._id?.toString();
    const userId = currentUserId?.toString();
    const isOwnMessage = senderId === userId;
    
    console.log('Sender ID (string):', senderId);
    console.log('User ID (string):', userId);
    console.log('Is own message:', isOwnMessage);

    // Safety check for content
    if (!item.content) {
      console.warn('Message item has no content:', item);
      return null;
    }

    // Check if message contains a consult note
    const hasConsultNote = item.content.includes('📋 Consult Note:');
    
    // Extract consult note data if present
    let consultNoteData = null;
    if (hasConsultNote) {
      const lines = item.content.split('\n');
      const consultNoteLine = lines.find(line => line.includes('📋 Consult Note:'));
      const patientLine = lines.find(line => line.includes('Patient:'));
      const dateLine = lines.find(line => line.includes('Date:'));
      const appointmentIdLine = lines.find(line => line.includes('Appointment ID:'));
      
      if (consultNoteLine && patientLine && dateLine && appointmentIdLine) {
        consultNoteData = {
          preview: consultNoteLine.split('📋 Consult Note:')[1].trim(),
          patientName: patientLine.split('Patient:')[1].trim(),
          date: dateLine.split('Date:')[1].trim(),
          appointmentId: appointmentIdLine.split('Appointment ID:')[1].trim()
        };
        console.log('Extracted consult note data:', consultNoteData);
      }
    }

    // Get the regular message content (without consult note data)
    const regularContent = hasConsultNote 
      ? item.content.split('📋 Consult Note:')[0].trim()
      : item.content;

    return (
      <View style={[
        styles.messageContainer,
        isOwnMessage ? styles.ownMessage : styles.otherMessage
      ]}>
        <View style={[
          styles.messageBubble,
          isOwnMessage ? styles.ownBubble : styles.otherBubble
        ]}>
          {regularContent && (
            <Text style={[
              styles.messageText,
              isOwnMessage ? styles.ownMessageText : styles.otherMessageText
            ]}>
              {regularContent}
            </Text>
          )}
          
          {hasConsultNote && consultNoteData && (
            <ConsultNoteComponent
              consultNote={consultNoteData}
              onPress={() => {
                console.log('Navigating to ConsultNoteView with appointmentId:', consultNoteData.appointmentId);
                navigation.navigate('ConsultNoteView', { 
                  appointmentId: consultNoteData.appointmentId 
                });
              }}
            />
          )}
          
          <Text style={[
            styles.messageTime,
            isOwnMessage ? styles.ownMessageTime : styles.otherMessageTime
          ]}>
            {new Date(item.timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Text>
        </View>
        {!isOwnMessage && (
          <Text style={styles.senderName}>{item.sender?.name}</Text>
        )}
      </View>
    );
  };

  const getOtherParticipantName = () => {
    if (!chat?.participants) return 'Chat';
    const otherParticipant = chat.participants.find(p => p._id !== currentUserId);
    
    if (otherParticipant?.firstName && otherParticipant?.lastName) {
      return `${otherParticipant.firstName} ${otherParticipant.lastName}`;
    } else if (otherParticipant?.name) {
      return otherParticipant.name;
    } else if (otherParticipant?.email) {
      return otherParticipant.email.split('@')[0];
    } else {
      return 'Chat';
    }
  };

  // Early return if no chatId
  if (!chatId) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="dark-content" backgroundColor="#FCFFF7" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Chat not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FCFFF7" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{getOtherParticipantName()}</Text>
      </View>
      
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No messages yet</Text>
              <Text style={styles.emptySubtext}>Start the conversation!</Text>
            </View>
          }
        />
        
        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={styles.attachButton}
            onPress={openConsultNoteModal}
          >
            <Text style={styles.attachButtonText}>+</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.textInput}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type a message..."
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!newMessage.trim() || isLoading) && styles.disabledButton]}
            onPress={sendMessage}
            disabled={!newMessage.trim() || isLoading}
          >
            <Text style={styles.sendButtonText}>
              {isLoading ? '...' : 'Send'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Consult Note Selection Modal */}
      <Modal
        visible={showConsultNoteModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer} edges={['top', 'left', 'right']}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Consult Note</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowConsultNoteModal(false)}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={patients}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <View style={styles.patientSection}>
                <Text style={styles.patientName}>
                  {item.firstName} {item.lastName}
                </Text>
                {item.consultNotes.map((note, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.consultNoteItem}
                    onPress={() => selectConsultNote({
                      ...note,
                      patientName: `${item.firstName} ${item.lastName}`
                    })}
                  >
                    <Text style={styles.consultNoteTitle}>{note.title}</Text>
                    <Text style={styles.consultNoteDate}>
                      {new Date(note.date).toLocaleDateString()}
                    </Text>
                    <Text style={styles.consultNotePreview} numberOfLines={2}>
                      {note.preview}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            contentContainerStyle={styles.modalList}
            ListEmptyComponent={
              <View style={styles.emptyModalContainer}>
                <Text style={styles.emptyModalText}>No consult notes found</Text>
              </View>
            }
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCFFF7',
  },
  header: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#64B6AC',
  },
  keyboardView: {
    flex: 1,
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
  },
  ownMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  ownBubble: {
    backgroundColor: '#64B6AC',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  ownMessageText: {
    color: 'white',
  },
  otherMessageText: {
    color: '#333',
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
  },
  ownMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  otherMessageTime: {
    color: '#999',
  },
  senderName: {
    fontSize: 12,
    color: '#64B6AC',
    marginTop: 4,
    marginLeft: 12,
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
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#64B6AC',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  attachButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#64B6AC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  attachButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FCFFF7',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#64B6AC',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    color: '#64B6AC',
    fontSize: 16,
    fontWeight: '600',
  },
  modalList: {
    padding: 20,
  },
  patientSection: {
    marginBottom: 20,
  },
  patientName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  consultNoteItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  consultNoteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  consultNoteDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  consultNotePreview: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  emptyModalContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyModalText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FCFFF7',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
}); 