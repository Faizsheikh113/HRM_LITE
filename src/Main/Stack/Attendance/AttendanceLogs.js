// Import libraries
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView, FlatList, RefreshControl, ActivityIndicator, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Table, Row } from "react-native-table-component";
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import axios from 'axios';
import Footer from '../../Bottom/Footer';
import { Attendance_BaseUrl, Rupioo_Lite_BaseUrl } from '../../../../Config/BaseUtil';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const calculateHeightPercentage = (percentage) => (windowHeight * percentage) / 100;
const calculateWidthPercentage = (percentage) => (windowWidth * percentage) / 100;
const calculateFontSizePercentage = (percentage) => {
    const baseDimension = Math.min(windowWidth, windowHeight);
    return (baseDimension * percentage) / 100;
};

// Create a component
const LogList = ({ navigation }) => {
    const [LogListData, setLogListData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refresh, setRefresh] = useState(false);
    const [Id, setId] = useState('');

    const GetLogList = useCallback(async () => {
        try {
            const id = await AsyncStorage.getItem('userId');
            setId(id);
            const response = await axios.get(`${Attendance_BaseUrl}/api/logsAttendance/${id}`);
            console.log("Logs Data ;- ", response?.data?.Attendance);
            setLogListData(response?.data?.Attendance || []);
        } catch (err) {
            console.log(err);
        } finally {
            setIsLoading(false);
        }
    }, [setLogListData, setIsLoading]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            GetLogList();
        });
        return () => {
            unsubscribe;
        };
    }, [navigation, GetLogList]);

    const pullMe = () => {
        setRefresh(true);
        GetLogList();
        setTimeout(() => {
            setRefresh(false);
        }, 1000);
    }

    const DeleteLogs = async (data) => {
        console.log(data?._id);
        await axios.delete(`${Attendance_BaseUrl}/api/logsAttendance/${data._id}`)
            .then((res) => {
                Alert.alert("Successful", res?.data?.message);
                GetLogList();
            })
            .catch((err) => {
                console.log(err)
                Alert.alert("Error", err?.response?.data);
            });
    }

    const renderHolidayItem = useCallback((item, index) => {
        const LogImage = calculateWidthPercentage(35);
        const LogDate = calculateWidthPercentage(25);
        const LogTime = calculateWidthPercentage(20);
        const Acrion = calculateWidthPercentage(20);
        return (
            <ScrollView horizontal={true}>
                <Table borderStyle={{ borderWidth: 1, borderColor: "#C1C0B9" }}>
                    <Row
                        key={index}
                        data={[
                            item.image ? <Image source={{ uri: item?.image }} style={{ height: calculateHeightPercentage(12), width: calculateWidthPercentage(33), alignSelf: 'center', borderRadius: calculateFontSizePercentage(2) }} resizeMode='stretch' /> : <Text style={{ color: 'gray', textAlign: 'center', fontSize: calculateFontSizePercentage(3.5) }}>No image present...!</Text>,
                            moment(item?.currentDate).format("DD-MMM-YYYY"),
                            moment(item?.currentTime, 'hh:mm').format('hh:mm A'),
                            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                                <TouchableOpacity onPress={() => DeleteLogs(item)}>
                                    <MaterialCommunityIcons name={'delete-outline'} size={30} color={'red'} />
                                </TouchableOpacity>
                            </View>
                        ]}
                        style={[{ backgroundColor: "#E7E6E1" }, index % 2 && { backgroundColor: "#F7F6E7" }]}
                        textStyle={{ fontSize: calculateFontSizePercentage(3.2), textAlign: 'center', color: 'black', height: calculateHeightPercentage(3), paddingHorizontal: calculateWidthPercentage(1), marginTop: calculateHeightPercentage(1) }}
                        widthArr={[LogImage, LogDate, LogTime, Acrion]}
                    />
                </Table>
            </ScrollView>
        );
    }, []);

    return (
        <SafeAreaView style={styles.container}>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0000ff" />
                </View>
            ) : (
                <>
                    {/* Holiday List */}
                    <View style={styles.tableContainer}>
                        <Table style={{ borderWidth: 1, borderColor: "#C1C0B9" }}>
                            <Row
                                data={['Image', 'Date', 'Time', 'Actions']}
                                style={styles.tableHeader}
                                textStyle={styles.tableHeaderText}
                                widthArr={[calculateWidthPercentage(35), calculateWidthPercentage(25), calculateWidthPercentage(20), calculateWidthPercentage(20)]}
                            />
                            <FlatList
                                refreshControl={
                                    <RefreshControl refreshing={refresh} onRefresh={() => { pullMe() }} />
                                }
                                style={{ marginBottom: calculateHeightPercentage(1.5) }}
                                data={LogListData}
                                // style={{paddingVertical:calculateHeightPercentage(10)}}
                                renderItem={({ item, index }) => renderHolidayItem(item, index)}
                                keyExtractor={(item, index) => index.toString()}
                            />
                        </Table>
                    </View>
                </>
            )}

            <View style={styles.footer}>
                <Footer navigation={navigation} />
            </View>
        </SafeAreaView>
    );
};

// Define your styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },
    footer: {
        position: 'absolute',
        height: "10%",
        alignItems: "center",
        top: calculateHeightPercentage(79),
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tableContainer: {
        marginBottom: calculateHeightPercentage(8.5),
    },
    tableHeader: {
        backgroundColor: '#E1E6F7',
    },
    tableHeaderText: {
        margin: calculateHeightPercentage(0.2),
        fontWeight: '600',
        fontSize: calculateFontSizePercentage(4),
        color: 'black',
        textAlign: 'center',
    },

});

export default LogList;
