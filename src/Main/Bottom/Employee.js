//import liraries
import React, { Component, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, SafeAreaView } from 'react-native';
import Footer from './Footer';
import Icon from 'react-native-vector-icons/Ionicons';
import Create_Employee from '../Stack/Employee/CreateEmployee';
import Employee_List from '../Stack/Employee/EmployeeList';
import Register_Faces from '../Stack/Employee/RegisterFaces';
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const calculateHeightPercentage = (percentage) => (windowHeight * percentage) / 100;
const calculateWidthPercentage = (percentage) => (windowWidth * percentage) / 100;
const calculateFontSizePercentage = (percentage) => {
    const baseDimension = Math.min(windowWidth, windowHeight);
    return (baseDimension * percentage) / 100;
};
// create a component
const Employee = ({ navigation }) => {
    const [selectedTab, setSelectedTab] = useState(1);
    const [driverData, setDriverData] = useState([]);

    const handleTabChange = (tabNumber) => {
        setSelectedTab(tabNumber);
    };
    return (
        <View style={styles.container}>
            <SafeAreaView >
                {/* Header */}
                <View style={styles.header}>
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
                        onPress={() => { navigation.navigate('Create_Customer') }}
                        style={{
                            backgroundColor: "transparent",
                            paddingLeft: calculateWidthPercentage(34),
                        }}
                    >
                        <View style={{ alignItems: 'center', }}>
                            <Icon name="person-add-sharp" size={25} color={'black'} />
                            <Text style={{ textAlign: 'center', marginTop: calculateHeightPercentage(-0.5), color: 'black' }}>New Cust..</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={styles.navbar}>
                    <TouchableOpacity onPress={() => handleTabChange(1)} style={[styles.tab, selectedTab === 1 && styles.activeTab]}>
                        <Text style={styles.tabText}>Create Employee</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleTabChange(2)} style={[styles.tab, selectedTab === 2 && styles.activeTab]}>
                        <Text style={styles.tabText}>Employee List</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleTabChange(3)} style={[styles.tab, selectedTab === 3 && styles.activeTab]}>
                        <Text style={styles.tabText}>Register Faces</Text>
                    </TouchableOpacity>
                </View>
                {selectedTab === 1 ? <Create_Employee driverData={driverData} navigation={navigation} /> :
                    selectedTab === 2 ? <Employee_List driverData={driverData} navigation={navigation} /> :
                        selectedTab === 3 ? <Register_Faces driverData={driverData} navigation={navigation} /> :
                            null}
            </SafeAreaView>
        </View>
    );
};

// define your styles
const styles = StyleSheet.create({
    container: {
        // flex: 1,
        alignItems: 'center',
        width:'100%'
        // flexWrap: 'wrap'
    },
    header: {
        alignSelf:'center',
        marginLeft:calculateWidthPercentage(0.5),
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
    mainContent: {
        flex: 1,
        display: 'flex',
        // height: "75%",
        width: "100%",
        // paddingHorizontal: calculateWidthPercentage(3),
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: "white",
    },
    navbar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: calculateHeightPercentage(0.5),
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        width: '100%'
    },
    tab: {
        // justifyContent:'space-around',
        paddingHorizontal: calculateWidthPercentage(2.5),
        paddingVertical: calculateHeightPercentage(1),
    },
    activeTab: {
        borderBottomWidth: calculateHeightPercentage(0.3),
        borderBottomColor: '#000',
    },
    tabText: {
        fontSize: calculateFontSizePercentage(3.8),
        fontWeight: '400',
        color: 'black',
        // width:calculateWidthPercentage(25)
    },
});

//make this component available to the app
export default Employee;
