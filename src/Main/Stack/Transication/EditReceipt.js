import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView } from 'react-native';
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Rupioo_Lite_BaseUrl } from '../../../../Config/BaseUtil';
import DropDownPicker from 'react-native-dropdown-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import DatePicker from 'react-native-date-picker';
import moment from 'moment';
import axios from 'axios';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const calculateHeightPercentage = (percentage) => (windowHeight * percentage) / 100;
const calculateWidthPercentage = (percentage) => (windowWidth * percentage) / 100;
const calculateFontSizePercentage = (percentage) => {
    const baseDimension = Math.min(windowWidth, windowHeight);
    return (baseDimension * percentage) / 100;
};

const Edit_Receipt = ({ navigation }) => {
    const [employeeList, setEmployeeList] = useState([]);
    const [formFields, setFormFields] = useState({
        startDate: null,
        selectedEmployee: null,
        remark: '',
        amount: '',
        status: null,
        showDatePicker: false,
        employeeOpen: false,
        statusOpen: false
    });
    const [ShowEMP, setShowEmp] = useState('');
    const [ShowDate, setDate] = useState(null);
    const [ReceiptId, setReceiptId] = useState(null);

    const statusOptions = [
        { label: 'Cash', value: 'Cash' },
        { label: 'Bank', value: 'Bank' },
    ];

    const fetchEmployees = useCallback(async () => {
        try {
            const id = await AsyncStorage.getItem('userId');
            const response = await axios.get(`${Rupioo_Lite_BaseUrl}empoloyee/view-employee-userId/${id}`);
            const employees = response?.data?.Employee || [];
            const formattedEmployees = employees.map(emp => ({
                label: emp.Name,
                value: emp.Name,
                data: emp
            }));
            setEmployeeList(formattedEmployees);
        } catch (error) {
            console.error("Error fetching employees:", error);
        }
    }, []);

    const handleFieldChange = (field, value) => {
        console.log(value);
        if (field === "selectedEmployee") {
            setFormFields(prevFields => ({
                ...prevFields,
                [field]: value?.data
            }));
        }
        else {
            setFormFields(prevFields => ({
                ...prevFields,
                [field]: value
            }));
        }
    };

    useEffect(() => {
        fetchEmployees();
        const getData = async () => {
            const data = await AsyncStorage.getItem('Receipt');
            const data1 = JSON.parse(data);
            console.log("@@@@@@@@@@@ :- ",data1?._id);
            const parsedDate = data1?.date ? new Date(data1.date) : null;
            setFormFields({
                startDate: parsedDate,
                selectedEmployee: data1?.employeeId,
                remark: data1?.remark,
                amount: data1?.amount?.toString(),
                status: data1?.paymentMode,
            });
            setShowEmp(data1?.employeeId?.Name);
            setDate(data1?.date);
            setReceiptId(data1?._id);

        };
        getData();
    }, [fetchEmployees, setDate, setShowEmp]);

    const validateForm = () => {
        const { startDate, selectedEmployee, status, amount } = formFields;
        if (!startDate) {
            Alert.alert('Validation Error', 'Please select a start date.');
            return false;
        }
        if (!selectedEmployee) {
            Alert.alert('Validation Error', 'Please select an employee.');
            return false;
        }
        if (!status) {
            Alert.alert('Validation Error', 'Please select a payment type.');
            return false;
        }
        if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
            Alert.alert('Validation Error', 'Please enter a valid amount.');
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;
        const id = await AsyncStorage.getItem('userId');

        // "userId":"",
        // "paymentMode":"",
        // "type":"",
        // "date":"",
        // "employeeId":"",
        // "amount":5000,
        // "remark":""
        const receiptData = {
            userId:id,
            date: formFields?.startDate ? moment(formFields?.startDate).format('DD-MM-YYYY') : moment(ShowDate).format('DD-MMM-YYYY'),
            employeeId: formFields.selectedEmployee?._id,
            remark: formFields.remark,
            amount: parseFloat(formFields.amount),
            paymentMode: formFields.status,
            type:'receipt'
        };
        console.log(receiptData);

        await axios.put(`${Rupioo_Lite_BaseUrl}receipt/update-receipt/${ReceiptId}`,receiptData)
        .then((res) => {
                console.log("Response data:", res?.data);
                navigation.navigate("Receipt")
        })
        .catch((err) => {
            console.log(err?.response?.data);
            Alert.alert("Error...",err.response.data.message)
        })
    };

    return (
        <GestureHandlerRootView style={styles.container}>
            <KeyboardAvoidingView behavior="padding" style={{ flex: 1, width: '100%' }}>
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <View style={styles.formContainer}>
                        <View style={styles.fieldContainer}>
                            <Text style={styles.label}>Date</Text>
                            <TouchableOpacity
                                onPress={() => handleFieldChange('showDatePicker', true)}
                                style={styles.input}
                            >
                                <Text style={formFields.startDate || ShowDate ? styles.inputText : { color: 'gray' }}>
                                    {formFields?.startDate ? moment(formFields?.startDate).format('DD-MMM-YYYY') : moment(ShowDate).format('DD-MMM-YYYY')}
                                </Text>
                            </TouchableOpacity>
                            {formFields.showDatePicker && (
                                <DatePicker
                                    modal
                                    mode="date"
                                    open={formFields.showDatePicker}
                                    date={formFields.startDate || new Date()}
                                    onConfirm={(date) => {
                                        handleFieldChange('startDate', date);
                                        handleFieldChange('showDatePicker', false);
                                    }}
                                    onCancel={() => handleFieldChange('showDatePicker', false)}
                                />

                            )}

                            <Text style={styles.label}>Employee</Text>
                            <DropDownPicker
                                open={formFields.employeeOpen}
                                value={formFields.selectedEmployee?.Name || ShowEMP}
                                items={employeeList}
                                setOpen={open => handleFieldChange('employeeOpen', open)}
                                onSelectItem={item => handleFieldChange('selectedEmployee', item)}
                                placeholder="Select Employee"
                                style={[styles.dropdown, styles.dropdownEmployee]}
                                dropDownContainerStyle={{ height: calculateHeightPercentage(23) }}
                                textStyle={formFields.selectedEmployee ? styles.dropdownText : { color: 'gray' }}
                            />

                            <Text style={styles.label}>Payment-Type</Text>
                            <DropDownPicker
                                open={formFields.statusOpen}
                                value={formFields.status}
                                items={statusOptions}
                                setOpen={open => handleFieldChange('statusOpen', open)}
                                onSelectItem={item => handleFieldChange('status', item.value)}
                                placeholder="Select Payment Type"
                                style={[styles.dropdown, styles.dropdownStatus]}
                                dropDownContainerStyle={{ height: calculateHeightPercentage(12) }}
                                textStyle={formFields.status ? styles.dropdownText : { color: 'gray' }}
                            />

                            <Text style={styles.label}>Amount</Text>
                            <TextInput
                                style={styles.input}
                                placeholderTextColor='gray'
                                placeholder="Enter amount"
                                onChangeText={value => handleFieldChange('amount', value)}
                                value={formFields.amount}
                                keyboardType="numeric"
                            />

                            <Text style={styles.label}>Remark</Text>
                            <TextInput
                                style={styles.input}
                                placeholderTextColor='gray'
                                placeholder="Enter remark"
                                onChangeText={value => handleFieldChange('remark', value)}
                                value={formFields.remark}
                            />
                        </View>

                        <TouchableOpacity
                            onPress={handleSubmit}
                            style={styles.button}
                        >
                            <Text style={styles.buttonText}>{'Submit'}</Text>
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
    scrollContainer: {
        flexGrow: 1,
        alignSelf: 'center',
        alignItems: 'center',
        width: '90%',
    },
    formContainer: {
        width: '95%',
        zIndex: 1000,
    },
    fieldContainer: {
        marginBottom: calculateHeightPercentage(2),
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e5',
        paddingBottom: calculateHeightPercentage(2),
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
        marginTop: calculateHeightPercentage(1),
        marginLeft: calculateWidthPercentage(1),
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
    buttonDisabled: {
        backgroundColor: 'gray',
    },
    buttonText: {
        fontSize: calculateFontSizePercentage(5),
        color: 'white',
        fontWeight: '600',
    },
});

export default Edit_Receipt;
