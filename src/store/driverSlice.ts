import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../utils/axiosInstance';

export const fetchDrivers = createAsyncThunk(
  'drivers/fetchDrivers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/admin/drivers');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch drivers');
    }
  }
);

export const addDriver = createAsyncThunk(
  'drivers/addDriver',
  async (data: any, { rejectWithValue }) => {
    try {
      // DriverVerification.tsx calls endpoint POST /admin/drivers
      const response = await axiosInstance.post('/admin/drivers', data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to add driver');
    }
  }
);

export const updateDriver = createAsyncThunk(
  'drivers/updateDriver',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/admin/drivers/${id}`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to update driver');
    }
  }
);

export const deleteDriver = createAsyncThunk(
  'drivers/deleteDriver',
  async (id: string, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/admin/drivers/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to delete driver');
    }
  }
);

export const updateDriverStatus = createAsyncThunk(
  'drivers/updateDriverStatus',
  async ({ id, status }: { id: string; status: string }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/admin/drivers/${id}/status`, { status });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to update driver status');
    }
  }
);

export const updateDocumentStatus = createAsyncThunk(
  'drivers/updateDocumentStatus',
  async ({ driverId, docId, status, reason }: { driverId: string; docId: string; status: string; reason?: string }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/admin/drivers/${driverId}/documents/${docId}/status`, { status, reason });
      return { driverId, docId, status, data: response.data }; // Assume response has updated payload or we just manually update array
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to update document status');
    }
  }
);

const driverSlice = createSlice({
  name: 'drivers',
  initialState: {
    drivers: [] as any[],
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchDrivers.pending, (state) => {
        if (state.drivers.length === 0) state.loading = true;
        state.error = null;
      })
      .addCase(fetchDrivers.fulfilled, (state, action) => {
        state.loading = false;
        state.drivers = action.payload;
      })
      .addCase(fetchDrivers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Add
      .addCase(addDriver.fulfilled, (state, action) => {
        state.drivers.push(action.payload);
      })
      // Delete
      .addCase(deleteDriver.fulfilled, (state, action) => {
        state.drivers = state.drivers.filter(d => d.id !== action.payload);
      })
      // Update
      .addCase(updateDriver.fulfilled, (state, action) => {
        state.drivers = state.drivers.map(d => (d.id === action.payload.id ? action.payload : d));
      })
      // Update Status
      .addCase(updateDriverStatus.fulfilled, (state, action) => {
        const { id, status } = action.meta.arg;
        state.drivers = state.drivers.map(d => (d.id === id ? { ...d, status: status.toUpperCase() } : d));
      })
      // Update Document Status
      .addCase(updateDocumentStatus.fulfilled, (state, action) => {
        const { driverId, docId, status } = action.payload;
        const driver = state.drivers.find(d => d.id === driverId);
        if (driver && driver.rawDocs) {
           driver.rawDocs = driver.rawDocs.map((doc: any) => doc.id === docId ? { ...doc, status: status.toUpperCase() } : doc);
        }
      });
  },
});

export default driverSlice.reducer;
