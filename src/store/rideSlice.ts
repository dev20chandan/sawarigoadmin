import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../utils/axiosInstance';

export const fetchRides = createAsyncThunk(
  'rides/fetchRides',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/admin/rides');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch rides');
    }
  }
);

const rideSlice = createSlice({
  name: 'rides',
  initialState: {
    rides: [] as any[],
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRides.pending, (state) => {
        if (state.rides.length === 0) state.loading = true;
        state.error = null;
      })
      .addCase(fetchRides.fulfilled, (state, action) => {
        state.loading = false;
        state.rides = action.payload;
      })
      .addCase(fetchRides.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default rideSlice.reducer;
