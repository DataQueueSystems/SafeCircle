import React, {useCallback, useContext, useEffect, useState} from 'react';
import {View, StyleSheet, TouchableOpacity, Alert} from 'react-native';
import BottomSheet, {BottomSheetBackdrop} from '@gorhom/bottom-sheet';
import {Text, useTheme, Portal, Divider} from 'react-native-paper';
import SemiBoldText from '../customText/SemiBoldText';
import RegularText from '../customText/RegularText';
import {Iconify} from 'react-native-iconify';
import BoldText from '../customText/BoldText';
import moment from 'moment';
import {useNavigation} from '@react-navigation/native';
import {showToast} from '../../utils/Toast';
import firestore, {doc} from '@react-native-firebase/firestore';
import {useAuthContext} from '../context/GlobaContext';

const UserSheet = ({bottomSheetRef, userData}) => {
  const {userDetail} = useAuthContext();

  const snapPoints = userData?.diagnosis ? ['50%', '60%'] : ['30%', '40%'];
  let theme = useTheme();
  let navigation = useNavigation();
  const renderBackdrop = useCallback(
    props => (
      <BottomSheetBackdrop
        {...props}
        style={{backgroundColor: 'rgba(0, 0, 0, 0.5)'}} // Transparent backdrop
        disappearsOnIndex={-1}
        appearsOnIndex={0}
      />
    ),
    [],
  );


  const handleEdit = () => {
    bottomSheetRef.current.close();
    let userScreen=userDetail?.role=="user"?"Edit Detail":"Edit User"
    navigation.navigate('ControlUser', {screenName: userScreen, userData});
  };
  const handleDelete = () => {
    Alert.alert(
      'Delete', //title
      'Are you sure,you want to delete this user ?', //message
      [
        {
          text: 'Cancel', // Cancel button
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'OK', // OK button
          onPress: async () => {
            try {
              let Status = 'Deleted';

              await firestore()
                .collection('users')
                .doc(userData?.id)
                .update({Status});
              bottomSheetRef.current.close();
              showToast('User Deleted ..');
            } catch (error) {
              console.log(error, 'error');
              showToast('Someting went wrong .');
            }
            // some logic
          },
        },
      ],
      {cancelable: false}, // Optionally prevent dismissing by tapping outside the alert
    );
  };
  let TEXT_COLOR = {color: theme.colors.onBackground};
  let addedDetail =
    userData?.addedBy == 'Admin' ? 'Added by you ' : 'User himself registered';
  let IsAdmin = userDetail?.role == 'admin' ? true : false; //disable some input for admin like password,email,name,contactNumber


  return (
    <Portal>
      <BottomSheet
        ref={bottomSheetRef}
        enablePanDownToClose={true}
        index={-1} // Initially closed
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        backgroundStyle={{
          backgroundColor: theme.colors.background,
        }}
        handleIndicatorStyle={{backgroundColor: theme.colors.onBackground}}>
        <View
          style={[
            styles.bottomModelDiv,
            {backgroundColor: theme.colors.background},
          ]}>
          {/* action Icon */}
          <View style={styles.actionView}>
            <Iconify
              onPress={handleEdit}
              icon="basil:edit-outline"
              size={25}
              color={theme.colors.green}
            />
            {IsAdmin && (
              <Iconify
                onPress={handleDelete}
                icon="solar:trash-bin-trash-linear"
                size={25}
                color={theme.colors.red}
              />
            )}
          </View>

          {/* userIcon */}
          <View
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
            }}>
            <Iconify 
                icon="solar:user-outline"
                size={70} color={'grey'} />
          </View>

          {/* User Detail */}
          <View style={styles.userDetailView}>
            <BoldText style={[styles.Nametext, TEXT_COLOR]}>
              {userData?.name}
            </BoldText>
            <RegularText style={[styles.text, TEXT_COLOR]}>
              {userData?.email}
            </RegularText>
            <RegularText style={[styles.text, TEXT_COLOR]}>
              {userData?.contactNumber}
            </RegularText>

            {/* Diagnosis */}
            {userData?.diagnosis && (
              <View>
                {/* Header */}
                <View style={styles.diagnosisHeader}>
                  <View style={styles.line} />
                  <BoldText
                    style={[
                      styles.text,
                      {
                        TEXT_COLOR,
                        marginHorizontal: 10,
                        fontSize: 18,
                      },
                    ]}>
                    Diagnosis
                  </BoldText>
                  <View style={styles.line} />
                </View>

                {/* diagnosis content */}
                <View style={styles.diagnosisContent}>
                  <BoldText style={[styles.text, TEXT_COLOR]}>
                    Type :{' '}
                    <RegularText style={[styles.text, TEXT_COLOR]}>
                      {userData?.diagnosis?.type}
                    </RegularText>
                  </BoldText>
                  <BoldText style={[styles.text, TEXT_COLOR]}>
                    Status :{' '}
                    <RegularText style={[styles.text, TEXT_COLOR]}>
                      {userData?.diagnosis?.status}
                    </RegularText>
                  </BoldText>
                </View>
              </View>
            )}
          </View>

          {/* divider */}
          <View style={{marginTop: 20, marginBottom: 10}}>
            <Divider />
          </View>

          {/* Created Detail */}

          <View style={{gap: 3, marginVertical: 5}}>
            <RegularText
              style={[
                {
                  TEXT_COLOR,
                  textAlign: 'right',
                  fontSize: 12,
                },
              ]}>
              Create on :
              {userData?.create_date
                ? moment(userData?.create_date).format('MMM D YYYY [at] h:mma')
                : 'N/A'}
            </RegularText>

            {IsAdmin && (
              <RegularText
                style={[
                  {
                    TEXT_COLOR,
                    textAlign: 'right',
                    fontSize: 12,
                  },
                ]}>
                {addedDetail}
              </RegularText>
            )}
          </View>
        </View>
      </BottomSheet>
    </Portal>
  );
};

export default UserSheet;

const styles = StyleSheet.create({
  bottomModelDiv: {
    padding: 16,
    flex: 1,
  },
  header: {
    fontSize: 20,
    marginBottom: 12,
  },
  userDetailView: {
    marginTop: 10,
    gap: 3,
  },
  Nametext: {
    fontSize: 22,
    textAlign: 'center',
  },
  text: {
    textAlign: 'center',
  },

  diagnosisHeader: {
    flexDirection: 'row', // Row layout for left, text, and right
    alignItems: 'center', // Center items vertically
    marginVertical: 8,
  },
  line: {
    flex: 1, // Lines take up equal space on both sides
    height: 0.5,
    backgroundColor: 'grey', // Set color of the line (adjust as needed)
  },
  actionView: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 6,
  },
});
