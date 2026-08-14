import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../utils/axiosInstance';

export const fetchRides = createAsyncThunk(
  'rides/fetchRides',
  async ({ page = 1, limit = 10 }: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/rides/history?page=${page}&limit=${limit}`);
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
    meta: {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 1
    },
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
        if (action.payload?.data) {
          state.rides = action.payload.data;
          state.meta = action.payload.meta || state.meta;
        } else {
          state.rides = action.payload;
        }
      })
      .addCase(fetchRides.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default rideSlice.reducer;
