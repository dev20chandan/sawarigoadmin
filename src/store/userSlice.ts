import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../utils/axiosInstance';

export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/admin/users');
      const data = response.data?.data || response.data;
      return Array.isArray(data) ? data : [];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.response?.data || 'Failed to fetch users');
    }
  }
);

export const fetchUserDetails = createAsyncThunk(
  'users/fetchUserDetails',
  async (userId: string, { rejectWithValue }) => {
    try {
      // Try GET /admin/user/:id with fallback to GET /admin/users/:id or /admin/user-data/:id
      let response;
      try {
        response = await axiosInstance.get(`/admin/user/${userId}`);
      } catch (err: any) {
        if (err.response && err.response.status === 404) {
          try {
            response = await axiosInstance.get(`/admin/users/${userId}`);
          } catch (e) {
            response = await axiosInstance.get(`/admin/user-data/${userId}`);
          }
        } else {
          throw err;
        }
      }
      const data = response.data?.data || response.data;
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.response?.data || 'Failed to fetch user details');
    }
  }
);

export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (userId: string, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/admin/user/${userId}`);
      return userId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to delete user');
    }
  }
);

export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ id, data }: { id: string, data: any }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/admin/user/${id}`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message || 'Failed to update user');
    }
  }
);

const userSlice = createSlice({
  name: 'users',
  initialState: {
    users: [] as any[],
    selectedUser: null as any,
    loading: false,
    loadingDetails: false,
    error: null as string | null,
    errorDetails: null as string | null,
  },
  reducers: {
    clearSelectedUser: (state) => {
      state.selectedUser = null;
      state.errorDetails = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch list
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
      // Fetch details
      .addCase(fetchUserDetails.pending, (state) => {
        state.loadingDetails = true;
        state.errorDetails = null;
      })
      .addCase(fetchUserDetails.fulfilled, (state, action) => {
        state.loadingDetails = false;
        state.selectedUser = action.payload;
      })
      .addCase(fetchUserDetails.rejected, (state, action) => {
        state.loadingDetails = false;
        state.errorDetails = action.payload as string;
      })
      // Delete
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter(u => u.id !== action.payload);
      })
      // Update
      .addCase(updateUser.fulfilled, (state, action) => {
        const updatedUser = action.payload?.user ? action.payload.user : (action.payload?.data ? action.payload.data : action.payload);
        if (updatedUser?.id) {
          state.users = state.users.map(u => u.id === updatedUser.id ? { ...u, ...updatedUser } : u);
          if (state.selectedUser?.id === updatedUser.id) {
            state.selectedUser = { ...state.selectedUser, ...updatedUser };
          }
        }
      });
  },
});

export const { clearSelectedUser } = userSlice.actions;
export default userSlice.reducer;

