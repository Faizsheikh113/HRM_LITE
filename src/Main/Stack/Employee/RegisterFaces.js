//import liraries
import React, { Component } from 'react';
import { View, Text, StyleSheet, Dimensions,RefreshControl } from 'react-native';
import Footer from '../../Bottom/Footer';
import WebView from 'react-native-webview';
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const calculateHeightPercentage = (percentage) => (windowHeight * percentage) / 100;
const calculateWidthPercentage = (percentage) => (windowWidth * percentage) / 100;
const calculateFontSizePercentage = (percentage) => {
    const baseDimension = Math.min(windowWidth, windowHeight);
    return (baseDimension * percentage) / 100;
};

// create a component
const Register_Faces = ({ navigation }) => {
    return (
        // <View style={styles.container}>
            <WebView
                // https://hrm-face.rupioo.com/
                source={{ uri: 'https://face.rupioo.com/#/ApplicationRegister' }}
                style={styles.webview}
                // ref={webViewRef}
                androidHardwareAccelerationDisabled={true}
            />
        // </View>
    );
};

// define your styles
const styles = StyleSheet.create({
    container: {
        // flex: 1,
        // justifyContent: 'center',
        // alignItems: 'center',
    },
    footer: {
        position: 'absolute',
        height: "10%",
        alignItems: "center",
        top: calculateHeightPercentage(81)
    },
});

//make this component available to the app
export default Register_Faces;
