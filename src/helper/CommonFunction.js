import moment from 'moment';

const amountCommon = (amount) => {
    const paymentAmount = parseFloat(amount);
    return isNaN(paymentAmount) ? 0 : paymentAmount.toFixed(2);
}

const submitDATE = (date, errorMessage, setFormDate, setEndDate, setFrom, form_date) => {
    setFormDate(date);
    setEndDate('');
    errorMessage('');

    if (date) {
        const newDate = moment(date).format('YYYY-MM-DD');
        setEndDate(newDate);
        if (!form_date) {
            setFrom(true);
        }
    } else {
        setFrom(false);
    }
};


const tableDATE = (date, setFormDate, setEndDate, setToFormDate, setFrom) => {
    setFormDate(date);
    setEndDate('');
    if (setToFormDate) {
        if (!date) {
            setEndDate('');
            setFrom(true);
        } else {
            setFrom(false);
        }
    } else {
        setFrom(false);
    }

    if (date) {
        const newDate = moment(date).format('YYYY-MM-DD');
        setEndDate(newDate);
        setFrom(false);
    }
};


const onFocusDate = (setHide) => {
    setHide('');
};

const onBlurDate = (setHide, form_date, end_date) => {
    if (form_date) {
        if (!end_date) {
            setHide('This field is required.');
        } else {
            setHide('');
        }
    }
};

export const formatBalance = (amount) => {
  // Use Math.max to ensure the value is not negative
  const value = Math.max(0, amount || 0);
  return value.toFixed(3);
}; 

const formatMoment = (date) => {
    if (!date) return '';

    const trimmed = date.trim();
    const m = moment.utc(trimmed, moment.ISO_8601, true); // strict ISO parse

    return m.isValid() ? m.format('YYYY-MM-DD HH:mm:ss') : '';
};


export { amountCommon, submitDATE, tableDATE, onFocusDate, onBlurDate, formatMoment };