import React, { useEffect, useState } from 'react';
import {
  View, Text, Button, StyleSheet, Alert, FlatList, TouchableOpacity,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';

const API_URL = 'http://10.106.45.81:5556/api/schedule';

export default function ScheduleScreen() {
  const [hour, setHour] = useState(7);
  const [minute, setMinute] = useState(0);
 const [second, setSecond] = useState(0); 
  const [schedules, setSchedules] = useState([]);

  const fetchSchedules = async () => {
    try {
      const res = await axios.get(API_URL);
      setSchedules(res.data);
    } catch (err) {
      console.error('Lỗi tải lịch tưới:', err);
    }
  };

  const handleSave = async () => {
    try {
      await axios.post(API_URL, { hour, minute, second });
      Alert.alert('Thành công', `Đã lưu lịch tưới lúc ${hour}:${minute}:${second}`);
      fetchSchedules(); // Load lại danh sách sau khi lưu
    } catch (err) {
      console.error(err);
      Alert.alert('Lỗi', 'Không thể lưu lịch tưới');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchSchedules(); // Load lại danh sách sau khi xóa
    } catch (err) {
      console.error(err);
      Alert.alert(' Lỗi', 'Không thể xóa lịch tưới');
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đặt lịch tưới tự động</Text>

      {/* Picker chọn giờ */}
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Giờ:</Text>
        <Picker
          selectedValue={hour}
          style={styles.picker}
          onValueChange={setHour}
        >
          {[...Array(24).keys()].map((h) => (
            <Picker.Item key={h} label={`${h}`} value={h} />
          ))}
        </Picker>
      </View>

      {/* Picker chọn phút */}
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Phút:</Text>
        <Picker
          selectedValue={minute}
          style={styles.picker}
          onValueChange={setMinute}
        >
          {[...Array(60).keys()].map((m) => (
            <Picker.Item key={m} label={`${m}`} value={m} />
          ))}
        </Picker>
      </View>
       {/* Picker chọn giây */}
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Giây:</Text>
        <Picker
          selectedValue={second}
          style={styles.picker}
          onValueChange={setSecond}
        >
          {[...Array(60).keys()].map((m) => (
            <Picker.Item key={m} label={`${m}`} value={m} />
          ))}
        </Picker>
      </View>

      <Button title="Lưu lịch tưới" onPress={handleSave} />

      {/* Danh sách lịch đã đặt */}
      <Text style={styles.subtitle}>Lịch tưới đã đặt</Text>
      <FlatList
        data={schedules}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.scheduleItem}>
            <Text style={styles.scheduleText}>
              {`• ${item.hour} giờ ${item.minute} phút ${item.second} giây`}
            </Text>
            <TouchableOpacity onPress={() => handleDelete(item.id)}>
              <Text style={styles.cancelBtn}>Hủy</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center' }}>Chưa có lịch tưới nào</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, marginTop: 40 },
  subtitle: { fontSize: 16, fontWeight: 'bold', marginTop: 30, marginBottom: 10 },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    minHeight: 100,
  },
  label: { fontSize: 16, width: 60 },
  picker: { flex: 1, height: 100 },
  scheduleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#eee',
    padding: 10,
    marginBottom: 6,
    borderRadius: 6,
  },
  scheduleText: { fontSize: 16 },
  cancelBtn: { color: 'red', fontWeight: 'bold' },
});
