import type { NavigatorScreenParams } from '@react-navigation/native';

export type SettingsFlowParamList = {
  Settings: undefined;
  Account: undefined;
};

export type MoreStackParamList = {
  MoreMenu: undefined;
  Money: undefined;
  MoneyContact: { contactId: string };
  BlockMode: undefined;
  FocusOverlay: undefined;
  Decisions: undefined;
  WeeklyReview: undefined;
  Assistant: undefined;
  Settings: undefined;
  Account: undefined;
  MfaEnroll: undefined;
  BioSyncHealth: undefined;
};

export type HomeStackParamList = {
  Dashboard: undefined;
  Settings: undefined;
  Account: undefined;
  MfaEnroll: undefined;
  OneThingModal: undefined;
  BrainDump: undefined;
  BrainDumpModal: undefined;
};

export type IdeasStackParamList = {
  IdeaVault: undefined;
  SundayReview: undefined;
  MindFocus: { id: string };
  MindSerendipity: undefined;
};

export type RootTabParamList = {
  Home: NavigatorScreenParams<HomeStackParamList>;
  Ideas: NavigatorScreenParams<IdeasStackParamList>;
  Habits: undefined;
  Projects: undefined;
  More: NavigatorScreenParams<MoreStackParamList>;
};
