// Profile Tab
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  Alert,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';
import { useSettingsStore } from '../../src/stores/settingsStore';
import { colors, spacing, fontSizes, borderRadius, shadows } from '../../src/utils/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const {
    notifications,
    hapticEnabled,
    biometricUnlock,
    diceGesture,
    updateNotifications,
    toggleHaptic,
    toggleBiometric,
    updateDiceGesture,
  } = useSettingsStore();

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/');
          },
        },
      ]
    );
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>👤</Text>
        <Text style={styles.emptyTitle}>Profile</Text>
        <Text style={styles.emptyText}>Sign in to manage your account</Text>
        <Pressable style={styles.loginButton} onPress={() => router.push('/login')}>
          <Text style={styles.loginButtonText}>Sign In</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* User Info */}
      <View style={styles.userSection}>
        {user?.avatarUrl ? (
          <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {user?.displayName?.charAt(0).toUpperCase() || '?'}
            </Text>
          </View>
        )}
        <Text style={styles.userName}>{user?.displayName}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
      </View>

      {/* Notifications Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔔 Notifications</Text>
        
        <SettingRow
          label="24-hour session reminder"
          value={notifications.sessionReminder24h}
          onToggle={(value) => updateNotifications({ sessionReminder24h: value })}
        />
        <SettingRow
          label="1-hour session reminder"
          value={notifications.sessionReminder1h}
          onToggle={(value) => updateNotifications({ sessionReminder1h: value })}
        />
        <SettingRow
          label="Turn alerts"
          value={notifications.turnAlerts}
          onToggle={(value) => updateNotifications({ turnAlerts: value })}
        />
        <SettingRow
          label="Session invites"
          value={notifications.sessionInvites}
          onToggle={(value) => updateNotifications({ sessionInvites: value })}
        />
        <SettingRow
          label="Do not disturb"
          value={notifications.dndEnabled}
          onToggle={(value) => updateNotifications({ dndEnabled: value })}
        />
      </View>

      {/* Dice Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎲 Dice Settings</Text>
        
        <SettingRow
          label="Haptic feedback"
          value={hapticEnabled}
          onToggle={toggleHaptic}
        />
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Roll gesture</Text>
          <View style={styles.gestureOptions}>
            {(['swipe', 'tap', 'shake'] as const).map((gesture) => (
              <Pressable
                key={gesture}
                style={[
                  styles.gestureOption,
                  diceGesture.type === gesture && styles.gestureOptionSelected,
                ]}
                onPress={() => updateDiceGesture({ type: gesture })}
              >
                <Text
                  style={[
                    styles.gestureOptionText,
                    diceGesture.type === gesture && styles.gestureOptionTextSelected,
                  ]}
                >
                  {gesture.charAt(0).toUpperCase() + gesture.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      {/* Security */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔒 Security</Text>
        
        <SettingRow
          label="Biometric unlock"
          value={biometricUnlock}
          onToggle={toggleBiometric}
        />
      </View>

      {/* Sign Out */}
      <View style={styles.section}>
        <Pressable style={styles.signOutButton} onPress={handleLogout}>
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </Pressable>
      </View>

      {/* App Version */}
      <View style={styles.footer}>
        <Text style={styles.versionText}>SPARC RPG v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

function SettingRow({
  label,
  value,
  onToggle,
}: {
  label: string;
  value: boolean;
  onToggle: (value: boolean) => void;
}) {
  return (
    <View style={styles.settingItem}>
      <Text style={styles.settingLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.background.tertiary, true: colors.primary[600] }}
        thumbColor={value ? colors.primary[400] : colors.text.muted}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  userSection: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background.secondary,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: spacing.md,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    fontSize: fontSizes.xxxl,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  userName: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  userEmail: {
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  section: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.background.tertiary,
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  settingLabel: {
    fontSize: fontSizes.md,
    color: colors.text.secondary,
  },
  gestureOptions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  gestureOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.elevated,
  },
  gestureOptionSelected: {
    backgroundColor: colors.primary[600],
  },
  gestureOptionText: {
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
  },
  gestureOptionTextSelected: {
    color: colors.text.primary,
    fontWeight: '600',
  },
  signOutButton: {
    backgroundColor: colors.error,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  signOutButtonText: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.text.primary,
  },
  footer: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  versionText: {
    fontSize: fontSizes.sm,
    color: colors.text.muted,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background.primary,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: fontSizes.xxl,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: fontSizes.md,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  loginButton: {
    backgroundColor: colors.primary[600],
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  loginButtonText: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.text.primary,
  },
});
