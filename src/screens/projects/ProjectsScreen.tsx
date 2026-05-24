import React, { useState, useMemo, useRef } from 'react';
import { View, StyleSheet, TextInput, Modal } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { ScreenShell, BentoCard } from '../../components/layout';
import {
  ActiveProjectCard,
  MilestoneCard,
  ProjectTodoCard,
  ProjectQueueCard,
} from '../../components/projects';
import { AppText } from '../../components/primitives/AppText';
import { Button } from '../../components/primitives/Button';
import { PostMortemModal } from './PostMortemModal';
import { useProjectStore } from '../../stores/useProjectStore';
import { generatePostMortemPattern } from '../../services/ai/weeklyReview';
import { hasAIConfigured } from '../../services/ai/client';
import { AIConfigBanner } from '../../components/primitives/AIConfigBanner';
import { getDaysLeft, getProjectProgress } from '../../utils/selectors';
import {
  getTaskDisplayTag,
  getQueueCapacityLabel,
} from '../../utils/projectManager';
import { useResponsive } from '../../hooks/useResponsive';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

export const ProjectsScreen = () => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const {
    projects,
    activeProjectId,
    queue,
    postMortems,
    setActiveProject,
    addProject,
    addTask,
    toggleTask,
    pauseProject,
    completeOrKill,
  } = useProjectStore();

  const { isMobile, isDesktop, gutter, titleVariant } = useResponsive();
  const projectSheetRef = useRef<BottomSheet>(null);
  const taskSheetRef = useRef<BottomSheet>(null);

  const [newName, setNewName] = useState('');
  const [newTagline, setNewTagline] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [mortem, setMortem] = useState<{ id: string; status: 'completed' | 'killed' } | null>(
    null,
  );
  const [pattern, setPattern] = useState<string | null>(null);

  const active = projects.find((p) => p.id === activeProjectId);
  const progress = getProjectProgress(active);
  const daysLeft = active ? getDaysLeft(active) : null;

  const queued = useMemo(
    () =>
      queue
        .map((id) => projects.find((p) => p.id === id))
        .filter((p): p is NonNullable<typeof p> => !!p && p.status === 'queued'),
    [queue, projects],
  );

  const todoItems = useMemo(() => {
    if (!active) return [];
    return active.tasks.map((task) => ({
      task,
      tag: getTaskDisplayTag(task, active.tasks),
    }));
  }, [active]);

  const capacityLabel = getQueueCapacityLabel(queued.length, !!active);
  const showStartCard = !active && queued.length > 0;
  const splitSecondRow = !isMobile && (active != null || showStartCard);

  React.useEffect(() => {
    if (postMortems.length >= 3 && !pattern) {
      generatePostMortemPattern(
        JSON.stringify(postMortems.slice(0, 5).map((m) => m.killedMomentum)),
      ).then(({ pattern: next }) => setPattern(next));
    }
  }, [postMortems.length, pattern]);

  const openProjectSheet = () => projectSheetRef.current?.expand();
  const openTaskSheet = () => taskSheetRef.current?.expand();

  const saveProject = () => {
    if (!newName.trim()) return;
    addProject({
      name: newName.trim(),
      tagline: newTagline.trim(),
      targetDays: 30,
    });
    setNewName('');
    setNewTagline('');
    projectSheetRef.current?.close();
  };

  const saveTask = () => {
    if (!newTaskTitle.trim() || !active) return;
    addTask(active.id, newTaskTitle.trim());
    setNewTaskTitle('');
    taskSheetRef.current?.close();
  };

  return (
    <View style={styles.screen}>
      <ScreenShell
        header="workspace"
        scroll
        scrollProps={{
          contentContainerStyle: { paddingTop: spacing.xs },
        }}
      >
        <View style={styles.hero}>
          <AppText variant={titleVariant} style={styles.heroTitle}>
            Projects
          </AppText>
          <AppText variant="body-lg" muted style={styles.heroSubtitle}>
            Plan, track milestones, and execute your high-leverage initiatives.
          </AppText>
        </View>

        {!hasAIConfigured() ? <AIConfigBanner /> : null}

        <View style={[styles.bento, { gap: gutter }]}>
          <View
            style={[styles.row, !isMobile && styles.rowSplit, { gap: gutter }]}
          >
            <View style={!isMobile ? styles.colWide : styles.colFull}>
              <ActiveProjectCard
                name={active?.name}
                tagline={active?.tagline}
                progress={progress}
                style={styles.cardFill}
              />
            </View>
            <View
              style={
                !isMobile
                  ? [styles.colMilestone, isDesktop && styles.colMilestoneCap]
                  : styles.colFull
              }
            >
              <MilestoneCard
                daysLeft={daysLeft}
                disabled={!active}
                onPause={() => active && pauseProject(active.id)}
                onCancel={() => active && setMortem({ id: active.id, status: 'killed' })}
                onComplete={() => active && setMortem({ id: active.id, status: 'completed' })}
                style={styles.cardFill}
                compactActions={isMobile}
              />
            </View>
          </View>

          <View
            style={[
              styles.row,
              splitSecondRow && styles.rowSplit,
              { gap: gutter },
            ]}
          >
            {active ? (
              <View style={splitSecondRow ? styles.colHalf : styles.colFull}>
                <ProjectTodoCard
                  items={todoItems}
                  onToggle={(taskId) => toggleTask(active.id, taskId)}
                  onAdd={openTaskSheet}
                  style={styles.cardFill}
                />
              </View>
            ) : showStartCard ? (
              <View style={splitSecondRow ? styles.colHalf : styles.colFull}>
                <BentoCard deep style={[styles.startCard, styles.cardFill]}>
                  <AppText variant="body-md" muted style={styles.startText}>
                    Start &quot;{queued[0].name}&quot; to manage tasks.
                  </AppText>
                  <Button
                    label="START PROJECT"
                    onPress={() => setActiveProject(queued[0].id)}
                    style={{ marginTop: spacing.md }}
                  />
                </BentoCard>
              </View>
            ) : null}

            <View style={splitSecondRow ? styles.colHalf : styles.colFull}>
              <ProjectQueueCard
                items={queued.map((p) => ({ id: p.id, name: p.name }))}
                capacityLabel={capacityLabel}
                onSelect={setActiveProject}
                onAddProject={openProjectSheet}
                style={styles.cardFill}
              />
            </View>
          </View>
        </View>

        {pattern && postMortems.length >= 3 ? (
          <BentoCard style={{ marginTop: spacing.sm }}>
            <AppText variant="label-sm">PATTERN</AppText>
            <AppText variant="body-md" style={{ marginTop: 8 }}>
              {pattern}
            </AppText>
          </BentoCard>
        ) : null}
      </ScreenShell>

      <BottomSheet
        ref={projectSheetRef}
        index={-1}
        snapPoints={['45%']}
        enablePanDownToClose
        containerStyle={styles.sheetContainer}
        backgroundStyle={styles.sheetBg}
        handleIndicatorStyle={{ backgroundColor: colors.outline }}
      >
        <BottomSheetView style={styles.sheet}>
          <AppText variant="label-sm">NEW PROJECT</AppText>
          <TextInput
            style={styles.input}
            placeholder="Project name"
            placeholderTextColor={colors.outlineVariant}
            value={newName}
            onChangeText={setNewName}
          />
          <TextInput
            style={styles.input}
            placeholder="Tagline"
            placeholderTextColor={colors.outlineVariant}
            value={newTagline}
            onChangeText={setNewTagline}
          />
          <Button label="ADD TO QUEUE" onPress={saveProject} />
        </BottomSheetView>
      </BottomSheet>

      <BottomSheet
        ref={taskSheetRef}
        index={-1}
        snapPoints={['35%']}
        enablePanDownToClose
        containerStyle={styles.sheetContainer}
        backgroundStyle={styles.sheetBg}
        handleIndicatorStyle={{ backgroundColor: colors.outline }}
      >
        <BottomSheetView style={styles.sheet}>
          <AppText variant="label-sm">ADD TASK</AppText>
          <TextInput
            style={styles.input}
            placeholder="Task title"
            placeholderTextColor={colors.outlineVariant}
            value={newTaskTitle}
            onChangeText={setNewTaskTitle}
          />
          <Button label="SAVE" onPress={saveTask} />
        </BottomSheetView>
      </BottomSheet>

      <Modal visible={!!mortem} animationType="slide">
        {mortem && active && (
          <PostMortemModal
            projectName={active.name}
            onSubmit={(data) => {
              completeOrKill(mortem.id, mortem.status, {
                projectId: mortem.id,
                projectName: active.name,
                ...data,
              });
              setMortem(null);
            }}
            onCancel={() => setMortem(null)}
          />
        )}
      </Modal>
    </View>
  );
};

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    screen: { flex: 1, minHeight: 0 },
    hero: {
      marginTop: spacing.sm,
      marginBottom: spacing.md,
    },
    heroTitle: {
      color: colors.primary,
      letterSpacing: -0.5,
      marginBottom: 8,
    },
    heroSubtitle: {
      color: colors.onSurfaceVariant,
      maxWidth: 640,
    },
    bento: {
      width: '100%',
      paddingBottom: spacing.md,
    },
    row: {
      width: '100%',
    },
    rowSplit: {
      flexDirection: 'row',
      alignItems: 'stretch',
    },
    colFull: { width: '100%' },
    colWide: { flex: 2, minWidth: 0 },
    colMilestone: { flex: 1, minWidth: 260 },
    colMilestoneCap: { maxWidth: 420 },
    colHalf: { flex: 1, minWidth: 0 },
    cardFill: { flex: 1, width: '100%' },
    startCard: {
      padding: spacing.lg,
      minHeight: 160,
      justifyContent: 'center',
    },
    startText: {
      textAlign: 'center',
      lineHeight: 22,
    },
    sheetContainer: {
      pointerEvents: 'box-none',
    },
    sheetBg: {
      backgroundColor: colors.surfaceContainer,
      borderWidth: 1,
      borderColor: colors.modalBorder,
    },
    sheet: { padding: spacing.screenMargin, gap: 12 },
    input: {
      fontSize: 16,
      color: colors.onSurface,
      borderBottomWidth: 1,
      borderBottomColor: colors.outlineVariant,
      paddingVertical: 8,
    },
  });
