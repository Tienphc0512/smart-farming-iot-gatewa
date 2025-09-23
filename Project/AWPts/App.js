import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import Sensor from './components/Sensor';
import Schedule from './components/Schedules';

const Tab = createMaterialBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen
          name="Dashboard"
          component={Sensor}
          options={{
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="view-dashboard" color={color} size={24} />
            ),
          }}
        />
        <Tab.Screen
          name="Đặt lịch"
          component={Schedule}
          options={{
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="history" color={color} size={24} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
