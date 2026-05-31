import React from 'react';
import {
  View,
  Image,
  Pressable,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { userDisplayLabel, userInitials } from '../../utils/userInitials';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

export type UserAvatarSize = 32 | 40 | 56;

interface UserAvatarProps {
  photoUrl?: string | null;
  displayName?: string | null;
  email?: string | null;
  /** Used when signed out and no Firebase user fields. */
  fallbackName?: string | null;
  size?: UserAvatarSize;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  photoUrl,
  displayName,
  email,
  fallbackName,
  size = 32,
  onPress,
  style,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const label = userDisplayLabel(displayName, email, fallbackName?.trim() || '');
  const hasPhoto = Boolean(photoUrl?.trim());
  // eslint-disable-next-line no-console
  console.log('[UserAvatar] photoUrl:', photoUrl, 'hasPhoto:', hasPhoto, 'label:', label);
  const hasLabel = Boolean(label);
  const radius = size / 2;

  const content = hasPhoto ? (
    <Image
      source={{ uri: photoUrl! }}
      style={[styles.image, { width: size, height: size, borderRadius: radius }]}
      resizeMode="cover"
      {...({ referrerPolicy: 'no-referrer' } as any)}
    />
  ) : hasLabel ? (
    <View
      style={[
        styles.fallback,
        { width: size, height: size, borderRadius: radius },
      ]}
    >
      <AppText
        variant={size >= 56 ? 'body-md' : 'label-sm'}
        style={[styles.initials, size < 40 && styles.initialsSm]}
      >
        {userInitials(label)}
      </AppText>
    </View>
  ) : (
    <View
      style={[
        styles.fallback,
        { width: size, height: size, borderRadius: radius },
      ]}
    >
      <Ionicons
        name="person-outline"
        size={size >= 40 ? 20 : 18}
        color={colors.onSurfaceVariant}
      />
    </View>
  );

  const shell = (
    <View
      style={[
        styles.shell,
        { width: size, height: size, borderRadius: radius },
        style,
      ]}
    >
      {content}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="Account"
        style={({ pressed }) => pressed && styles.pressed}
      >
        {shell}
      </Pressable>
    );
  }

  return shell;
};

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    shell: {
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      backgroundColor: colors.surfaceContainerHighest,
      flexShrink: 0,
    },
    image: {
      width: '100%',
      height: '100%',
    },
    fallback: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surfaceContainerHigh,
    },
    initials: { color: colors.primary },
    initialsSm: { fontSize: 11, letterSpacing: 0.3 },
    pressed: { opacity: 0.88 },
  });
