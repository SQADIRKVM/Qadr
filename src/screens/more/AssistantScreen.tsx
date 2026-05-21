import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { ScreenShell, SubScreenHeader } from '../../components/layout';
import {
  UserMessageBubble,
  AssistantMessage,
  AssistantInputBar,
  AssistantEmptyState,
  AssistantDisclaimer,
} from '../../components/assistant';
import { AppText } from '../../components/primitives/AppText';
import { AIConfigBanner } from '../../components/primitives/AIConfigBanner';
import { askAssistant } from '../../services/ai/assistant';
import { hasAIConfigured } from '../../services/ai/client';
import { buildAssistantContext } from '../../utils/assistantContext';
import { useBlockStore } from '../../stores/useBlockStore';
import type { AssistantReply } from '../../services/ai/types';
import type { MoreStackParamList } from '../../navigation/types';
import { useResponsive } from '../../hooks/useResponsive';
import { spacing } from '../../theme/spacing';
import { generateId } from '../../utils/id';
import { userAlert } from '../../utils/userAlert';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

type ChatMessage =
  | { id: string; role: 'user'; text: string }
  | { id: string; role: 'assistant'; reply: AssistantReply; offlineFallback?: boolean };

/** Matches AssistantInputBar pill minHeight + vertical padding. */
const COMPOSER_HEIGHT = 52;

export const AssistantScreen = () => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation<StackNavigationProp<MoreStackParamList>>();
  const { horizontalPadding } = useResponsive();
  const scrollRef = useRef<ScrollView>(null);
  const aiFailureAlerted = useRef(false);
  const { setMode, startFocus } = useBlockStore();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const shouldScrollToEnd = useRef(false);

  const scrollToEnd = useCallback(() => {
    if (!shouldScrollToEnd.current) return;
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 120);
  }, []);

  const startDeepWork = useCallback(() => {
    setMode('work');
    startFocus();
    navigation.navigate('FocusOverlay');
  }, [navigation, setMode, startFocus]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = { id: generateId(), role: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    shouldScrollToEnd.current = true;
    scrollToEnd();

    try {
      const context = buildAssistantContext();
      const { reply, fromStub, error } = await askAssistant(text, JSON.stringify(context));
      const offlineFallback = hasAIConfigured() && fromStub && !!error;
      if (offlineFallback && !aiFailureAlerted.current) {
        aiFailureAlerted.current = true;
        userAlert('Assistant', 'AI request failed — showing offline reply.');
      }
      setMessages((prev) => [
        ...prev,
        { id: generateId(), role: 'assistant', reply, offlineFallback },
      ]);
    } finally {
      setLoading(false);
      shouldScrollToEnd.current = true;
      scrollToEnd();
    }
  }, [input, loading, scrollToEnd]);

  const renderMessage = useMemo(
    () => (msg: ChatMessage) => {
      if (msg.role === 'user') {
        return <UserMessageBubble key={msg.id} text={msg.text} />;
      }
      return (
        <AssistantMessage
          key={msg.id}
          reply={msg.reply}
          offlineFallback={msg.offlineFallback}
          onSuggestionPress={startDeepWork}
        />
      );
    },
    [startDeepWork],
  );

  const hasMessages = messages.length > 0;

  return (
    <ScreenShell header="none" scroll={false} fullWidth skipBottomInset edges={['top']}>
      <View style={styles.screen}>
        <SubScreenHeader
          title="Assistant"
          onBack={() => navigation.goBack()}
          onSensorsPress={() => navigation.navigate('BioSyncHealth')}
        />

        <View style={{ paddingHorizontal: horizontalPadding }}>
          <AIConfigBanner />
        </View>

        <KeyboardAvoidingView
          style={styles.chatColumn}
          behavior={
            Platform.OS === 'ios'
              ? 'padding'
              : Platform.OS === 'android'
                ? 'height'
                : undefined
          }
          keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
        >
          {hasMessages ? (
            <ScrollView
              ref={scrollRef}
              style={styles.threadScroll}
              contentContainerStyle={[
                styles.thread,
                {
                  paddingHorizontal: horizontalPadding,
                  paddingBottom: COMPOSER_HEIGHT + spacing.lg,
                },
              ]}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
              onScrollBeginDrag={() => {
                shouldScrollToEnd.current = false;
              }}
              onContentSizeChange={() => {
                if (shouldScrollToEnd.current) scrollToEnd();
              }}
            >
              {messages.map(renderMessage)}
              {loading ? (
                <View style={styles.typing}>
                  <AppText variant="label-sm" style={styles.typingText}>
                    Qadr is thinking...
                  </AppText>
                </View>
              ) : null}
            </ScrollView>
          ) : (
            <View
              style={[
                styles.emptyZone,
                { paddingHorizontal: horizontalPadding },
              ]}
            >
              <AssistantEmptyState />
            </View>
          )}

          <View
            style={[
              styles.composerFooter,
              { paddingHorizontal: horizontalPadding },
            ]}
          >
            <AssistantInputBar
              docked
              value={input}
              onChangeText={setInput}
              onSend={handleSend}
              loading={loading}
            />
            {!hasMessages ? <AssistantDisclaimer /> : null}
          </View>
        </KeyboardAvoidingView>
      </View>
    </ScreenShell>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  screen: {
    flex: 1,
    minHeight: 0,
    ...(Platform.OS === 'web' ? { height: '100%' as const, minHeight: 0 } : {}),
  },
  chatColumn: {
    flex: 1,
    minHeight: 0,
    flexDirection: 'column',
  },
  threadScroll: {
    flex: 1,
    minHeight: 0,
    ...(Platform.OS === 'web' ? { overflow: 'scroll' as const } : {}),
  },
  thread: {
    paddingTop: spacing.lg,
    flexGrow: 1,
  },
  emptyZone: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 0,
  },
  composerFooter: {
    flexShrink: 0,
    marginTop: 'auto',
    paddingTop: 0,
    paddingBottom: 6,
    backgroundColor: 'transparent',
  },
  typing: {
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  typingText: {
    color: colors.onSurfaceVariant,
    letterSpacing: 1,
    fontSize: 10,
  },
});
