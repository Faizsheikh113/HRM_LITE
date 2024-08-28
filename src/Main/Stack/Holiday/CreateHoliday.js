import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, TextInput, Alert } from 'react-native';
import DatePicker from 'react-native-date-picker';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
import axios from 'axios';
import { Rupioo_Lite_BaseUrl } from '../../../../Config/BaseUtil';
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const calculateHeightPercentage = (percentage) => (windowHeight * percentage) / 100;
const calculateWidthPercentage = (percentage) => (windowWidth * percentage) / 100;
const calculateFontSizePercentage = (percentage) => {
    const baseDimension = Math.min(windowWidth, windowHeight);
    return (baseDimension * percentage) / 100;
};

// create a component
const CreateHoliday = () => {
    const [openDate, setOpenDate] = useState(false);
    const [Holiday, setHoliday] = useState('');
    const [date, setDate] = useState(new Date());
    const [day, setDay] = useState('');
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');

    const handleDateConfirm = (date) => {
        setOpenDate(false);
        setDate(date);
        setDay(moment(date).format("DD"));
        setMonth(moment(date).format("MM"));
        setYear(moment(date).format("YYYY"));
    };

    const handleSubmit = async ({ navigation }) => {
        try {
            const id = await AsyncStorage.getItem("userId");
            console.log(id);
            console.log("Holiday :- ", Holiday);
            console.log("Day :- ", day);
            console.log("Month :- ", month);
            console.log("Year :- ", year);
    
            const response = await axios.post(`${Rupioo_Lite_BaseUrl}holiday/save-holiday`,{
                userId: id,
                Year: year,
                Month: month,
                Day: day,
                HolidayName: Holiday
            });
    
            if (response.status === 200) {
                console.log("@@@@@@@@@@@",response?.data);
                Alert.alert('successfull !!', response?.data?.message);
                navigation.navigate('Holiday List')
            } else {
                throw new Error(response.data.message);
            }
        } catch (error) {
            console.log("11111111111111",error?.response?.data);
            Alert.alert('error !!', error?.response?.data?.message);
        }
    }

    return (
        <GestureHandlerRootView style={styles.container}>
            <View style={{ flex: 1, marginTop: calculateHeightPercentage(10) }}>
                <ScrollView>
                    <Text style={{ fontSize: calculateFontSizePercentage(4), marginTop: calculateHeightPercentage(2), marginLeft: calculateWidthPercentage(1), color: 'black' }}>Holiday Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholderTextColor={'gray'}
                        placeholder="Enter holiday name here..."
                        onChangeText={e => setHoliday(e)}
                        value={Holiday}
                    />
                    <Text style={{ fontSize: calculateFontSizePercentage(4), marginTop: calculateHeightPercentage(2), marginLeft: calculateWidthPercentage(1), color: 'black' }}>Day</Text>
                    <TouchableOpacity
                        style={styles.input}
                        onPress={() => setOpenDate(true)}
                    >
                        {
                            day ? <Text style={{ color: 'black' }}>{day}</Text> : <Text>DD</Text>
                        }
                    </TouchableOpacity>

                    <Text style={{ fontSize: calculateFontSizePercentage(4), marginTop: calculateHeightPercentage(2), marginLeft: calculateWidthPercentage(1), color: 'black' }}>Month</Text>
                    <TouchableOpacity
                        style={styles.input}
                        onPress={() => setOpenDate(true)}
                    >
                        {
                            month ? <Text style={{ color: 'black' }}>{month}</Text> : <Text>MM</Text>
                        }
                    </TouchableOpacity>

                    <Text style={{ fontSize: calculateFontSizePercentage(4), marginTop: calculateHeightPercentage(2), marginLeft: calculateWidthPercentage(1), color: 'black' }}>Year</Text>
                    <TouchableOpacity
                        style={styles.input}
                        onPress={() => setOpenDate(true)}
                    >
                        {
                            year ? <Text style={{ color: 'black' }}>{year}</Text> : <Text>YYYY</Text>
                        }
                    </TouchableOpacity>
                    <DatePicker
                        modal
                        open={openDate}
                        date={date}
                        mode='date'
                        onConfirm={(date) => handleDateConfirm(date)}
                        onCancel={() => {
                            setOpenDate(false)
                        }}
                    />
                    <TouchableOpacity onPress={handleSubmit} style={styles.button}>
                        <Text style={styles.buttonText}>Submit</Text>
                    </TouchableOpacity>
                </ScrollView>

            </View>
        </GestureHandlerRootView>
    );
};

// define your styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        // backgroundColor: '#2c3e50',
    },
    input: {
        color: 'black',
        paddingHorizontal: calculateWidthPercentage(5),
        flexDirection: 'row',
        height: calculateHeightPercentage(6),
        width: calculateWidthPercentage(85),
        borderColor: 'black',
        borderRadius: calculateFontSizePercentage(1),
        alignItems: 'center',
        backgroundColor: "#f0f0f0",
        borderColor: '#e0e0e5',
        borderWidth: 1,
        elevation: 2,
        marginTop: calculateHeightPercentage(0.5),
    },
    button: {
        backgroundColor: 'black',
        paddingVertical: calculateHeightPercentage(1),
        marginTop: calculateHeightPercentage(5),
        borderRadius: calculateFontSizePercentage(1),
        width: "100%",
        alignSelf: 'center',
        elevation: 3,
        marginBottom: calculateHeightPercentage(1)
    },
    buttonText: {
        fontSize: calculateFontSizePercentage(5),
        color: 'white',
        textAlign: 'center',
        fontWeight: '650',
        paddingHorizontal: calculateWidthPercentage(10)
        // marginBottom: calculateHeightPercentage(8)
    },
});

//make this component available to the app
export default CreateHoliday;
