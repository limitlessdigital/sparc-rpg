// Login Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { useAuthStore } from '../src/stores/authStore';
import { authApi } from '../src/services/api';
import { registerForPushNotifications } from '../src/services/notifications';
import { colors, spacing, fontSizes, borderRadius, shadows } from '../src/utils/theme';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleOAuthLogin = async (provider: 'google' | 'discord' | 'apple') => {
    setIsLoading(provider);
    
    try {
      // For demo purposes, simulate OAuth flow
      // In production, this would use the actual OAuth providers
      Alert.alert(
        'Demo Mode',
        `${provider.charAt(0).toUpperCase() + provider.slice(1)} login would open here.\n\nFor this demo, a sample account will be used.`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => setIsLoading(null),
          },
          {
            text: 'Continue',
            onPress: async () => {
              // Simulate successful login
              const demoUser = {
                id: 'demo-user-1',
                email: 'player@sparcrpg.com',
                displayName: 'Demo Player',
                avatarUrl: undefined,
              };
              const demoToken = 'demo-token-' + Date.now();
              
              await login(demoUser, demoToken);
              
              // Register for push notifications
              await registerForPushNotifications();
              
              router.back();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Login Failed', 'Please try again later.');
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Text style={styles.logoEmoji}>🎲</Text>
        <Text style={styles.title}>SPARC RPG</Text>
        <Text style={styles.subtitle}>Sign in to continue your adventure</Text>
      </View>

      {/* OAuth Buttons */}
      <View style={styles.buttonsContainer}>
        <Pressable
          style={[styles.oauthButton, styles.googleButton]}
          onPress={() => handleOAuthLogin('google')}
          disabled={!!isLoading}
        >
          {isLoading === 'google' ? (
            <ActivityIndicator color={colors.text.inverse} />
          ) : (
            <>
              <Text style={styles.oauthIcon}>G</Text>
              <Text style={styles.oauthButtonText}>Continue with Google</Text>
            </>
          )}
        </Pressable>

        <Pressable
          style={[styles.oauthButton, styles.discordButton]}
          onPress={() => handleOAuthLogin('discord')}
          disabled={!!isLoading}
        >
          {isLoading === 'discord' ? (
            <ActivityIndicator color={colors.text.primary} />
          ) : (
            <>
              <Text style={styles.oauthIcon}>🎮</Text>
              <Text style={[styles.oauthButtonText, styles.discordButtonText]}>
                Continue with Discord
              </Text>
            </>
          )}
        </Pressable>

        <Pressable
          style={[styles.oauthButton, styles.appleButton]}
          onPress={() => handleOAuthLogin('apple')}
          disabled={!!isLoading}
        >
          {isLoading === 'apple' ? (
            <ActivityIndicator color={colors.text.primary} />
          ) : (
            <>
              <Text style={styles.oauthIcon}></Text>
              <Text style={[styles.oauthButtonText, styles.appleButtonText]}>
                Continue with Apple
              </Text>
            </>
          )}
        </Pressable>
      </View>

      {/* Terms */}
      <View style={styles.termsContainer}>
        <Text style={styles.termsText}>
          By signing in, you agree to our{' '}
          <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
          <Text style={styles.termsLink}>Privacy Policy</Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    padding: spacing.xl,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  logoEmoji: {
    fontSize: 80,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSizes.display,
    fontWeight: 'bold',
    color: colors.text.primary,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: fontSizes.md,
    color: colors.text.secondary,
    marginTop: spacing.sm,
  },
  buttonsContainer: {
    gap: spacing.md,
  },
  oauthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  googleButton: {
    backgroundColor: '#ffffff',
  },
  discordButton: {
    backgroundColor: '#5865F2',
  },
  appleButton: {
    backgroundColor: '#000000',
  },
  oauthIcon: {
    fontSize: fontSizes.xl,
    marginRight: spacing.md,
  },
  oauthButtonText: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.text.inverse,
  },
  discordButtonText: {
    color: colors.text.primary,
  },
  appleButtonText: {
    color: colors.text.primary,
  },
  termsContainer: {
    marginTop: spacing.xxl,
    alignItems: 'center',
  },
  termsText: {
    fontSize: fontSizes.sm,
    color: colors.text.muted,
    textAlign: 'center',
    lineHeight: 20,
  },
  termsLink: {
    color: colors.primary[400],
  },
});
