import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import AppointmentDetailScreen from '../screens/AppointmentDetailScreen';
import AddPatientScreen from '../screens/AddPatientScreen';
import AddAppointmentScreen from '../screens/AddAppointmentScreen';
import RecordAppointmentScreen from '../screens/RecordAppointmentScreen';
import ChatsScreen from '../screens/ChatsScreen';
import ChatDetailScreen from '../screens/ChatDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeList" component={HomeScreen} />
      <Stack.Screen name="AppointmentDetail" component={AppointmentDetailScreen} />
    </Stack.Navigator>
  );
}

function ChatsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ChatsList" component={ChatsScreen} />
      <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
    </Stack.Navigator>
  );
}

function RecordTabButton({ children, onPress }) {
  return (
    <TouchableOpacity
      style={styles.recordButton}
      onPress={onPress}
    >
      {children}
    </TouchableOpacity>
  );
}

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false
      }}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="AddPatient" component={AddPatientScreen} />
      <Tab.Screen name="Schedule" component={AddAppointmentScreen} />
      <Tab.Screen 
        name="Record"
        component={RecordAppointmentScreen}
        options={{
          tabBarButton: props => (
            <RecordTabButton {...props}>
              <Text style={styles.recordButtonText}>+</Text>
            </RecordTabButton>
          )
        }}
      />
      <Tab.Screen name="Chats" component={ChatsStack} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  recordButton: {
    position: 'absolute',
    bottom: 16,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#64B6AC',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  recordButtonText: {
    color: 'white',
    fontSize: 24,
  },
});
