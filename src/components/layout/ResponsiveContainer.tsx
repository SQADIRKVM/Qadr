import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useResponsive, LAYOUT } from '../../hooks/useResponsive';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

/** Centers content and caps width at 1200px on large screens. */
export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  style,
}) => {
  const { contentWidth, horizontalPadding } = useResponsive();

  return (
    <View
      style={[
        styles.wrap,
        {
          maxWidth: LAYOUT.containerMax,
          width: contentWidth,
          paddingHorizontal: horizontalPadding,
          alignSelf: 'center',
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { width: '100%' },
});
