// Tab Navigation Layout
import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../src/utils/theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary[500],
        tabBarInactiveTintColor: colors.text.muted,
        tabBarStyle: {
          backgroundColor: colors.background.secondary,
          borderTopColor: colors.background.tertiary,
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: 8,
          height: 80,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
        headerStyle: {
          backgroundColor: colors.background.secondary,
        },
        headerTintColor: colors.text.primary,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Characters',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="sessions"
        options={{
          title: 'Sessions',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="game-controller-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="dice"
        options={{
          title: 'Dice',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="dice-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="reference"
        options={{
          title: 'Reference',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
