import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import useBLE from '@/bluetooth/ble';
import { Item } from '@/components/Item';
import { ThemedText } from '@/components/ThemedText';
import colorScheme from '@/constants/colorScheme';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import DeviceModal from '../../components/conn_modal';

export default function HomeScreen() {

  const {
    requestPermissions,
    scanForPeripherals,
    allDevices,
    connectToDevice,
    connectedDevice,
    humi,
    temp,
    cond,
    ph,
    nitro,
    phos,
    pota,
    disconnectFromDevice,
  } = useBLE();

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const hideModal = () => {
    setIsModalVisible(false);
  };

  const scan = async ()=>{
    const isPermissionsEnabled = await requestPermissions();
    if (isPermissionsEnabled) {
      scanForPeripherals();
      setIsModalVisible(true);
    }
  }

  return (
    <SafeAreaProvider>
    <SafeAreaView style={styles.main}>

      <View style={styles.top}>
        <Image source={require('../../assets/images/react-logo.png')} resizeMode='stretch' style={{width:'15%',height:'85%', alignSelf:'center'}}/>
        <ThemedText type='title' style={{alignSelf:'center'}} darkColor={colorScheme.tint} lightColor={colorScheme.tint}> Aplicacion de sensado </ThemedText>
      </View>
      
      <View style={{height:'13%'}}></View>
      <View
        style={{height:'96%', width:'100%'}}
      >
        <View style={styles.container}>
          <TextInput 
          style={styles.input}
          placeholder='Nombre del Paquete'
          placeholderTextColor={colorScheme.placeholderTextColor}
          />
          <TouchableOpacity style={{marginLeft:5, width:'25%', height:'100%', backgroundColor:colorScheme.subBackground, borderRadius:20, flexDirection:'row',alignItems:'center', justifyContent:'center'}}>
            <MaterialIcons size={30} name='add' color={colorScheme.tint} />
            <Text style={{fontSize:18,fontStyle:'italic',color:colorScheme.tint}}>Nuevo</Text>
          </TouchableOpacity>
        </View>


        <View style={{height:'3%'}}/>
        
        <ScrollView>
        <Item title='Actual' ph={ph} cond={cond} date={Date.now().toString()} humi={humi} nitro={nitro} phos={phos} pota={pota} temp={temp} />
        <View style={{height:120}}/>
        </ScrollView>

      </View>

      <DeviceModal
        closeModal={hideModal}
        visible={isModalVisible}
        connectToPeripheral={connectToDevice}
        devices={allDevices}
      />

      <TouchableOpacity 
        onPress={()=>{ 
          scan();
          
          
        }}
      style={{width:'25%', height:'10%', backgroundColor:colorScheme.button, borderRadius:20, borderColor:colorScheme.blackbars, borderWidth:2, flexDirection:'row',alignItems:'center', justifyContent:'center', position:'absolute', bottom:25, right:10}}>
            <FontAwesome size={30} name='bluetooth' color={colorScheme.tint}/>
            <ThemedText type='defaultSemiBold' lightColor={colorScheme.tint} darkColor={colorScheme.tint}>Conectar</ThemedText>
      </TouchableOpacity>


    </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  top:{
    position:'absolute',
    left:0,
    backgroundColor:'#000',
    width:'100%', 
    height:'10%',
    alignContent:'center',
    justifyContent:'flex-start',
    flexDirection:'row'},
  main:{
    width:'100%',
    height:'100%',
    backgroundColor:colorScheme.background
  },
  container:{
    height:'10%',
    width:'100%',
    flexDirection:'row',
    outline:'none',
    
    alignItems:'center',
  }
  ,
  input:{
    borderWidth:2,
    borderRadius:15,
    borderColor:colorScheme.accent,
    backgroundColor:colorScheme.subBackground,
    justifyContent:'center',
    marginHorizontal:5,
    width:'70%', 
    height:'100%',
    outline:'none', 
    fontSize:20, 
    color:colorScheme.tint
  }
  ,
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});