import { View, Text, Dimensions, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import Icon from "react-native-vector-icons/Ionicons";
import Feather from "react-native-vector-icons/Feather";

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

// Helper functions for dimension calculations
const calculateHeightPercentage = percentage => (windowHeight * percentage) / 100;
const calculateWidthPercentage = percentage => (windowWidth * percentage) / 100;
const calculateFontSizePercentage = percentage => {
    const baseDimension = Math.min(windowWidth, windowHeight);
    return (baseDimension * percentage) / 100;
};

const Footer = ({ navigation }) => {
    const windowWidth = Dimensions.get("screen").width / 100;
    const windowHeight = Dimensions.get("screen").height / 100;

    const [color, setColor] = useState(0)
    return (
        <View style={{ height: windowHeight * 100, width: windowWidth * 100 }}>
            <View
                style={{
                    height: windowHeight * 10,
                    width: windowWidth * 100,
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "flex-start",
                    backgroundColor: "white"
                }}
            >
                <View style={{
                    height: windowHeight * 8.5,
                    width: windowWidth * 95,
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-evenly",
                    alignItems: "center",
                    backgroundColor: "#fdc493",
                    borderRadius: windowHeight * 5
                }}>

                    <TouchableOpacity
                        onPress={() => { navigation.navigate("Dashboard") }}
                        style={{
                            height: windowHeight * 6,
                            width: windowWidth * 17,
                            backgroundColor: color === 5 ? "#99C68E" : "white",
                            borderColor: "lightgrey",
                            borderWidth: 1,
                            flexDirection: "row",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            borderRadius: 10,
                            elevation: 3
                        }}
                    >
                        <Icon name="home-outline" size={20} color="grey" />

                        <Text style={{ fontSize: calculateFontSizePercentage(2.8), fontWeight: "600", color: "grey" }}>Dashboard</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {
                            navigation.navigate("Employee");
                        }}
                        style={{
                            height: windowHeight * 6,
                            width: windowWidth * 19,
                            backgroundColor: color === 1 ? "#99C68E" : "white",
                            borderColor: "lightgrey",
                            borderWidth: 1,
                            flexDirection: "row",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            borderRadius: 10,
                            elevation: 3,
                            bottom: 0
                        }}
                    >
                        <Icon name="person-add-outline" size={20} color="grey" />
                        <Text style={{ fontSize: calculateFontSizePercentage(3), fontWeight: "600", color: "grey", textAlign: 'center' }}>Employee</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => {
                            navigation.navigate("Salary")
                        }}
                        style={{
                            height: windowHeight * 6,
                            width: windowWidth * 17,
                            backgroundColor: color === 2 ? "#99C68E" : "white",
                            borderColor: "lightgrey",
                            borderWidth: 1,
                            flexDirection: "row",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            borderRadius: 10,
                            elevation: 3
                        }}
                    >
                        <Icon
                            name="cash-outline"
                            size={22}
                            color="grey"
                        />

                        <Text style={{ fontSize: calculateFontSizePercentage(3), fontWeight: "600", color: "grey" }}>Salary</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => { navigation.navigate("More") }}
                        style={{
                            height: windowHeight * 6,
                            width: windowWidth * 17,
                            backgroundColor: color === 3 ? "#99C68E" : "white",
                            borderColor: "lightgrey",
                            borderWidth: 1,
                            flexDirection: "row",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            borderRadius: 10,
                            elevation: 3
                        }}
                    >
                        <Feather name="more-horizontal" size={20} color="grey" />

                        <Text style={{ fontSize: calculateFontSizePercentage(2.5), fontWeight: "600", color: "grey" }}>More</Text>
                    </TouchableOpacity>

                </View>
            </View>
        </View>
    )
}

export default Footer
