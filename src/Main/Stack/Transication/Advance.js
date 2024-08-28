// import libraries
import React, { useState, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    Modal,
    TextInput,
    FlatList,
    Button,
    Alert,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Transication_Footer from './Transication_footer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DropDownPicker from 'react-native-dropdown-picker';
import { Table, Row } from "react-native-table-component";
import AntDesign from 'react-native-vector-icons/AntDesign';
import axios from 'axios';
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
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

// create a component
const Advance = ({ navigation }) => {
    const [isModalVisible, setModalVisible] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [amount, setAmount] = useState('');
    const [employeeList, setEmployeeList] = useState([]);
    const [employeeOpen, setEmployeeOpen] = useState(false);

    const [AdvanceData, setAdvanceData] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [refresh, setRefresh] = useState(false);

    // Update
    const [isUpdateModalVisible, setUpdateModalVisible] = useState(false);
    const [updateAdvanceData, setUpdateAdvanceData] = useState({});
    const [updatedAmount, setUpdatedAmount] = useState('');


    const GetProduct = useCallback(async () => {
        try {
            const id = await AsyncStorage.getItem('userId');

            const Employeeresponse = await axios.get(`${Rupioo_Lite_BaseUrl}empoloyee/view-employee-userId/${id}`);
            const employees = Employeeresponse?.data?.Employee || [];

            const formattedEmployees = employees.map(emp => ({
                label: emp.Name,
                value: emp
            }));
            setEmployeeList(formattedEmployees);
        } catch (err) {
            console.log(err);
        }
    }, []);

    const handleModalClose = () => {
        setModalVisible(false);
        setSelectedEmployee(null);
        setAmount('');
    };

    const handleSubmit = async () => {
        console.log('Employee:', selectedEmployee);
        console.log('Amount:', amount);
        await axios.post(`${Rupioo_Lite_BaseUrl}ad-salary/add-advance`, {
            fullname: selectedEmployee?._id,
            amount: amount
        })
            .then((res) => {
                console.log(res?.data);
                Alert.alert("Successfull...!!!", res?.data?.message);
                handleModalClose();
                GetAdvance();
            })
            .catch((err) => {
                console.log(err);
                Alert.alert("Error", err?.response?.data);
            })
    };

    const handleUpdateSubmit = async () => {
        try {
            await axios.put(`${Rupioo_Lite_BaseUrl}ad-salary/update-advance/${updateAdvanceData._id}`, {
                amount: updatedAmount
            });
            Alert.alert("Success", "Advance updated successfully");
            setUpdateModalVisible(false);
            GetAdvance(); // Refresh the data
        } catch (err) {
            console.log(err);
            Alert.alert("Error", "Failed to update advance");
        }
    };


    const GetAdvance = useCallback(async () => {
        try {
            const response = await axios.get(`${Rupioo_Lite_BaseUrl}ad-salary/view-advance`);
            console.log(response?.data?.salary);
            setAdvanceData(response?.data?.salary || []);
        } catch (err) {
            console.log(err);
        } finally {
            setIsLoading(false);
        }
    }, [setAdvanceData, setIsLoading]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            GetAdvance();
            GetProduct();
        });
        return () => {
            unsubscribe;
        };
    }, [navigation, GetAdvance, GetProduct]);

    const pullMe = () => {
        setRefresh(true);
        GetAdvance();
        setTimeout(() => {
            setRefresh(false);
        }, 1000)
    }

    const goToEdit = async (data) => {
        console.log("Edit :- ", data);
        console.log(data?._id);
        await AsyncStorage.setItem("Advance", JSON.stringify(data))
    }

    const DeleteAdvance = async (data) => {
        console.log("Edit :- ", data);
        console.log(data?._id);
        await axios.delete(`${Rupioo_Lite_BaseUrl}ad-salary/delete-advacne/${data?._id}`)
            .then((res) => {
                console.log(res?.data);
                Alert.alert("Success", "Data Deleted Successfully");
                GetAdvance();
            })
            .catch((err) => {
                console.log("Error", err?.response?.data);
            })
    }

    const Date = calculateWidthPercentage(20);
    const Name = calculateWidthPercentage(30);
    const Desiganation = calculateWidthPercentage(25);
    const Shift = calculateWidthPercentage(25);

    const renderProductItem = useCallback((item, index) => {
        return (
            <ScrollView horizontal={true}>
                <Table borderStyle={{ borderWidth: 1, borderColor: "#C1C0B9" }}>
                    <Row
                        key={index}
                        data={[
                            moment(item?.date).format("DD-MMM-YY"),
                            item?.fullname?.Name?.toUpperCase(),
                            item?.amount?.toString(),
                            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                                <TouchableOpacity onPress={() => {
                                    setUpdateAdvanceData(item);
                                    setUpdatedAmount(item?.amount?.toString() || '');
                                    setUpdateModalVisible(true);
                                }}>
                                    <AntDesign name={'edit'} size={20} color={'black'} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => DeleteAdvance(item)}>
                                    <AntDesign name={'delete'} size={20} color={'black'} />
                                </TouchableOpacity>
                            </View>,
                        ]}
                        style={[{ backgroundColor: "#E7E6E1" }, index % 2 && { backgroundColor: "#F7F6E7" }]}
                        textStyle={{ fontSize: calculateFontSizePercentage(3), textAlign: 'center', color: '#6b6b6b', padding: calculateHeightPercentage(1), paddingHorizontal: calculateWidthPercentage(1) }}
                        widthArr={[Date, Name, Desiganation, Shift]}
                    />
                </Table>
            </ScrollView>
        );
    }, []);


    return (
        <GestureHandlerRootView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={{ backgroundColor: "transparent", paddingLeft: calculateWidthPercentage(4) }}
                >
                    <Icon name="arrow-back" size={25} color={'black'} />
                </TouchableOpacity>

                <View
                    style={{
                        height: "100%",
                        width: calculateWidthPercentage(45),
                        display: "flex",
                        paddingLeft: '5%',
                        justifyContent: "center",
                    }}
                >
                    <Text style={{ fontSize: calculateFontSizePercentage(5), fontWeight: "bold", color: 'black' }}>Advance</Text>
                </View>

                <TouchableOpacity
                    onPress={() => { setModalVisible(true) }}
                    style={{ backgroundColor: "transparent", paddingLeft: calculateWidthPercentage(16.5) }}
                >
                    <View style={{ alignItems: 'center' }}>
                        <Icon name="person-add-sharp" size={22} color={'black'} />
                        <Text style={{ textAlign: 'center', marginTop: calculateHeightPercentage(-0.5), color: 'black', fontSize: calculateFontSizePercentage(3) }}>Create Advance</Text>
                    </View>
                </TouchableOpacity>
            </View>

            {/* Main Content */}
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0000ff" />
                </View>
            ) : (
                <ScrollView horizontal={true} style={{ marginBottom: calculateHeightPercentage(8.5) }}>
                    <Table>
                        <Row data={['Date', 'Employee', 'Amount', 'Action']} style={{ backgroundColor: '#E1E6F7', }} textStyle={{ margin: calculateHeightPercentage(0.2), fontWeight: '600', fontSize: calculateFontSizePercentage(3.5), color: 'black', textAlign: 'center' }}
                            borderStyle={{ borderColor: "#C1C0B9", borderWidth: calculateWidthPercentage(0.3), }}
                            widthArr={[Date, Name, amount, Shift]}
                        />
                        <FlatList
                            refreshControl={
                                <RefreshControl
                                    refreshing={refresh}
                                    onRefresh={() => { pullMe() }}
                                />
                            }
                            style={{ marginBottom: calculateHeightPercentage(1) }}
                            data={AdvanceData}
                            renderItem={({ item, index }) => (
                                renderProductItem(item, index)
                            )}
                            keyExtractor={(item, index) => index.toString()}
                        />
                    </Table>
                </ScrollView>
            )
            }

            <View style={styles.footer}>
                <Transication_Footer navigation={navigation} />
            </View>

            {/* Create */}
            <Modal
                visible={isModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={handleModalClose}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Create Advance</Text>

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
                            zIndex={2000}
                            scrollViewProps={{ showsVerticalScrollIndicator: true }}
                        />

                        <Text style={styles.label}>Amount</Text>
                        <TextInput
                            style={styles.amountInput}
                            placeholder="Enter amount"
                            keyboardType="numeric"
                            value={amount}
                            onChangeText={setAmount}
                        />

                        <Button title="Submit" onPress={handleSubmit} />

                        <TouchableOpacity onPress={handleModalClose} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Update */}
            <Modal
                visible={isUpdateModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setUpdateModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Update Advance</Text>

                        <Text style={styles.label}>Employee</Text>
                        <TextInput
                            style={styles.amountInput}
                            value={updateAdvanceData.fullname?.Name || ''}
                            editable={false}
                        />

                        <Text style={styles.label}>Amount</Text>
                        <TextInput
                            style={styles.amountInput}
                            placeholder="Enter amount"
                            keyboardType="numeric"
                            value={updatedAmount}
                            onChangeText={setUpdatedAmount}
                        />

                        <Button title="Update" onPress={handleUpdateSubmit} />

                        <TouchableOpacity onPress={() => setUpdateModalVisible(false)} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </GestureHandlerRootView>
    );
};

// define your styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },
    header: {
        alignSelf: 'center',
        marginLeft: calculateWidthPercentage(0.5),
        backgroundColor: "white",
        height: "7%",
        width: '100%',
        alignItems: "center",
        flexDirection: "row",
        borderBottomWidth: 1,
        elevation: 5,
        borderBottomColor: "lightgrey",
        marginBottom: calculateHeightPercentage(0.5),
    },
    footer: {
        position: 'absolute',
        height: "10%",
        alignItems: "center",
        top: calculateHeightPercentage(87),
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        width: calculateWidthPercentage(90),
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: calculateFontSizePercentage(5),
        fontWeight: 'bold',
        marginBottom: 10,
    },
    label: {
        fontSize: calculateFontSizePercentage(4),
        marginTop: calculateHeightPercentage(2),
        color: 'black',
        alignSelf: 'flex-start'
    },
    dropdown: {
        elevation: 2,
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
    amountInput: {
        width: '100%',
        borderWidth: 1,
        borderColor: 'lightgrey',
        borderRadius: 5,
        padding: 10,
        marginTop: 5,
        marginBottom: 20,
        fontSize: calculateFontSizePercentage(4),
    },
    closeButton: {
        marginTop: 20,
        padding: 10,
        backgroundColor: '#ccc',
        borderRadius: 5,
    },
    closeButtonText: {
        fontSize: calculateFontSizePercentage(4),
        color: 'black',
    },
});

export default Advance;
