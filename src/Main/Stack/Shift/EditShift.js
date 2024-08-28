import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Dimensions, TouchableOpacity, KeyboardAvoidingView, Alert } from 'react-native';
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
import { DateTimePickerModal } from 'react-native-modal-datetime-picker';
import moment from 'moment';
import axios from 'axios';
import { Rupioo_Lite_BaseUrl } from '../../../../Config/BaseUtil';
import AsyncStorage from '@react-native-async-storage/async-storage';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const calculateHeightPercentage = (percentage) => (windowHeight * percentage) / 100;
const calculateWidthPercentage = (percentage) => (windowWidth * percentage) / 100;
const calculateFontSizePercentage = (percentage) => {
    const baseDimension = Math.min(windowWidth, windowHeight);
    return (baseDimension * percentage) / 100;
};

const Edit_Shift = ({ navigation }) => {
    const [ShiftName, setShiftName] = useState('');
    const [FromTime, setFromTime] = useState(null);
    const [LateByTime, setLateByTime] = useState(null);
    const [ToTime, setToTime] = useState(null);
    const [ShortByTime, setShortByTime] = useState(null);
    const [isFromTimePickerVisible, setFromTimePickerVisibility] = useState(false);
    const [isLateByTimePickerVisible, setLateByTimePickerVisibility] = useState(false);
    const [isToTimePickerVisible, setToTimePickerVisibility] = useState(false);
    const [isShortByTimePickerVisible, setShortByTimePickerVisibility] = useState(false);

    const [ViewFromTime, setViewFromTime] = useState(null);
    const [ViewLateByTime, setViewLateByTime] = useState(null);
    const [ViewToTime, setViewToTime] = useState(null);
    const [ViewShortByTime, setViewShortByTime] = useState(null);


    useEffect(() => {
        const getShift = async () => {
            // shift/view-shift-by-id/
            const id = await AsyncStorage.getItem('ShiftID');
            console.log(id)
            await axios.get(`${Rupioo_Lite_BaseUrl}shift/view-shift-by-id/${id}`)
                .then((response) => {
                    console.log(response?.data?.Shift);
                    setShiftName(response?.data?.Shift?.shiftName);
                    setViewFromTime(response?.data?.Shift?.fromTime);
                    setViewLateByTime(response?.data?.Shift?.lateByTime);
                    setViewToTime(response?.data?.Shift?.toTime);
                    setViewShortByTime(response?.data?.Shift?.shortByTime);
                })
                .catch((error) => {
                    console.log(error);
                })
        }
        getShift();
    }, [])

    const showTimePicker = (field) => {
        if (field === 'from') {
            setFromTimePickerVisibility(true);
        } else if (field === 'late') {
            setLateByTimePickerVisibility(true);
        } else if (field === 'to') {
            setToTimePickerVisibility(true);
        } else if (field === 'short') {
            setShortByTimePickerVisibility(true);
        }
    };

    const hideTimePicker = () => {
        setFromTimePickerVisibility(false);
        setLateByTimePickerVisibility(false);
        setToTimePickerVisibility(false);
        setShortByTimePickerVisibility(false);
    };

    const handleConfirm = (time, field) => {
        console.log("A time has been picked: ", time);
        if (field === 'from') {
            setFromTime(time);
        } else if (field === 'late') {
            setLateByTime(time);
        } else if (field === 'to') {
            setToTime(time);
        } else if (field === 'short') {
            setShortByTime(time);
        }
        hideTimePicker();
    };

    const handleSubmit = async () => {
        const id = await AsyncStorage.getItem("userId");
        const ShiftID = await AsyncStorage.getItem('ShiftID');
        console.log('GetID :- ', id);
        console.log('Shift Name :- ', ShiftName);
        console.log('FromTime :- ', FromTime ? moment(FromTime).format('H:mm') : ViewFromTime);
        console.log('LateByTime :- ', LateByTime ? moment(LateByTime).format('H:mm') : ViewLateByTime);
        console.log('ToTime :- ',ToTime ? moment(ToTime).format('H:mm') : ViewToTime);
        console.log('Short BY TIme :- ',ShortByTime ? moment(ShortByTime).format('H:mm') : ViewShortByTime);

        console.log(moment(FromTime).format('h:mm'));
        console.log(moment(ToTime).format('h:mm'))

        // console.log(moment(ViewToTime,"h:mm").format("h:mm")-ViewFromTime);

        const [startHours, startMinutes] = FromTime ? moment(FromTime).format('h:mm') : ViewFromTime.split(':').map(Number);
        const [endHours, endMinutes] = ToTime ? moment(ToTime).format('h:mm') : ViewToTime.split(':').map(Number);

        console.log(startHours + " " + startMinutes);
        console.log(endHours + " " + endMinutes);

        let totalMinutes = endMinutes - startMinutes;
        let totalHours = endHours - startHours;
        if (totalMinutes < 0) {
            totalMinutes += 60;
            totalHours -= 1;
        }
        if (totalHours < 0) {
            totalHours += 24;
        }
        console.log(totalHours)

        if (totalHours) {
            await axios.put(`${Rupioo_Lite_BaseUrl}shift/update-shift/${ShiftID}`, {
                userId: id,
                shiftName: ShiftName,
                fromTime: FromTime ? moment(FromTime).format('H:mm') : ViewFromTime,
                toTime: ToTime ? moment(ToTime).format('H:mm') : ViewToTime,
                lateByTime: LateByTime ? moment(LateByTime).format('H:mm') : ViewLateByTime,
                shortByTime: ShortByTime ? moment(ShortByTime).format('H:mm') : ViewShortByTime,
                totalHours: Number(totalHours.toFixed(2))
            })
                .then((res) => {
                    console.log('Shift saved:- ', res?.data);
                    Alert.alert("Successfull...!!!", res?.data?.message)
                    navigation.navigate('Shift List')
                })
                .catch((err) => {
                    console.log('Error:- ', err);
                })

        } else {
            console.log('Invalid time format');
        }

    };

    return (
        <KeyboardAvoidingView style={{ flex: 1 }}>
            <GestureHandlerRootView style={styles.container}>
                {/* <ScrollView contentContainerStyle={styles.scrollView}> */}
                {/* Shift Name */}
                <Text style={{
                    fontSize: calculateFontSizePercentage(4),
                    color: 'black',
                    marginTop: calculateHeightPercentage(2),
                    marginLeft: calculateWidthPercentage(-61)
                }}>Shift Name</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter Shift Name"
                    placeholderTextColor="gray"
                    value={ShiftName}
                    onChangeText={text => setShiftName(text)}
                />

                {/* From Time */}
                <Text style={{
                    fontSize: calculateFontSizePercentage(4),
                    color: 'black',
                    marginTop: calculateHeightPercentage(2),
                    marginLeft: calculateWidthPercentage(-61)
                }}>From Time</Text>
                <TouchableOpacity
                    style={styles.input}
                    onPress={() => showTimePicker('from')}
                >
                    <Text style={{ color: 'black' }}>
                        {FromTime ? moment(FromTime).format('h:mm A') : moment(ViewFromTime,"H:mm").format('h:mm A')}
                    </Text>
                </TouchableOpacity>
                <DateTimePickerModal
                    isVisible={isFromTimePickerVisible}
                    mode="time"
                    is24Hour={false}
                    onConfirm={(time) => handleConfirm(time, 'from')}
                    onCancel={hideTimePicker}
                    headerTextIOS="Select Time"
                    headerTextStyle={styles.pickerHeaderText}
                    cancelTextIOS="Cancel"
                    cancelTextStyle={styles.pickerButton}
                    confirmTextIOS="OK"
                    confirmTextStyle={styles.pickerButton}
                    containerStyle={styles.pickerContainer}
                    pickerStyle={styles.picker}
                />

                {/* Late By Time */}
                <Text style={{
                    fontSize: calculateFontSizePercentage(4),
                    color: 'black',
                    marginTop: calculateHeightPercentage(2),
                    marginLeft: calculateWidthPercentage(-56)
                }}>Late By Time</Text>
                <TouchableOpacity
                    style={styles.input}
                    onPress={() => showTimePicker('late')}
                >
                    <Text style={{ color: 'black' }}>
                        {LateByTime ? moment(LateByTime).format('h:mm A') : moment(ViewLateByTime,"H:mm").format('h:mm A')}
                    </Text>
                </TouchableOpacity>
                <DateTimePickerModal
                    isVisible={isLateByTimePickerVisible}
                    mode="time"
                    is24Hour={false}
                    onConfirm={(time) => handleConfirm(time, 'late')}
                    onCancel={hideTimePicker}
                    headerTextIOS="Select Time"
                    headerTextStyle={styles.pickerHeaderText}
                    cancelTextIOS="Cancel"
                    cancelTextStyle={styles.pickerButton}
                    confirmTextIOS="OK"
                    confirmTextStyle={styles.pickerButton}
                    containerStyle={styles.pickerContainer}
                    pickerStyle={styles.picker}
                />

                {/* To Time */}
                <Text style={{
                    fontSize: calculateFontSizePercentage(4),
                    color: 'black',
                    marginTop: calculateHeightPercentage(2),
                    marginLeft: calculateWidthPercentage(-66)
                }}>To Time</Text>
                <TouchableOpacity
                    style={styles.input}
                    onPress={() => showTimePicker('to')}
                >
                    <Text style={{ color: 'black' }}>
                        {ToTime ? moment(ToTime).format('h:mm A') : moment(ViewToTime,"H:mm").format('h:mm A')}
                    </Text>
                </TouchableOpacity>
                <DateTimePickerModal
                    isVisible={isToTimePickerVisible}
                    mode="time"
                    is24Hour={false}
                    onConfirm={(time) => handleConfirm(time, 'to')}
                    onCancel={hideTimePicker}
                    headerTextIOS="Select Time"
                    headerTextStyle={styles.pickerHeaderText}
                    cancelTextIOS="Cancel"
                    cancelTextStyle={styles.pickerButton}
                    confirmTextIOS="OK"
                    confirmTextStyle={styles.pickerButton}
                    containerStyle={styles.pickerContainer}
                    pickerStyle={styles.picker}
                />

                {/* Short By Time */}
                <Text style={{
                    fontSize: calculateFontSizePercentage(4),
                    color: 'black',
                    marginTop: calculateHeightPercentage(2),
                    marginLeft: calculateWidthPercentage(-55)
                }}>Short By Time</Text>
                <TouchableOpacity
                    style={styles.input}
                    onPress={() => showTimePicker('short')}
                >
                    <Text style={{ color: 'black' }}>
                        {ShortByTime ? moment(ShortByTime).format('h:mm A') : moment(ViewShortByTime,"H:mm").format('h:mm A')}
                    </Text>
                </TouchableOpacity>
                <DateTimePickerModal
                    isVisible={isShortByTimePickerVisible}
                    mode="time"
                    is24Hour={false}
                    onConfirm={(time) => handleConfirm(time, 'short')}
                    onCancel={hideTimePicker}
                    headerTextIOS="Select Time"
                    headerTextStyle={styles.pickerHeaderText}
                    cancelTextIOS="Cancel"
                    cancelTextStyle={styles.pickerButton}
                    confirmTextIOS="OK"
                    confirmTextStyle={styles.pickerButton}
                    containerStyle={styles.pickerContainer}
                    pickerStyle={styles.picker}
                />

                {/* Submit Button */}
                <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                    <Text style={styles.buttonText}>Submit</Text>
                </TouchableOpacity>
                {/* </ScrollView> */}
            </GestureHandlerRootView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        paddingTop: calculateHeightPercentage(5)
    },
    label: {
        fontSize: calculateFontSizePercentage(4),
        color: 'black',
        marginTop: calculateHeightPercentage(2),
    },
    input: {
        width: calculateWidthPercentage(85),
        height: calculateHeightPercentage(6),
        paddingHorizontal: calculateWidthPercentage(5),
        backgroundColor: '#f0f0f0',
        borderRadius: calculateFontSizePercentage(1),
        borderWidth: 1,
        borderColor: '#e0e0e5',
        marginTop: calculateHeightPercentage(1),
        justifyContent: 'center',
    },
    button: {
        width: calculateWidthPercentage(85),
        backgroundColor: 'black',
        borderRadius: calculateFontSizePercentage(1),
        marginTop: calculateHeightPercentage(5),
        paddingVertical: calculateHeightPercentage(1),
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: calculateFontSizePercentage(5),
        fontWeight: 'bold',
    },
    pickerContainer: {
        backgroundColor: 'white',
        borderRadius: 10,
    },
    picker: {
        backgroundColor: 'white',
        borderRadius: 10,
    },
    pickerHeaderText: {
        color: 'black',
        fontSize: 18,
        fontWeight: 'bold',
    },
    pickerButton: {
        fontSize: 16,
        color: 'green',
    },
});

export default Edit_Shift;
