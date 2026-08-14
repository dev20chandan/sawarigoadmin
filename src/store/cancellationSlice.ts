import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../utils/axiosInstance';

export const fetchCancellations = createAsyncThunk(
  'cancellations/fetchCancellations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/admin/cancellations');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch cancellations');
    }
  }
);

interface CancellationState {
  records: any[];
  loading: boolean;
  error: string | null;
}

const initialState: CancellationState = {
  records: [],
  loading: false,
  error: null,
};

const cancellationSlice = createSlice({
  name: 'cancellations',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCancellations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCancellations.fulfilled, (state, action) => {
        state.loading = false;
        state.records = action.payload;
      })
      .addCase(fetchCancellations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default cancellationSlice.reducer;
