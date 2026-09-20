import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../utils/axiosInstance';

export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/admin/users');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch users');
    }
  }
);

export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (userId: string, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/admin/users/${userId}`);
      return userId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.response?.data || 'Failed to delete user');
    }
  }
);

export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/admin/users/${id}`, data);
      return response.data?.data || response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.response?.data || error.message || 'Failed to update user');
    }
  }
);

const userSlice = createSlice({
  name: 'users',
  initialState: {
    users: [] as any[],
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchUsers.pending, (state) => {
        if (state.users.length === 0) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter(u => u.id !== action.payload);
      })
      // Update
      .addCase(updateUser.fulfilled, (state, action) => {
        const updatedUser = action.payload?.data || action.payload;
        if (updatedUser && updatedUser.id) {
          state.users = state.users.map(u => (u.id === updatedUser.id ? { ...u, ...updatedUser } : u));
        }
      });
  },
});

export default userSlice.reducer;