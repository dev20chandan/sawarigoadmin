import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../utils/axiosInstance';

export const fetchCoupons = createAsyncThunk(
  'coupons/fetchCoupons',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/admin/coupons');
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch coupons');
    }
  }
);

export const addCoupon = createAsyncThunk(
  'coupons/addCoupon',
  async (payload: any, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/admin/coupons', payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to add coupon');
    }
  }
);

export const updateCoupon = createAsyncThunk(
  'coupons/updateCoupon',
  async ({ id, payload }: { id: string; payload: any }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/admin/coupons/${id}`, payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to update coupon');
    }
  }
);

export const deleteCoupon = createAsyncThunk(
  'coupons/deleteCoupon',
  async (id: string, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/admin/coupons/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to delete coupon');
    }
  }
);

const couponSlice = createSlice({
  name: 'coupons',
  initialState: {
    coupons: [] as any[],
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchCoupons.pending, (state) => {
        if (state.coupons.length === 0) state.loading = true;
        state.error = null;
      })
      .addCase(fetchCoupons.fulfilled, (state, action) => {
        state.loading = false;
        state.coupons = action.payload;
      })
      .addCase(fetchCoupons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.coupons = [];
      })
      // Add
      .addCase(addCoupon.fulfilled, (state, action) => {
        state.coupons.push(action.payload);
      })
      // Update
      .addCase(updateCoupon.fulfilled, (state, action) => {
        state.coupons = state.coupons.map(c => (c.id === action.payload.id ? action.payload : c));
      })
      // Delete
      .addCase(deleteCoupon.fulfilled, (state, action) => {
        state.coupons = state.coupons.filter(c => c.id !== action.payload);
      });
  },
});

export default couponSlice.reducer;
