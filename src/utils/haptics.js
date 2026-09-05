import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

export const triggerImpact = async (style = ImpactStyle.Light) => {
  try {
    await Haptics.impact({ style });
  } catch (e) {
    // Gracefully ignore on unsupported platforms/browsers
  }
};

export const triggerNotification = async (type = NotificationType.Success) => {
  try {
    await Haptics.notification({ type });
  } catch (e) {
    // Gracefully ignore on unsupported platforms/browsers
  }
};

export const triggerVibrate = async (duration = 300) => {
  try {
    await Haptics.vibrate({ duration });
  } catch (e) {
    // Gracefully ignore on unsupported platforms/browsers
  }
};
