import React, { Component, type ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText } from './primitives/AppText';
import { Button } from './primitives/Button';
import { spacing } from '../theme/spacing';
import { useColors } from '../theme/ThemeContext';
import { useThemedStyles } from '../theme/useThemedStyles';
import type { ColorPalette } from '../theme/palettes';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

const ErrorFallback: React.FC<{ error: Error; onRetry: () => void }> = ({
  error,
  onRetry,
}) => {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.wrap}>
      <AppText variant="headline-md" style={styles.title}>
        Something went wrong
      </AppText>
      <AppText variant="body-md" muted style={styles.msg}>
        {error.message}
      </AppText>
      <Button label="TRY AGAIN" onPress={onRetry} />
    </View>
  );
};

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  private handleRetry = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return (
        <ErrorFallback error={this.state.error} onRetry={this.handleRetry} />
      );
    }
    return this.props.children;
  }
}

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    wrap: {
      flex: 1,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.xl,
      gap: spacing.md,
    },
    title: { color: colors.primary, textAlign: 'center' },
    msg: { textAlign: 'center', maxWidth: 320 },
  });
