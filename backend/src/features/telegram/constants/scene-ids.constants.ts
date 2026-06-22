export const TELEGRAM_SCENE_IDS = {
  welcome: 'welcome',
} as const;

export type TelegramSceneId =
  (typeof TELEGRAM_SCENE_IDS)[keyof typeof TELEGRAM_SCENE_IDS];
