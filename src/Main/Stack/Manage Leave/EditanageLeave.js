import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, TextInput, Alert, KeyboardAvoidingView } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
import axios from 'axios';
import { Rupioo_Lite_BaseUrl } from '../../../../Config/BaseUtil';
import DatePicker from 'react-native-date-picker';
import moment from 'moment';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const calculateHeightPercentage = (percentage) => (windowHeight * percentage) / 100;
const calculateWidthPercentage = (percentage) => (windowWidth * percentage) / 100;
const calculateFontSizePercentage = (percentage) => {
    const baseDimension = Math.min(windowWidth, windowHeight);
    return (baseDimension * percentage) / 100;
};

const EditManageLeave = ({ navigation }) => {
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

    // Show Data
    const [ShowStartDate, setShowStartDate] = useState('');
    const [ShowEndDate, setShowEnddate] = useState('');
    const [ItemId, setItemId] = useState('');

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
                value: lev.LeaveType  // Ensure value is consistent with label
            }));
            setLeaveList(formattedLeave);
            const formattedEmployees = employees.map(emp => ({
                label: emp.Name,
                value: emp._id  // Use _id for value
            }));
            setEmployeeList(formattedEmployees);
        } catch (err) {
            console.log(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        GetProduct();
        if (startDate && endDate) {
            const days = moment(endDate).diff(moment(startDate), 'days') + 1; // Calculate total days
            setTotalDays(days);
        } else {
            setTotalDays(0);
        }
    }, [GetProduct, startDate, endDate]);

    useEffect(() => {
        const getStoredData = async () => {
            const data = await AsyncStorage.getItem('ManageLeaveData');
            const data1 = JSON.parse(data);
            console.log("Get Data ;- ", data1);
            setShowStartDate(data1.StartDate);
            setShowEnddate(data1?.EndDate);
            setReason(data1?.LeaveReason);
            setStatus(data1?.CheckStatus);
            setTotalDays(data1?.TotalDays);
            setItemId(data1?._id);

            // Match employee and leave data with dropdown items
            const employee = employeeList.find(emp => emp.label === data1?.Employee?.Name);
            const leave = LeaveList.find(lev => lev.label === data1?.LeaveType);
            setSelectedEmployee(employee?.value);
            setSelectedLeave(leave?.value);
        };
        getStoredData();
    }, [employeeList, LeaveList]);

    const statusOptions = [
        { label: 'Paid', value: 'Paid' },
        { label: 'Unpaid', value: 'Unpaid' },
    ];

    const handleSubmit = async () => {
        try {
            const id = await AsyncStorage.getItem("userId");
            console.log("Id :- ", id);
            console.log("ItemId :- ", ItemId);
            console.log("Employee :- ", selectedEmployee)
            console.log("Leave Type :- ", selectedLeave)
            console.log("Leave Reason :- ", reason)
            console.log("start Date :- ", startDate ? moment(startDate).format('DD-MM-YYYY') : moment(ShowStartDate).format('DD-MM-YYYY'))
            console.log("End Date :- ", endDate ? moment(endDate).format('DD-MM-YYYY') : moment(ShowEndDate).format('DD-MM-YYYY'))
            console.log("Status :- ", status)
            console.log("Total Days :- ", totalDays);
            await axios.put(`${Rupioo_Lite_BaseUrl}leave-manage/update-manage-leave/${ItemId}`, {
                userId: id,
                LeaveType: selectedLeave,
                LeaveReason: reason,
                Employee: selectedEmployee,
                CheckStatus: status,
                StartDate: startDate ? moment(startDate).format('DD-MM-YYYY') : ShowStartDate,
                EndDate: endDate ? moment(endDate).format('DD-MM-YYYY') : ShowEndDate,
                TotalDays: totalDays
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
            <KeyboardAvoidingView behavior="padding" style={{ alignSelf: 'center', marginLeft: calculateWidthPercentage(5) }}>
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
                            scrollViewProps={{ showsVerticalScrollIndicator: true }}
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
                            scrollViewProps={{ showsVerticalScrollIndicator: true }}
                        />

                        <Text style={styles.label}>Start Date</Text>
                        <TouchableOpacity onPress={() => setStartDatePickerVisible(true)} style={styles.input}>
                            <Text style={styles.inputText}>{startDate ? moment(startDate).format('DD-MMM-YYYY') : ShowStartDate}</Text>
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
                            <Text style={styles.inputText}>{endDate ? moment(endDate).format('DD-MMM-YYYY') : ShowEndDate}</Text>
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

export default EditManageLeave;
