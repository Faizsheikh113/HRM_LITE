//import liraries
import React, { useCallback, useEffect, useState, } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image, TextInput, Button, Switch, Modal, Alert, KeyboardAvoidingView } from 'react-native';
import { GestureHandlerRootView, ScrollView, } from 'react-native-gesture-handler';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Icon from 'react-native-vector-icons/Ionicons';
import DatePicker from 'react-native-date-picker';
import moment from 'moment';
import { Dropdown } from 'react-native-element-dropdown';
import axios, { Axios } from 'axios';
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
const Create_Employee = ({ navigation }) => {
    const [userName, setUserName] = useState('');
    const [date1, setDate] = useState(new Date());
    const [openDate, setOpenDate] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [IsSecureEntry, setIsSecureEntery] = useState(true)
    const [address, setAddress] = useState('');
    const [desiganation, setDesiganation] = useState('');
    const [aadhar, setAadhar] = useState('');
    const [pan, setPan] = useState('');
    const [mobile, setMobile] = useState('');
    const [ReferalName, setReferalName] = useState('');
    const [ReferalNo, setReferalNo] = useState('');
    const [photo, setPhoto] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    const [ShiftList, setShiftList] = useState([{}]);
    const [value, setValue] = useState({});
    const [sendShift, setSendShift] = useState({});
    const [isFocus, setIsFocus] = useState(false);

    const GetShift = useCallback(async () => {
        const id = await AsyncStorage.getItem("userId");
        try {
            const response = await axios.get(`${Rupioo_Lite_BaseUrl}shift/view-shift-by-user/${id}`);
            console.log(response?.data?.Shift);
            setShiftList(response?.data?.Shift || []);
        } catch (err) {
            console.log(err);
        }
    }, [setShiftList]);

    useEffect(() => {
        GetShift();
    }, [GetShift])

    const handleSelectShift = (item) => {
        console.log("Handle Item :- ",item);
        setValue(item.value);
        setSendShift(item?.obj);
        setIsFocus(false);
    };

    const handleMobileNo = text => {
        const formattedText = text.replace(/[^\d]/g, '');
        if (/^\d{0,10}$/.test(formattedText)) {
            // const countryCode = '+1-';
            const formattedMobile = formattedText;
            setMobile(formattedMobile);
        }
    };

    const handleReferalNo = text => {
        const formattedText = text.replace(/[^\d]/g, '');
        if (/^\d{0,10}$/.test(formattedText)) {
            // const countryCode = '+1-';
            const formattedMobile = formattedText;
            setReferalNo(formattedMobile);
        }
    };

    const closeModal = () => {
        setModalVisible(false);
    };

    const handleLogin = async () => {
        const userId = await AsyncStorage.getItem('userId')
        // const image = {
        //     name: photo?.fileName,
        //     size: photo?.fileSize,
        //     uri: photo?.uri,
        //     type: photo?.type,
        // }
        // console.log("Image ;- ", image);
        console.log("Name :- ", userName);
        console.log('DOB :- ', moment(date1).format("DD/MM/YYYY"));
        console.log("Address :- ", address);
        console.log("Email :- ", email);
        console.log("passsword :- ", password);
        console.log("Contact :- ", mobile);
        console.log("Desiganation :- ", desiganation);
        console.log("Aadhar :- ", aadhar);
        console.log("Pan :- ", pan);
        console.log("Referal Name :- ", ReferalName);
        console.log("Referal Number :- ", ReferalNo);
        console.log("Shift :- ", sendShift);

        const formData = new FormData(); 
        formData.append('userId', userId);
        formData.append('Name', userName);
        formData.append('dob', moment(date1).format("DD/MM/YYYY"));
        formData.append('Address', address);
        formData.append('Email', email);
        formData.append('Password', password);
        formData.append('Contact', mobile);
        formData.append('Designation', desiganation);
        formData.append('AadharNo', aadhar);
        formData.append('PanNo', pan);
        formData.append('ReferalName', ReferalName);
        formData.append('ReferalContactNo', ReferalNo);
        formData.append('Shift', JSON.stringify(sendShift));

        await axios.post(`${Rupioo_Lite_BaseUrl}empoloyee/save-employee`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        })
            .then((response) => {
                console.log(response?.data);
                Alert.alert('successfull !!', response?.data?.message);
                navigation.navigate('Employee')
            })
            .catch((error) => {
                console.log(error?.response?.data);
                Alert.alert('error !!', error?.response?.data?.message);
            })
    }

    return (
        <GestureHandlerRootView style={styles.container}>
            {/* <View style={styles.container}> */}

            <View style={{ height: calculateHeightPercentage(87.5), width: '100%', alignItems: 'center', marginTop: calculateHeightPercentage(1.5) }}>
                <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={10}>
                    <ScrollView showsVerticalScrollIndicator={true} style={{ marginBottom: calculateHeightPercentage(1) }}>

                        {/* Name */}
                        <Text style={{ fontSize: calculateFontSizePercentage(4), paddingVertical: calculateHeightPercentage(-2), marginLeft: calculateWidthPercentage(1), color: 'black' }}>Username</Text>
                        <TextInput
                            style={styles.input}
                            placeholderTextColor={'gray'}
                            placeholder="Username"
                            value={userName}
                            onChangeText={text => setUserName(text)}
                        />

                        {/* DOB */}
                        <Text style={{ fontSize: calculateFontSizePercentage(4), marginTop: calculateHeightPercentage(2), marginLeft: calculateWidthPercentage(1), color: 'black' }}>DOB</Text>
                        <View>
                            <TouchableOpacity
                                style={styles.input}
                                onPress={() => setOpenDate(true)}
                            >
                                {
                                    date1 ? <Text style={{ color: 'black' }}>{moment(date1).format("DD/MM/YYYY")}</Text> : <Text>DD/MM/YY</Text>
                                }
                            </TouchableOpacity>
                            <DatePicker
                                modal
                                open={openDate}
                                date={date1}
                                mode='date'
                                onConfirm={(date) => {
                                    setOpenDate(false)
                                    setDate(date)
                                    console.log(date)
                                }}
                                onCancel={() => {
                                    setOpenDate(false)
                                }}
                            />
                        </View>


                        {/* Address */}
                        <Text style={{ fontSize: calculateFontSizePercentage(4), paddingVertical: calculateHeightPercentage(-2), marginLeft: calculateWidthPercentage(1), color: 'black', marginTop: calculateHeightPercentage(2) }}>Address</Text>
                        <TextInput
                            style={styles.input}
                            placeholderTextColor={'gray'}
                            placeholder="Address"
                            value={address}
                            onChangeText={text => setAddress(text)}
                            keyboardType='email-address'
                        />

                        {/* Email */}
                        <Text style={{ fontSize: calculateFontSizePercentage(4), paddingVertical: calculateHeightPercentage(-2), marginLeft: calculateWidthPercentage(1), color: 'black', marginTop: calculateHeightPercentage(2) }}>Email</Text>
                        <TextInput
                            style={styles.input}
                            placeholderTextColor={'gray'}
                            placeholder="Email"
                            value={email}
                            onChangeText={text => setEmail(text)}
                            keyboardType='email-address'
                        />

                        <Text style={{ fontSize: calculateFontSizePercentage(4), marginLeft: calculateWidthPercentage(1), marginTop: calculateHeightPercentage(2) }}>Password</Text>
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

                        {/* Contact */}
                        <Text style={{ fontSize: calculateFontSizePercentage(4), paddingVertical: calculateHeightPercentage(-2), marginLeft: calculateWidthPercentage(1), color: 'black', marginTop: calculateHeightPercentage(2) }}>Contact</Text>
                        <View style={styles.input}>
                            <TextInput
                                style={{ flex: 1, color: 'black' }}
                                placeholderTextColor={'gray'}
                                placeholder="Mobile"
                                value={mobile}
                                onChangeText={handleMobileNo}
                                keyboardType='numeric'
                            />
                        </View>

                        {/* Desiganation */}
                        <Text style={{ fontSize: calculateFontSizePercentage(4), paddingVertical: calculateHeightPercentage(-2), marginLeft: calculateWidthPercentage(1), color: 'black', marginTop: calculateHeightPercentage(2) }}>Desiganation</Text>
                        <TextInput
                            style={styles.input}
                            placeholderTextColor={'gray'}
                            placeholder="Desiganation"
                            value={desiganation}
                            onChangeText={text => setDesiganation(text)}
                        // keyboardType='email-address'
                        />

                        <Text style={{ fontSize: calculateFontSizePercentage(4), paddingVertical: calculateHeightPercentage(-2), marginLeft: calculateWidthPercentage(1), color: 'black', marginTop: calculateHeightPercentage(2) }}>Shift</Text>
                        <Dropdown
                            style={[styles.dropdown, isFocus && { borderColor: 'blue' }]}
                            placeholderStyle={styles.placeholderStyle}
                            selectedTextStyle={styles.selectedTextStyle}
                            inputSearchStyle={styles.inputSearchStyle}
                            iconStyle={styles.iconStyle}
                            data={ShiftList.map((shift) => ({ label: shift?.shiftName, value: shift?.shiftName , obj:shift }))}
                            search
                            maxHeight={300}
                            labelField="label"
                            valueField="value"
                            placeholder={!isFocus ? 'Select item' : '...'}
                            searchPlaceholder="Search..."
                            value={value}
                            onFocus={() => setIsFocus(true)}
                            onBlur={() => setIsFocus(false)}
                            onChange={(item)=>{
                                console.log("ggggg",item)
                                handleSelectShift(item);
                            }}
                            renderLeftIcon={() => (
                                <AntDesign
                                    style={styles.icon}
                                    color={isFocus ? 'blue' : 'black'}
                                    name="Safety"
                                    size={20}
                                />
                            )}
                        />

                        {/* AAdhar No. */}
                        <Text style={{ fontSize: calculateFontSizePercentage(4), paddingVertical: calculateHeightPercentage(-2), marginLeft: calculateWidthPercentage(1), color: 'black', marginTop: calculateHeightPercentage(2) }}>Aadhar No.</Text>
                        <View style={styles.input}>
                            <TextInput
                                style={{ flex: 1, color: 'black' }}
                                placeholderTextColor={'gray'}
                                placeholder="Aadhar number"
                                value={aadhar}
                                onChangeText={num => setAadhar(num)}
                            />
                        </View>

                        {/* Pan No. */}
                        <Text style={{ fontSize: calculateFontSizePercentage(4), paddingVertical: calculateHeightPercentage(-2), marginLeft: calculateWidthPercentage(1), color: 'black', marginTop: calculateHeightPercentage(2) }}>Pan No.</Text>
                        <View style={styles.input}>
                            <TextInput
                                style={{ flex: 1, color: 'black' }}
                                placeholderTextColor={'gray'}
                                placeholder="Pan number"
                                value={pan}
                                onChangeText={num => setPan(num)}
                            />
                        </View>

                        {/* Referal Name */}
                        <Text style={{ fontSize: calculateFontSizePercentage(4), paddingVertical: calculateHeightPercentage(-2), marginLeft: calculateWidthPercentage(1), color: 'black', marginTop: calculateHeightPercentage(2) }}>Referal name</Text>
                        <View style={styles.input}>
                            <TextInput
                                style={{ flex: 1, color: 'black' }}
                                placeholderTextColor={'gray'}
                                placeholder="Referal Name"
                                value={ReferalName}
                                onChangeText={num => setReferalName(num)}
                            />
                        </View>

                        {/* Referal Number */}
                        <Text style={{ fontSize: calculateFontSizePercentage(4), paddingVertical: calculateHeightPercentage(-2), marginLeft: calculateWidthPercentage(1), color: 'black', marginTop: calculateHeightPercentage(2) }}>Referal No.</Text>
                        <View style={styles.input}>
                            <TextInput
                                style={{ flex: 1, color: 'black' }}
                                placeholderTextColor={'gray'}
                                placeholder="Referal number"
                                value={ReferalNo}
                                onChangeText={handleReferalNo}
                                keyboardType='numeric'
                            />
                        </View>
                        <TouchableOpacity onPress={handleLogin} style={styles.button}>
                            <Text style={styles.buttonText}>Submit</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </KeyboardAvoidingView>
            </View>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={closeModal}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalTitle}>Choose an option</Text>
                        <TouchableOpacity onPress={() => { closeModal(); TakePhotoFromCamera(); }} style={styles.modalButton}>
                            <Text style={styles.modalButtonText}>Take Photo</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => { closeModal(); TakePhotoFromGallery(); }} style={styles.modalButton}>
                            <Text style={styles.modalButtonText}>Choose from Gallery</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={closeModal} style={styles.modalCancelButton}>
                            <Text style={styles.modalButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </GestureHandlerRootView >
    );
};

// define your styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#fff0',
    },
    footer: {
        position: 'absolute',
        height: "10%",
        alignItems: "center",
        top: calculateHeightPercentage(80),
        // marginTop:calculateHeightPercentage(5)
    },
    image: {
        alignSelf: 'center',
        marginHorizontal: calculateWidthPercentage(3),
        width: calculateWidthPercentage(12),
        height: calculateHeightPercentage(8),
        resizeMode: 'center',
        borderRadius: calculateFontSizePercentage(100)
    },
    name: {
        fontSize: calculateFontSizePercentage(4),
        fontWeight: 'bold',
        width: calculateWidthPercentage(50)
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
        marginTop: calculateHeightPercentage(1),
        borderRadius: calculateFontSizePercentage(1),
        width: "85%",
        alignSelf: 'center',
        elevation: 3,
        marginBottom: calculateHeightPercentage(1)
    },
    buttonText: {
        fontSize: calculateFontSizePercentage(5),
        color: 'white',
        textAlign: 'center',
        fontWeight: '650',
        // marginBottom: calculateHeightPercentage(8)
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: calculateWidthPercentage(85),
        marginTop: calculateHeightPercentage(2),
    },
    photoButton: {
        backgroundColor: 'grey',
        paddingVertical: calculateHeightPercentage(1),
        borderRadius: calculateFontSizePercentage(1),
        width: "48%",
        alignSelf: 'center',
        elevation: 5,
    },
    photo: {
        width: calculateWidthPercentage(50),
        height: calculateHeightPercentage(25),
        marginTop: calculateHeightPercentage(2),
        borderRadius: calculateFontSizePercentage(1),
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: calculateFontSizePercentage(2),
        padding: calculateHeightPercentage(2),
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: calculateFontSizePercentage(5),
        fontWeight: 'bold',
        marginBottom: calculateHeightPercentage(2),
    },
    modalButton: {
        backgroundColor: 'grey',
        paddingVertical: calculateHeightPercentage(1),
        paddingHorizontal: calculateWidthPercentage(5),
        width: calculateWidthPercentage(70),
        borderRadius: calculateFontSizePercentage(1),
        marginVertical: calculateHeightPercentage(1),
    },
    modalCancelButton: {
        backgroundColor: 'grey',
        paddingVertical: calculateHeightPercentage(1),
        paddingHorizontal: calculateWidthPercentage(5),
        width: calculateWidthPercentage(70),
        borderRadius: calculateFontSizePercentage(1),
        marginVertical: calculateHeightPercentage(1),
    },
    modalButtonText: {
        fontSize: calculateFontSizePercentage(4),
        color: 'white',
        textAlign: 'center',
    },
    dropdown: {
        height: calculateHeightPercentage(6),
        borderColor: 'gray',
        borderWidth: 0.5,
        borderRadius: calculateFontSizePercentage(1),
        paddingHorizontal: calculateWidthPercentage(2),
    },
    icon: {
        marginRight: calculateWidthPercentage(1),
    },
    label: {
        position: 'absolute',
        backgroundColor: 'white',
        left: calculateWidthPercentage(5),
        top: 8,
        zIndex: 999,
        paddingHorizontal: calculateWidthPercentage(2),
        fontSize: calculateFontSizePercentage(4),
    },
    placeholderStyle: {
        fontSize: calculateFontSizePercentage(4),
    },
    selectedTextStyle: {
        color:'black',
        fontSize: calculateFontSizePercentage(4),
    },
    iconStyle: {
        width: calculateWidthPercentage(3),
        height: calculateHeightPercentage(3),
    },
    inputSearchStyle: {
        height: calculateHeightPercentage(5),
        fontSize: calculateFontSizePercentage(3.5),
    },
});

//make this component available to the app
export default Create_Employee;
