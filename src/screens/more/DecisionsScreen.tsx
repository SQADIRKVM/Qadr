import React, { useState, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { ScreenShell, SubScreenHeader } from '../../components/layout';
import {
  DecisionScreenHero,
  DecisionTable,
  DecisionStatsGrid,
  DecisionFab,
} from '../../components/decisions';
import { AppText } from '../../components/primitives/AppText';
import { Button } from '../../components/primitives/Button';
import { UnderlineInput } from '../../components/primitives/UnderlineInput';
import { EnergyDots } from '../../components/EnergyDots';
import { useDecisionStore } from '../../stores/useDecisionStore';
import { useResponsive } from '../../hooks/useResponsive';
import type { MoreStackParamList } from '../../navigation/types';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

const FAB_HEIGHT = 56;
const FAB_GAP = 12;

export const DecisionsScreen = () => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation<StackNavigationProp<MoreStackParamList>>();
  const { decisions, addDecision, revisitDecision, markDecided } = useDecisionStore();
  const { tabBarHeight, gutter } = useResponsive();
  const fabClearance = tabBarHeight + FAB_HEIGHT + FAB_GAP + spacing.md;

  const sheetRef = useRef<BottomSheet>(null);
  const revisitRef = useRef<BottomSheet>(null);

  const [title, setTitle] = useState('');
  const [reasoning, setReasoning] = useState('');
  const [deadline, setDeadline] = useState('');
  const [confidence, setConfidence] = useState(5);
  const [revisitId, setRevisitId] = useState<string | null>(null);
  const [outcome, setOutcome] = useState('');
  const [wasRight, setWasRight] = useState<'yes' | 'no' | 'unsure'>('unsure');

  const openAdd = () => sheetRef.current?.expand();

  const openRevisit = (id: string) => {
    const d = decisions.find((x) => x.id === id);
    if (d?.status === 'pending') {
      markDecided(id);
      return;
    }
    setRevisitId(id);
    setOutcome('');
    setWasRight('unsure');
    revisitRef.current?.expand();
  };

  const handleRowLongPress = (id: string) => {
    const d = decisions.find((x) => x.id === id);
    if (d?.status === 'pending') {
      markDecided(id);
    }
  };

  const resetAddForm = () => {
    setTitle('');
    setReasoning('');
    setDeadline('');
    setConfidence(5);
  };

  const saveDecision = () => {
    if (!title.trim()) return;
    addDecision({
      title: title.trim(),
      reasoning: reasoning.trim(),
      deadline: deadline.trim(),
      confidence,
    });
    resetAddForm();
    sheetRef.current?.close();
  };

  const saveRevisit = () => {
    if (revisitId) revisitDecision(revisitId, outcome, wasRight);
    revisitRef.current?.close();
  };

  return (
    <View style={styles.screen}>
      <ScreenShell
        header="none"
        scroll
        scrollProps={{
          contentContainerStyle: {
            paddingTop: spacing.xs,
            paddingBottom: fabClearance,
          },
        }}
      >
        <View style={[styles.content, { gap: gutter }]}>
          <SubScreenHeader title="Decisions" onBack={() => navigation.goBack()} />
          <DecisionScreenHero />
          <DecisionTable
            decisions={decisions}
            onRowPress={openRevisit}
            onRowLongPress={handleRowLongPress}
          />
          <DecisionStatsGrid decisions={decisions} />
        </View>
      </ScreenShell>

      <DecisionFab onPress={openAdd} />

      <BottomSheet
        ref={sheetRef}
        index={-1}
        snapPoints={['55%']}
        enablePanDownToClose
        backgroundStyle={styles.sheetBg}
      >
        <BottomSheetView style={styles.sheet}>
          <AppText variant="label-sm" style={styles.sheetTitle}>
            NEW DECISION
          </AppText>
          <UnderlineInput label="DECISION" value={title} onChangeText={setTitle} />
          <UnderlineInput label="REASONING" value={reasoning} onChangeText={setReasoning} multiline />
          <UnderlineInput label="DEADLINE YYYY-MM-DD" value={deadline} onChangeText={setDeadline} />
          <AppText variant="label-sm" style={styles.sheetLabel}>
            CONFIDENCE
          </AppText>
          <EnergyDots count={confidence} max={10} onChange={setConfidence} />
          <Button label="SAVE" onPress={saveDecision} />
        </BottomSheetView>
      </BottomSheet>

      <BottomSheet
        ref={revisitRef}
        index={-1}
        snapPoints={['50%']}
        enablePanDownToClose
        backgroundStyle={styles.sheetBg}
      >
        <BottomSheetView style={styles.sheet}>
          <AppText variant="label-sm" style={styles.sheetTitle}>
            REVISIT DECISION
          </AppText>
          <AppText variant="label-sm" style={styles.sheetLabel}>
            WHAT ACTUALLY HAPPENED?
          </AppText>
          <UnderlineInput value={outcome} onChangeText={setOutcome} />
          <View style={styles.pills}>
            {(['yes', 'no', 'unsure'] as const).map((v) => (
              <Button
                key={v}
                label={v.toUpperCase()}
                variant={wasRight === v ? 'primary' : 'secondary'}
                onPress={() => setWasRight(v)}
              />
            ))}
          </View>
          <Button label="SAVE REVISIT" onPress={saveRevisit} />
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    width: '100%',
  },
  sheetBg: {
    backgroundColor: colors.surfaceContainer,
  },
  sheet: {
    padding: spacing.screenMargin,
    gap: 12,
  },
  sheetTitle: {
    color: colors.onSurfaceVariant,
    letterSpacing: 2,
    marginBottom: spacing.xs,
  },
  sheetLabel: {
    color: colors.onSurfaceVariant,
    letterSpacing: 1,
  },
  pills: {
    flexDirection: 'row',
    gap: 8,
  },
});
