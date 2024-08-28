//import liraries
import React, { useCallback, useEffect, useState, } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image, TextInput, Button, Switch, Modal, Alert, KeyboardAvoidingView } from 'react-native';
import { GestureHandlerRootView, ScrollView, } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/Ionicons';
import DatePicker from 'react-native-date-picker';
import moment from 'moment';
import Footer from '../../Bottom/Footer';
import { Dropdown } from 'react-native-element-dropdown';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import axios, { Axios } from 'axios';
import { Rupioo_Lite_BaseUrl } from '../../../../Config/BaseUtil';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AntDesign from 'react-native-vector-icons/AntDesign'

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const calculateHeightPercentage = (percentage) => (windowHeight * percentage) / 100;
const calculateWidthPercentage = (percentage) => (windowWidth * percentage) / 100;
const calculateFontSizePercentage = (percentage) => {
    const baseDimension = Math.min(windowWidth, windowHeight);
    return (baseDimension * percentage) / 100;
};
// create a component
const Edit_Employee = ({ navigation }) => {
    const [userName, setUserName] = useState('');
    const [date1, setDate] = useState(null);
    const [showDate, setShowDate] = useState();
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
    const [Resphoto, setResPhoto] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [EmpId, setEmpId] = useState('');

    const [ShiftList, setShiftList] = useState([{}]);
    const [ShowShiftList, setShowShiftList] = useState({});
    const [value, setValue] = useState(null);
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
        console.log("Handle Item :- ", item);
        setValue(item.value);
        setIsFocus(false);
    };

    console.log("Value :- ", value);

    useEffect(() => {
        const getEmployee = async () => {
            try {
                const employeeId = await AsyncStorage.getItem("EmployeeId");
                if (!employeeId) {
                    console.log("Employee ID not found in storage");
                    return;
                }
                await axios.get(`${Rupioo_Lite_BaseUrl}empoloyee/view-employee-by-id/${employeeId}`)
                    .then((res) => {
                        console.log(res?.data?.Employee);
                        console.log(res?.data?.Employee?._id);
                        setEmpId(res?.data?.Employee?._id)
                        setResPhoto(res?.data?.Employee?.Image);
                        setUserName(res?.data?.Employee?.Name);
                        setShowDate(res?.data?.Employee?.dob);
                        setAddress(res?.data?.Employee?.Address);
                        setEmail(res?.data?.Employee?.Email);
                        setPassword(res?.data?.Employee?.Password);
                        setMobile(res?.data?.Employee?.Contact);
                        setDesiganation(res?.data?.Employee?.Designation);
                        setAadhar(res?.data?.Employee?.AadharNo);
                        setPan(res?.data?.Employee?.PanNo);
                        setReferalName(res?.data?.Employee?.ReferalName);
                        setReferalNo(res?.data?.Employee?.ReferalContactNo);
                        setShowShiftList(JSON.parse(res?.data?.Employee?.Shift))
                    })
                    .catch((err) => {
                        console.log(err)
                    })
            } catch (error) {
                console.error("Error fetching employee data:", error?.response?.data);
            }
        };
        getEmployee();
    }, []);

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

    const handleEdit = async () => {
        const employeeId = await AsyncStorage.getItem("EmployeeId");

        console.log("Name :- ", userName);
        console.log('dob :- ', moment(date1).format("DD/MM/YYYY"));
        console.log("Address :- ", address);
        console.log("Email :- ", email);
        console.log("passsword :- ", password);
        console.log("Contact :- ", mobile);
        console.log("Desiganation :- ", desiganation);
        console.log("Aadhar :- ", aadhar);
        console.log("Pan :- ", pan);
        console.log("Referal Name :- ", ReferalName);
        console.log("Referal Number :- ", ReferalNo);

        const payload = {
            Name: userName,
            dob: moment(date1).format("DD/MM/YYYY"),
            Address: address,
            Email: email,
            Password: password,
            Contact: mobile,
            Designation: desiganation,
            AadharNo: aadhar,
            PanNo: pan,
            ReferalName: ReferalName,
            ReferalContactNo: ReferalNo,
        }

        await axios.put(`${Rupioo_Lite_BaseUrl}/empoloyee/update-employee/${employeeId}`, payload)
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

    const deleteEmployee = async () => {
        console.log("Emp ID :- ",EmpId);
        await axios.delete(`${Rupioo_Lite_BaseUrl}/empoloyee/delete-employee/${EmpId}`)
            .then((res) => {
                console.log(res);
                navigation.navigate('Employee')
            })
            .catch((err) => {
                console.log(err);
            })
    }

    return (
        <GestureHandlerRootView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => { navigation.navigate('Employee') }}
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
                    <Text style={{ fontSize: calculateFontSizePercentage(5), fontWeight: "bold", color: 'black' }}>Edit Employee</Text>
                </View>

                <TouchableOpacity
                    onPress={() => { deleteEmployee() }}
                    style={{
                        backgroundColor: "transparent",
                        paddingLeft: calculateWidthPercentage(30),
                        marginTop:calculateFontSizePercentage(1)
                    }}
                >
                    <View style={{ alignItems: 'center', }}>
                        <Icon name="trash" size={23} color={'red'} />
                        <Text style={{ textAlign: 'center', marginTop: calculateHeightPercentage(-0.5), color: 'red',fontSize:calculateFontSizePercentage(3) }}>Delete</Text>
                    </View>
                </TouchableOpacity>
            </View>

            {/* Fields */}
            <View style={{ height: calculateHeightPercentage(76.6), width: '100%', alignItems: 'center', marginTop: calculateHeightPercentage(0.5) }}>
                <KeyboardAvoidingView behavior="padding" style={{ flex:1 }}>
                    <ScrollView showsVerticalScrollIndicator={false} style={{ marginBottom: calculateHeightPercentage(0.5) }}>

                        {/* Name */}
                        <View style={{ flexDirection: 'row', width: '100%', alignItems: 'center' }}>
                            <Text style={{ fontSize: calculateFontSizePercentage(3.2), paddingVertical: calculateHeightPercentage(-2), marginLeft: calculateWidthPercentage(1), color: 'blue', marginRight: calculateWidthPercentage(2) }}>USERNAME</Text>
                            <TextInput
                                style={styles.input}
                                placeholderTextColor={'gray'}
                                placeholder="Username"
                                value={userName}
                                onChangeText={text => setUserName(text)}
                            />
                        </View>

                        {/* DOB */}
                        <View style={{ flexDirection: 'row', width: '100%', marginTop: calculateHeightPercentage(0), alignItems: 'center' }}>
                            <Text style={{ fontSize: calculateFontSizePercentage(3.2), paddingVertical: calculateHeightPercentage(-2), marginLeft: calculateWidthPercentage(1), color: 'blue', marginRight: calculateWidthPercentage(14) }}>DOB</Text>
                            <View>
                                <TouchableOpacity
                                    style={styles.input}
                                    onPress={() => setOpenDate(true)}
                                >
                                    {
                                        date1 ? <Text style={{ color: 'black', textAlign: 'center', alignItems: 'center', alignSelf: 'center' }}>{moment(date1).format("DD/MM/YYYY")}</Text> : showDate ? <Text style={{ color: 'black', textAlign: 'center', alignItems: 'center', alignSelf: 'center' }}>{showDate}</Text> : <Text>DD/MM/YY</Text>
                                    }
                                </TouchableOpacity>
                                <DatePicker
                                    modal
                                    open={openDate}
                                    date={new Date()}
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
                        </View>


                        {/* Address */}
                        <View style={{ flexDirection: 'row', width: '100%', marginTop: calculateHeightPercentage(0), alignItems: 'center' }}>
                            <Text style={{ fontSize: calculateFontSizePercentage(3.2), paddingVertical: calculateHeightPercentage(-2), marginLeft: calculateWidthPercentage(1), color: 'blue', marginRight: calculateWidthPercentage(5.5) }}>ADDRESS</Text>
                            <TextInput
                                style={styles.input}
                                placeholderTextColor={'gray'}
                                placeholder="Address"
                                value={address}
                                onChangeText={text => setAddress(text)}
                                keyboardType='email-address'
                            />
                        </View>

                        {/* Email */}
                        <View style={{ flexDirection: 'row', width: '100%', marginTop: calculateHeightPercentage(0), alignItems: 'center' }}>
                            <Text style={{ fontSize: calculateFontSizePercentage(3.2), paddingVertical: calculateHeightPercentage(-2), marginLeft: calculateWidthPercentage(1), color: 'blue', marginRight: calculateWidthPercentage(10) }}>EMAIL</Text>
                            <TextInput
                                style={styles.input}
                                placeholderTextColor={'gray'}
                                placeholder="Email"
                                value={email}
                                onChangeText={text => setEmail(text)}
                                keyboardType='email-address'
                            />
                        </View>

                        {/* PASSWORD */}
                        <View style={{ flexDirection: 'row', width: '100%', marginTop: calculateHeightPercentage(0), alignItems: 'center' }}>
                            <Text style={{ fontSize: calculateFontSizePercentage(3.2), paddingVertical: calculateHeightPercentage(-2), marginLeft: calculateWidthPercentage(1), color: 'blue', marginRight: calculateWidthPercentage(2) }}>PASSWORD</Text>
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
                        </View>

                        {/* Contact */}
                        <View style={{ flexDirection: 'row', width: '100%', marginTop: calculateHeightPercentage(0), alignItems: 'center' }}>
                            <Text style={{ fontSize: calculateFontSizePercentage(3.2), paddingVertical: calculateHeightPercentage(-2), marginLeft: calculateWidthPercentage(1), color: 'blue', marginRight: calculateWidthPercentage(5) }}>CONTACT</Text>
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
                        </View>

                        {/* Desiganation */}
                        <View style={{ flexDirection: 'row', width: '100%', marginTop: calculateHeightPercentage(0), alignItems: 'center' }}>
                            <Text style={{ fontSize: calculateFontSizePercentage(3.2), paddingVertical: calculateHeightPercentage(-2), marginLeft: calculateWidthPercentage(1), color: 'blue', marginRight: calculateWidthPercentage(5) }}>POSITION</Text>
                            <TextInput
                                style={styles.input}
                                placeholderTextColor={'gray'}
                                placeholder="Desiganation"
                                value={desiganation}
                                onChangeText={text => setDesiganation(text)}
                            // keyboardType='email-address'
                            />
                        </View>

                        {/* SHIFT */}
                        <View style={{ flexDirection: 'row', width: '100%', marginTop: calculateHeightPercentage(0), alignItems: 'center' }}>
                            <Text style={{ fontSize: calculateFontSizePercentage(3.2), paddingVertical: calculateHeightPercentage(-2), marginLeft: calculateWidthPercentage(1), color: 'blue', marginRight: calculateWidthPercentage(11) }}>SHIFT</Text>
                            <Dropdown
                                style={[styles.dropdown, isFocus && { borderColor: 'blue' }]}
                                placeholderStyle={styles.placeholderStyle}
                                selectedTextStyle={styles.selectedTextStyle}
                                inputSearchStyle={styles.inputSearchStyle}
                                iconStyle={styles.iconStyle}
                                data={ShiftList.map((shift) => ({ label: shift?.shiftName, value: shift?.shiftName, obj: shift }))}
                                search
                                maxHeight={300}
                                labelField="label"
                                valueField="value"
                                placeholder={!isFocus ? 'Select item' : '...'}
                                searchPlaceholder="Search..."
                                value={value == null ? value : ShowShiftList?.shiftName}
                                onFocus={() => setIsFocus(true)}
                                onBlur={() => setIsFocus(false)}
                                onChange={(item) => {
                                    console.log("ggggg", item)
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
                        </View>

                        {/* AAdhar No. */}
                        <View style={{ flexDirection: 'row', width: '100%', marginTop: calculateHeightPercentage(0), alignItems: 'center' }}>
                            <Text style={{ fontSize: calculateFontSizePercentage(3.2), paddingVertical: calculateHeightPercentage(-2), marginLeft: calculateWidthPercentage(1), color: 'blue', marginRight: calculateWidthPercentage(2) }}>AADHAR N.</Text>
                            <View style={styles.input}>
                                <TextInput
                                    style={{ flex: 1, color: 'black' }}
                                    placeholderTextColor={'gray'}
                                    placeholder="Aadhar number"
                                    value={aadhar}
                                    onChangeText={num => setAadhar(num)}
                                />
                            </View>
                        </View>

                        {/* Pan No. */}
                        <View style={{ flexDirection: 'row', width: '100%', marginTop: calculateHeightPercentage(0), alignItems: 'center' }}>
                            <Text style={{ fontSize: calculateFontSizePercentage(3.2), paddingVertical: calculateHeightPercentage(-2), marginLeft: calculateWidthPercentage(1), color: 'blue', marginRight: calculateWidthPercentage(7) }}>PAN NO.</Text>
                            <View style={styles.input}>
                                <TextInput
                                    style={{ flex: 1, color: 'black' }}
                                    placeholderTextColor={'gray'}
                                    placeholder="Pan number"
                                    value={pan}
                                    onChangeText={num => setPan(num)}
                                />
                            </View>
                        </View>

                        {/* Referal Name */}
                        <View style={{ flexDirection: 'row', width: '100%', marginTop: calculateHeightPercentage(0), alignItems: 'center' }}>
                            <Text style={{ fontSize: calculateFontSizePercentage(3.2), paddingVertical: calculateHeightPercentage(-2), marginLeft: calculateWidthPercentage(1), color: 'blue', marginRight: calculateWidthPercentage(2.5) }}>REF. NAME</Text>
                            <View style={styles.input}>
                                <TextInput
                                    // style={{ flex: 1, color: 'black' }}
                                    placeholderTextColor={'gray'}
                                    placeholder="Referal Name"
                                    value={ReferalName}
                                    onChangeText={num => setReferalName(num)}
                                />
                            </View>
                        </View>

                        {/* Referal Number */}
                        <View style={{ flexDirection: 'row', width: '100%', marginTop: calculateHeightPercentage(0), alignItems: 'center' }}>
                            <Text style={{ fontSize: calculateFontSizePercentage(3.2), paddingVertical: calculateHeightPercentage(-2), marginLeft: calculateWidthPercentage(1), color: 'blue', marginRight: calculateWidthPercentage(7) }}>REF. NO.</Text>
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
                        </View>
                    </ScrollView>

                    <View style={{ flexDirection: 'row', marginBottom: calculateHeightPercentage(-3),justifyContent:'center' }}>
                        <TouchableOpacity onPress={handleEdit} style={{
                            backgroundColor: 'red',
                            paddingVertical: calculateHeightPercentage(0.8),
                            borderRadius: calculateFontSizePercentage(1),
                            width: "35%",
                            alignSelf: 'center',
                            elevation: 3,
                            marginBottom: calculateHeightPercentage(1),
                            marginRight: calculateWidthPercentage(2)
                        }}>
                            <Text style={styles.buttonText}>Submit</Text>
                        </TouchableOpacity>
                        <View style={{ width: calculateWidthPercentage(5) }}></View>
                        <TouchableOpacity onPress={() => navigation.navigate("Register_Employee")} style={{
                            backgroundColor: 'green',
                            paddingVertical: calculateHeightPercentage(0.8),
                            borderRadius: calculateFontSizePercentage(1),
                            width: "35%",
                            alignSelf: 'center',
                            elevation: 3,
                            marginBottom: calculateHeightPercentage(1)
                        }}>
                            <Text style={styles.buttonText}>Face-Register</Text>
                        </TouchableOpacity>
                    </View>
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

            {/* Footer */}
            <View style={styles.footer}>
                <View style={{ flexDirection: 'row', marginBottom: calculateHeightPercentage(1) }}>
                </View>
                <Footer navigation={navigation} />
            </View>
        </GestureHandlerRootView >
    );
};

// define your styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        // alignItems: 'center',
        // backgroundColor: '#fff0',
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
        top: calculateHeightPercentage(86.5),
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
        textAlign: 'center',
        paddingHorizontal: calculateWidthPercentage(5),
        flexDirection: 'row',
        height: calculateHeightPercentage(5),
        width: calculateWidthPercentage(60),
        borderColor: 'black',
        borderRadius: calculateFontSizePercentage(1),
        // alignItems: 'center',
        backgroundColor: "#f0f0f0",
        borderColor: '#e0e0e5',
        borderWidth: 1,
        elevation: 2,
        marginTop: calculateHeightPercentage(1),
    },
    button: {
        backgroundColor: 'black',
        paddingVertical: calculateHeightPercentage(1),
        marginTop: calculateHeightPercentage(1),
        borderRadius: calculateFontSizePercentage(1),
        width: "40%",
        alignSelf: 'center',
        elevation: 3,
        marginBottom: calculateHeightPercentage(1)
    },
    buttonText: {
        fontSize: calculateFontSizePercentage(4),
        color: 'white',
        textAlign: 'center',
        fontWeight: '650',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: calculateWidthPercentage(85),
        marginTop: calculateHeightPercentage(1),
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
        marginTop: calculateHeightPercentage(1),
        height: calculateHeightPercentage(5),
        width: calculateWidthPercentage(60),
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
        color: 'black',
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
export default Edit_Employee;
