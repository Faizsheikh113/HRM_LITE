//import liraries
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView, FlatList, RefreshControl, ActivityIndicator, Linking, Button, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Table, Row } from "react-native-table-component";
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import Footer from '../../Bottom/Footer';
import { CustomerApi, CustomerBaseUrl, Rupioo_Lite_BaseUrl } from '../../../../Config/BaseUtil';
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
const Shift_List = ({ navigation }) => {
    const [leadData, setLeadData] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [refresh, setRefresh] = useState(false);

    const GetProduct = useCallback(async () => {
        const id = await AsyncStorage.getItem("userId");

        try {
            const response = await axios.get(`${Rupioo_Lite_BaseUrl}shift/view-shift-by-user/${id}`);
            console.log(response?.data?.Shift);
            setLeadData(response?.data?.Shift || []);
        } catch (err) {
            console.log(err);
        } finally {
            setIsLoading(false);
        }
    }, [setLeadData, setIsLoading]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            GetProduct();
        });

        return () => {
            unsubscribe;
        };
    }, [navigation, GetProduct]);

    const pullMe = () => {
        setRefresh(true);
        GetProduct();
        setTimeout(() => {
            setRefresh(false);
        }, 1000)
    }

    const goToEdit = async (data) => {
        console.log(data);
        console.log(data?._id);
        await AsyncStorage.setItem("ShiftID", data?._id)
        navigation.navigate('Edit_Shift');
    }

    const deleteEmployee = async (data) => {
        console.log(data);
        console.log(data?._id);
        await axios.delete(`${Rupioo_Lite_BaseUrl}shift/delete-shift/${data?._id}`)
            .then((res) => {
                console.log(res);
                GetProduct();
            })
            .catch((err) => {
                console.log(err);
            })
    }

    const renderProductItem = useCallback((item, index) => {
        const Date = calculateWidthPercentage(20);
        const EmployeeID = calculateWidthPercentage(20);
        const CheckIn = calculateWidthPercentage(20);
        const Email1 = calculateWidthPercentage(20);
        const Email = calculateWidthPercentage(30);
        const image = calculateWidthPercentage(25);
        return (

            <ScrollView horizontal={true}>
                <Table borderStyle={{ borderWidth: 1, borderColor: "#C1C0B9" }}>
                    <Row
                        key={index}
                        data={[
                            <Text style={{ color: 'blue', textAlign: 'center', fontSize: calculateFontSizePercentage(3.5) }}>
                                {item?.shiftName?.toUpperCase()}
                            </Text>,
                            <Text style={{ color: 'green', textAlign: 'center', fontSize: calculateFontSizePercentage(3.2), paddingVertical: calculateHeightPercentage(1) }}>

                                {`${moment(item?.fromTime, "H:mm").format("hh:mm A")}
                                    ${moment(item?.lateByTime, "H:mm").format("hh:mm A")}`}
                            </Text>,
                            <Text style={{ color: 'red', textAlign: 'center', fontSize: calculateFontSizePercentage(3.2), paddingVertical: calculateHeightPercentage(1) }}>

                                {`${moment(item?.toTime, "H:mm").format("hh:mm A")}
                                    ${moment(item?.shortByTime, "H:mm").format("hh:mm A")}`}
                            </Text>,

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: calculateWidthPercentage(4), padding: calculateFontSizePercentage(1) }}>
                                <TouchableOpacity style={{ alignItems: 'center' }}
                                    onPress={() => { goToEdit(item) }}
                                >
                                    <MaterialCommunityIcons name={'account-edit'} size={25} color={'#6b6b6b'} />
                                    <Text style={{ fontSize: calculateFontSizePercentage(3), color: '#6b6b6b' }}>Edit</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={{ alignItems: 'center' }}
                                    onPress={() => { deleteEmployee(item) }}
                                >
                                    <MaterialCommunityIcons name={'delete'} size={23} color={'#6b6b6b'} />
                                    <Text style={{ fontSize: calculateFontSizePercentage(3), color: '#6b6b6b' }}>Delete</Text>
                                </TouchableOpacity>
                            </View>
                        ]}
                        style={[{ backgroundColor: "white", paddingVertical: calculateHeightPercentage(1) }, index % 2 && { backgroundColor: "white" }]}
                        textStyle={{ fontSize: calculateFontSizePercentage(3), textAlign: 'center', color: 'black', height: calculateHeightPercentage(-1), paddingHorizontal: calculateWidthPercentage(1) }}
                        widthArr={[image, Date, CheckIn, Email]}
                    />
                </Table>
            </ScrollView>
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
                        paddingLeft: calculateWidthPercentage(3),
                    }}
                >
                    <Icon name={"arrow-back"} size={25} color={'black'} />
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
                    <Text style={{ fontSize: calculateFontSizePercentage(4), fontWeight: '600', color: 'black' }}>Shift List</Text>
                </View>

                <TouchableOpacity
                    onPress={() => { navigation.navigate('Create Shift') }}
                    style={{
                        backgroundColor: "transparent",
                        paddingLeft: calculateWidthPercentage(28),
                    }}
                >
                    <View style={{ alignItems: 'center', }}>
                        <Icon name="person-add-sharp" size={23} color={'black'} />
                        <Text style={{ textAlign: 'center', marginTop: calculateHeightPercentage(-0.5), color: 'black', fontSize: calculateFontSizePercentage(3) }}>New Shift</Text>
                    </View>
                </TouchableOpacity>
            </View>
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0000ff" />
                </View>
            ) : (
                <ScrollView horizontal={true} style={{ marginBottom: calculateHeightPercentage(0) }}>
                    <Table>
                        <Row data={['Shift Name', 'In-Time', 'Out-Time', 'Actions']} style={{ backgroundColor: 'blue', }} textStyle={{ margin: calculateHeightPercentage(0.2), fontWeight: '600', fontSize: calculateFontSizePercentage(3.5), color: 'white', textAlign: 'center' }}
                            borderStyle={{ borderColor: "#C1C0B9", borderWidth: calculateWidthPercentage(0.3), }}
                            widthArr={[calculateWidthPercentage(25), calculateWidthPercentage(20), calculateWidthPercentage(20), calculateWidthPercentage(30)]}
                        />
                        <FlatList
                            refreshControl={
                                <RefreshControl
                                    refreshing={refresh}
                                    onRefresh={() => { pullMe() }}
                                />
                            }
                            style={{ marginBottom: calculateHeightPercentage(1) }}
                            data={leadData}
                            renderItem={({ item, index }) => (
                                renderProductItem(item, index)
                            )}
                            keyExtractor={(item, index) => index.toString()}
                        />
                    </Table>
                </ScrollView>
            )
            }
            {/* <View style={styles.footer}>
                <View style={{ flexDirection: 'row', marginBottom: calculateHeightPercentage(1) }}>
                </View>
                <Footer navigation={navigation} />
            </View> */}
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
export default Shift_List;
