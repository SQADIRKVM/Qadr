import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { ScreenShell } from '../../components/layout';
import {
  UtilitiesSectionCard,
  UtilitiesListRow,
  UtilitiesSystemTile,
  SystemTerminalFooter,
} from '../../components/more';
import type { MoreStackParamList, RootTabParamList } from '../../navigation/types';
import { useResponsive } from '../../hooks/useResponsive';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

type MoreNav = CompositeNavigationProp<
  StackNavigationProp<MoreStackParamList, 'MoreMenu'>,
  BottomTabNavigationProp<RootTabParamList>
>;

export const MoreMenuScreen = () => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation<MoreNav>();
  const tabNav = navigation.getParent();
  const { isMobile, gutter } = useResponsive();

  const goSettings = () => navigation.navigate('Settings');
  const goBrainDump = () => tabNav?.navigate('Home', { screen: 'BrainDump' });
  const goIdeas = () => tabNav?.navigate('Ideas');
  const goProjects = () => tabNav?.navigate('Projects');
  const goBioSyncHealth = () => navigation.navigate('BioSyncHealth');

  return (
    <ScreenShell header="workspace">
      <View style={styles.titleRow}>
        <Text style={styles.title}>
          <Text style={styles.titleSlash}>/</Text>
          <Text style={styles.titleMain}>/ UTILITIES</Text>
        </Text>
      </View>

      <View style={[styles.topRow, !isMobile && styles.topRowWide, { gap: gutter }]}>
        <UtilitiesSectionCard
          title="Intelligence"
          headerIcon="hardware-chip-outline"
          style={!isMobile ? styles.halfCard : undefined}
        >
          <UtilitiesListRow
            label="Brain Dump AI"
            icon="sparkles-outline"
            onPress={goBrainDump}
          />
          <UtilitiesListRow
            label="Weekly AI Review"
            icon="bar-chart-outline"
            onPress={() => navigation.navigate('WeeklyReview')}
          />
          <UtilitiesListRow
            label="Personal Assistant"
            icon="chatbubble-ellipses-outline"
            onPress={() => navigation.navigate('Assistant')}
          />
        </UtilitiesSectionCard>

        <UtilitiesSectionCard
          title="Productivity"
          headerIcon="briefcase-outline"
          style={!isMobile ? styles.halfCard : undefined}
        >
          <UtilitiesListRow
            label="Focus Mode"
            icon="scan-outline"
            onPress={() => navigation.navigate('BlockMode')}
          />
          <UtilitiesListRow
            label="Idea Vault"
            icon="bulb-outline"
            onPress={goIdeas}
          />
          <UtilitiesListRow
            label="Project Manager"
            icon="git-network-outline"
            onPress={goProjects}
          />
        </UtilitiesSectionCard>
      </View>

      <View style={{ marginTop: gutter }}>
        <UtilitiesSectionCard title="System" headerIcon="server-outline">
          <View style={[styles.systemGrid, !isMobile && styles.systemGridWide]}>
            <UtilitiesSystemTile
              title="Bio-Sync Health"
              subtitle="System Vitals"
              icon="pulse-outline"
              onPress={goBioSyncHealth}
              style={!isMobile ? styles.systemTileHalf : undefined}
            />
            <UtilitiesSystemTile
              title="Settings & Profile"
              subtitle="Configuration"
              icon="settings-outline"
              onPress={goSettings}
              style={!isMobile ? styles.systemTileHalf : undefined}
            />
          </View>
        </UtilitiesSectionCard>
      </View>

      <View style={{ marginTop: gutter }}>
        <UtilitiesSectionCard title="Finance" headerIcon="wallet-outline">
          <UtilitiesListRow
            label="Money"
            icon="cash-outline"
            onPress={() => navigation.navigate('Money')}
          />
          <UtilitiesListRow
            label="Decisions"
            icon="git-branch-outline"
            onPress={() => navigation.navigate('Decisions')}
          />
        </UtilitiesSectionCard>
      </View>

      <SystemTerminalFooter moduleCount={9} />
    </ScreenShell>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  titleRow: { marginBottom: spacing.md, marginTop: spacing.xs },
  title: { fontFamily: 'SpaceGrotesk_500Medium' },
  titleSlash: {
    fontSize: 32,
    lineHeight: 38,
    color: colors.secondary,
    letterSpacing: 2,
  },
  titleMain: {
    fontSize: 32,
    lineHeight: 38,
    color: colors.primary,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  topRow: { width: '100%' },
  topRowWide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  halfCard: {
    flex: 1,
    minWidth: 0,
  },
  systemGrid: { gap: spacing.md },
  systemGridWide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  systemTileHalf: {
    flex: 1,
    minWidth: 200,
  },
});
