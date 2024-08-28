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
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const calculateHeightPercentage = (percentage) => (windowHeight * percentage) / 100;
const calculateWidthPercentage = (percentage) => (windowWidth * percentage) / 100;
const calculateFontSizePercentage = (percentage) => {
    const baseDimension = Math.min(windowWidth, windowHeight);
    return (baseDimension * percentage) / 100;
};
// create a component
const LeaveList = ({ navigation }) => {
    const [LeaveListData, setLeaveListData] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [refresh, setRefresh] = useState(false);

    const GetLeaveList = useCallback(async () => {
        try {
            const id = await AsyncStorage.getItem('userId');
            console.log(id);
            const response = await axios.get(`${Rupioo_Lite_BaseUrl}leave/view-leave-user/${id}`);
            console.log(response?.data?.Leave);
            setLeaveListData(response?.data?.Leave || []);
        } catch (err) {
            console.log(err);
        } finally {
            setIsLoading(false);
        }
    }, [setLeaveListData, setIsLoading]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            GetLeaveList();
        });
        return () => {
            unsubscribe;
        };
    }, [navigation, GetLeaveList]);

    const pullMe = () => {
        setRefresh(true);
        GetLeaveList();
        setTimeout(() => {
            setRefresh(false);
        }, 1000)
    }

    const goToEdit = async (data) => {
        console.log(data);
        await AsyncStorage.setItem("LeaveData", JSON.stringify(data))
        navigation.navigate('Edit Leave');
    }

    const DeleteHoliday = async (data) => {
        console.log(data);
        await axios.delete(`${Rupioo_Lite_BaseUrl}leave/delete-leave/${data._id}`)
            .then((res) => {
                console.log(res?.data);
                Alert.alert("Successfull...", res?.data?.message)
                GetLeaveList();
            })
            .catch((err) => { 
                console.log(err);
                Alert.alert("Successfull...", err?.response?.data) 
            })
    }

    const renderProductItem = useCallback((item, index) => {
        const LeaveNameWidth = calculateWidthPercentage(35);
        const LeaveMonthWidth = calculateWidthPercentage(15);
        const LeaveDayWidth = calculateWidthPercentage(15);
        const LeaveYearWidth = calculateWidthPercentage(16);
        const LeaveActions = calculateWidthPercentage(18);
        return (
            <ScrollView horizontal={true}>
                <Table borderStyle={{ borderWidth: 1, borderColor: "#C1C0B9" }}>
                    <Row
                        key={index}
                        data={[
                            item?.LeaveType?.toUpperCase(),
                            item?.NoOfYearly,
                            item?.NoOfMonthly,
                            item?.CheckStatus,
                            <View style={{
                                flexDirection: 'row', justifyContent: 'space-around'
                            }}>
                                <TouchableOpacity onPress={() => goToEdit(item)}>
                                    <AntDesign name={'edit'} size={20} color={'black'} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => DeleteHoliday(item)}>
                                    <MaterialCommunityIcons name={'delete-outline'} size={20} color={'black'} />
                                </TouchableOpacity>
                            </View>
                        ]}
                        style={[{ backgroundColor: "#E7E6E1", }, index % 2 && { backgroundColor: "#F7F6E7" }]}
                        textStyle={{ fontSize: calculateFontSizePercentage(3.2), textAlign: 'center', color: 'black', height: calculateHeightPercentage(3), paddingHorizontal: calculateWidthPercentage(1), marginTop: calculateHeightPercentage(1) }}
                        widthArr={[LeaveNameWidth, LeaveMonthWidth, LeaveDayWidth, LeaveYearWidth, LeaveActions]}
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
                    <Text style={{ fontSize: calculateFontSizePercentage(4.5), fontWeight: "bold", color: 'black' }}>Leave</Text>
                </View>

                <TouchableOpacity
                    onPress={() => { navigation.navigate('Manage Leave') }}
                    style={{
                        backgroundColor: "transparent",
                        marginTop: calculateHeightPercentage(0.5)
                    }}
                >
                    <View style={{ alignItems: 'center',marginTop:calculateHeightPercentage(-0.8) }}>
                        <MaterialIcons name="manage-accounts" size={30} color={'black'} />
                        <Text style={{ textAlign: 'center', marginTop: calculateHeightPercentage(-0.9), color: 'black', fontSize: calculateFontSizePercentage(3) }}>Manage Leave</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => { navigation.navigate('Create Leave') }}
                    style={{
                        backgroundColor: "transparent",
                        paddingLeft: calculateWidthPercentage(3),
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
                        <Row data={['Leave Name', 'Year', 'Month', 'Status', 'Actions']} style={{ backgroundColor: '#E1E6F7', }} textStyle={{ margin: calculateHeightPercentage(0.2), fontWeight: '600', fontSize: calculateFontSizePercentage(4), color: 'black', textAlign: 'center', }}
                            borderStyle={{ borderColor: "#C1C0B9", borderWidth: calculateWidthPercentage(0.3), }}
                            widthArr={[calculateWidthPercentage(35), calculateWidthPercentage(15), calculateWidthPercentage(15), calculateWidthPercentage(16), calculateWidthPercentage(18)]}
                        />
                        <FlatList
                            refreshControl={
                                <RefreshControl
                                    refreshing={refresh}
                                    onRefresh={() => { pullMe() }}
                                />
                            }
                            style={{ marginBottom: calculateHeightPercentage(1) }}
                            data={LeaveListData}
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
export default LeaveList;
