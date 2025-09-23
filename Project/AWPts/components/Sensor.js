import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert, FlatList, StyleSheet, SafeAreaView } from 'react-native';
import axios from 'axios';
import { sendMqttCommand, connectMqtt } from '../mqtt';

export default function Dashboard() {
  const API_BASE = 'http://10.106.45.81:5556';
  const [dataList, setDataList] = useState([]);

  const sendAndLog = async (mqttCode, apiEndpoint, apiBody) => {
    try {
      if (mqttCode) sendMqttCommand(mqttCode);  // chỉ gửi nếu có mã
      const fullUrl = new URL(apiEndpoint, API_BASE).href;
      const res = await axios.post(fullUrl, apiBody);
      console.log('Gửi thành công:', mqttCode, apiBody, res.data);
    } catch (err) {
      console.error('Lỗi khi gửi:', err.message);
      Alert.alert('Lỗi', 'Không gửi được điều khiển đến server');
    }
  };

  useEffect(() => {
    connectMqtt((message) => {
      if (message.destinationName === 'farm/sensor/data') {
        try {
          const json = JSON.parse(message.payloadString);
          setDataList((prev) => {
            const newData = [{ ...json, time: new Date().toLocaleTimeString() }, ...prev];
            return newData.slice(0, 15);
          });
        } catch (e) {
          console.log('Parse error:', e.message);
        }
      }
    });
  }, []);

  const renderSensorItem = ({ item, index }) => (
    <View style={styles.row}>
      <View style={styles.rowHeader}>
        <Text style={styles.index}>#{index + 1}</Text>
        <Text style={styles.time}>{item.time}</Text>
      </View>
      <View style={styles.rowData}>
        <Text style={styles.text}>Nhiệt độ: <Text style={styles.bold}>{item.temperature}°C</Text></Text>
        <Text style={styles.text}>Độ ẩm: <Text style={styles.bold}>{item.humidity}%</Text></Text>
        <Text style={styles.text}>Độ ẩm đất: <Text style={styles.bold}>{item.soil_moisture}%</Text></Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.screen}>
      <Text style={styles.title}>Theo dõi môi trường trồng cây</Text>

      <FlatList
        data={dataList}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderSensorItem}
        ListEmptyComponent={<Text style={styles.empty}>Chưa có dữ liệu...</Text>}
        contentContainerStyle={styles.listContainer}
      />

      <View style={styles.controlBar}>
        <View style={styles.button}>
          <Button title="Thủ công" color="#28a745"
            onPress={() => sendAndLog('5', '/api/settings', { action: '5' })} />
        </View>
        <View style={styles.button}>
          <Button title="Auto on" color="#007bff"
            onPress={() => sendAndLog('3', '/api/settings', { action: '3' })} />
        </View>
        <View style={styles.button}>
          <Button title="Auto off" color="#dc3545"
            onPress={() => sendAndLog('4', '/api/settings', { action: '4' })} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f4f9fb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 16,
    textAlign: 'center',
    color: '#333',
     marginTop: 40,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100, // chừa khoảng trống dưới cho control bar
  },
  row: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#aaa',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  rowData: {
    paddingLeft: 8,
  },
  index: {
    fontWeight: 'bold',
    color: '#444',
  },
  text: {
    fontSize: 14,
    marginVertical: 2,
    color: '#444',
  },
  bold: {
    fontWeight: 'bold',
    color: '#007acc',
  },
  time: {
    fontSize: 12,
    color: '#888',
  },
  empty: {
    textAlign: 'center',
    marginTop: 20,
    color: '#999',
  },
  controlBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#ffffffee',
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
});
