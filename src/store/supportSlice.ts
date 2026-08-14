import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../utils/axiosInstance';

export const fetchSupportTickets = createAsyncThunk(
  'support/fetchSupportTickets',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/admin/support-tickets');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch support tickets');
    }
  }
);

interface SupportState {
  tickets: any[];
  loading: boolean;
  error: string | null;
}

const initialState: SupportState = {
  tickets: [],
  loading: false,
  error: null,
};

const supportSlice = createSlice({
  name: 'support',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSupportTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSupportTickets.fulfilled, (state, action) => {
        state.loading = false;
        state.tickets = action.payload;
      })
      .addCase(fetchSupportTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default supportSlice.reducer;
