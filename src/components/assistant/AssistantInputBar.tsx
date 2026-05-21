import React from 'react';
import {
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Platform,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { platformShadow } from '../../theme/shadows';
import { spacing } from '../../theme/spacing';
import { hapticLight } from '../../utils/haptics';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface AssistantInputBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  loading?: boolean;
  /** Sits flush in the screen footer — no extra top margin. */
  docked?: boolean;
}

export const AssistantInputBar: React.FC<AssistantInputBarProps> = ({
  value,
  onChangeText,
  onSend,
  loading,
  docked,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const canSend = value.trim().length > 0 && !loading;

  return (
    <View style={[styles.composer, docked && styles.composerDocked]}>
      <View style={styles.pill}>
        <TextInput
          style={styles.input}
          placeholder="Ask anything..."
          placeholderTextColor={colors.outline}
          value={value}
          onChangeText={onChangeText}
          editable={!loading}
          returnKeyType="send"
          onSubmitEditing={() => {
            if (canSend) onSend();
          }}
          multiline={false}
          underlineColorAndroid="transparent"
        />
        <Pressable
          onPress={() => {
            if (!canSend) return;
            hapticLight();
            onSend();
          }}
          disabled={!canSend}
          style={[styles.sendBtn, !canSend && styles.sendBtnDisabled]}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.background} />
          ) : (
            <MaterialIcons name="arrow-upward" size={20} color={colors.background} />
          )}
        </Pressable>
      </View>
    </View>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  composer: {
    marginTop: spacing.md,
    width: '100%',
  },
  composerDocked: {
    marginTop: 0,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: colors.cardBgDeep,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 9999,
    paddingLeft: 20,
    paddingRight: 6,
    paddingVertical: 6,
    minHeight: 52,
    ...platformShadow({
      color: colors.black,
      offset: { width: 0, height: 8 },
      opacity: 0.35,
      radius: 12,
      elevation: 8,
    }),
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.onSurface,
    paddingVertical: 10,
    paddingRight: 8,
    margin: 0,
    backgroundColor: 'transparent',
    borderWidth: 0,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      } as object,
      default: {},
    }),
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.inverseSurface,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  sendBtnDisabled: {
    opacity: 0.45,
  },
});
