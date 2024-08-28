import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, RefreshControl, FlatList, Image, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Table, Row } from "react-native-table-component";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Attendance_BaseUrl, Rupioo_Lite_BaseUrl } from '../../../Config/BaseUtil';
import Footer from '../Bottom/Footer';
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

const Dashboard = ({ navigation }) => {
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

    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem('userId');
            navigation.navigate("Login");
        } catch (error) {
            console.error('Error logging out:', error);
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

    const filterDataByMonth = (data) => {
        const startOfMonth = moment().startOf('month');
        const endOfMonth = moment().endOf('month');

        return data.filter(item => {
            const itemDate = moment(item.currentDate);
            return itemDate.isBetween(startOfMonth, endOfMonth, null, '[]');
        });
    };

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

    const renderNestedTable = (data, InnerData) => {
        if (expandedName === data?.Name) {
            const year = moment().year();
            const month = moment().month();

            const daysInMonth = moment().daysInMonth();

            const dates = Array.from({ length: daysInMonth }, (_, i) => moment().date(i + 1).format('DD-MMM-YYYY'));

            // Filter InnerData to include only the current month's data
            const filteredData = filterDataByMonth(InnerData);

            return (
                <View style={styles.nestedTableContainer}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: calculateHeightPercentage(1) }}>
                        <Image
                            source={{ uri: data?.Image }}
                            height={calculateHeightPercentage(8)}
                            width={calculateWidthPercentage(16)}
                            style={{ borderRadius: calculateFontSizePercentage(20), borderWidth: 0.5, borderColor: 'black' }}
                            resizeMethod='resize'
                            resizeMode='cover'
                        />
                        <View>
                            <Text style={{ fontSize: calculateFontSizePercentage(3.5), color: 'black', fontWeight: '600', marginHorizontal: calculateWidthPercentage(4) }}>Name :- {data?.Name || '-'}</Text>
                            <Text style={{ fontSize: calculateFontSizePercentage(3), color: 'black', fontWeight: '400', marginHorizontal: calculateWidthPercentage(4) }}>Contact :- {data?.Contact || '-'}</Text>
                            <Text style={{ fontSize: calculateFontSizePercentage(3), color: 'black', fontWeight: '400', marginHorizontal: calculateWidthPercentage(4) }}>Shift :- {data?.Shift?.shiftName || '-'}</Text>
                        </View>
                    </View>
                    <View style={{ alignSelf: 'center' }}>
                        <Table borderStyle={{
                            borderWidth: 1,
                            borderColor: "black",
                        }}>
                            <Row
                                data={['Date', 'In-Time', 'Out-Time', 'Duration', 'Action']}
                                style={{ backgroundColor: 'lightgrey', height: calculateHeightPercentage(4) }}
                                textStyle={styles.tableText}
                                widthArr={[calculateWidthPercentage(23), calculateWidthPercentage(20), calculateWidthPercentage(20), calculateWidthPercentage(20), calculateWidthPercentage(12)]}
                            />
                            {dates.map((date) => {
                                // Find attendance data for the current date
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
                                        style={{ backgroundColor: 'white', height: calculateHeightPercentage(4) }}
                                        textStyle={styles.tableText}
                                        widthArr={[calculateWidthPercentage(23), calculateWidthPercentage(20), calculateWidthPercentage(20), calculateWidthPercentage(20), calculateWidthPercentage(12)]}
                                    />
                                );
                            })}
                        </Table>
                    </View>
                </View>
            );
        }
        return null;
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

    const pullMe = () => {
        setRefresh(true);
        fetchData();
        setTimeout(() => {
            setRefresh(false);
        }, 1000);
    };

    return (
        <View style={styles.container}>

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTitle}>
                    <Text style={{
                        fontSize: calculateFontSizePercentage(5),
                        alignItems: 'center',
                        fontWeight: "bold",
                        color: 'black',
                    }}>Dashboard</Text>
                </View>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                    <MaterialIcons name="logout" size={23} color={'black'} />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>

            {/* Main Container */}
            <View style={styles.mainContent}>
                {/* Row 1 Buttons */}
                <View style={styles.actionRow}>
                    <TouchableOpacity onPress={() => navigation.navigate("Attendance List")}>
                        <View style={styles.actionCardYellow}>
                            <Text style={styles.actionCardText}>Today</Text>
                            <View style={{ flexDirection: 'row' }}>
                                <Text style={{ fontSize: calculateFontSizePercentage(3), color: 'black', fontWeight: '700' }}>Present</Text>
                                <Text style={{ fontSize: calculateFontSizePercentage(3), color: 'black', fontWeight: '700', marginLeft: calculateWidthPercentage(4) }}>Absent</Text>
                            </View>
                            <View style={{ flexDirection: 'row' }}>
                                <Text style={{ fontSize: calculateFontSizePercentage(3), color: 'black', fontWeight: '700' }}>10</Text>
                                <Text style={{ fontSize: calculateFontSizePercentage(3), color: 'black', fontWeight: '700', marginLeft: calculateWidthPercentage(15) }}>5</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate("Attendance List")}>
                        <View style={styles.actionCardGreen1}>
                            <Text style={styles.actionCardText}>Salary</Text>
                            <View style={{ flexDirection: 'row' }}>
                                <Text style={{ fontSize: calculateFontSizePercentage(3), color: 'black', fontWeight: '700' }}>Till Now</Text>
                                <Text style={{ fontSize: calculateFontSizePercentage(3), color: 'black', fontWeight: '700', marginLeft: calculateWidthPercentage(7) }}>Total</Text>
                            </View>
                            <View style={{ flexDirection: 'row' }}>
                                <Text style={{ fontSize: calculateFontSizePercentage(3), color: 'black', fontWeight: '700' }}>7647</Text>
                                <Text style={{ fontSize: calculateFontSizePercentage(3), color: 'black', fontWeight: '700', marginLeft: calculateWidthPercentage(3) }}>12000</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate("Shift List")}>
                        <View style={styles.actionCardBlue}>
                            <Text style={styles.actionCardText}>Shift</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Row 2 Buttons */}
                <View style={styles.actionRow}>
                    <TouchableOpacity onPress={() => navigation.navigate("Holiday List")}>
                        <View style={styles.actionCardGreen}>
                            <Text style={styles.actionCardText}>Holiday</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate("Leave List")}>
                        <View style={styles.actionCardDarkRed}>
                            <Text style={styles.actionCardText}>Leave</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate("Receipt")}>
                        <View style={styles.actionCardDarkGreen}>
                            <Text style={styles.actionCardText}>Transication</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Table */}
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
        </View >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: 'white',
    },
    header: {
        alignSelf: 'center',
        marginLeft: calculateWidthPercentage(0.5),
        backgroundColor: "white",
        height: calculateHeightPercentage(7),
        width: '100%',
        flexDirection: "row",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "lightgrey",
        elevation: 5,
    },
    headerTitle: {
        width: calculateWidthPercentage(45),
        paddingLeft: '5%',
    },
    headerText: {
        fontSize: calculateFontSizePercentage(3.5),
        padding: calculateFontSizePercentage(1),
        paddingHorizontal: calculateWidthPercentage(1),
        alignItems: 'center',
        fontWeight: "bold",
        color: 'white',
    },
    logoutButton: {
        paddingLeft: calculateWidthPercentage(34),
        alignItems: 'center',
    },
    logoutText: {
        textAlign: 'center',
        marginTop: calculateHeightPercentage(-0.5),
        color: 'black',
    },
    mainContent: {
        flex: 1,
        paddingVertical: calculateHeightPercentage(3),
        backgroundColor: "white",
    },
    actionRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: calculateHeightPercentage(3),
        paddingHorizontal: calculateWidthPercentage(1.5)
    },
    actionCardYellow: {
        height: calculateHeightPercentage(10),
        paddingHorizontal: calculateWidthPercentage(2),
        backgroundColor: "#f2bf66",
        elevation: 5,
        borderRadius: 5,
        alignItems: "center",
    },
    actionCardGreen1: {
        height: calculateHeightPercentage(10),
        paddingHorizontal: calculateWidthPercentage(2),
        backgroundColor: "#048c16",
        elevation: 5,
        borderRadius: 5,
        alignItems: "center",
    },
    actionCardBlue: {
        height: calculateHeightPercentage(10),
        width: calculateWidthPercentage(30),
        backgroundColor: "#68c3f7",
        elevation: 5,
        borderRadius: 5,
        alignItems: "center",
        justifyContent: "center",
    },
    actionCardGreen: {
        height: calculateHeightPercentage(10),
        width: calculateWidthPercentage(30),
        backgroundColor: "#e1fa7d",
        elevation: 5,
        borderRadius: 5,
        alignItems: "center",
        justifyContent: "center",
    },
    actionCardDarkGreen: {
        height: calculateHeightPercentage(10),
        width: calculateWidthPercentage(30),
        backgroundColor: "#7ad169",
        elevation: 5,
        borderRadius: 5,
        alignItems: "center",
        justifyContent: "center",
    },
    actionCardDarkRed: {
        height: calculateHeightPercentage(10),
        width: calculateWidthPercentage(30),
        backgroundColor: "#fc0313",
        elevation: 5,
        borderRadius: 5,
        alignItems: "center",
        justifyContent: "center",
    },
    actionCardText: {
        fontSize: calculateFontSizePercentage(3),
        fontWeight: "bold",
        textAlign: "center",
        color: 'black',
        marginTop: calculateHeightPercentage(1)
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
    },
    tableRow: {
        backgroundColor: 'white',
        paddingVertical: calculateHeightPercentage(0.1),
    },
    tableText: {
        fontSize: calculateFontSizePercentage(3),
        textAlign: 'center',
        color: 'black',
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
    nestedTableWidths: [calculateWidthPercentage(24), calculateWidthPercentage(24), calculateWidthPercentage(24), calculateWidthPercentage(24),],
    tableWidths: [calculateWidthPercentage(20), calculateWidthPercentage(21), calculateWidthPercentage(19), calculateWidthPercentage(19), calculateWidthPercentage(19)],
    nestedtableWidths: [calculateWidthPercentage(20), calculateWidthPercentage(18), calculateWidthPercentage(19), calculateWidthPercentage(20), calculateWidthPercentage(18)],
    footer: {
        position: 'absolute',
        paddingTop:calculateHeightPercentage(88),
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

export default Dashboard;
