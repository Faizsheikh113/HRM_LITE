import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, RefreshControl, FlatList, Image, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Table, Row } from "react-native-table-component";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Attendance_BaseUrl, Rupioo_Lite_BaseUrl } from '../../../../Config/BaseUtil';
import Footer from '../../Bottom/Footer';
import moment from 'moment';
import { DateTimePickerModal } from 'react-native-modal-datetime-picker';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const calculateHeightPercentage = (percentage) => (windowHeight * percentage) / 100;
const calculateWidthPercentage = (percentage) => (windowWidth * percentage) / 100;
const calculateFontSizePercentage = (percentage) => {
    const baseDimension = Math.min(windowWidth, windowHeight);
    return (baseDimension * percentage) / 100;
};
// create a component
const PrevAttendance = ({ navigation }) => {
    const [leadData, setLeadData] = useState([]);
    const [InnerData, setInnerData] = useState([]);
    const [refresh, setRefresh] = useState(false);
    const [IsLoading, setIsLoading] = useState(false);
    const [expandedName, setExpandedName] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Edit State
    const [editData, setEditData] = useState('');
    const [isModalVisible, setModalVisible] = useState(false);
    const [ViewInTime, setViewInTime] = useState('');
    const [ViewOutTime, setViewOutTime] = useState('');
    const [editInTime, setEditInTime] = useState('');
    const [editOutTime, setEditOutTime] = useState('');
    const [isInTimePickerVisible, setInTimePickerVisibility] = useState(false);
    const [isOutTimePickerVisible, setOutTimePickerVisibility] = useState(false);


    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const id = await AsyncStorage.getItem('userId');
            if (!id) return;

            let leadResponse = await axios.get(`${Rupioo_Lite_BaseUrl}empoloyee/view-employee-userId/${id}`)
                .catch((error) => {
                    console.error('Error fetching lead data:', error);
                    return null;
                });

            let attendanceResponse = await axios.get(`${Attendance_BaseUrl}/api/attendanceAws/${id}`)
                .catch((error) => {
                    console.error('Error fetching attendance data:', error);
                    return null;
                });

            let employee = leadResponse?.data?.Employee || [];
            let Attendace = attendanceResponse?.data?.Attendance || [];
            employee.forEach((ele) => {
                ele["today"] = new Date(new Date());
                Attendace.forEach((Data) => {
                    if (ele?._id == Data?.userId) {
                        ele["attandance"] = Data;
                    }
                });
            });

            console.log("@@@@@@@ :- ", employee);
            console.log("Attendace :- ", Attendace);
            setLeadData(employee);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', fetchData);
        return unsubscribe;
    }, [navigation, fetchData]);

    const handleExpand = async (item) => {
        console.log(item._id);
        if (expandedName === item?.Name) {
            setExpandedName(null);
            setAttendanceData({});
        } else {
            setExpandedName(item?.Name);
            try {
                const response = await axios.get(`${Attendance_BaseUrl}/api/attendanceAwsById/${item._id}`);
                console.log("Inner Attendance Respinse L:- ", response?.data?.Attendance);
                setInnerData(response?.data?.Attendance)
            } catch (err) {
                console.log(err?.response?.data);
            }
        }
    };

    const calculateDynamicDuration = (intime, outtime) => {
        const intimeMoment = moment(intime, "HH:mm, A");
        const now = moment(currentTime);

        if (outtime && intime) {
            const outtimeMoment = moment(outtime, "HH:mm, A");
            let duration = moment.duration(outtimeMoment.diff(intimeMoment));
            return `${duration.hours()}h ${duration.minutes()}m`;
        } else {
            return 'N/A';
        }
    };

    const filterDataByMonth = (data, monthOffset = 0) => {
        const startOfMonth = moment().subtract(monthOffset, 'months').startOf('month');
        const endOfMonth = moment().subtract(monthOffset, 'months').endOf('month');

        return data.filter(item => {
            const itemDate = moment(item.currentDate);
            return itemDate.isBetween(startOfMonth, endOfMonth, null, '[]');
        });
    };

    const renderNestedTable = (data, InnerData) => {
        if (expandedName === data?.Name) {
            // Get current month and previous month for filtering
            const currentMonth = moment().month(); // Current month
            const previousMonth = moment().subtract(1, 'months').month(); // Previous month

            // Filter data
            const currentMonthData = filterDataByMonth(InnerData);
            const previousMonthData = filterDataByMonth(InnerData, 1);

            return (
                <View style={styles.nestedTableContainer}>
                    <Text style={styles.monthHeader}>Current Month</Text>
                    <Table borderStyle={styles.tableBorder}>
                        <Row
                            data={['Date', 'In-Time', 'Out-Time', 'Duration', 'Action']}
                            style={styles.tableHeader}
                            textStyle={{
                                fontSize: calculateFontSizePercentage(3.2),
                                textAlign: 'center',
                                color: 'white',
                            }}
                            widthArr={styles.nestedtableWidths}
                        />
                        {renderTableRows(currentMonthData, currentMonth)}
                    </Table>

                    <Text style={styles.monthHeader}>Previous Month</Text>
                    <Table borderStyle={styles.tableBorder}>
                        <Row
                            data={['Date', 'In-Time', 'Out-Time', 'Duration', 'Action']}
                            style={styles.tableHeader}
                            textStyle={{
                                fontSize: calculateFontSizePercentage(3.2),
                                textAlign: 'center',
                                color: 'white',
                            }}
                            widthArr={styles.nestedtableWidths}
                        />
                        {renderTableRows(previousMonthData, previousMonth)}
                    </Table>
                </View>
            );
        }
        return null;
    };

    // Helper function to render table rows
    const renderTableRows = (filteredData, month) => {
        const dates = getDatesForMonth(month);

        return dates.map((date) => {
            const attendance = filteredData.find(item => moment(item.currentDate).format('DD-MMM-YYYY') === date);
            return (
                <Row
                    key={date}
                    data={[
                        date,
                        attendance?.intime ? moment(attendance?.intime, 'hh:mm').format('hh:mm A') : '-',
                        attendance?.outtime && attendance?.outtime.length > 0 ? moment(attendance?.outtime, 'hh:mm').format('hh:mm A') : '-',
                        calculateDynamicDuration(attendance?.intime.join(', '), attendance?.outtime.join(', ')),
                        <TouchableOpacity style={{ alignItems: 'center' }}
                            onPress={() => handleEditOpenModal(attendance)}>
                            <MaterialCommunityIcons name='calendar-edit' size={18} color='black' />
                        </TouchableOpacity>
                    ]}
                    style={styles.tableRow}
                    textStyle={styles.tableText}
                    widthArr={styles.nestedtableWidths}
                />
            );
        });
    };

    // Helper function to get dates for a month
    const getDatesForMonth = (month) => {
        const startOfMonth = moment().month(month).startOf('month');
        const daysInMonth = moment(startOfMonth).daysInMonth();
        return Array.from({ length: daysInMonth }, (_, i) => moment(startOfMonth).date(i + 1).format('DD-MMM-YYYY'));
    };

    const renderProductItem = ({ item, index }) => {
        const formattedDate = moment(new Date()).format("DD-MMM-YYYY");
        console.log("Selected Item ;-", item);
        return (
            // <ScrollView horizontal>
            <View style={styles.tableContainer}>
                <Table borderStyle={styles.tableBorder}>
                    <Row
                        data={[
                            <TouchableOpacity
                                style={styles.nameCell}
                                onPress={() => handleExpand(item)}
                            >
                                <Text style={styles.nameText}>{item?.Name?.toUpperCase()}</Text>
                            </TouchableOpacity>,

                            <Text style={{ fontSize: calculateFontSizePercentage(2.8), color: 'black', textAlign: 'center' }}>{formattedDate}</Text>,

                            item?.attandance?.intime ? moment(item?.attandance?.intime, 'hh:mm').format('hh:mm A') : '-',

                            <Text style={{ fontSize: calculateFontSizePercentage(2.8), color: 'black', textAlign: 'center' }}>{item?.attandance?.outtime && item?.attandance?.outtime.length > 0 ? moment(item?.attandance?.outtime, 'hh:mm').format('hh:mm A') : '-'
                            }</Text>,

                            calculateDynamicDuration(item?.attandance?.intime.join(', '), item?.attandance?.outtime.join(', ')),

                        ]}
                        style={[styles.tableRow, { backgroundColor: index % 2 === 0 ? "white" : "#f2f2f2" }]}
                        textStyle={styles.tableText}
                        widthArr={styles.tableWidths}
                    />
                </Table>
                {renderNestedTable(item, InnerData)}
            </View>
            // </ScrollView>
        );
    };


    // Edit data
    const handleEditOpenModal = (data) => {
        setModalVisible(true)
        setEditData(data);
        setViewInTime(data?.intime[0]);
        setViewOutTime(data?.outtime[0]);
    }

    const submitEdit = async () => {
        console.log(editData);
        console.log("in-time :- ", editInTime ? editInTime : ViewInTime)
        console.log("Out-time :- ", editOutTime ? editOutTime : ViewOutTime)
        await axios.put(`${Attendance_BaseUrl}/api/attendanceAwsUpdate/${editData?._id}`, {
            intime: editInTime ? editInTime : ViewInTime,
            outtime: editOutTime ? editOutTime : ViewOutTime
        })
            .then((res) => {
                console.log(res.data);
                Alert.alert("Successfull...", res.data.message);
                fetchData();
                setModalVisible(false);
                Location.reload()
            })
            .catch((err) => {
                console.log(err?.response?.data)
                Alert.alert("Error...", err?.response?.data?.messsage);
            })

    }
    const showTimePicker = (field) => {
        if (field === 'In') {
            setInTimePickerVisibility(true);
        } else if (field === 'Out') {
            setOutTimePickerVisibility(true);
        }
    };

    const hideTimePicker = () => {
        setInTimePickerVisibility(false);
        setOutTimePickerVisibility(false);
    };

    const handleConfirm = (time, field) => {
        console.log("A time has been picked: ", time);
        if (field === 'In') {
            setEditInTime(moment(time).format('hh:mm:ss A'));
        } else if (field === 'Out') {
            setEditOutTime(moment(time).format('hh:mm:ss A'));
        }
        hideTimePicker();
    };

    const pullMe = () => {
        setRefresh(true);
        fetchData();
        setTimeout(() => {
            setRefresh(false);
        }, 1000);
    };
    return (
        <View style={styles.container}>
            <View style={styles.Maincontainer}>
                {IsLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#0000ff" />
                    </View>
                ) : (
                    <ScrollView style={{ marginBottom: calculateHeightPercentage(6.5) }}>
                        <View style={styles.tableContainer}>
                            <Table style={styles.tableBorder}>
                                <Row
                                    data={[
                                        <Text style={{ color: 'white', fontWeight: '700', marginLeft: calculateWidthPercentage(5), fontSize: calculateFontSizePercentage(3.5) }}>Name</Text>,
                                        <Text style={{ color: 'white', fontWeight: '700', marginLeft: calculateWidthPercentage(5), fontSize: calculateFontSizePercentage(3.5) }}>Date</Text>,
                                        <Text style={{ color: 'white', fontWeight: '700', marginLeft: calculateWidthPercentage(4), fontSize: calculateFontSizePercentage(3.5) }}>In-Time</Text>,
                                        <Text style={{ color: 'white', fontWeight: '700', marginLeft: calculateWidthPercentage(3), fontSize: calculateFontSizePercentage(3.5) }}>Out-Time</Text>,
                                        <Text style={{ color: 'white', fontWeight: '700', marginLeft: calculateWidthPercentage(3), fontSize: calculateFontSizePercentage(3.5) }}>Duration</Text>,
                                    ]}
                                    style={styles.tableHeader}
                                    textStyle={styles.headerText}
                                    widthArr={[calculateWidthPercentage(20), calculateWidthPercentage(18), calculateWidthPercentage(20), calculateWidthPercentage(21), calculateWidthPercentage(20)]}
                                />
                                <FlatList
                                    data={leadData}
                                    style={{ marginBottom: calculateHeightPercentage(10) }}
                                    renderItem={renderProductItem}
                                    keyExtractor={(item, index) => index.toString()}
                                    refreshControl={
                                        <RefreshControl refreshing={refresh} onRefresh={pullMe} />
                                    }
                                />
                            </Table>
                        </View>
                    </ScrollView>
                )}
            </View>
            {/* Footer */}
            <View style={styles.footer}>
                <Footer navigation={navigation} />
            </View>

            {/* Modal for Edit attendance time */}
            <Modal
                animationType='none'
                transparent={true}
                visible={isModalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>

                        {/* Close Button  */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: calculateHeightPercentage(-2), marginBottom: calculateHeightPercentage(2) }}>
                            <Text style={{ color: 'black' }}>Attendance Edit</Text>
                            <TouchableOpacity
                                onPress={() => {
                                    setModalVisible(false);
                                    setEditInTime('');
                                    setEditOutTime('');
                                }
                                }
                                style={styles.modalCloseButton}
                            >
                                <Icon name='close' size={20} color={'gray'} />
                            </TouchableOpacity>
                        </View>
                        {/* LockPassword input */}

                        <View style={{ flexDirection: 'row' }}>
                            <Text style={{ color: 'black', marginLeft: calculateWidthPercentage(0.5) }}>In-Time</Text>
                            <Text style={{ color: 'black', marginLeft: calculateWidthPercentage(28) }}>Out-Time</Text>
                        </View>

                        <View style={{ flex: 1, flexDirection: 'row' }}>
                            <TouchableOpacity
                                style={styles.modalinput}
                                onPress={() => showTimePicker('In')}
                            >
                                <Text style={{ color: 'black' }}>
                                    {editInTime ? editInTime : ViewInTime}
                                    {/* {ViewInTime} */}
                                </Text>
                            </TouchableOpacity>
                            <DateTimePickerModal
                                isVisible={isInTimePickerVisible}
                                mode="time"
                                is24Hour={false}
                                onConfirm={(time) => handleConfirm(time, 'In')}
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

                            <TouchableOpacity
                                style={styles.modalinput}
                                onPress={() => showTimePicker('Out')}
                            >
                                <Text style={{ color: 'black' }}>
                                    {editOutTime ? editOutTime : ViewOutTime}
                                </Text>
                            </TouchableOpacity>
                            <DateTimePickerModal
                                isVisible={isOutTimePickerVisible}
                                mode="time"
                                is24Hour={false}
                                onConfirm={(time) => handleConfirm(time, 'Out')}
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
                        </View>

                        <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: calculateHeightPercentage(3) }}>
                            <TouchableOpacity
                                onPress={submitEdit}
                                style={{ height: calculateHeightPercentage(5), width: calculateWidthPercentage(30), backgroundColor: 'blue', borderRadius: calculateFontSizePercentage(1), marginTop: calculateHeightPercentage(-3), }}
                            >
                                <Text style={{ textAlign: 'center', paddingVertical: calculateHeightPercentage(1.2), color: 'white' }}>Done</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

// define your styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: "white",
    },
    Maincontainer: {
        flex: 1,
        paddingVertical: calculateHeightPercentage(3),
        backgroundColor: "white",
    },
    tableContainer: {
        borderRadius: calculateFontSizePercentage(2),
        overflow: 'hidden',
    },
    tableBorder: {
        borderWidth: 1,
        borderColor: "black",
    },
    tableHeader: {
        backgroundColor: 'blue',
        color: 'white',
    },
    tableRow: {
        backgroundColor: 'white',
        paddingVertical: calculateHeightPercentage(0.1),
    },
    tableText: {
        fontSize: calculateFontSizePercentage(3),
        textAlign: 'center',
        color: 'black',
        // color:'white'
    },
    nameCell: {
        alignItems: 'center',
    },
    nameText: {
        fontSize: calculateFontSizePercentage(3),
        color: 'blue',
        textAlign: 'center',
    },
    timeText: {
        fontSize: calculateFontSizePercentage(2.5),
        textAlign: 'center',
        color: 'black',
    },
    nestedTableContainer: {
        paddingVertical: calculateHeightPercentage(0.5),
    },
    nestedTableWidths: [calculateWidthPercentage(25), calculateWidthPercentage(24), calculateWidthPercentage(24), calculateWidthPercentage(24),],
    tableWidths: [calculateWidthPercentage(20), calculateWidthPercentage(21), calculateWidthPercentage(19), calculateWidthPercentage(19), calculateWidthPercentage(19)],
    nestedtableWidths: [calculateWidthPercentage(24), calculateWidthPercentage(18), calculateWidthPercentage(19), calculateWidthPercentage(20), calculateWidthPercentage(18)],
    monthHeader: {
        fontSize: calculateFontSizePercentage(4),
        fontWeight: '700',
        color: 'black',
        marginVertical: calculateHeightPercentage(0.5),
        textAlign: 'center',
    },
    footer: {
        position: 'absolute',
        bottom: -348,
        height: "10%",
        width: '100%',
        alignItems: "center",
        justifyContent: 'center',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: calculateWidthPercentage(5),
    },
    modalContent: {
        paddingHorizontal: calculateWidthPercentage(5),
        height: calculateHeightPercentage(30),
        backgroundColor: 'white',
        opacity: 1,
        padding: calculateFontSizePercentage(10),
        borderRadius: 10,
        elevation: 5,
    },
    modalCloseButton: {
        marginTop: calculateHeightPercentage(-4),
        borderRadius: 5,
        alignSelf: 'flex-end',
    },
    modalinput: {
        width: calculateWidthPercentage(38),
        height: calculateHeightPercentage(6),
        paddingHorizontal: calculateWidthPercentage(3),
        backgroundColor: '#f0f0f0',
        borderRadius: calculateFontSizePercentage(1),
        borderWidth: 1,
        borderColor: '#e0e0e5',
        justifyContent: 'center',
        marginRight: calculateWidthPercentage(5),
        marginBottom: calculateHeightPercentage(4),
        marginTop: calculateHeightPercentage(0.5)
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

//make this component available to the app
export default PrevAttendance;
