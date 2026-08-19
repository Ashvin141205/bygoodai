// redux/slices/couponSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  couponCode: null,
  expiryTime: null,
  discount: 0,
};

const couponSlice = createSlice({
  name: "coupon",
  initialState,
  reducers: {
    setCouponCode: (state, action) => {
      state.couponCode = action.payload.couponCode;
      state.expiryTime = action.payload.expiryTime;
      state.discount = action.payload.discount;
    },
    clearCouponCode: (state) => {
      state.couponCode = null;
      state.expiryTime = null;
      state.discount = 0;
    },
  },
});

export const { setCouponCode, clearCouponCode } = couponSlice.actions;

export default couponSlice.reducer;
