//import liraries
import React, { Component } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Footer from './Footer';
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const calculateHeightPercentage = (percentage) => (windowHeight * percentage) / 100;
const calculateWidthPercentage = (percentage) => (windowWidth * percentage) / 100;
const calculateFontSizePercentage = (percentage) => {
    const baseDimension = Math.min(windowWidth, windowHeight);
    return (baseDimension * percentage) / 100;
};
// create a component
const More = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap',justifyContent:'space-between',alignItems:'center',padding:calculateFontSizePercentage(10) }}>
                <TouchableOpacity style={{ height: calculateHeightPercentage(15), width: calculateWidthPercentage(30), backgroundColor: 'red', borderRadius: calculateFontSizePercentage(2), justifyContent: 'center' }}
                    onPress={() => navigation.navigate('Attendance Logs')}
                >
                    <Text style={{ color: 'white', fontSize: calculateFontSizePercentage(4), fontWeight: '700', textAlign: 'center', alignItems: 'center' }}>Attendance Logs</Text>
                </TouchableOpacity>

                <TouchableOpacity style={{ height: calculateHeightPercentage(15), width: calculateWidthPercentage(30), backgroundColor: 'red', borderRadius: calculateFontSizePercentage(2), justifyContent: 'center' }}
                    onPress={() => navigation.navigate('All Attendance')}
                >
                    <Text style={{ color: 'white', fontSize: calculateFontSizePercentage(4), fontWeight: '700', textAlign: 'center', alignItems: 'center' }}>All Attendance</Text>
                </TouchableOpacity>
            </View>
            {/* <View style={{ flexDirection: 'row', flexWrap: 'wrap',justifyContent:'space-between',alignItems:'center',padding:calculateFontSizePercentage(10) }}>
                <TouchableOpacity style={{ height: calculateHeightPercentage(15), width: calculateWidthPercentage(30), backgroundColor: 'red', borderRadius: calculateFontSizePercentage(2), justifyContent: 'center' }}
                    onPress={() => navigation.navigate('Leave List')}
                >
                    <Text style={{ color: 'white', fontSize: calculateFontSizePercentage(4), fontWeight: '700', textAlign: 'center', alignItems: 'center' }}>Leave</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ height: calculateHeightPercentage(15), width: calculateWidthPercentage(30), backgroundColor: 'red', borderRadius: calculateFontSizePercentage(2), justifyContent: 'center' }}
                    onPress={() => navigation.navigate('Holiday List')}
                >
                    <Text style={{ color: 'white', fontSize: calculateFontSizePercentage(4), fontWeight: '700', textAlign: 'center', alignItems: 'center' }}>Manage Leave</Text>
                </TouchableOpacity>
            </View> */}
            <View style={styles.footer}>
                <Footer navigation={navigation} />
            </View>
        </View>
    );
};

// define your styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        // justifyContent: 'center',
        // alignItems: 'center',
        // backgroundColor: '#2c3e50',
    },
    footer: {
        position: 'absolute',
        height: "10%",
        alignItems: "center",
        top: calculateHeightPercentage(88)
    },
});

//make this component available to the app
export default More;
