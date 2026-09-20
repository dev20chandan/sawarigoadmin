import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../utils/axiosInstance';

// Page Thunks
export const fetchAllPages = createAsyncThunk(
  'cms/fetchAllPages',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/admin/pages');
      const raw = response.data?.body || response.data?.data || response.data;
      const arr = Array.isArray(raw) ? raw : (raw && typeof raw === 'object' ? Object.values(raw) : []);
      const pagesDict: Record<string, any> = {};
      arr.forEach((p: any) => {
        if (p && p.slug) {
          pagesDict[p.slug] = p;
        }
      });
      return pagesDict;
    } catch (error: any) {
      const errMsg = error.response?.data?.message || error.response?.data || error.message || 'Failed to fetch custom pages';
      return rejectWithValue(typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg));
    }
  }
);

export const updatePage = createAsyncThunk(
  'cms/updatePage',
  async ({ slug, payload }: { slug: string; payload: any }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/admin/pages/${slug}`, payload);
      let responseData = response.data?.body || response.data?.data || response.data || {};
      if (!responseData.content && payload.content) {
        responseData = { ...responseData, ...payload };
      }
      return { slug, data: responseData };
    } catch (error: any) {
      const errMsg = error.response?.data?.message || error.response?.data || error.message || 'Failed to update custom page';
      return rejectWithValue(typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg));
    }
  }
);

// FAQ Thunks
export const fetchFaqs = createAsyncThunk(
  'cms/fetchFaqs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/admin/faqs');
      const raw = response.data?.body || response.data?.data || response.data;
      if (Array.isArray(raw)) {
        return raw;
      }
      return [];
    } catch (error: any) {
      const errMsg = error.response?.data?.message || error.response?.data || error.message || 'Failed to fetch FAQs';
      return rejectWithValue(typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg));
    }
  }
);

export const addFaq = createAsyncThunk(
  'cms/addFaq',
  async (payload: any, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/admin/faqs', payload);
      return response.data?.body || response.data?.data || response.data;
    } catch (error: any) {
      const errMsg = error.response?.data?.message || error.response?.data || error.message || 'Failed to add FAQ';
      return rejectWithValue(typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg));
    }
  }
);

export const updateFaq = createAsyncThunk(
  'cms/updateFaq',
  async ({ id, payload }: { id: string; payload: any }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/admin/faqs/${id}`, payload);
      return response.data?.body || response.data?.data || response.data;
    } catch (error: any) {
      const errMsg = error.response?.data?.message || error.response?.data || error.message || 'Failed to update FAQ';
      return rejectWithValue(typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg));
    }
  }
);

export const deleteFaq = createAsyncThunk(
  'cms/deleteFaq',
  async (id: string, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/admin/faqs/${id}`);
      return id;
    } catch (error: any) {
      const errMsg = error.response?.data?.message || error.response?.data || error.message || 'Failed to delete FAQ';
      return rejectWithValue(typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg));
    }
  }
);

const cmsSlice = createSlice({
  name: 'cms',
  initialState: {
    pages: {} as Record<string, any>,
    faqs: [] as any[],
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // PAGES
      .addCase(fetchAllPages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllPages.fulfilled, (state, action) => {
        state.loading = false;
        // Merge fetched pages into the record
        state.pages = { ...state.pages, ...action.payload };
      })
      .addCase(fetchAllPages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updatePage.fulfilled, (state, action) => {
        state.pages[action.payload.slug] = action.payload.data;
      })
      // FAQS
      .addCase(fetchFaqs.pending, (state) => {
        if (state.faqs.length === 0) state.loading = true;
        state.error = null;
      })
      .addCase(fetchFaqs.fulfilled, (state, action) => {
        state.loading = false;
        state.faqs = action.payload;
      })
      .addCase(fetchFaqs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.faqs = [];
      })
      .addCase(addFaq.fulfilled, (state, action) => {
        state.faqs.push(action.payload);
      })
      .addCase(updateFaq.fulfilled, (state, action) => {
        state.faqs = state.faqs.map(f => (f.id === action.payload.id ? action.payload : f));
      })
      .addCase(deleteFaq.fulfilled, (state, action) => {
        state.faqs = state.faqs.filter(f => f.id !== action.payload);
      });
  },
});

export default cmsSlice.reducer;
