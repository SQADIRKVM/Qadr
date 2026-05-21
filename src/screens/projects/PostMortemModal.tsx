import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BentoCard } from '../../components/layout';
import { AppText } from '../../components/primitives/AppText';
import { UnderlineInput } from '../../components/primitives/UnderlineInput';
import { Button } from '../../components/primitives/Button';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface PostMortemModalProps {
  projectName: string;
  onSubmit: (data: { worked: string; killedMomentum: string; differently: string }) => void;
  onCancel: () => void;
}

export const PostMortemModal: React.FC<PostMortemModalProps> = ({
  projectName,
  onSubmit,
  onCancel,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const [worked, setWorked] = useState('');
  const [killedMomentum, setKilledMomentum] = useState('');
  const [differently, setDifferently] = useState('');
  const valid = worked.trim() && killedMomentum.trim() && differently.trim();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <AppText variant="label-sm">POST-MORTEM</AppText>
        <AppText variant="body-md" muted style={{ marginBottom: 24 }}>
          {projectName}
        </AppText>
        <BentoCard deep style={styles.card}>
          <UnderlineInput label="WHAT WORKED?" value={worked} onChangeText={setWorked} />
          <UnderlineInput label="WHAT KILLED MOMENTUM?" value={killedMomentum} onChangeText={setKilledMomentum} />
          <UnderlineInput label="WHAT WOULD YOU DO DIFFERENTLY?" value={differently} onChangeText={setDifferently} />
        </BentoCard>
        <Button
          label="ARCHIVE"
          onPress={() => onSubmit({ worked, killedMomentum, differently })}
          disabled={!valid}
          style={{ marginTop: 16 }}
        />
        <Button label="CANCEL" variant="secondary" onPress={onCancel} style={{ marginTop: 8 }} />
      </View>
    </SafeAreaView>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.black },
  inner: { flex: 1, padding: spacing.screenMargin, paddingTop: 48 },
  card: { gap: 16, padding: spacing.md },
});
