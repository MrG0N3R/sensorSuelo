import { Platform } from 'react-native';
import useBLE from './ble';
import useBleMock from './mock-ble';

// Detect if we're running in Expo Go
const isExpoGo = () => {
  return !!(global as any).expo?.AppOwnership === 'expo';
};

// Use mock if we're on web or in Expo Go
const shouldUseMock = Platform.OS === 'web' || isExpoGo();

// Export the appropriate hook based on platform
export default shouldUseMock ? useBleMock : useBLE;

// Also export helper functions for environment detection
export const isBleSupported = !shouldUseMock;
export const isRunningInExpoGo = isExpoGo();
