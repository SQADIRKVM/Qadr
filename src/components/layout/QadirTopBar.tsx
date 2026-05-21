import React, { useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '../primitives/AppText';
import { UserAvatar } from '../primitives/UserAvatar';
import { UserAccountMenu } from '../account/UserAccountMenu';
import { useAuthStore } from '../../stores/useAuthStore';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { ResponsiveContainer } from './ResponsiveContainer';
import { useResponsive } from '../../hooks/useResponsive';
import { useRootTabNavigation } from '../../hooks/useRootTabNavigation';
import type { RootTabParamList } from '../../navigation/types';
import { spacing } from '../../theme/spacing';
import { hapticLight } from '../../utils/haptics';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

const TABS: { name: keyof RootTabParamList; label: string }[] = [
  { name: 'Home', label: 'Home' },
  { name: 'Ideas', label: 'Ideas' },
  { name: 'Habits', label: 'Habits' },
  { name: 'Projects', label: 'Projects' },
  { name: 'More', label: 'More' },
];

interface QadirTopBarProps {
  onSettingsPress?: () => void;
  onSensorsPress?: () => void;
  showBack?: boolean;
  onBack?: () => void;
}

export const QadirTopBar: React.FC<QadirTopBarProps> = ({
  onSettingsPress,
  onSensorsPress,
  showBack,
  onBack,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const { tabNavigation, activeTabName } = useRootTabNavigation();
  const { isMobile } = useResponsive();
  const activeRoute = activeTabName;
  const user = useAuthStore((s) => s.user);
  const userName = useSettingsStore((s) => s.userName);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <View style={styles.bar}>
      <ResponsiveContainer style={styles.inner}>
        <View style={styles.row}>
          <View style={styles.left}>
            {showBack && onBack ? (
              <Pressable onPress={onBack} style={styles.iconBtn}>
                <Ionicons name="arrow-back" size={22} color={colors.primary} />
              </Pressable>
            ) : (
              <UserAvatar
                photoUrl={user?.photoURL ?? null}
                displayName={user?.displayName ?? null}
                email={user?.email ?? null}
                fallbackName={userName}
                size={40}
                onPress={() => {
                  hapticLight();
                  setMenuOpen((open) => !open);
                }}
              />
            )}
            <AppText variant="headline-lg-mobile" style={styles.brand}>
              Qadr
            </AppText>
          </View>

          {!isMobile && tabNavigation && (
            <View style={styles.nav}>
              {TABS.map((tab) => {
                const focused = activeRoute === tab.name;
                return (
                  <Pressable
                    key={tab.name}
                    onPress={() => {
                      hapticLight();
                      if (activeRoute !== tab.name) {
                        tabNavigation.navigate(tab.name as never);
                      }
                    }}
                    style={styles.navItem}
                  >
                    <AppText
                      variant="label-sm"
                      style={focused ? styles.navActive : styles.navInactive}
                    >
                      {tab.label}
                    </AppText>
                    {focused && <View style={styles.navDot} />}
                  </Pressable>
                );
              })}
            </View>
          )}

          <Pressable
            onPress={() => {
              hapticLight();
              (onSensorsPress ?? onSettingsPress)?.();
            }}
            style={styles.iconBtn}
          >
            <Ionicons
              name={onSettingsPress && !onSensorsPress ? 'settings-outline' : 'pulse-outline'}
              size={22}
              color={colors.primary}
            />
          </Pressable>
        </View>
      </ResponsiveContainer>

      {!showBack ? (
        <UserAccountMenu
          visible={menuOpen}
          onClose={() => setMenuOpen(false)}
          align="left"
        />
      ) : null}
    </View>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  bar: {
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
    backgroundColor: colors.background,
    paddingVertical: 12,
  },
  inner: { width: '100%' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 12, flexShrink: 0 },
  brand: { color: colors.primary, letterSpacing: -0.5 },
  nav: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    flexWrap: 'wrap',
  },
  navItem: { alignItems: 'center', paddingVertical: 4, minWidth: 48 },
  navActive: { color: colors.primary },
  navInactive: { color: colors.onSurfaceVariant },
  navDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.tertiary,
    marginTop: 6,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});
