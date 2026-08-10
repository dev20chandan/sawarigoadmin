import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../utils/axiosInstance';

export const fetchProfile = createAsyncThunk(
  'settings/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/admin/profile');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch profile');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'settings/updateProfile',
  async (payload: any, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put('/admin/profile', payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to update profile');
    }
  }
);

const settingsSlice = createSlice({
  name: 'settings',
  initialState: {
    profile: { name: '', username: '', email: '', image: '' },
    loading: false,
    error: null as string | null,
    updateSuccess: false
  },
  reducers: {
    clearSettingsMessages: (state) => {
      state.error = null;
      state.updateSuccess = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = {
          name: action.payload.name || '',
          username: action.payload.username || '',
          email: action.payload.email || '',
          image: action.payload.image || ''
        };
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.updateSuccess = false;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.updateSuccess = true;
        
        // Sometimes backend just returns { message: 'success' } without the full data
        // We optimistically use the previous profile as base if not returned
        const updated = action.meta.arg;
        state.profile = {
            name: updated.name || state.profile.name,
            username: updated.username || state.profile.username,
            email: updated.email || state.profile.email,
            image: updated.image !== undefined ? updated.image : state.profile.image
        };
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearSettingsMessages } = settingsSlice.actions;
export default settingsSlice.reducer;
