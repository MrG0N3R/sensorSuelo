# Configurando Bluetooth en tu Aplicación Expo

Para usar Bluetooth (BLE) con Expo, necesitas crear una **Development Build** o una **EAS Build**. No funcionará en Expo Go.

## Opción 1: Crear una Development Build

1. Instala las dependencias necesarias:
   ```bash
   npx expo install expo-dev-client
   npm install react-native-ble-plx
   ```

2. Añade los plugins necesarios a tu app.json:
   ```json
   {
     "expo": {
       "plugins": [
         [
           "react-native-ble-plx",
           {
             "isBackgroundEnabled": true,
             "modes": ["peripheral", "central"],
             "bluetoothAlwaysPermission": "Allow $(PRODUCT_NAME) to connect to bluetooth devices"
           }
         ]
       ]
     }
   }
   ```

3. Crea una build de desarrollo:
   ```bash
   npx expo prebuild --clean
   npx expo run:android   # Para Android
   npx expo run:ios       # Para iOS (requiere Mac)
   ```

## Opción 2: Usar EAS Build

1. Configura EAS:
   ```bash
   npm install -g eas-cli
   eas login
   eas build:configure
   ```

2. Añade los plugins al app.json como en la opción 1.

3. Crea un archivo eas.json:
   ```json
   {
     "build": {
       "development": {
         "developmentClient": true,
         "distribution": "internal"
       }
     }
   }
   ```

4. Construye la app:
   ```bash
   eas build --profile development --platform android
   ```

5. Una vez construida, instala la app en tu dispositivo.

## Solución de problemas

- Si los módulos nativos no se detectan después de la build, asegúrate de que react-native-ble-plx esté correctamente instalado.
- Verifica que tu dispositivo tenga Bluetooth y acceso a ubicación activados.
- En Android, asegura tener los permisos de ubicación y Bluetooth habilitados.
