import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/client';

export default function ChatsScreen() {
  const [chats, setChats] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    getCurrentUser();
    fetchChats();
  }, []);

  useEffect(() => {
    filterDoctors();
  }, [searchQuery, doctors]);

  const getCurrentUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('doctor');
      if (userData) {
        const user = JSON.parse(userData);
        setCurrentUserId(user.id);
      }
    } catch (error) {
      console.error('Error getting current user:', error);
    }
  };

  const filterDoctors = () => {
    if (!searchQuery.trim()) {
      setFilteredDoctors(doctors);
      return;
    }

    const filtered = doctors.filter(doctor => {
      // Handle all possible name fields
      let fullName = '';
      if (doctor.firstName && doctor.lastName) {
        fullName = `${doctor.firstName} ${doctor.lastName}`.toLowerCase();
      } else if (doctor.name) {
        fullName = doctor.name.toLowerCase();
      } else if (doctor.email) {
        fullName = doctor.email.split('@')[0].toLowerCase();
      }
      
      const profession = doctor.profession?.toLowerCase() || '';
      const searchLower = searchQuery.toLowerCase();
      
      // Prioritize name search over profession search
      return fullName.includes(searchLower) || profession.includes(searchLower);
    });
    setFilteredDoctors(filtered);
  };

  const fetchChats = async () => {
    try {
      const response = await api.get('/chats');
      console.log('Chats fetched:', response.data);
      setChats(response.data);
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await api.get('/doctors');
      console.log('Doctors fetched:', response.data);
      setDoctors(response.data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const handleNewChat = async (doctorId) => {
    setIsLoading(true);
    try {
      const response = await api.post('/chats', { doctorId });
      setShowDoctorModal(false);
      navigation.navigate('ChatDetail', { chatId: response.data._id });
    } catch (error) {
      Alert.alert('Error', 'Failed to create new chat');
    } finally {
      setIsLoading(false);
    }
  };

  const openDoctorModal = () => {
    fetchDoctors();
    setShowDoctorModal(true);
  };

  const renderChatItem = ({ item }) => {
    // Get the other participant's name (not the current user)
    const otherParticipant = item.participants?.find(p => p._id !== currentUserId);
    const lastMessage = item.messages?.[item.messages.length - 1];

    return (
      <TouchableOpacity
        style={styles.chatCard}
        onPress={() => navigation.navigate('ChatDetail', { chatId: item._id })}
      >
        <View style={styles.chatHeader}>
                  <Text style={styles.chatName}>
          {(() => {
            if (otherParticipant?.firstName && otherParticipant?.lastName) {
              return `${otherParticipant.firstName} ${otherParticipant.lastName}`;
            } else if (otherParticipant?.name) {
              return otherParticipant.name;
            } else if (otherParticipant?.email) {
              return otherParticipant.email.split('@')[0];
            } else {
              return 'Unknown Doctor';
            }
          })()}
        </Text>
          <Text style={styles.chatTime}>
            {lastMessage ? new Date(lastMessage.timestamp).toLocaleDateString() : ''}
          </Text>
        </View>
        
        <Text style={styles.lastMessage} numberOfLines={2}>
          {lastMessage?.content || 'No messages yet'}
        </Text>
        
        <View style={styles.chatFooter}>
          <Text style={styles.messageCount}>
            {item.messages?.length || 0} messages
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderDoctorItem = ({ item }) => {
    console.log('Rendering doctor item:', item);
    // Check all possible name fields
    let doctorName = 'Unknown Doctor';
    if (item.firstName && item.lastName) {
      doctorName = `${item.firstName} ${item.lastName}`;
    } else if (item.name) {
      doctorName = item.name;
    } else if (item.email) {
      doctorName = item.email.split('@')[0]; // Use email prefix as fallback
    }
    
    return (
      <TouchableOpacity
        style={styles.doctorItem}
        onPress={() => handleNewChat(item._id)}
        disabled={isLoading}
      >
        <Text style={styles.doctorName}>
          {doctorName}
        </Text>
        <Text style={styles.doctorProfession}>{item.profession || 'No profession'}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Chats</Text>
        <TouchableOpacity 
          style={styles.newChatButton}
          onPress={openDoctorModal}
        >
          <Text style={styles.newChatButtonText}>+</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={chats}
        renderItem={renderChatItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No chats yet</Text>
            <Text style={styles.emptySubtext}>Start a conversation with another doctor</Text>
          </View>
        }
      />

      <Modal
        visible={showDoctorModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Doctor</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowDoctorModal(false)}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search doctors by name or profession..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          
          <FlatList
            data={filteredDoctors}
            renderItem={renderDoctorItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.doctorList}
            ListEmptyComponent={
              <View style={styles.emptyDoctorContainer}>
                <Text style={styles.emptyDoctorText}>
                  {isLoading ? 'Loading doctors...' :
                   searchQuery ? 'No doctors found matching your search' : 
                   'No doctors available'}
                </Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  newChatButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#64B6AC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  newChatButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  list: {
    padding: 20,
  },
  chatCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
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
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  chatName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64B6AC',
  },
  chatTime: {
    fontSize: 14,
    color: '#666',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  chatFooter: {
    alignItems: 'flex-end',
  },
  messageCount: {
    fontSize: 12,
    color: '#999',
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
  doctorList: {
    padding: 20,
  },
  doctorItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
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
  doctorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  doctorProfession: {
    fontSize: 14,
    color: '#666',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchInput: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  emptyDoctorContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyDoctorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
}); 