//import liraries
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView, FlatList, RefreshControl, ActivityIndicator, Linking, Button, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Table, Row } from "react-native-table-component";
import Icon from 'react-native-vector-icons/Ionicons';
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
const Employee_List = ({ navigation }) => {
    const [leadData, setLeadData] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [refresh, setRefresh] = useState(false);

    const GetProduct = useCallback(async () => {
        try {
            const id = await AsyncStorage.getItem('userId');
            // console.log(database);
            const response = await axios.get(`${Rupioo_Lite_BaseUrl}empoloyee/view-employee-userId/${id}`);
            console.log(response?.data?.Employee);
            setLeadData(response?.data?.Employee || []);
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
        await AsyncStorage.setItem("EmployeeId", data?._id)
        navigation.navigate('Edit_Employee');
    }

    const renderProductItem = useCallback((item, index) => {
        const image = calculateWidthPercentage(25);
        const Name = calculateWidthPercentage(30);
        const Desiganation = calculateWidthPercentage(25);
        const Shift = calculateWidthPercentage(20);
        return (
            <ScrollView horizontal={true}>
                <Table borderStyle={{ borderWidth: 1, borderColor: "#C1C0B9" }}>
                    <Row
                        key={index}
                        data={[
                            <Image
                                source={{ uri: item?.Image }}
                                style={{ height: calculateHeightPercentage(6), alignSelf: 'center',borderRadius:calculateFontSizePercentage(1) }}
                                resizeMode='stretch'
                                width={calculateHeightPercentage(12)}
                            />,
                            <View>
                                <TouchableOpacity style={{ alignItems: 'center' }}
                                    onPress={() => {
                                        goToEdit(item)
                                    }}
                                >
                                    <Text style={{ fontSize: calculateFontSizePercentage(3), color: 'blue' }}>{item?.Name?.toUpperCase()}</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={{ alignItems: 'center' }}
                                    onPress={() => {
                                        Linking.openURL(`tel:${item?.Contact}`);
                                    }}
                                >
                                    <Text style={{ fontSize: calculateFontSizePercentage(3), color: 'red', marginTop: calculateHeightPercentage(1) }}>{item.Contact}</Text>
                                </TouchableOpacity>
                            </View>,
                            item?.Designation?.toUpperCase(),
                            `${item?.Shift?.shiftName?.toUpperCase()}`
                        ]}
                        style={[{ backgroundColor: "#E7E6E1" }, index % 2 && { backgroundColor: "#F7F6E7" }]}
                        textStyle={{ fontSize: calculateFontSizePercentage(3), textAlign: 'center', color: '#6b6b6b', height: calculateHeightPercentage(-1), paddingHorizontal: calculateWidthPercentage(1) }}
                        widthArr={[image, Name, Desiganation, Shift,]}
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
                    <Text style={{ fontSize: calculateFontSizePercentage(5), fontWeight: "bold", color: 'black' }}>Employee</Text>
                </View>

                <TouchableOpacity
                    onPress={() => { navigation.navigate('Create_Employee') }}
                    style={{
                        backgroundColor: "transparent",
                        paddingLeft: calculateWidthPercentage(22),
                    }}
                >
                    <View style={{ alignItems: 'center', }}>
                        <Icon name="person-add-sharp" size={25} color={'black'} />
                        <Text style={{ textAlign: 'center', marginTop: calculateHeightPercentage(-0.5), color: 'black' }}>New Emp..</Text>
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
                        <Row data={['Image', 'Name', 'Position', 'Shift']} style={{ backgroundColor: '#E1E6F7', }} textStyle={{ margin: calculateHeightPercentage(0.2), fontWeight: '600', fontSize: calculateFontSizePercentage(4), color: 'black', textAlign: 'center' }}
                            borderStyle={{ borderColor: "#C1C0B9", borderWidth: calculateWidthPercentage(0.3), }}
                            widthArr={[calculateWidthPercentage(25), calculateWidthPercentage(30), calculateWidthPercentage(25), calculateWidthPercentage(20)]}
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
export default Employee_List;
