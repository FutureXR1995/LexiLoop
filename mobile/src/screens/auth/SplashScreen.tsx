/**
 * Splash Screen
 * Loading screen displayed while checking authentication
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../store/ThemeContext';
import { theme } from '../../utils/theme';

const SplashScreen: React.FC = () => {
  const { colors } = useTheme();
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.5);

  useEffect(() => {
    // Animate logo appearance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <LinearGradient
      colors={[colors.primary, colors.secondary]}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Text style={[styles.logo, { color: colors.text.inverse }]}>
          LexiLoop
        </Text>
        <Text style={[styles.tagline, { color: colors.text.inverse }]}>
          Learn vocabulary through AI stories
        </Text>
      </Animated.View>
      
      <View style={styles.loadingContainer}>
        <Animated.View
          style={[
            styles.loadingDot,
            { backgroundColor: colors.text.inverse, opacity: fadeAnim },
          ]}
        />
        <Animated.View
          style={[
            styles.loadingDot,
            { 
              backgroundColor: colors.text.inverse, 
              opacity: fadeAnim,
              marginLeft: 8,
            },
          ]}
        />
        <Animated.View
          style={[
            styles.loadingDot,
            { 
              backgroundColor: colors.text.inverse, 
              opacity: fadeAnim,
              marginLeft: 8,
            },
          ]}
        />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 100,
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  tagline: {
    fontSize: 16,
    opacity: 0.9,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 100,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default SplashScreen;