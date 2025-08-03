import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import AddPatientScreen from '../screens/AddPatientScreen';
import RecordAppointmentScreen from '../screens/RecordAppointmentScreen';
import ChatsScreen from '../screens/ChatsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

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
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="AddPatient" component={AddPatientScreen} />
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
      <Tab.Screen name="Chats" component={ChatsScreen} />
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
