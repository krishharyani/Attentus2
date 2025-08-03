import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import api from '../api/client';

export default function ChatsScreen() {
  const [chats, setChats] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      const response = await api.get('/chats');
      setChats(response.data);
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await api.get('/doctors');
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
    const otherParticipant = item.participants?.find(p => p._id !== 'current-user-id');
    const lastMessage = item.messages?.[item.messages.length - 1];

    return (
      <TouchableOpacity
        style={styles.chatCard}
        onPress={() => navigation.navigate('ChatDetail', { chatId: item._id })}
      >
        <View style={styles.chatHeader}>
          <Text style={styles.chatName}>
            {otherParticipant?.name || 'Unknown Doctor'}
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

  const renderDoctorItem = ({ item }) => (
    <TouchableOpacity
      style={styles.doctorItem}
      onPress={() => handleNewChat(item._id)}
      disabled={isLoading}
    >
      <Text style={styles.doctorName}>{item.name}</Text>
      <Text style={styles.doctorProfession}>{item.profession}</Text>
    </TouchableOpacity>
  );

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
          
          <FlatList
            data={doctors}
            renderItem={renderDoctorItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.doctorList}
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
}); 