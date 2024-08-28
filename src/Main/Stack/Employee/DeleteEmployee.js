//import liraries
import React, { Component } from 'react';
import { View, Text, StyleSheet,Dimensions } from 'react-native';
import Footer from '../../Bottom/Footer';
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const calculateHeightPercentage = (percentage) => (windowHeight * percentage) / 100;
const calculateWidthPercentage = (percentage) => (windowWidth * percentage) / 100;
const calculateFontSizePercentage = (percentage) => {
    const baseDimension = Math.min(windowWidth, windowHeight);
    return (baseDimension * percentage) / 100;
};
// create a component
const Delete_Employee = ({navigation}) => {
    return (
        <View style={styles.container}>
            <Text>Delete_Employee</Text>
            <View style={styles.footer}>
                <Footer navigation={navigation} />
            </View>
        </View>
    );
};

// define your styles
const styles = StyleSheet.create({
    container: {
        // paddingHorizontal: calculateWidthPercentage(8)
        // flex: 1,
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
export default Delete_Employee;
