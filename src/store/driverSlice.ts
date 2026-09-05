import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../utils/axiosInstance';

export const fetchDrivers = createAsyncThunk(
  'drivers/fetchDrivers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/admin/drivers');
      const data = response.data?.data || response.data;
      return Array.isArray(data) ? data : [];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.response?.data || 'Failed to fetch drivers');
    }
  }
);

export const fetchDriverDetails = createAsyncThunk(
  'drivers/fetchDriverDetails',
  async (id: string, { rejectWithValue }) => {
    try {
      let response;
      try {
        response = await axiosInstance.get(`/admin/driver/${id}`);
      } catch (err: any) {
        if (err.response && err.response.status === 404) {
          try {
            response = await axiosInstance.get(`/admin/drivers/${id}`);
          } catch (e) {
            response = await axiosInstance.get(`/admin/driver-data/${id}`);
          }
        } else {
          throw err;
        }
      }
      const data = response.data?.data || response.data;
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.response?.data || 'Failed to fetch driver details');
    }
  }
);

export const addDriver = createAsyncThunk(
  'drivers/addDriver',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/admin/drivers', data);
      return response.data?.data || response.data;
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
      return response.data?.data || response.data;
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
      return response.data?.data || response.data;
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
      return { driverId, docId, status, data: response.data?.data || response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to update document status');
    }
  }
);

const driverSlice = createSlice({
  name: 'drivers',
  initialState: {
    drivers: [] as any[],
    selectedDriver: null as any,
    loading: false,
    loadingDetails: false,
    error: null as string | null,
    errorDetails: null as string | null,
  },
  reducers: {
    clearSelectedDriver: (state) => {
      state.selectedDriver = null;
      state.errorDetails = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch list
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
      // Fetch details
      .addCase(fetchDriverDetails.pending, (state) => {
        state.loadingDetails = true;
        state.errorDetails = null;
      })
      .addCase(fetchDriverDetails.fulfilled, (state, action) => {
        state.loadingDetails = false;
        state.selectedDriver = action.payload;
      })
      .addCase(fetchDriverDetails.rejected, (state, action) => {
        state.loadingDetails = false;
        state.errorDetails = action.payload as string;
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
        const updatedDriver = action.payload?.data ? action.payload.data : action.payload;
        if (updatedDriver?.id) {
          state.drivers = state.drivers.map(d => (d.id === updatedDriver.id ? updatedDriver : d));
          if (state.selectedDriver?.id === updatedDriver.id) {
            state.selectedDriver = { ...state.selectedDriver, ...updatedDriver };
          }
        }
      })
      // Update Status
      .addCase(updateDriverStatus.fulfilled, (state, action) => {
        const { id, status } = action.meta.arg;
        state.drivers = state.drivers.map(d => (d.id === id ? { ...d, status: status.toUpperCase() } : d));
        if (state.selectedDriver && (state.selectedDriver.id === id || state.selectedDriver.driverId === id)) {
          state.selectedDriver = { ...state.selectedDriver, status: status.toUpperCase(), rawStatus: status.toUpperCase() };
        }
      })
      // Update Document Status
      .addCase(updateDocumentStatus.fulfilled, (state, action) => {
        const { driverId, docId, status } = action.payload;
        const updateDocs = (rawDocs: any[]) => {
          if (!rawDocs) return rawDocs;
          return rawDocs.map((doc: any) => doc.id === docId ? { ...doc, status: status.toUpperCase() } : doc);
        };
        const driver = state.drivers.find(d => d.id === driverId);
        if (driver && driver.rawDocs) {
          driver.rawDocs = updateDocs(driver.rawDocs);
        }
        if (state.selectedDriver && (state.selectedDriver.id === driverId || state.selectedDriver.driverId === driverId)) {
          if (state.selectedDriver.rawDocs) {
            state.selectedDriver.rawDocs = updateDocs(state.selectedDriver.rawDocs);
          }
          if (state.selectedDriver.documents) {
            state.selectedDriver.documents = updateDocs(state.selectedDriver.documents);
          }
        }
      });
  },
});

export const { clearSelectedDriver } = driverSlice.actions;
export default driverSlice.reducer;

