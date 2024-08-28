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

const Create_payment = ({ navigation }) => {
    const [employeeList, setEmployeeList] = useState([]);
    const [formFields, setFormFields] = useState([{ id: Date.now(), startDate: null, selectedEmployee: null, remark: '', amount: '', status: null, reason: null, showDatePicker: false, employeeOpen: false, statusOpen: false, reasonOpen: false }]);
    const [loading, setLoading] = useState(false);

    const statusOptions = [
        { label: 'Cash', value: 'Cash' },
        { label: 'Online', value: 'Online' },
    ];
    const Reason = [
        { label: 'Salary', value: 'Salary' },
        { label: 'Advance', value: 'Advance' },
        { label: 'Loan', value: 'Loan' },
    ];

    const fetchEmployees = useCallback(async () => {
        try {
            const id = await AsyncStorage.getItem('userId');
            const response = await axios.get(`${Rupioo_Lite_BaseUrl}empoloyee/view-employee-userId/${id}`);
            const employees = response?.data?.Employee || [];
            const formattedEmployees = employees.map(emp => ({
                label: emp.Name,
                value: emp?.Name,
                // id: emp?._id,
                data: emp
            }));
            setEmployeeList(formattedEmployees);
        } catch (error) {
            console.error("Error fetching employees:", error);
        }
    }, []);

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    const handleAddMore = () => {
        setFormFields(prevFields => [
            ...prevFields,
            { id: Date.now(), startDate: null, selectedEmployee: null, remark: '', amount: '', status: null, reason: null, showDatePicker: false, employeeOpen: false, statusOpen: false, reasonOpen: false }
        ]);
    };

    const handleFieldChange = (id, field, value) => {
        if (field === 'status') {
            const label = value?.value;
            setFormFields(prevFields =>
                prevFields.map(item =>
                    item.id === id ? { ...item, [field]: label } : item
                )
            );
        } else if (field === 'selectedEmployee') {
            const label = value?.data;
            setFormFields(prevFields =>
                prevFields.map(item =>
                    item.id === id ? { ...item, [field]: label } : item
                )
            );
        } else if (field === 'reason') {
            const label = value?.value;
            setFormFields(prevFields =>
                prevFields.map(item =>
                    item.id === id ? { ...item, [field]: label } : item
                )
            );
        }
        else {
            setFormFields(prevFields =>
                prevFields.map(item =>
                    item.id === id ? { ...item, [field]: value } : item
                )
            );
        }
    };
    console.log("Selected Emoloyee ;- ", formFields[0]?.selectedEmployee);

    const handleRemove = (id) => {
        setFormFields(prevFields => prevFields.length > 1 ? prevFields.filter(item => item.id !== id) : prevFields);
    };

    const validateForm = () => {
        for (const field of formFields) {
            if (!field.startDate) {
                Alert.alert('Error...', 'Please select a start date for each set.');
                return false;
            }
            if (!field.selectedEmployee) {
                Alert.alert('Error...', 'Please select an employee for each set.');
                return false;
            }
            if (!field.status) {
                Alert.alert('Error...', 'Please select a payment type for each set.');
                return false;
            }
            if (!field.amount || isNaN(field.amount) || parseFloat(field.amount) <= 0) {
                Alert.alert('Error...', 'Please enter a valid amount for each set.');
                return false;
            }
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        const receiptData = formFields.map(field => ({
            date: moment(field.startDate).format('DD-MM-YYYY'),
            employee: field.selectedEmployee?._id,
            remark: field.remark,
            amount: parseFloat(field.amount),
            status: field.status,
        }));

        console.log(receiptData)
    };
    return (
        <GestureHandlerRootView style={styles.container}>
            <KeyboardAvoidingView behavior="padding" style={{ flex: 1, width: '100%' }}>
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <View style={styles.formContainer}>
                        {formFields.map((field, index) => (
                            <View key={field.id} style={styles.fieldContainer}>
                                {index !== 0 && (
                                    <TouchableOpacity onPress={() => handleRemove(field.id)} style={styles.removeButton}>
                                        <Icon name="close" size={22} color={'white'} />
                                    </TouchableOpacity>
                                )}
                                <Text style={styles.label}>Date</Text>
                                <TouchableOpacity
                                    onPress={() => handleFieldChange(field.id, 'showDatePicker', true)}
                                    style={styles.input}
                                >
                                    <Text style={field.startDate ? styles.inputText : { color: 'gray' }}>
                                        {field.startDate ? moment(field.startDate).format('DD-MMM-YYYY') : 'Select Start Date'}
                                    </Text>
                                </TouchableOpacity>
                                {field.showDatePicker && (
                                    <DatePicker
                                        modal
                                        mode="date"
                                        open={field.showDatePicker}
                                        date={field.startDate || new Date()}
                                        onConfirm={(date) => {
                                            handleFieldChange(field.id, 'startDate', date);
                                            handleFieldChange(field.id, 'showDatePicker', false);
                                        }}
                                        onCancel={() => handleFieldChange(field.id, 'showDatePicker', false)}
                                    />
                                )}

                                <Text style={styles.label}>Employee</Text>
                                <DropDownPicker
                                    open={field.employeeOpen}
                                    value={field?.selectedEmployee?.Name}
                                    items={employeeList}
                                    setOpen={open => handleFieldChange(field.id, 'employeeOpen', open)}
                                    onSelectItem={(value) => {
                                        console.log("first : -", value)
                                        handleFieldChange(field.id, 'selectedEmployee', value)
                                    }}
                                    placeholder="Select Employee"
                                    style={[styles.dropdown, styles.dropdownEmployee]}
                                    dropDownContainerStyle={{ height: calculateHeightPercentage(23) }}
                                    textStyle={field.selectedEmployee ? styles.dropdownText : { color: 'gray' }}
                                />

                                <Text style={styles.label}>Payment-Type</Text>
                                <DropDownPicker
                                    open={field.statusOpen}
                                    value={field?.status}
                                    items={statusOptions}
                                    setOpen={open => handleFieldChange(field.id, 'statusOpen', open)}
                                    onSelectItem={(value) => {
                                        console.log("first : -", value)
                                        handleFieldChange(field.id, 'status', value)
                                    }}
                                    placeholder="Select Payment Type"
                                    style={[styles.dropdown, styles.dropdownStatus]}
                                    dropDownContainerStyle={{ height: calculateHeightPercentage(12) }}
                                    textStyle={field.status ? styles.dropdownText : { color: 'gray' }}
                                />
                                <Text style={styles.label}>Reason</Text>
                                <DropDownPicker
                                    open={field.reasonOpen}
                                    value={field?.reason}
                                    items={Reason}
                                    setOpen={open => handleFieldChange(field.id, 'reasonOpen', open)}
                                    onSelectItem={(value) => {
                                        console.log("first : -", value);
                                        handleFieldChange(field.id, 'reason', value)
                                    }}
                                    placeholder="Select Payment Reason"
                                    style={[styles.dropdown, styles.dropdownStatus]}
                                    dropDownContainerStyle={{ height: calculateHeightPercentage(18) }}
                                    textStyle={field.status ? styles.dropdownText : { color: 'gray' }}
                                />

                                <Text style={styles.label}>Amount</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholderTextColor='gray'
                                    placeholder="Enter amount"
                                    onChangeText={value => handleFieldChange(field.id, 'amount', value)}
                                    value={field.amount}
                                    keyboardType="numeric"
                                />

                                <Text style={styles.label}>Remark</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholderTextColor='gray'
                                    placeholder="Enter remark"
                                    onChangeText={value => handleFieldChange(field.id, 'remark', value)}
                                    value={field.remark}
                                />
                            </View>
                        ))}

                        <TouchableOpacity onPress={handleAddMore} style={styles.addButton}>
                            <Text style={styles.addButtonText}>Add More</Text>
                        </TouchableOpacity>

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
    addButton: {
        backgroundColor: '#007bff',
        paddingVertical: calculateHeightPercentage(1),
        borderRadius: calculateFontSizePercentage(1),
        width: '100%',
        alignItems: 'center',
        marginTop: calculateHeightPercentage(3),
        elevation: 3,
    },
    addButtonText: {
        fontSize: calculateFontSizePercentage(5),
        color: 'white',
        fontWeight: '600',
    },
    removeButton: {
        backgroundColor: '#ff4d4d',
        paddingVertical: calculateHeightPercentage(0.5),
        borderRadius: calculateFontSizePercentage(1),
        alignSelf: 'flex-end',
        width: '10%',
        alignItems: 'center',
        marginTop: calculateHeightPercentage(2),
        elevation: 3,
    },
    removeButtonText: {
        fontSize: calculateFontSizePercentage(4),
        color: 'white',
        fontWeight: '600',
    },
});

export default Create_payment;
