//import liraries
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Splash from './src/Auth/Splash';
import Login from './src/Auth/Login';
import Employee from './src/Main/Bottom/Employee';
import Transiction from './src/Main/Bottom/Transiction';
import More from './src/Main/Bottom/More';
import Salary from './src/Main/Bottom/Salary';
import Edit_Employee from './src/Main/Stack/Employee/EditEmployee';
import Employee_List from './src/Main/Stack/Employee/EmployeeList';
import Create_Employee from './src/Main/Stack/Employee/CreateEmployee';
import Shift_List from './src/Main/Stack/Shift/ShiftList';
import Create_Shift from './src/Main/Stack/Shift/CreateShift';
import Edit_Shift from './src/Main/Stack/Shift/EditShift';
import Register_Faces from './src/Main/Stack/Employee/RegisterFaces';
import Dashboard from './src/Main/Bottom/Dashboard';
import HolidayList from './src/Main/Stack/Holiday/HolidayList';
import CreateHoliday from './src/Main/Stack/Holiday/CreateHoliday';
import EditHoliday from './src/Main/Stack/Holiday/EditHoliday';
import LeaveList from './src/Main/Stack/Leave/LeaveList';
import CreateLeave from './src/Main/Stack/Leave/CreateLeave';
import EditLeave from './src/Main/Stack/Leave/EditLeave';
import Advance from './src/Main/Stack/Transication/Advance';
import Payment from './src/Main/Stack/Transication/Payment';
import Loan from './src/Main/Stack/Transication/Loan';
import TransicationReceipt from './src/Main/Stack/Transication/TransicationReceipt';
import ManageLeaveList from './src/Main/Stack/Manage Leave/ManageLeaveList';
import CreateManageLeave from './src/Main/Stack/Manage Leave/CreateManageLeave';
import EditManageLeave from './src/Main/Stack/Manage Leave/EditanageLeave';
import LogList from './src/Main/Stack/Attendance/AttendanceLogs';
import Pdf from './src/Main/Stack/Salary/Pdf';
import PdfScreen from './src/Main/Stack/Salary/Pdf';
import Create_Receipt from './src/Main/Stack/Transication/CreateReceipt';
import Create_payment from './src/Main/Stack/Transication/CreatePayment';
import Edit_Receipt from './src/Main/Stack/Transication/EditReceipt';
import PrevAttendance from './src/Main/Stack/Attendance/PreviousAttendaceList';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false
        }}
      >
        <Stack.Screen name="Splash" component={Splash} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Dashboard" component={Dashboard} />
        <Stack.Screen name="Employee" component={Employee_List} />
        <Stack.Screen name="Holiday List" component={HolidayList} />
        <Stack.Screen name="Leave List" component={LeaveList} />
        <Stack.Screen name="Manage Leave" component={ManageLeaveList} />
        <Stack.Screen name="Attendance Logs" component={LogList}
          options={{
            headerShown: true,
          }}
        />
        <Stack.Screen name="All Attendance" component={PrevAttendance}
          options={{
            headerShown: true,
          }}
        />
        <Stack.Screen name="Create_Employee" component={Create_Employee}
          options={{
            headerShown: true,
          }}
        />
        <Stack.Screen name="Edit_Employee" component={Edit_Employee}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen name="Register_Employee" component={Register_Faces}
          options={{
            headerShown: true,
          }}
        />
        <Stack.Screen name="Shift List" component={Shift_List}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen name="Create Shift" component={Create_Shift}
          options={{
            headerShown: true,
          }}
        />
        <Stack.Screen name="Edit_Shift" component={Edit_Shift}
          options={{
            headerShown: true,
          }}
        />
        <Stack.Screen name="Create Holiday" component={CreateHoliday}
          options={{
            headerShown: true,
          }}
        />
        <Stack.Screen name="Edit Holiday" component={EditHoliday}
          options={{
            headerShown: true,
          }}
        />
        <Stack.Screen name="Create Leave" component={CreateLeave}
          options={{
            headerShown: true,
          }}
        />
        <Stack.Screen name="Edit Leave" component={EditLeave}
          options={{
            headerShown: true,
          }}
        />
        <Stack.Screen name="Create Manage Leave" component={CreateManageLeave}
          options={{
            headerShown: true,
          }}
        />
        <Stack.Screen name="Edit Manage Leave" component={EditManageLeave}
          options={{
            headerShown: true,
          }}
        />
        <Stack.Screen name="Salary" component={Salary} />
        <Stack.Screen name="Receipt" component={TransicationReceipt}/>
        <Stack.Screen name="Create Receipt" component={Create_Receipt}
          options={{
            headerShown: true,
          }}
        />
        <Stack.Screen name="Edit Receipt" component={Edit_Receipt}
          options={{
            headerShown: true,
          }}
        />
        <Stack.Screen name="Create Payment" component={Create_payment}
          options={{
            headerShown: true,
          }}
        />
        <Stack.Screen name="Advance" component={Advance}/>
        <Stack.Screen name="Payment" component={Payment}/>
        <Stack.Screen name="Loan" component={Loan}/>
        <Stack.Screen name="Pdf" component={PdfScreen}
          options={{
            headerShown: true,
          }}
        />
        <Stack.Screen name="More" component={More} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2c3e50',
  },
});

export default App;
