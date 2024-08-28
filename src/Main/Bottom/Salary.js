//import liraries
import React, { Component, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Salary_Slip from '../Stack/Salary/SalarySlip';
import Month_Wise_Salary from '../Stack/Salary/Month-Wise-Salary';
import Emp_Wise_Salary from '../Stack/Salary/Emp-Wise-Salary';
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const calculateHeightPercentage = (percentage) => (windowHeight * percentage) / 100;
const calculateWidthPercentage = (percentage) => (windowWidth * percentage) / 100;
const calculateFontSizePercentage = (percentage) => {
    const baseDimension = Math.min(windowWidth, windowHeight);
    return (baseDimension * percentage) / 100;
};
// create a component
const Salary = ({ navigation }) => {
    const [selectedTab, setSelectedTab] = useState(1);
    const [driverData, setDriverData] = useState([]);

    const handleTabChange = (tabNumber) => {
        setSelectedTab(tabNumber);
    };
    return (
        <View style={styles.container}>
            <View>
                <View style={styles.navbar}>
                    <TouchableOpacity onPress={() => handleTabChange(1)} style={[styles.tab, selectedTab === 1 && styles.activeTab]}>
                        <Text style={styles.tabText}>Salary Slip</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleTabChange(2)} style={[styles.tab, selectedTab === 2 && styles.activeTab]}>
                        <Text style={styles.tabText}>Month-Wise Salary</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleTabChange(3)} style={[styles.tab, selectedTab === 3 && styles.activeTab]}>
                        <Text style={styles.tabText}>Emp-Wise Salary</Text>
                    </TouchableOpacity>
                </View>
                {selectedTab === 1 ? <Salary_Slip driverData={driverData} navigation={navigation} /> :
                    selectedTab === 2 ? <Month_Wise_Salary driverData={driverData} navigation={navigation} /> :
                        selectedTab === 3 ? <Emp_Wise_Salary driverData={driverData} navigation={navigation} /> :
                            null}
            </View>
        </View>
    );
};

// define your styles
const styles = StyleSheet.create({
    container: {
        // flex: 1,
        alignItems: 'center',
        // flexWrap: 'wrap'
    },
    navbar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: calculateHeightPercentage(0.5),
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        width:'100%'
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
export default Salary;
