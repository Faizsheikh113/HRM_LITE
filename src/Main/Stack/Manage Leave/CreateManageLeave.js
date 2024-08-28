import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, TextInput, Alert, KeyboardAvoidingView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DropDownPicker from 'react-native-dropdown-picker';
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
import axios from 'axios';
import DatePicker from 'react-native-date-picker';
import moment from 'moment';
import { Rupioo_Lite_BaseUrl } from '../../../../Config/BaseUtil';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const calculateHeightPercentage = (percentage) => (windowHeight * percentage) / 100;
const calculateWidthPercentage = (percentage) => (windowWidth * percentage) / 100;
const calculateFontSizePercentage = (percentage) => {
    const baseDimension = Math.min(windowWidth, windowHeight);
    return (baseDimension * percentage) / 100;
};


const CreateManageLeave = ({ navigation }) => {
    const [employeeList, setEmployeeList] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [employeeOpen, setEmployeeOpen] = useState(false);
    const [LeaveList, setLeaveList] = useState([]);
    const [selectedLeave, setSelectedLeave] = useState(null);
    const [leaveOpen, setLeaveOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [reason, setReason] = useState('');
    const [status, setStatus] = useState(null);
    const [statusOpen, setStatusOpen] = useState(false);
    const [isStartDatePickerVisible, setStartDatePickerVisible] = useState(false);
    const [isEndDatePickerVisible, setEndDatePickerVisible] = useState(false);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [totalDays, setTotalDays] = useState(0);


    const GetProduct = useCallback(async () => {
        try {
            setIsLoading(true);
            const id = await AsyncStorage.getItem('userId');

            const Employeeresponse = await axios.get(`${Rupioo_Lite_BaseUrl}empoloyee/view-employee-userId/${id}`);
            const employees = Employeeresponse?.data?.Employee || [];

            const Leaveresponse = await axios.get(`${Rupioo_Lite_BaseUrl}leave/view-leave-user/${id}`);
            const leave = Leaveresponse?.data?.Leave || [];
            const formattedLeave = leave.map(lev => ({
                label: lev.LeaveType,
                value: lev
            }));
            setLeaveList(formattedLeave);
            const formattedEmployees = employees.map(emp => ({
                label: emp.Name,
                value: emp
            }));
            setEmployeeList(formattedEmployees);
        } catch (err) {
            console.log(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            GetProduct();
        });
        return () => {
            unsubscribe();
        };
    }, [navigation, GetProduct]);

    useEffect(() => {
        if (startDate && endDate) {
            const days = moment(endDate).diff(moment(startDate), 'days') + 1; // Calculate total days
            setTotalDays(days);
        } else {
            setTotalDays(0);
        }
    }, [startDate, endDate]);

    const statusOptions = [
        { label: 'Paid', value: 'Paid' },
        { label: 'Unpaid', value: 'Unpaid' },
    ];

    const handleSubmit = async () => {
        try {
            const id = await AsyncStorage.getItem("userId");
            console.log("Id :- ", id);
            console.log("Employee :- ", selectedEmployee?._id)
            console.log("Leave Type :- ", selectedLeave?.LeaveType)
            console.log("Leave Reason :- ", reason)
            console.log("start Date :- ", moment(startDate).format('DD-MM-YYYY'))
            console.log("End Date :- ", moment(endDate).format('DD-MM-YYYY'))
            console.log("Status :- ", status)
            console.log("Total Days :- ", totalDays);
            // parameter's : userId,Employee, LeaveType, StartDate, EndDate, LeaveReason,CheckStatus,TotalDays
            await axios.post(`${Rupioo_Lite_BaseUrl}leave-manage/save-manage-leave`, {
                userId: id,
                LeaveType: selectedLeave?.LeaveType,
                LeaveReason:reason,
                Employee: selectedEmployee?._id,
                CheckStatus: status,
                StartDate: startDate ? moment(startDate).format('DD-MM-YYYY') : null,
                EndDate: endDate ? moment(endDate).format('DD-MM-YYYY') : null,
                TotalDays:totalDays
            })
                .then((res) => {
                    Alert.alert("Successfully...", res?.data?.message);
                    navigation.navigate('Manage Leave');
                })
                .catch((err) => {
                    console.log(err.response.data);
                });
        } catch (error) {
            console.log("Error: ", error?.response?.data);
            Alert.alert('Error!', error.response?.data?.message || "Something went wrong");
        }
    };

    return (
        <GestureHandlerRootView style={styles.container}>
            <KeyboardAvoidingView behavior="padding" style={{ alignSelf: 'center',marginLeft:calculateWidthPercentage(5) }}>
                <ScrollView>
                    <View style={styles.formContainer}>
                        <Text style={styles.label}>Employee</Text>
                        <DropDownPicker
                            open={employeeOpen}
                            value={selectedEmployee}
                            items={employeeList}
                            setOpen={setEmployeeOpen}
                            setValue={setSelectedEmployee}
                            placeholder="Select Employee"
                            style={[styles.dropdown, styles.dropdownEmployee]}
                            dropDownContainerStyle={{ height: calculateHeightPercentage(23) }}
                            textStyle={styles.dropdownText}
                            zIndex={2000} // Ensure this dropdown is on top
                            scrollViewProps={{ showsVerticalScrollIndicator: true }} // Enable vertical scroll
                        />
                        <Text style={styles.label}>Leave Type</Text>
                        <DropDownPicker
                            open={leaveOpen}
                            value={selectedLeave}
                            items={LeaveList}
                            setOpen={setLeaveOpen}
                            setValue={setSelectedLeave}
                            placeholder="Select Leave"
                            style={[styles.dropdown, styles.dropdownLeave]}
                            dropDownContainerStyle={{ height: calculateHeightPercentage(15) }}
                            textStyle={styles.dropdownText}
                            zIndex={1000} // Ensure this dropdown is below the employee dropdown
                            scrollViewProps={{ showsVerticalScrollIndicator: true }} // Enable vertical scroll
                        />
                        <Text style={styles.label}>Start Date</Text>
                        <TouchableOpacity onPress={() => setStartDatePickerVisible(true)} style={styles.input}>
                            <Text style={styles.inputText}>{startDate ? moment(startDate).format('DD-MMM-YYYY') : 'Select Start Date'}</Text>
                        </TouchableOpacity>
                        <DatePicker
                            modal
                            mode="date"
                            open={isStartDatePickerVisible}
                            date={startDate || new Date()}
                            onConfirm={(date) => {
                                setStartDate(date);
                                setStartDatePickerVisible(false);
                            }}
                            onCancel={() => setStartDatePickerVisible(false)}
                        />

                        <Text style={styles.label}>End Date</Text>
                        <TouchableOpacity onPress={() => setEndDatePickerVisible(true)} style={styles.input}>
                            <Text style={styles.inputText}>{endDate ? moment(endDate).format('DD-MMM-YYYY') : 'Select End Date'}</Text>
                        </TouchableOpacity>
                        <DatePicker
                            modal
                            mode="date"
                            open={isEndDatePickerVisible}
                            date={endDate || new Date()}
                            onConfirm={(date) => {
                                setEndDate(date);
                                setEndDatePickerVisible(false);
                            }}
                            onCancel={() => setEndDatePickerVisible(false)}
                        />

                        <Text style={styles.label}>Leave Reason</Text>
                        <TextInput
                            style={styles.input}
                            placeholderTextColor='gray'
                            placeholder="Enter Leave Reason here..."
                            onChangeText={setReason}
                            value={reason}
                        />

                        <Text style={styles.label}>Status</Text>
                        <DropDownPicker
                            open={statusOpen}
                            value={status}
                            items={statusOptions}
                            setOpen={setStatusOpen}
                            setValue={setStatus}
                            placeholder="Select Status"
                            style={[styles.dropdown, styles.dropdownStatus]}
                            dropDownContainerStyle={{ height: calculateHeightPercentage(20) }}
                            textStyle={styles.dropdownText}
                            zIndex={500} // Ensure this dropdown is below the others
                            scrollViewProps={{ showsVerticalScrollIndicator: true }}
                        />

                        <TouchableOpacity onPress={handleSubmit} style={styles.button}>
                            <Text style={styles.buttonText}>Submit</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
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
        width: '95%',
        zIndex: 1000, // Ensure form container is on top
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
    inputText: {
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
    dropdownEmployee: {
        zIndex: 2000,
    },
    dropdownLeave: {
        zIndex: 1000,
    },
    dropdownStatus: {
        zIndex: 500,
        marginTop: calculateHeightPercentage(1),
    },
    button: {
        backgroundColor: 'black',
        paddingVertical: calculateHeightPercentage(1),
        borderRadius: calculateFontSizePercentage(1),
        width: '100%',
        alignItems: 'center',
        marginTop: calculateHeightPercentage(3),
        elevation: 3,
    },
    buttonText: {
        fontSize: calculateFontSizePercentage(5),
        color: 'white',
        fontWeight: '600',
    },
});

export default CreateManageLeave;
