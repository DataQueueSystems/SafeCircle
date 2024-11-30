import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {useAuthContext} from '../context/GlobaContext';
import UserHome from './User/UserHome';
import AdminHome from './Admin/AdminHome';

export default function Parent() {
  const {userDetail} = useAuthContext();
  return <>
  {userDetail?.role == 'admin' ? <AdminHome /> : <UserHome />}
  </>;
}
const styles = StyleSheet.create({});
