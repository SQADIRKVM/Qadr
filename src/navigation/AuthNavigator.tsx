import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { OnboardingScreen } from '../screens/onboarding/OnboardingScreen';
import { SignInScreen } from '../screens/auth/SignInScreen';

type AuthStep = 'onboarding' | 'signIn';

export const AuthNavigator: React.FC = () => {
  const [step, setStep] = useState<AuthStep>('onboarding');

  return (
    <View style={styles.root}>
      {step === 'signIn' ? (
        <SignInScreen />
      ) : (
        <OnboardingScreen
          onComplete={() => setStep('signIn')}
          onSkip={() => setStep('signIn')}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
  },
});
