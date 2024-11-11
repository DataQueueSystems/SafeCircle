// toastHelper.js
import { ToastAndroid } from 'react-native';

// Global function to show toast
export const showToast = (message, duration = ToastAndroid.SHORT, position = ToastAndroid.BOTTOM) => {
    ToastAndroid.showWithGravity(
        message,
        duration,  // SHORT or LONG
        position   // BOTTOM, CENTER, or TOP
    );
};
