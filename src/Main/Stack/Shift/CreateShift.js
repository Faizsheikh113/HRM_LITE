import React, { useState } from 'react';
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

const Create_Shift = ({navigation}) => {
    const [ShiftName, setShiftName] = useState('');
    const [FromTime, setFromTime] = useState(null);
    const [LateByTime, setLateByTime] = useState(null);
    const [ToTime, setToTime] = useState(null);
    const [ShortByTime, setShortByTime] = useState(null);
    const [isFromTimePickerVisible, setFromTimePickerVisibility] = useState(false);
    const [isLateByTimePickerVisible, setLateByTimePickerVisibility] = useState(false);
    const [isToTimePickerVisible, setToTimePickerVisibility] = useState(false);
    const [isShortByTimePickerVisible, setShortByTimePickerVisibility] = useState(false);

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

    const handleSubmit = async() => {
        const id = await AsyncStorage.getItem("userId");
        console.log('GetID :- ',id);
        console.log('Shift Name :- ',ShiftName);
        console.log('FromTime :- ',moment(FromTime).format('H:mm A'));
        console.log('LateByTime :- ',moment(LateByTime).format('H:mm A'));
        console.log('ToTime :- ',moment(ToTime).format('H:mm A'));
        console.log('Short BY TIme :- ',moment(ShortByTime).format('H:mm A'));

        const fromTimeMoment = moment(FromTime);
        const toTimeMoment = moment(ToTime);

        if (fromTimeMoment.isValid() && toTimeMoment.isValid()) {
            const duration = moment.duration(toTimeMoment.diff(fromTimeMoment));

            const hours = Math.floor(duration.asHours());
            const minutes = duration.minutes();
            const totalHours = hours+(minutes/60);
            console.log('Total duration:- ',totalHours.toFixed(2));

            await axios.post(`${Rupioo_Lite_BaseUrl}shift/save-shift`,{
                userId:id,
                shiftName:ShiftName,
                fromTime:moment(FromTime).format('H:MM'),
                toTime:moment(ToTime).format('H:MM'),
                lateByTime:moment(LateByTime).format('H:MM'),
                shortByTime:moment(ShortByTime).format('H:MM'),
                totalHours:Number(totalHours.toFixed(2))
            })
            .then((res)=>{
                console.log('Shift saved:- ',res?.data);
                Alert.alert("Successfull...!!!",res?.data?.message)
                navigation.navigate('Shift List')
            })
            .catch((err)=>{
                console.log('Error:- ',err);
            })

        } else {
            console.log('Invalid time format');
        }

    };

    // Placeholder texts
    const placeholders = {
        from: 'Select From Time',
        late: 'Select Late By Time',
        to: 'Select To Time',
        short: 'Select Short By Time',
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
                        <Text style={{ color: FromTime ? 'black' : 'gray' }}>
                            {FromTime ? moment(FromTime).format('h:mm A') : placeholders.from}
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
                        <Text style={{ color: LateByTime ? 'black' : 'gray' }}>
                            {LateByTime ? moment(LateByTime).format('h:mm A') : placeholders.late}
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
                        <Text style={{ color: ToTime ? 'black' : 'gray' }}>
                            {ToTime ? moment(ToTime).format('h:mm A') : placeholders.to}
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
                        <Text style={{ color: ShortByTime ? 'black' : 'gray' }}>
                            {ShortByTime ? moment(ShortByTime).format('h:mm A') : placeholders.short}
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
        paddingTop:calculateHeightPercentage(5)
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

export default Create_Shift;
