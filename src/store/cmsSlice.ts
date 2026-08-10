import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../utils/axiosInstance';

// Page Thunks
export const fetchAllPages = createAsyncThunk(
  'cms/fetchAllPages',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/admin/pages');
      // Force it to be an array and index them.
      let arr = Array.isArray(response.data) ? response.data : [response.data];
      const pagesDict: Record<string, any> = {};
      arr.forEach((p: any) => {
          if (p && p.slug) {
              pagesDict[p.slug] = p;
          }
      });
      return pagesDict;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch custom pages');
    }
  }
);

export const updatePage = createAsyncThunk(
  'cms/updatePage',
  async ({ slug, payload }: { slug: string; payload: any }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/admin/pages/${slug}`, payload);
      // If backend returns a basic success message without the full page model,
      // we merge the updated payload manually into the returned object.
      let responseData = response.data || {};
      if (!responseData.content && payload.content) {
          responseData = { ...responseData, ...payload };
      }
      return { slug, data: responseData };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to update custom page');
    }
  }
);

// FAQ Thunks
export const fetchFaqs = createAsyncThunk(
  'cms/fetchFaqs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/admin/faqs');
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch FAQs');
    }
  }
);

export const addFaq = createAsyncThunk(
  'cms/addFaq',
  async (payload: any, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/admin/faqs', payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to add FAQ');
    }
  }
);

export const updateFaq = createAsyncThunk(
  'cms/updateFaq',
  async ({ id, payload }: { id: string; payload: any }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/admin/faqs/${id}`, payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to update FAQ');
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
      return rejectWithValue(error.response?.data || 'Failed to delete FAQ');
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
