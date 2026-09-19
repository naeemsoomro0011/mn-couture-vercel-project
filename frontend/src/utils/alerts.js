import Swal from 'sweetalert2';
import './alerts.css';

const themedSwal = () => {
  const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
  return Swal.mixin({
    background: isDark ? '#141d20' : '#ffffff',
    color: isDark ? '#eef2f1' : '#221f28',
    confirmButtonColor: '#6d28d9',
    cancelButtonColor: 'transparent',
    customClass: {
      popup: 'mnc-swal-popup',
      title: 'mnc-swal-title',
      htmlContainer: 'mnc-swal-html',
      icon: 'mnc-swal-icon',
      actions: 'mnc-swal-actions',
      confirmButton: 'mnc-swal-confirm',
      cancelButton: 'mnc-swal-cancel',
    },
    buttonsStyling: true,
  });
};

export const alertSuccess = (title, text) =>
  themedSwal().fire({ icon: 'success', title, text, timer: 2200, showConfirmButton: false });

export const alertError = (title, text) =>
  themedSwal().fire({ icon: 'error', title, text });

export const alertConfirm = async (title, text, confirmText = 'Yes') => {
  const result = await themedSwal().fire({
    icon: 'warning',
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: 'Cancel',
  });
  return result.isConfirmed;
};

export const alertLoading = (title = 'Please wait...') => {
  themedSwal().fire({
    title,
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading(),
  });
};

export const closeAlert = () => Swal.close();
