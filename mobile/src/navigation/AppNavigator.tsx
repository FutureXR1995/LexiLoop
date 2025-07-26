/**
 * App Navigator
 * Main navigation structure for the app
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { useAuth } from '../store/AuthContext';
import { useTheme } from '../store/ThemeContext';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import SplashScreen from '../screens/auth/SplashScreen';

// Main Screens
import HomeScreen from '../screens/main/HomeScreen';
import LearnScreen from '../screens/main/LearnScreen';
import ProgressScreen from '../screens/main/ProgressScreen';
import SocialScreen from '../screens/main/SocialScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

// Learning Screens
import StoryScreen from '../screens/learning/StoryScreen';
import TestScreen from '../screens/learning/TestScreen';
import VocabularyDetailScreen from '../screens/learning/VocabularyDetailScreen';

// Social Screens
import FriendsScreen from '../screens/social/FriendsScreen';
import AchievementsScreen from '../screens/social/AchievementsScreen';
import LeaderboardScreen from '../screens/social/LeaderboardScreen';

export type RootStackParamList = {
  // Auth
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  
  // Main
  MainTabs: undefined;
  
  // Learning
  Story: { storyId: string };
  Test: { sessionId: string };
  VocabularyDetail: { vocabularyId: string };
  
  // Social
  Friends: undefined;
  Achievements: undefined;
  Leaderboard: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Learn: undefined;
  Progress: undefined;
  Social: undefined;
  Profile: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabNavigator: React.FC = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home';
              break;
            case 'Learn':
              iconName = focused ? 'school' : 'school';
              break;
            case 'Progress':
              iconName = focused ? 'analytics' : 'analytics';
              break;
            case 'Social':
              iconName = focused ? 'people' : 'people';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person';
              break;
            default:
              iconName = 'help';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text.secondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.text.primary,
        headerTitleStyle: {
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: 'Home' }}
      />
      <Tab.Screen 
        name="Learn" 
        component={LearnScreen}
        options={{ title: 'Learn' }}
      />
      <Tab.Screen 
        name="Progress" 
        component={ProgressScreen}
        options={{ title: 'Progress' }}
      />
      <Tab.Screen 
        name="Social" 
        component={SocialScreen}
        options={{ title: 'Social' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { colors } = useTheme();

  if (isLoading) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.text.primary,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      {!isAuthenticated ? (
        // Auth Stack
        <>
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Register" 
            component={RegisterScreen}
            options={{ 
              title: 'Create Account',
              headerShown: true 
            }}
          />
        </>
      ) : (
        // Main App Stack
        <>
          <Stack.Screen 
            name="MainTabs" 
            component={MainTabNavigator}
            options={{ headerShown: false }}
          />
          
          {/* Learning Screens */}
          <Stack.Screen 
            name="Story" 
            component={StoryScreen}
            options={{ title: 'Story' }}
          />
          <Stack.Screen 
            name="Test" 
            component={TestScreen}
            options={{ title: 'Test' }}
          />
          <Stack.Screen 
            name="VocabularyDetail" 
            component={VocabularyDetailScreen}
            options={{ title: 'Vocabulary' }}
          />
          
          {/* Social Screens */}
          <Stack.Screen 
            name="Friends" 
            component={FriendsScreen}
            options={{ title: 'Friends' }}
          />
          <Stack.Screen 
            name="Achievements" 
            component={AchievementsScreen}
            options={{ title: 'Achievements' }}
          />
          <Stack.Screen 
            name="Leaderboard" 
            component={LeaderboardScreen}
            options={{ title: 'Leaderboard' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;