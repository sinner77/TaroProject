import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ImageBackground,
  Modal
} from 'react-native';
import * as SQLite from 'expo-sqlite';
import {CalendarList} from 'react-native-calendars';
import PushNotification from 'react-native-push-notification';
import moment from 'moment';
import 'moment/locale/ru';

const db = SQLite.openDatabase('tarot.db');

export default function App() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [showCalendarModal, setShowCalendarModal] = useState(false);

  // Создание таблицы Consultations
  const createTable = () => {
    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS Consultations (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT, consultant TEXT, message TEXT, date TEXT)',
      );
    });
  };

  // Получение списка консультаций из базы данных
  const getConsultations = () => {
    db.transaction(tx => {
      tx.executeSql('SELECT * FROM Consultations', [], (_, {rows}) => {
        const data = rows._array;
        setConsultations(data);
      });
    });
  };

  // Добавление записи о консультации
  const addConsultation = () => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO Consultations (name, phone, message, date) VALUES (?, ?, ?, ?)',
        [name, phone, message, selectedDate],
        (_, {}) => {
          // Обновление списка консультаций после успешного добавления записи
          getConsultations();
          // Отправка уведомления о новой консультации
          scheduleNotification(selectedDate);
        },
      );
    });

    // Очистка полей после добавления записи
    setName('');
    setPhone('');
    setMessage('');
    setSelectedDate(null);

    // Дополнительные действия после добавления записи, например, открытие другого экрана или отображение сообщения об успешной записи
    // ...
  };

  // Открытие модального окна с календарем
  const openCalendarModal = () => {
    setShowCalendarModal(true);
  };

  // Закрытие модального окна с календарем
  const closeCalendarModal = () => {
    setShowCalendarModal(false);
  };

  // Отправка уведомления о новой консультации
  const scheduleNotification = date => {
    PushNotification.localNotificationSchedule({
      title: 'Новая консультация',
      message: 'У вас назначена консультация на ' + date,
      date: new Date(date),
    });
  };

  // Вызов функции создания таблицы и получения списка консультаций при монтировании компонента
  React.useEffect(() => {
    createTable();
    getConsultations();
    moment.locale('ru'); // Установка русской локали для moment.js
  }, []);

  return (
    <>
      <View style={styles.container}>
        <ImageBackground
          style={styles.image}
          source={{
            uri: 'https://cdn.nur.kz/images/720/df92eeaae54be0e3.webp',
        }}>
        <Text style={styles.heading}>Запись на консультацию</Text>
        <TextInput
          style={styles.input}
          placeholder="Ваше имя"
          value={name}
          onChangeText={text => setName(text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Ваш номер телефона"
          value={phone}
          onChangeText={text => setPhone(text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Сообщение"
          value={message}
          onChangeText={text => setMessage(text)}
        />

        <Text>{selectedDate}</Text>

        <Button style={styles.button} title="Выбрать дату" onPress={openCalendarModal} />

        <Modal visible={showCalendarModal} animationType="slide">
          <View style={styles.modalContainer}>
            <CalendarList
              current={new Date()}
              markedDates={{
                [selectedDate]: { selected: true },
              }}
              onDayPress={day => {
                setSelectedDate(day.dateString);
                closeCalendarModal();
              }}
            />
            <Button title="Закрыть" onPress={closeCalendarModal} />
          </View>
        </Modal>

        <Button title="Записаться" onPress={addConsultation} />

        </ImageBackground>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  image: {
    flex: 1,
    height: 600,
    width: 400,
    alignItems: 'center',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    marginTop: 20,
  },
  heading: {
    fontSize: 30,
    color: "red",
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    width: '80%',
    height: 40,
    borderWidth: 5,
    borderColor: 'green',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  button: {
    width: '80%',
    height: 40,
    borderWidth: 5,
    borderColor: 'green',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  calendar: {
    marginBottom: 1,
  },
  consultationItem: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
  },
});
