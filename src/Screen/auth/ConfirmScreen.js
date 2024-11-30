import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import Header from '../../Component/Header';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from 'react-native-paper';
import SemiBoldText from '../../customText/SemiBoldText';
import RegularText from '../../customText/RegularText';
import {Iconify} from 'react-native-iconify';

export default function ConfirmScreen() {
  let theme = useTheme();
  let navigation = useNavigation();
  const handleRoleSelect = role => {
    navigation.navigate('Login', {selectedRole: role});
  };
  
  return (
    <>
      <Header screenName={''} />
      <View
        style={[
          styles.mainContainer,
          {backgroundColor: theme.colors.background},
        ]}>
        <ScrollView
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}>
          {/* Top content */}
          <View>
            <SemiBoldText style={styles.heading}>Select Your Role</SemiBoldText>
            <RegularText style={styles.subheading}>
              Choose a role to explore features designed specifically for you.
            </RegularText>
          </View>

          {/* Role base */}
          <View style={styles.mainOptionCard}>
            <TouchableOpacity
              activeOpacity={0.6}
              style={[
                styles.optionCard,
                {backgroundColor: theme.colors.transpgrey},
              ]}
              onPress={() => handleRoleSelect('admin')}>
              <Iconify
                icon="clarity:administrator-line"
                size={90}
                color={theme.colors.onBackground}
              />
              <RegularText>Admin</RegularText>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.6}
              style={[
                styles.optionCard,
                {backgroundColor: theme.colors.transpgrey},
              ]}
              onPress={() => handleRoleSelect('user')}>
              <Iconify
                icon="solar:user-outline"
                size={90}
                color={theme.colors.onBackground}
              />
              <RegularText>User</RegularText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  heading: {
    fontSize: 26,
    marginBottom: 10,
  },
  subheading: {
    fontSize: 16,
    marginBottom: 30,
  },
  mainOptionCard: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionCard: {
    padding: 20,
    marginVertical: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    alignItems: 'center',
    width: '46%',
    flexDirection: 'column',
    gap: 10,
  },
});
