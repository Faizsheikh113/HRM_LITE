//import liraries
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView, FlatList, RefreshControl, ActivityIndicator, Linking, Button, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Table, Row } from "react-native-table-component";
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import axios from 'axios';
import Footer from '../../Bottom/Footer';
import { Rupioo_Lite_BaseUrl } from '../../../../Config/BaseUtil';
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
// create a component
const ManageLeaveList = ({ navigation }) => {
    const [ManageLeaveListData, setManageLeaveListData] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [refresh, setRefresh] = useState(false);

    const GetManageLeaveList = useCallback(async () => {
        try {
            const id = await AsyncStorage.getItem('userId');
            console.log(id);
            const response = await axios.get(`${Rupioo_Lite_BaseUrl}leave-manage/view-manage-leave-user/${id}`);
            console.log(response?.data?.Leave);
            setManageLeaveListData(response?.data?.Leave || []);
        } catch (err) {
            console.log(err);
        } finally {
            setIsLoading(false);
        }
    }, [setManageLeaveListData, setIsLoading]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            GetManageLeaveList();
        });
        return () => {
            unsubscribe;
        };
    }, [navigation, GetManageLeaveList]);

    const pullMe = () => {
        setRefresh(true);
        GetManageLeaveList();
        setTimeout(() => {
            setRefresh(false);
        }, 1000)
    }

    const goToEdit = async (data) => {
        data.StartDate = moment(data?.StartDate).format('MM-DD-YYYY');
        data.EndDate = moment(data?.EndDate).format('MM-DD-YYYY');
        console.log("datadatadata",data);
        AsyncStorage.setItem("ManageLeaveData", JSON.stringify(data))
        navigation.navigate('Edit Manage Leave');
    }

    const DeleteHoliday = async (data) => {
        console.log(data);
        await axios.delete(`${Rupioo_Lite_BaseUrl}leave-manage/delete-manage-leave/${data._id}`)
            .then((res) => {
                console.log(res?.data);
                Alert.alert("Successfull...", res?.data?.message)
                GetManageLeaveList();
            })
            .catch((err) => {
                console.log(err);
                Alert.alert("Successfull...", err?.response?.data)
            })
    }

    const renderProductItem = useCallback((item, index) => {
        const EmployeeName = calculateWidthPercentage(25);
        const LeaveType = calculateWidthPercentage(28);
        const StartDate = calculateWidthPercentage(22);
        const EndDate = calculateWidthPercentage(22);
        const Days = calculateWidthPercentage(15);
        const Status = calculateWidthPercentage(16);
        const Action = calculateWidthPercentage(20);
        return (
            <ScrollView horizontal={true}>
                <Table borderStyle={{ borderWidth: 1, borderColor: "#C1C0B9" }}>
                    <Row
                        key={index}
                        data={[
                            item?.Employee?.Name.toUpperCase(),
                            item?.LeaveType?.toUpperCase(),
                            moment(item?.StartDate).format('MM-DD-YYYY'),
                            moment(item?.EndDate).format('MM-DD-YYYY'),
                            item?.TotalDays,
                            item?.CheckStatus,
                            <View style={{
                                flexDirection: 'row', justifyContent: 'space-around'
                            }}>
                                <TouchableOpacity onPress={() => goToEdit(item)}>
                                    <AntDesign name={'edit'} size={20} color={'black'} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => DeleteHoliday(item)} style={{marginRight:calculateWidthPercentage(2.5)}}>
                                    <MaterialCommunityIcons name={'delete-outline'} size={20} color={'black'} />
                                </TouchableOpacity>
                            </View>
                        ]}
                        style={[{ backgroundColor: "#E7E6E1", }, index % 2 && { backgroundColor: "#F7F6E7" }]}
                        textStyle={{ fontSize: calculateFontSizePercentage(3.2), textAlign: 'center', color: 'black', padding: calculateHeightPercentage(0.5), paddingHorizontal: calculateWidthPercentage(0.5), marginTop: calculateHeightPercentage(1) }}
                        widthArr={[EmployeeName, LeaveType, StartDate, EndDate, Days, Status, Action]}
                    />
                </Table >
            </ScrollView >
        );
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => { navigation.goBack() }}
                    style={{
                        backgroundColor: "transparent",
                        paddingLeft: calculateWidthPercentage(4),
                    }}
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
                    <Text style={{ fontSize: calculateFontSizePercentage(4.5), fontWeight: "bold", color: 'black' }}>Manage Leave</Text>
                </View>

                <TouchableOpacity
                    onPress={() => { navigation.navigate('Create Manage Leave') }}
                    style={{
                        backgroundColor: "transparent",
                        paddingLeft: calculateWidthPercentage(24),
                        marginTop: calculateHeightPercentage(0.5)
                    }}
                >
                    <View style={{ alignItems: 'center', }}>
                        <AntDesign name="pluscircleo" size={20} color={'black'} />
                        <Text style={{ textAlign: 'center', marginTop: calculateHeightPercentage(-0.2), color: 'black', fontSize: calculateFontSizePercentage(3) }}>New Leave</Text>
                    </View>
                </TouchableOpacity>
            </View>
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0000ff" />
                </View>
            ) : (
                <ScrollView horizontal={true} style={{ marginBottom: calculateHeightPercentage(8.5) }}>
                    <Table>
                        {/* parameter's : userId,Employee, LeaveType, StartDate, EndDate, LeaveReason,CheckStatus,TotalDays */}
                        <Row data={['Employee', 'LeaveType', 'StartDate', 'EndDate', 'Days', 'Status','Action']} style={{ backgroundColor: '#E1E6F7', }} textStyle={{ margin: calculateHeightPercentage(0.2), fontWeight: '600', fontSize: calculateFontSizePercentage(3.5), color: 'black', textAlign: 'center', }}
                            borderStyle={{ borderColor: "#C1C0B9", borderWidth: calculateWidthPercentage(0.3), }}
                            widthArr={[calculateWidthPercentage(25), calculateWidthPercentage(28), calculateWidthPercentage(22), calculateWidthPercentage(22), calculateWidthPercentage(15), calculateWidthPercentage(16),calculateWidthPercentage(20),]}
                        />
                        <FlatList
                            refreshControl={
                                <RefreshControl
                                    refreshing={refresh}
                                    onRefresh={() => { pullMe() }}
                                />
                            }
                            style={{ marginBottom: calculateHeightPercentage(1) }}
                            data={ManageLeaveListData}
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
                <Footer navigation={navigation} />
            </View>
        </SafeAreaView >
    );
};

// define your styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        // justifyContent: 'center',
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
        borderBlockColor: "lightgrey",
        marginBottom: calculateHeightPercentage(0.5)
    },
    footer: {
        position: 'absolute',
        height: "10%",
        alignItems: "center",
        top: calculateHeightPercentage(87)
    },
});

//make this component available to the app
export default ManageLeaveList;
