import colorScheme from '@/constants/colorScheme';
import { Dimensions, StyleSheet } from 'react-native';


const { width, height } = Dimensions.get('window');

export const modalStyle = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: width * 0.85,
    maxHeight: height * 0.7,
    borderRadius: 15,
    backgroundColor: colorScheme.subBackground,
    borderWidth: 2,
    borderColor: colorScheme.blackbars,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  closeButton: {
    padding: 5,
  },
  divider: {
    height: 1,
    backgroundColor: colorScheme.blackbars,
    marginHorizontal: 15,
  },
  scanningIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  scanningText: {
    color: colorScheme.tint,
    marginLeft: 10,
    fontSize: 14,
  },
  modalTitleText: {
    fontSize: 20,
    fontWeight: "bold",
    color: colorScheme.tint,
  },
  listContainer: {
    flexGrow: 1,
    paddingVertical: 10,
  },
  deviceItem: {
    backgroundColor: colorScheme.button,
    borderRadius: 8,
    marginHorizontal: 15,
    marginVertical: 5,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  deviceItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviceInfo: {
    flex: 1,
    marginLeft: 10,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  deviceId: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  rssiText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  emptyList: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyListText: {
    color: colorScheme.tint,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 15,
  },
  emptyListSubtext: {
    color: colorScheme.tint,
    fontSize: 14,
    opacity: 0.8,
    textAlign: 'center',
    marginTop: 10,
  },
  targetDeviceItem: {
    backgroundColor: 'rgba(76, 175, 80, 0.3)', // Green background for target device
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  targetDeviceName: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  foundIndicator: {
    flexDirection: 'row',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    padding: 10,
    marginHorizontal: 15,
  marginTop: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  foundText: {
    color: '#4CAF50',
    marginLeft: 10,
    fontSize: 14,
  },
});
