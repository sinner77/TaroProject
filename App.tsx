import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { Calendar, CalendarList, Agenda } from 'react-native-calendars';
import { WebView } from 'react-native-webview';

const db = SQLite.openDatabase('tarot.db');

export default function App() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [consultant, setConsultant] = useState('');
  const [message, setMessage] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [consultations, setConsultations] = useState([]);

  // Создание таблицы Consultations
  const createTable = () => {
    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS Consultations (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT, consultant TEXT, message TEXT, date TEXT)'
      );
    });
  };

  // Получение списка консультаций из базы данных
  const getConsultations = () => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM Consultations',
        [],
        (_, { rows }) => {
          const data = rows._array;
          setConsultations(data);
        }
      );
    });
  };

  // Добавление записи о консультации
  const addConsultation = () => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO Consultations (name, email, consultant, message, date) VALUES (?, ?, ?, ?, ?)',
        [name, email, consultant, message, selectedDate],
        (_, { insertId }) => {
          // Обновление списка консультаций после успешного добавления записи
          getConsultations();
        }
      );
    });

    // Очистка полей после добавления записи
    setName('');
    setEmail('');
    setConsultant('');
    setMessage('');
    setSelectedDate(null);

    // Дополнительные действия после добавления записи, например, открытие другого экрана или отображение сообщения об успешной записи
    // ...
  };

  // Вызов функции создания таблицы и получения списка консультаций при монтировании компонента
  React.useEffect(() => {
    createTable();
    getConsultations();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Запись на консультацию</Text>
      <TextInput
        style={styles.input}
        placeholder="Ваше имя"
        value={name}
        onChangeText={text => setName(text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={text => setEmail(text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Консультант"
        value={consultant}
        onChangeText={text => setConsultant(text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Сообщение"
        value={message}
        onChangeText={text => setMessage(text)}
      />
      <CalendarList
        style={styles.calendar}
        current={new Date()}
        markedDates={{
          [selectedDate]: { selected: true },
        }}
        onDayPress={day => setSelectedDate(day.dateString)}
      />
      <Button title="Записаться" onPress={addConsultation} />

      <Text style={styles.heading}>Список консультаций</Text>
      {consultations.map(item => (
        <View key={item.id} style={styles.consultationItem}>
          <Text>Имя: {item.name}</Text>
          <Text>Email: {item.email}</Text>
          <Text>Консультант: {item.consultant}</Text>
          <Text>Сообщение: {item.message}</Text>
          <Text>Дата: {item.date}</Text>
        </View>
      ))}

      {/* Веб-компонент для онлайн-оплаты */}
      <WebView
        source={{ uri: 'https://example.com/payment' }}
        style={styles.paymentComponent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  calendar: {
    marginBottom: 10,
  },
  consultationItem: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
  },
  paymentComponent: {
    width: '100%',
    height: 300,
  },
});
