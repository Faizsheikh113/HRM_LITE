//import liraries
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView, FlatList, RefreshControl, ActivityIndicator, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Table, Row } from "react-native-table-component";
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import axios from 'axios';
import Footer from '../../Bottom/Footer';
import { Rupioo_Lite_BaseUrl } from '../../../../Config/BaseUtil';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNFS from 'react-native-fs';
import Pdf from 'react-native-pdf';
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const calculateHeightPercentage = (percentage) => (windowHeight * percentage) / 100;
const calculateWidthPercentage = (percentage) => (windowWidth * percentage) / 100;
const calculateFontSizePercentage = (percentage) => {
    const baseDimension = Math.min(windowWidth, windowHeight);
    return (baseDimension * percentage) / 100;
};

// create a component
const Salary_Slip = ({ navigation }) => {
    const [SalaryListData, setSalaryListData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refresh, setRefresh] = useState(false);

    // Pdf
    const [count, setCount] = useState(1);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [pdfPath, setPdfPath] = useState('');

    const orderLines = [
        {
            id: 1,
            product: 'Product 1',
            quantity: 1,
            price: '$10.00',
        },
        {
            id: 2,
            product: 'Product 2',
            quantity: 2,
            price: '$20.00',
        },
        {
            id: 3,
            product: 'Product 3',
            quantity: 3,
            price: '$30.00',
        },
    ];

    const generatePDF = async (salaryData) => {
        console.log("first :- ",salaryData);
        setIsLoading(true);
        try {
            const html = `
        <div class="container">
        <div class="panel panel-default thumbnail"> 
            <div class="panel-body">
                <div style="display:flex; justify-content: center;">
                    <img src="https://jupitech.org/hrmnew/hrm/assets/images/HRM.png" alt="logo" style="width:155px; ">
                </div>
                </div>
                <br>
                <div id="dataContainer">
                        <br>
                        <div class="row mb-10">
                            <table width="100%">
                                <thead>
                                    <tr style="height: 40px; background-color: #E7E0EE;">
                                        <th class="text-center fs-20">PAYSLIP</th>
                                    </tr>
                                </thead>
                            </table>
                        </div>
                        <br>
                        <div class="row">
                            <table width="99%" class="payrollDatatableReportPaySlip table table-striped table-bordered table-hover">
                                <tbody>
                                    <tr style="text-align: left; background-color: #E7E0EE;  ">
                                        <th>Employee Name</th>
                                        <td>${salaryData?.employeeId?.Name}</td>
                                        <th>Month</th>
                                        <td>${moment(salaryData?.salaryMonth).format('MMMM')}</td>
                                    </tr>
                                    <tr style="text-align: left;">
                                        <th>Position</th>
                                        <td>${salaryData?.employeeId?.Designation}</td>
                                         <th>Contact</th>
                                        <td>${salaryData?.employeeId?.Contact}</td>
                                    </tr>
                                     
                                    <tr style="text-align: left;">
                                        <th>Address</th>
                                        <td>${salaryData?.employeeId?.Address}</td>
                                        <th>Staff ID No.</th>
                                        <td>${salaryData?.employeeId?._id}</td>
                                    </tr>
                                    
                                    <tr style="text-align: left;">
                                        <th>Worked Days</th>
                                        <td>${salaryData?.totalWorkingDays}</td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="row">
                            <table width="99%" class="payrollDatatableReportPaySlip table table-striped table-bordered table-hover">
                                <thead>
                                    <tr style="text-align: left; background-color: #E7E0EE;">
                                        <th>Description</th>
                                        <th>Gross Amount</th>
                                        <th>Deduction</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr style="text-align: left;">
                                        <td>Basic Salary</td>
                                        <td>${salaryData?.basicSalary}</td>
                                        <td></td>
                                    </tr>
                                    <tr style="text-align: left;">
                                        <th>Total Salary</th>
                                        <th><?php echo $adjusted_total_salary; ?></th>
                                        <th></th>
                                        <!--<th></th>-->
                                        <!--<th></th>-->
                                    </tr>
                                    <tr style="text-align: left;">
                                        <th>Total Deductions</th>
                                        <th></th>
                                        <!--<th></th>-->
                                        <!--<th></th>-->
                                        <th><?php echo $total_deduction; ?></th>
                                    </tr>
                                    <tr style="text-align: left;">
                                        <th colspan="2" align="left">NET SALARY</th>
                                        <!--<th></th>-->
                                        <th align="left"><?php echo $net_salary; ?></th>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
          `;
            const options = {
                html,
                fileName: `Salary_Slip_${count}`,
                directory: 'Invoices',
            };
            const file = await RNHTMLtoPDF.convert(options);
            setPdfPath(file.filePath);
            setIsModalVisible(true);
        } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const downloadPDF = async () => {
        try {
            const downloadsFolder = RNFS.DownloadDirectoryPath;
            const newFilePath = `${downloadsFolder}/invoice_${count}.pdf`;
            await RNFS.copyFile(pdfPath, newFilePath);
            Alert.alert('Success', `PDF saved to ${newFilePath}`);
            setCount(count + 1);
            setIsModalVisible(false);
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };


    const GetManageLeaveList = useCallback(async () => {
        try {
            const id = await AsyncStorage.getItem('userId');
            console.log(id);
            const response = await axios.get(`${Rupioo_Lite_BaseUrl}salary/view-salary/${id}`);
            console.log(response?.data?.Salary);
            setSalaryListData(response?.data?.Salary || []);
        } catch (err) {
            console.log(err);
        } finally {
            setIsLoading(false);
        }
    }, [setSalaryListData, setIsLoading]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            GetManageLeaveList();
        });
        return () => {
            unsubscribe;
        };
    }, [navigation, GetManageLeaveList]);

    const pullMe = () => {
        setRefresh(true);
        GetManageLeaveList();
        setTimeout(() => {
            setRefresh(false);
        }, 1000)
    }

    const DeleteHoliday = async (data) => {
        console.log(data);
        await axios.delete(`${Rupioo_Lite_BaseUrl}leave-manage/delete-manage-leave/${data._id}`)
            .then((res) => {
                console.log(res?.data);
                Alert.alert("Successfull...", res?.data?.message)
                GetManageLeaveList();
            })
            .catch((err) => {
                console.log(err);
                Alert.alert("Successfull...", err?.response?.data)
            })
    }

    const renderProductItem = useCallback((item, index) => {
        const EmployeeName = calculateWidthPercentage(25);
        const AadharNo = calculateWidthPercentage(28);
        const BasicSalary = calculateWidthPercentage(25);
        const CurrentSalary = calculateWidthPercentage(28);
        const Month = calculateWidthPercentage(18);
        const Payslip = calculateWidthPercentage(18);
        const Status = calculateWidthPercentage(18);
        const Action = calculateWidthPercentage(20);
        return (
            <ScrollView horizontal={true}>
                <Table borderStyle={{ borderWidth: 1, borderColor: "#C1C0B9" }}>
                    <Row
                        key={index}
                        data={[
                            item?.employeeId?.Name.toUpperCase(),
                            item?.employeeId?.AadharNo?.toUpperCase(),
                            item?.basicSalary,
                            item?.totalSalary.toFixed(0),
                            moment(item?.salaryMonth, 'MM').format('MMMM'),
                            <TouchableOpacity
                                onPress={() => generatePDF(item)}
                                style={{ borderRadius: calculateFontSizePercentage(2), backgroundColor: 'green', height: calculateHeightPercentage(3.5), width: calculateWidthPercentage(15), justifyContent: 'center', alignSelf: 'center' }}
                            >
                                <Text style={{ padding: calculateFontSizePercentage(1), fontSize: calculateFontSizePercentage(3), color: 'black', textAlign: 'center' }}>Payslip</Text>
                            </TouchableOpacity>,
                            item?.CheckStatus,
                            <View style={{
                                flexDirection: 'row', justifyContent: 'space-around'
                            }}>
                                <TouchableOpacity onPress={() => goToEdit(item)}>
                                    <AntDesign name={'edit'} size={20} color={'black'} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => DeleteHoliday(item)} style={{ marginRight: calculateWidthPercentage(2.5) }}>
                                    <MaterialCommunityIcons name={'delete-outline'} size={20} color={'black'} />
                                </TouchableOpacity>
                            </View>
                        ]}
                        style={[{ backgroundColor: "#E7E6E1", }, index % 2 && { backgroundColor: "#F7F6E7" }]}
                        textStyle={{ fontSize: calculateFontSizePercentage(3.2), textAlign: 'center', color: 'black', padding: calculateHeightPercentage(0.5), paddingHorizontal: calculateWidthPercentage(0.5), marginTop: calculateHeightPercentage(1) }}
                        widthArr={[EmployeeName, AadharNo, BasicSalary, CurrentSalary, Month, Payslip, Status, Action]}
                    />
                </Table >
            </ScrollView >
        );
    }, []);

    return (
        <View style={styles.container}>
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0000ff" />
                </View>
            ) : (
                <ScrollView horizontal={true} style={{ marginBottom: calculateHeightPercentage(8.5) }}>
                    <Table>
                        {/* parameter's : userId,Employee, LeaveType, StartDate, EndDate, LeaveReason,CheckStatus,TotalDays */}
                        <Row data={['Employee', 'Aadhar No.', 'Basic Salary', 'Current Salary', 'Month', 'PaySlip', 'Status', 'Action']} style={{ backgroundColor: '#E1E6F7', }} textStyle={{ margin: calculateHeightPercentage(0.2), fontWeight: '600', fontSize: calculateFontSizePercentage(3.5), color: 'black', textAlign: 'center', }}
                            borderStyle={{ borderColor: "#C1C0B9", borderWidth: calculateWidthPercentage(0.3), }}
                            widthArr={[calculateWidthPercentage(25), calculateWidthPercentage(28), calculateWidthPercentage(25), calculateWidthPercentage(28), calculateWidthPercentage(18), calculateWidthPercentage(18), calculateWidthPercentage(18), calculateWidthPercentage(20),]}
                        />
                        <FlatList
                            refreshControl={
                                <RefreshControl
                                    refreshing={refresh}
                                    onRefresh={() => { pullMe() }}
                                />
                            }
                            style={{ marginBottom: calculateHeightPercentage(1) }}
                            data={SalaryListData}
                            renderItem={({ item, index }) => (
                                renderProductItem(item, index)
                            )}
                            keyExtractor={(item, index) => index.toString()}
                        />
                    </Table>
                </ScrollView>
            )
            }
            <View style={styles.footer}>
                <Footer navigation={navigation} />
            </View>
            <Modal
                visible={isModalVisible}
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View>
                    <View style={{ height: calculateHeightPercentage(80), width: calculateWidthPercentage(100) }}>
                        <Pdf
                            source={{ uri: `file://${pdfPath}` }}
                            onLoadComplete={(numberOfPages, filePath) => {
                                console.log(`Number of pages: ${numberOfPages}`);
                            }}
                            onPageChanged={(page, numberOfPages) => {
                                console.log(`Current page: ${page}`);
                            }}
                            onError={(error) => {
                                console.log(error);
                            }}
                            onPressLink={(uri) => {
                                console.log(`Link pressed: ${uri}`);
                            }}
                            style={{ flex: 1 }}
                        />
                    </View>
                    <TouchableOpacity onPress={downloadPDF}
                        style={{ height: calculateHeightPercentage(6), width: '80%', backgroundColor: 'blue',marginTop:calculateHeightPercentage(5),justifyContent:'center',alignSelf:'center',borderRadius:calculateFontSizePercentage(1) }}
                    >
                        <Text style={{ color: 'white', fontSize: calculateFontSizePercentage(4), padding: calculateFontSizePercentage(1), textAlign: 'center' }}>Download PDF</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </View>
    );
};

// define your styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    footer: {
        position: 'absolute',
        height: "10%",
        alignItems: "center",
        top: calculateHeightPercentage(81)
    },
});

//make this component available to the app
export default Salary_Slip;
