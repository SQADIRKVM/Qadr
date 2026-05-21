import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText } from '../primitives/AppText';
import { spacing } from '../../theme/spacing';
import { glassCardBase } from '../../theme/glass';
import { BentoCard } from '../layout/BentoCard';
import { UserAvatar } from '../primitives/UserAvatar';
import { userDisplayLabel } from '../../utils/userInitials';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface AccountProfileHeaderProps {
  photoUrl: string | null;
  displayName: string | null;
  email: string | null;
}

export const AccountProfileHeader: React.FC<AccountProfileHeaderProps> = ({
  photoUrl,
  displayName,
  email,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const label = userDisplayLabel(displayName, email, 'Account');

  return (
    <BentoCard style={[styles.card, glassCardBase(colors)]}>
      <View style={styles.row}>
        <UserAvatar
          photoUrl={photoUrl}
          displayName={displayName}
          email={email}
          size={56}
        />
        <View style={styles.text}>
          <AppText variant="body-md" style={styles.name}>
            {label}
          </AppText>
          {email ? (
            <AppText variant="label-sm" muted numberOfLines={1}>
              {email}
            </AppText>
          ) : null}
        </View>
      </View>
    </BentoCard>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  card: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  text: { flex: 1, minWidth: 0 },
  name: { color: colors.onSurface, marginBottom: 2 },
});
