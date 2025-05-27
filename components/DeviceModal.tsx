import colorScheme from '@/constants/colorScheme';
import { MaterialIcons } from '@expo/vector-icons';
import { ActivityIndicator, FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Device } from 'react-native-ble-plx';

type DeviceModalProps = {
  visible: boolean;
  closeModal: () => void;
  devices: Device[];
  connectToPeripheral: (device: Device) => void;
};

export function DeviceModal({ visible, closeModal, devices, connectToPeripheral }: DeviceModalProps) {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={closeModal}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Dispositivos Disponibles</Text>
            <TouchableOpacity onPress={closeModal}>
              <MaterialIcons name="close" size={24} color={colorScheme.tint} />
            </TouchableOpacity>
          </View>
          
          {devices.length > 0 ? (
            <FlatList
              data={devices}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.deviceItem}
                  onPress={() => {
                    connectToPeripheral(item);
                    closeModal();
                  }}
                >
                  <View style={styles.deviceInfo}>
                    <Text style={styles.deviceName}>{item.name || 'Dispositivo sin nombre'}</Text>
                    <Text style={styles.deviceId}>ID: {item.id}</Text>
                    <View style={styles.signalContainer}>
                      <MaterialIcons name="signal-cellular-alt" size={16} color={colorScheme.tint} />
                      <Text style={styles.rssiText}>RSSI: {item.rssi || 'N/A'}</Text>
                    </View>
                  </View>
                  <MaterialIcons name="bluetooth-connected" size={24} color={colorScheme.tint} />
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.listContainer}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <ActivityIndicator size="large" color={colorScheme.tint} />
              <Text style={styles.emptyText}>Escaneando dispositivos...</Text>
              <Text style={styles.helpText}>Asegúrate de que tu sensor esté encendido y dentro del alcance</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '70%',
    backgroundColor: colorScheme.subBackground,
    borderRadius: 20,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colorScheme.accent,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colorScheme.tint,
  },
  listContainer: {
    paddingBottom: 20,
  },
  deviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: colorScheme.blackbars,
    marginVertical: 5,
    borderRadius: 10,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colorScheme.tint,
    marginBottom: 4,
  },
  deviceId: {
    fontSize: 12,
    color: colorScheme.tint,
    opacity: 0.7,
    marginBottom: 2,
  },
  signalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rssiText: {
    fontSize: 12,
    color: colorScheme.tint,
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    color: colorScheme.tint,
    marginTop: 15,
    marginBottom: 5,
  },
  helpText: {
    fontSize: 14,
    color: colorScheme.tint,
    opacity: 0.7,
    textAlign: 'center',
    marginTop: 5,
  },
});
