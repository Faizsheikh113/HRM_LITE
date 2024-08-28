// Import libraries
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView, FlatList, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Table, Row } from "react-native-table-component";
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import axios from 'axios';
import Footer from '../../Bottom/Footer';
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

// Create a component
const HolidayList = ({ navigation }) => {
    const [HolidayListData, setHolidayListData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refresh, setRefresh] = useState(false);
    const [Id, setId] = useState('');

    // Function to get Sundays by month
    const getSundaysByMonth = (year) => {
        const sundaysByMonth = {};
        for (let month = 0; month < 12; month++) {
            sundaysByMonth[month] = [];
            let date = new Date(year, month, 1);

            while (date.getMonth() === month) {
                if (date.getDay() === 0) {
                    sundaysByMonth[month].push(new Date(date));
                }
                date.setDate(date.getDate() + 1);
            }
        }
        return sundaysByMonth;
    };

    // Function to generate holiday data from Sundays
    const generateHolidayData = (year, sundaysByMonth) => {
        const holidayData = [];
        Object.keys(sundaysByMonth).forEach(monthIndex => {
            sundaysByMonth[monthIndex].forEach(sunday => {
                holidayData.push({
                    userId: Id,
                    HolidayName: "Sunday",
                    Month: sunday.getMonth() + 1,
                    Day: sunday.getDate(),
                    Year: sunday.getFullYear(),
                });
            });
        });

        return holidayData;
    };

    const GetHolidayList = useCallback(async () => {
        try {
            const id = await AsyncStorage.getItem('userId');
            setId(id);
            const response = await axios.get(`${Rupioo_Lite_BaseUrl}holiday/view-holiday-user/${id}`);
            setHolidayListData(response?.data?.Holiday || []);
        } catch (err) {
            console.log(err);
        } finally {
            setIsLoading(false);
        }
    }, [setHolidayListData, setIsLoading]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            GetHolidayList();
        });
        return () => {
            unsubscribe;
        };
    }, [navigation, GetHolidayList]);

    const pullMe = () => {
        setRefresh(true);
        GetHolidayList();
        setTimeout(() => {
            setRefresh(false);
        }, 1000);
    }

    const goToEdit = async (data) => {
        await AsyncStorage.setItem("HolidayData", JSON.stringify(data));
        navigation.navigate('Edit Holiday');
    }

    const DeleteHoliday = async (data) => {
        await axios.delete(`${Rupioo_Lite_BaseUrl}holiday/delete-holiday/${data._id}`)
            .then((res) => {
                Alert.alert("Successful", res?.data?.message);
                GetHolidayList();
            })
            .catch((err) => {
                Alert.alert("Error", err?.response?.data);
            });
    }

    const handleSendHolidayData = async () => {
        try {
            const year = new Date().getFullYear();
            let holidayData = generateHolidayData(year, sundaysByMonth);
            let Holidays = holidayData;
            // Send data to the backend
            await axios.post(`${Rupioo_Lite_BaseUrl}holiday/save-holiday-multipe`, { Holidays: Holidays })
                .then((res) => {
                    console.log(res.data);
                    // Alert.alert("Successful", res?.data?.message);
                })
                .catch((err) => {
                    console.log(err);
                    // Alert.alert("Error", err?.response?.data);
                })
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to send holiday data.");
        }
    };

    const renderHolidayItem = useCallback((item, index) => {
        const HolidayNameWidth = calculateWidthPercentage(35);
        const HolidayMonthWidth = calculateWidthPercentage(16);
        const HolidayDayWidth = calculateWidthPercentage(14);
        const HolidayYearWidth = calculateWidthPercentage(16);
        const HolidayActions = calculateWidthPercentage(18);

        return (
            <ScrollView horizontal={true}>
                <Table style={{ borderWidth: 1, borderColor: "#C1C0B9" }}>
                    <Row
                        key={index}
                        data={[
                            item?.HolidayName?.toUpperCase(),
                            item?.Month,
                            item?.Day,
                            item?.Year,
                            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                                <TouchableOpacity onPress={() => goToEdit(item)}>
                                    <AntDesign name={'edit'} size={20} color={'black'} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => DeleteHoliday(item)}>
                                    <MaterialCommunityIcons name={'delete-outline'} size={20} color={'black'} />
                                </TouchableOpacity>
                            </View>
                        ]}
                        style={[{ backgroundColor: "#E7E6E1" }, index % 2 && { backgroundColor: "#F7F6E7" }]}
                        textStyle={{ fontSize: calculateFontSizePercentage(3.2), textAlign: 'center', color: 'black', height: calculateHeightPercentage(3), paddingHorizontal: calculateWidthPercentage(1), marginTop: calculateHeightPercentage(1) }}
                        widthArr={[HolidayNameWidth, HolidayMonthWidth, HolidayDayWidth, HolidayYearWidth, HolidayActions]}
                    />
                </Table>
            </ScrollView>
        );
    }, []);

    // Get current year's Sundays
    const year = new Date().getFullYear();
    const sundaysByMonth = getSundaysByMonth(year);

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => { navigation.goBack() }}
                    style={{ backgroundColor: "transparent", paddingLeft: calculateWidthPercentage(4) }}
                >
                    <Icon name="arrow-back" size={25} color={'black'} />
                </TouchableOpacity>

                <View style={{ height: "100%", width: calculateWidthPercentage(45), display: "flex", paddingLeft: '5%', justifyContent: "center" }}>
                    <Text style={{ fontSize: calculateFontSizePercentage(5), fontWeight: "bold", color: 'black' }}>Holiday</Text>
                </View>


                <TouchableOpacity
                    onPress={() => { GetHolidayList() }}
                    style={{ backgroundColor: "transparent", paddingLeft: calculateWidthPercentage(0), marginTop: calculateHeightPercentage(0.5) }}
                >
                    <View style={{ alignItems: 'center' }}>
                        <AntDesign name="calendar" size={20} color={'black'} />
                        <Text style={{ textAlign: 'center', marginTop: calculateHeightPercentage(-0.2), color: 'black', fontSize: calculateFontSizePercentage(3) }}>Get Sunday</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => { navigation.navigate('Create Holiday') }}
                    style={{ backgroundColor: "transparent", paddingLeft: calculateWidthPercentage(5), marginTop: calculateHeightPercentage(0.5) }}
                >
                    <View style={{ alignItems: 'center' }}>
                        <AntDesign name="pluscircleo" size={20} color={'black'} />
                        <Text style={{ textAlign: 'center', marginTop: calculateHeightPercentage(-0.2), color: 'black', fontSize: calculateFontSizePercentage(3) }}>New Holiday</Text>
                    </View>
                </TouchableOpacity>
            </View>

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
                                data={['Holiday Name', 'Month', 'Day', 'Year', 'Actions']}
                                style={styles.tableHeader}
                                textStyle={styles.tableHeaderText}
                                widthArr={[calculateWidthPercentage(35), calculateWidthPercentage(16), calculateWidthPercentage(14), calculateWidthPercentage(16), calculateWidthPercentage(18)]}
                            />
                            <FlatList
                                refreshControl={
                                    <RefreshControl refreshing={refresh} onRefresh={() => { pullMe() }} />
                                }
                                style={{ marginBottom: calculateHeightPercentage(9) }}
                                data={HolidayListData}
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tableContainer: {
        marginBottom: calculateHeightPercentage(8.5),
    },
    tableTitle: {
        fontSize: calculateFontSizePercentage(5),
        fontWeight: 'bold',
        marginVertical: calculateHeightPercentage(1),
        textAlign: 'center',
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
    tableText: {
        fontSize: calculateFontSizePercentage(3.2),
        textAlign: 'center',
        color: 'black',
        height: calculateHeightPercentage(3),
        paddingHorizontal: calculateWidthPercentage(1),
    },
    sendButton: {
        backgroundColor: '#4CAF50',
        width: calculateWidthPercentage(25),
        padding: calculateHeightPercentage(1),
        borderRadius: calculateHeightPercentage(0.5),
        alignItems: 'center',
        marginTop: calculateHeightPercentage(2),
    },
    sendButtonText: {
        color: 'white',
        fontSize: calculateFontSizePercentage(3.5),
        alignItems: 'center',
        textAlign: 'center'
    },
});

export default HolidayList;
