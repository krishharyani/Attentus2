import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import AddPatientScreen from '../screens/AddPatientScreen';
import RecordAppointmentScreen from '../screens/RecordAppointmentScreen';
import ChatsScreen from '../screens/ChatsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { TouchableOpacity, Text } from 'react-native';

const Tab = createBottomTabNavigator();

function RecordTabButton({ children, onPress }) {
  return (
    <TouchableOpacity
      className="absolute bottom-4 w-16 h-16 rounded-full bg-primary items-center justify-center shadow-lg"
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
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="AddPatient" component={AddPatientScreen} />
      <Tab.Screen 
        name="Record"
        component={RecordAppointmentScreen}
        options={{
          tabBarButton: props => (
            <RecordTabButton {...props}>
              <Text className="text-white text-2xl">+</Text>
            </RecordTabButton>
          )
        }}
      />
      <Tab.Screen name="Chats" component={ChatsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
