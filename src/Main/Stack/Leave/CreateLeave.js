import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, TextInput, Alert } from 'react-native';
import DatePicker from 'react-native-date-picker';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import DropDownPicker from 'react-native-dropdown-picker';
import { Rupioo_Lite_BaseUrl } from '../../../../Config/BaseUtil';
import axios from 'axios';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const calculateHeightPercentage = (percentage) => (windowHeight * percentage) / 100;
const calculateWidthPercentage = (percentage) => (windowWidth * percentage) / 100;
const calculateFontSizePercentage = (percentage) => {
    const baseDimension = Math.min(windowWidth, windowHeight);
    return (baseDimension * percentage) / 100;
};

const CreateLeave = ({ navigation }) => {
    const [openDate, setOpenDate] = useState(false);
    const [leave, setLeave] = useState('');
    const [year, setYear] = useState('');
    const [month, setMonth] = useState(null);
    const [status, setStatus] = useState(null);
    const [date, setDate] = useState(new Date());

    const [monthOpen, setMonthOpen] = useState(false);
    const [statusOpen, setStatusOpen] = useState(false);

    const months = [
        { label: 'January', value: '01' },
        { label: 'February', value: '02' },
        { label: 'March', value: '03' },
        { label: 'April', value: '04' },
        { label: 'May', value: '05' },
        { label: 'June', value: '06' },
        { label: 'July', value: '07' },
        { label: 'August', value: '08' },
        { label: 'September', value: '09' },
        { label: 'October', value: '10' },
        { label: 'November', value: '11' },
        { label: 'December', value: '12' },
    ];

    const statusOptions = [
        { label: 'Paid', value: 'Paid' },
        { label: 'Unpaid', value: 'Unpaid' },
    ];

    const handleSubmit = async () => {
        try {
            const id = await AsyncStorage.getItem("userId");
            console.log(id);
            console.log("Leave: ", leave);
            console.log("Month: ", month);
            console.log("Year: ", year);
            console.log("Status: ", status);

            await axios.post(`${Rupioo_Lite_BaseUrl}leave/save-leave`, {
                userId: id,
                LeaveType: leave,
                NoOfYearly: Number(year),
                NoOfMonthly: Number(month),
                CheckStatus: status
            })
                .then((res) => {
                    console.log(res.data);
                    Alert.alert("Successfully...", res?.data?.message)
                    navigation.navigate('Leave List')
                })
                .catch((err) => {
                    console.log(err.response.data);
                })

        } catch (error) {
            console.log("Error: ", error?.response?.data);
            Alert.alert('Error!', error.response?.data?.message || "Something went wrong");
        }
    };

    return (
        <GestureHandlerRootView style={styles.container}>
            <View style={styles.formContainer}>
                <Text style={styles.label}>Leave Name</Text>
                <TextInput
                    style={styles.input}
                    placeholderTextColor='gray'
                    placeholder="Enter Leave name here..."
                    onChangeText={setLeave}
                    value={leave}
                />

                <Text style={styles.label}>Monthly Leave</Text>
                <TextInput
                    style={styles.input}
                    placeholderTextColor='gray'
                    placeholder="Enter monthly leave here..."
                    onChangeText={setMonth}
                    value={month}
                    keyboardType='numeric'
                />

                <Text style={styles.label}>Yearly Leave</Text>
                <TextInput
                    style={styles.input}
                    placeholderTextColor='gray'
                    placeholder="Enter yearly leave here..."
                    onChangeText={setYear}
                    value={year}
                    keyboardType='numeric'
                />

                <Text style={styles.label}>Status</Text>
                <DropDownPicker
                    open={statusOpen}
                    value={status}
                    items={statusOptions}
                    setOpen={setStatusOpen}
                    setValue={setStatus}
                    setItems={() => { }}
                    placeholder="Select Status"
                    style={[styles.dropdown, styles.dropdownStatus]}
                    textStyle={styles.dropdownText}
                />

                <TouchableOpacity onPress={handleSubmit} style={styles.button}>
                    <Text style={styles.buttonText}>Submit</Text>
                </TouchableOpacity>
            </View>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    formContainer: {
        marginTop: calculateHeightPercentage(6),
        width: '80%',
    },
    input: {
        color: 'black',
        elevation: 2,
        paddingHorizontal: calculateWidthPercentage(5),
        height: calculateHeightPercentage(6),
        borderColor: '#e0e0e5',
        borderWidth: 1,
        borderRadius: calculateFontSizePercentage(1),
        backgroundColor: "#f0f0f0",
        marginTop: calculateHeightPercentage(1),
        justifyContent: 'center',
    },
    dateText: {
        color: 'black',
        fontSize: calculateFontSizePercentage(4),
    },
    label: {
        fontSize: calculateFontSizePercentage(4),
        marginTop: calculateHeightPercentage(2),
        color: 'black',
    },
    dropdown: {
        elevation: 2,
        backgroundColor: '#f0f0f0',
        borderColor: '#e0e0e5',
        borderWidth: 1,
        borderRadius: calculateFontSizePercentage(1),
        marginTop: calculateHeightPercentage(1),
    },
    dropdownText: {
        color: 'black',
        fontSize: calculateFontSizePercentage(4),
    },
    dropdownStatus: {
        marginTop: calculateHeightPercentage(1),
    },
    button: {
        backgroundColor: 'black',
        paddingVertical: calculateHeightPercentage(1.5),
        borderRadius: calculateFontSizePercentage(1),
        width: '100%',
        alignItems: 'center',
        marginTop: calculateHeightPercentage(5),
        elevation: 3,
    },
    buttonText: {
        fontSize: calculateFontSizePercentage(5),
        color: 'white',
        fontWeight: '600',
    },
});

export default CreateLeave;
