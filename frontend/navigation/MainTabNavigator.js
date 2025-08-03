import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import AppointmentDetailScreen from '../screens/AppointmentDetailScreen';
import AddPatientScreen from '../screens/AddPatientScreen';
import AddAppointmentScreen from '../screens/AddAppointmentScreen';
import RecordAppointmentScreen from '../screens/RecordAppointmentScreen';
import ChatsScreen from '../screens/ChatsScreen';
import ChatDetailScreen from '../screens/ChatDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';
import PatientHistoryScreen from '../screens/PatientHistoryScreen';
import PatientConsultNotesScreen from '../screens/PatientConsultNotesScreen';
import ConsultNoteViewScreen from '../screens/ConsultNoteViewScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeList" component={HomeScreen} />
      <Stack.Screen name="AppointmentDetail" component={AppointmentDetailScreen} />
      <Stack.Screen name="PatientHistory" component={PatientHistoryScreen} />
      <Stack.Screen name="PatientConsultNotes" component={PatientConsultNotesScreen} />
      <Stack.Screen name="ConsultNoteView" component={ConsultNoteViewScreen} />
    </Stack.Navigator>
  );
}

function ChatsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ChatsList" component={ChatsScreen} />
      <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
      <Stack.Screen name="ConsultNoteView" component={ConsultNoteViewScreen} />
    </Stack.Navigator>
  );
}



export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconText;

          if (route.name === 'Home') {
            iconText = '🏠';
          } else if (route.name === 'AddPatient') {
            iconText = '👤+';
          } else if (route.name === 'Schedule') {
            iconText = '📅';
          } else if (route.name === 'Record') {
            iconText = '🎤';
          } else if (route.name === 'Chats') {
            iconText = '💬';
          } else if (route.name === 'Profile') {
            iconText = '👤';
          }

          return <Text style={{ fontSize: size, color: color }}>{iconText}</Text>;
        },
        tabBarActiveTintColor: '#64B6AC',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeStack}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen 
        name="AddPatient" 
        component={AddPatientScreen}
        options={{ tabBarLabel: 'Add Patient' }}
      />
      <Tab.Screen 
        name="Schedule" 
        component={AddAppointmentScreen}
        options={{ tabBarLabel: 'Schedule' }}
      />
      <Tab.Screen 
        name="Record"
        component={RecordAppointmentScreen}
        options={{ tabBarLabel: 'Record' }}
      />
      <Tab.Screen 
        name="Chats" 
        component={ChatsStack}
        options={{ tabBarLabel: 'Chats' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
}


