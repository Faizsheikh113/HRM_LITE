import React, { useState } from 'react';
import { View, Text, Pressable, Alert, Modal,Dimensions } from 'react-native';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNFS from 'react-native-fs';
import Pdf from 'react-native-pdf';

const PdfScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
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

  const generatePDF = async () => {
    setIsLoading(true);
    try {
      const html = `
        <h1>Invoice for Order #${count}</h1>
        <table>
          <tr>
            <th>Order ID</th>
            <td>${count}</td>
          </tr>
          <tr>
            <th>Order Date</th>
            <td>29-Jul-2022</td>
          </tr>
          <tr>
            <th>Order Status</th>
            <td>Completed</td>
          </tr>
          <tr>
            <th>Order Total</th>
            <td>$13232</td>
          </tr>
        </table>
        <h2>Order Lines</h2>
        <table>
          <tr>
            <th>Product ID</th>
            <th>Product Name</th>
            <th>Product Qty</th>
            <th>Product Price</th>
          </tr>
          ${orderLines
          .map(
            (line) => `
                <tr>
                  <td>${line.id}</td>
                  <td>${line.product}</td>
                  <td>${line.quantity}</td>
                  <td>${line.price}</td>
                </tr>
              `,
          )
          .join('')}
        </table>
      `;
      const options = {
        html,
        fileName: `Salary_Slip${count}`,
        directory: 'Invoices',
      };
      const file = await RNHTMLtoPDF.convert(options);
      setPdfPath(file.filePath);
      setIsModalVisible(true);
      setIsLoading(false);
    } catch (error) {
      Alert.alert('Error', error.message);
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

  if (isLoading) {
    return <Text>Generating PDF...</Text>;
  }

  return (
    <View>
      <Pressable onPress={generatePDF}>
        <Text>Generate PDF</Text>
      </Pressable>
      <Modal
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View>
          <View style={{ height: Dimensions.get('window').height * 0.8, width: Dimensions.get('window').width * 1 }}>
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
              style={{ flex: 1, width: '100%', backgroundColor: 'red',alignSelf:'center' }}
            />
          </View>
          <Text>Helllo</Text>
          <Pressable onPress={downloadPDF}>
            <Text>Download PDF</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
};

export default PdfScreen;