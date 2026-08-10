import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../utils/axiosInstance';

export const sendNotification = createAsyncThunk(
  'notifications/send',
  async ({ title, message, target }: { title: string, message: string, target: string }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/admin/notifications', { title, message, target });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to send notification');
    }
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    loading: false,
    success: false,
    error: null as string | null,
  },
  reducers: {
    resetNotificationState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendNotification.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(sendNotification.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(sendNotification.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetNotificationState } = notificationSlice.actions;
export default notificationSlice.reducer;
