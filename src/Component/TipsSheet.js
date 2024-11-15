import React, {useCallback, useContext, useEffect, useState} from 'react';
import {View, StyleSheet, TouchableOpacity, Alert} from 'react-native';
import BottomSheet, {BottomSheetBackdrop} from '@gorhom/bottom-sheet';
import {Text, useTheme, Portal, Divider} from 'react-native-paper';
import SemiBoldText from '../customText/SemiBoldText';
import RegularText from '../customText/RegularText';

const TipsSheet = ({bottomSheetRef}) => {
  const snapPoints = ['50%', '70%'];
  let theme = useTheme();
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

  return (
    <Portal>
      <BottomSheet
        ref={bottomSheetRef}
        enablePanDownToClose={true}
        index={-1} // Initially closed
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        backgroundStyle={{
          backgroundColor: theme.colors.sheetGreen,
        }}
        handleIndicatorStyle={{backgroundColor: theme.colors.onBackground}}>
        <View
          style={[
            styles.bottomModelDiv,
            {backgroundColor: theme.colors.sheetGreen},
          ]}>
          <SemiBoldText style={styles.header}>Follow Safe Tips</SemiBoldText>
          <Divider />

          <RegularText style={styles.tipsText}>
            1. Wash Your Hands Regularly
          </RegularText>
          <RegularText style={styles.tipsText}>
            2. Wear a Mask in Crowded Areas
          </RegularText>
          <RegularText style={styles.tipsText}>
            3. Maintain Social Distance
          </RegularText>
          <RegularText style={styles.tipsText}>
            4. Stay Home if You Feel Unwell
          </RegularText>
          <RegularText style={styles.tipsText}>
            5. Clean and Disinfect Frequently Touched Surfaces
          </RegularText>
          <RegularText style={styles.tipsText}>
            6. Boost Your Immunity
          </RegularText>
          <RegularText style={styles.tipsText}>7. Get Vaccinated</RegularText>
          <RegularText style={styles.tipsText}>
            8. Cover Coughs and Sneezes
          </RegularText>
        </View>
      </BottomSheet>
    </Portal>
  );
};

export default TipsSheet;

const styles = StyleSheet.create({
  bottomModelDiv: {
    padding: 16,
    flex: 1,
  },
  header: {
    fontSize: 20,
    marginBottom: 12,
  },
  tipsText: {
    marginVertical: 10,
    fontSize: 16,
  },
});
