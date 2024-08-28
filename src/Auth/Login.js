//import liraries
import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
// import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Rupioo_Lite_BaseUrl } from '../../Config/BaseUtil';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

// Helper functions for dimension calculations
const calculateHeightPercentage = percentage => (windowHeight * percentage) / 100;
const calculateWidthPercentage = percentage => (windowWidth * percentage) / 100;
const calculateFontSizePercentage = percentage => {
    const baseDimension = Math.min(windowWidth, windowHeight);
    return (baseDimension * percentage) / 100;
};

// create a component
const Login = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [IsSecureEntry, setIsSecureEntery] = useState(true)
    const [confirm, setConfirm] = useState(null);
    // const handleLogin = async () => {
    //     console.log("first")
    //     if (mobile.length === 10 && /^[0-9]+$/.test(mobile)) {
    //         console.log("first",mobile);
    //         navigation.navigate('Employee');
    //         // await axios.post("https://customer-node.rupioo.com/customer/login", { mobileNo: "91"+mobile.toString() })
    //         //     .then(async (response) => {
    //         //         console.log(response.data.user);
    //         //         // signInWithPhoneNumber('+91' + mobile)
    //         //         console.log(response.data.user._id);

    //         //         await AsyncStorage.setItem('database', response.data.user.database);
    //         //         await AsyncStorage.setItem('id', response.data.user._id);
    //         //         await AsyncStorage.setItem('mobileNumber', response.data.user.mobileNumber);
    //         //         Alert.alert(response.data.message, 'please wait for a bit..!')
    //         //         navigation.navigate('SuperAdminList')
    //         //     })
    //         //     .catch((err) => {
    //         //         console.log("Api Error ;- ", err.response.data.message)
    //         //         Alert.alert(err.response.data.message, 'Please try again later..!')
    //         //     })
    //     } else {
    //         alert('Invalid Input ,\nPlease enter a valid 10-digit phone number.');
    //     }
    // };

    // const handleInputChange = text => {
    //     // Ensure that only digits are entered and limit the length to 10 characters
    //     if (/^[0-9]*$/.test(text) && text.length <= 10) {
    //         setMobile(text);
    //     }
    // };

    // const signInWithPhoneNumber = async (phoneNumber) => {
    //     const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
    //     const data = JSON.stringify(confirmation);
    //     console.log("Show Conformation", data);
    //     setConfirm(confirmation);
    //     navigation.navigate('VeryfiOtp', { confirm });
    //     await AsyncStorage.setItem("Confirmation", JSON.stringify(confirmation));
    // }

    // if (confirm) {
    //     setConfirm(null);
    //     navigation.navigate("VeryfiOtp");
    // }

    const handleLogin = async () => {
        console.log("Email :- ", email)
        console.log("Password :- ", password)

        // salesone@gmail.com  123456
        if(email && password){
        await axios.post(`${Rupioo_Lite_BaseUrl}customer/customer-login`,
            {
                "Email": email,
                "Password": password
            },
        )
            .then(async(res) => {
                    console.log("Response data:", res?.data?.Customer);
                    await AsyncStorage.setItem('userId',res?.data?.Customer?._id);
                    // await AsyncStorage.setItem('database',res?.data?.user?.database);
                    navigation.navigate("Dashboard")
            })
            .catch((err) => {
                console.log(err.response.data.message);
                Alert.alert(err.response.data.message)
            })
        }
        else{
            Alert.alert("Error","Please fill empty fields...!!!")
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <View>
                <Image
                    source={require('../../assets/LoginLogo.png')}
                    style={styles.lottieAnimation}
                    resizeMode='cover'
                />
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={{ marginTop: calculateHeightPercentage(1), width: calculateWidthPercentage(85) }}>

                    <Text style={{ fontSize: calculateFontSizePercentage(4), marginBottom: calculateHeightPercentage(-1), marginLeft: calculateWidthPercentage(1), marginTop: calculateHeightPercentage(2) }}>Email</Text>
                    <TextInput
                        style={styles.input}
                        placeholderTextColor={'gray'}
                        placeholder="Enter your Email here !!"
                        onChangeText={e => setEmail(e)}
                        value={email}
                        keyboardType='email-address'
                    />
                    <Text style={{ fontSize: calculateFontSizePercentage(4), marginBottom: calculateHeightPercentage(-1), marginLeft: calculateWidthPercentage(1), marginTop: calculateHeightPercentage(2) }}>Password</Text>
                    <View style={styles.input}>
                        <TextInput
                            style={{ width: '90%', color: 'black' }}
                            placeholderTextColor={'gray'}
                            placeholder="Enter your Password here!!"
                            onChangeText={text => setPassword(text)}
                            value={password}
                            secureTextEntry={IsSecureEntry}
                        />
                        <TouchableOpacity
                            style={{
                                width: calculateWidthPercentage(20)
                            }}
                            onPress={() => {
                                setIsSecureEntery(!IsSecureEntry)
                            }}>
                            <Icon name={IsSecureEntry === false ? 'eye' : 'eye-off'} size={23} color='black' />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity onPress={handleLogin} style={styles.button}>
                        <Text style={styles.buttonText}>Submit</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

// define your styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        // justifyContent: 'center',
        marginTop: calculateHeightPercentage(10),
        alignItems: 'center',
    },
    input: {
        paddingHorizontal: calculateWidthPercentage(5),
        flexDirection: 'row',
        height: calculateHeightPercentage(6),
        borderColor: 'black',
        borderRadius: calculateFontSizePercentage(2),
        alignItems: 'center',
        backgroundColor: "#f0f0f0",
        borderColor: '#e0e0e5',
        borderWidth: 1,
        elevation: 2,
        marginTop: calculateHeightPercentage(1),
    },
    button: {
        backgroundColor: '#EAAA13',
        paddingVertical: calculateHeightPercentage(1),
        marginTop: calculateHeightPercentage(5),
        borderRadius: calculateFontSizePercentage(10),
        width: "100%",
        alignSelf: 'center',
        elevation: 5,
        marginBottom: calculateHeightPercentage(1)
    },
    buttonText: {
        fontSize: calculateFontSizePercentage(5),
        color: 'white',
        textAlign: 'center',
        fontWeight: '650'
    },
    lottieAnimation: {
        // marginTop: calculateHeightPercentage(-15),
        height: calculateHeightPercentage(30),
        width: calculateWidthPercentage(70),

    },
});

//make this component available to the app
export default Login;
