//import liraries
import React, { Component, useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView, FlatList, RefreshControl, ActivityIndicator, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Table, Row } from "react-native-table-component";
import Transication_Footer from './Transication_footer';
import AntDesign from 'react-native-vector-icons/AntDesign';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Rupioo_Lite_BaseUrl } from '../../../../Config/BaseUtil';
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
const TransicationReceipt = ({ navigation }) => {
    const [ReceiptData, setReceiptData] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [refresh, setRefresh] = useState(false);

    const GetReceipt = useCallback(async () => {
        try {
            const id = await AsyncStorage.getItem('userId');
            // console.log(database);
            const response = await axios.get(`${Rupioo_Lite_BaseUrl}receipt/view-reciept/${id}`);
            console.log(response?.data?.Receipts);
            setReceiptData(response?.data?.Receipts || []);
        } catch (err) {
            console.log(err);
        } finally {
            setIsLoading(false);
        }
    }, [setReceiptData, setIsLoading]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            GetReceipt();
        });
        return () => {
            unsubscribe;
        };
    }, [navigation, GetReceipt]);

    const pullMe = () => {
        setRefresh(true);
        GetReceipt();
        setTimeout(() => {
            setRefresh(false);
        }, 1000)
    }

    const goToEdit = async (data) => {
        console.log("Edit :- ", data);
        console.log(data?._id);
        await AsyncStorage.setItem("Receipt", JSON.stringify(data))
        navigation.navigate('Edit Receipt');
    }

    const DeleteReceipt = async (data) => {
        console.log("Edit :- ", data);
        const id = await AsyncStorage.getItem('userId');
        console.log(data?._id);
        await axios.get(`${Rupioo_Lite_BaseUrl}receipt/delete-receipt/${id}`)
        .then((res)=>{
            console.log(res?.data);
        })
        .catch((err)=>{
            console.log("Error",err?.response?.data);
        })
        navigation.navigate('Edit Receipt');
    }

    const renderProductItem = useCallback((item, index) => {
        const Date = calculateWidthPercentage(20);
        const Name = calculateWidthPercentage(25);
        const Desiganation = calculateWidthPercentage(15);
        const Shift = calculateWidthPercentage(20);
        const Remark = calculateWidthPercentage(20);
        const Action = calculateWidthPercentage(20);
        return (
            <ScrollView horizontal={true}>
                <Table borderStyle={{ borderWidth: 1, borderColor: "#C1C0B9" }}>
                    <Row
                        key={index}
                        data={[
                            moment(item?.date).format("DD-MMM-YY"),
                            item?.employeeId?.Name?.toUpperCase(),
                            item?.paymentMode?.toUpperCase(),
                            item?.amount?.toString(),
                            item?.remark?.toUpperCase(),
                            <View style={{
                                flexDirection: 'row', justifyContent: 'space-around'
                            }}>
                                <TouchableOpacity onPress={() => goToEdit(item)}>
                                    <AntDesign name={'edit'} size={20} color={'black'} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => DeleteReceipt(item)}>
                                    <AntDesign name={'delete'} size={20} color={'black'} />
                                </TouchableOpacity>
                            </View>,
                        ]}
                        style={[{ backgroundColor: "#E7E6E1" }, index % 2 && { backgroundColor: "#F7F6E7" }]}
                        textStyle={{ fontSize: calculateFontSizePercentage(3), textAlign: 'center', color: '#6b6b6b', padding: calculateHeightPercentage(1), paddingHorizontal: calculateWidthPercentage(1) }}
                        widthArr={[Date, Name, Desiganation, Shift, Remark, Action]}
                    />
                </Table >
            </ScrollView >
        );
    }, []);

    return (
        <View style={styles.container}>
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
                    <Text style={{ fontSize: calculateFontSizePercentage(4.5), fontWeight: "bold", color: 'black' }}>Receipt</Text>
                </View>

                <TouchableOpacity
                    onPress={() => { navigation.navigate('Create Receipt') }}
                    style={{
                        backgroundColor: "transparent",
                        paddingLeft: calculateWidthPercentage(18),
                    }}
                >
                    <View style={{ alignItems: 'center', }}>
                        <Icon name="person-add-sharp" size={22} color={'black'} />
                        <Text style={{ textAlign: 'center', marginTop: calculateHeightPercentage(-0.5), color: 'black', fontSize: calculateFontSizePercentage(3) }}>Create Receipt</Text>
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
                        <Row data={['Date', 'Employee', 'Mode', 'Amount', 'Remark', 'Action']} style={{ backgroundColor: '#E1E6F7', }} textStyle={{ margin: calculateHeightPercentage(0.2), fontWeight: '600', fontSize: calculateFontSizePercentage(3.5), color: 'black', textAlign: 'center' }}
                            borderStyle={{ borderColor: "#C1C0B9", borderWidth: calculateWidthPercentage(0.3), }}
                            widthArr={[calculateWidthPercentage(20), calculateWidthPercentage(25), calculateWidthPercentage(15), calculateWidthPercentage(20), calculateWidthPercentage(20), calculateWidthPercentage(20)]}
                        />
                        <FlatList
                            refreshControl={
                                <RefreshControl
                                    refreshing={refresh}
                                    onRefresh={() => { pullMe() }}
                                />
                            }
                            style={{ marginBottom: calculateHeightPercentage(1) }}
                            data={ReceiptData}
                            renderItem={({ item, index }) => (
                                renderProductItem(item, index)
                            )}
                            keyExtractor={(item, index) => index.toString()}
                        />
                    </Table>
                </ScrollView>
            )
            }

            {/* Footer */}
            <View style={styles.footer}>
                <Transication_Footer navigation={navigation} />
            </View>
        </View>
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
export default TransicationReceipt;
