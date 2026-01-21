import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { timeTrackerApi } from '@/lib/api/timeTrackerApi';
import { TimeEntry, Project } from '@/types/timeTracker';

// Define the state interface
export interface TimeTrackerState {
  timeEntries: TimeEntry[];
  projects: Project[];
  loading: boolean;
  error: string | null;
  dailyTotals: { [date: string]: number };
  grandTotal: number;
}

// Initial state
const initialState: TimeTrackerState = {
  timeEntries: [],
  projects: [],
  loading: false,
  error: null,
  dailyTotals: {},
  grandTotal: 0,
};

// Async thunks for API calls
export const fetchProjects = createAsyncThunk<Project[]>(
  'timeTracker/fetchProjects',
  async (_, { rejectWithValue }) => {
    try {
      return await timeTrackerApi.getProjects();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch projects');
    }
  }
);

export const fetchTimeEntries = createAsyncThunk<TimeEntry[]>(
  'timeTracker/fetchTimeEntries',
  async (_, { rejectWithValue }) => {
    try {
      return await timeTrackerApi.getTimeEntries();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch time entries');
    }
  }
);

export const createTimeEntry = createAsyncThunk<TimeEntry, Omit<TimeEntry, 'id' | 'createdAt' | 'updatedAt'>>(
  'timeTracker/createTimeEntry',
  async (timeEntryData, { rejectWithValue }) => {
    try {
      return await timeTrackerApi.createTimeEntry(timeEntryData);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to create time entry');
    }
  }
);

export const updateTimeEntry = createAsyncThunk<TimeEntry, { id: string; data: Partial<TimeEntry> }>(
  'timeTracker/updateTimeEntry',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await timeTrackerApi.updateTimeEntry(id, data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to update time entry');
    }
  }
);

export const deleteTimeEntry = createAsyncThunk<string, string>(
  'timeTracker/deleteTimeEntry',
  async (id, { rejectWithValue }) => {
    try {
      await timeTrackerApi.deleteTimeEntry(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to delete time entry');
    }
  }
);

// Slice
export const timeTrackerSlice = createSlice({
  name: 'timeTracker',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    addTimeEntry: (state, action: PayloadAction<TimeEntry>) => {
      state.timeEntries.unshift(action.payload);
    },
    updateLocalTimeEntry: (state, action: PayloadAction<TimeEntry>) => {
      const index = state.timeEntries.findIndex(entry => entry.id === action.payload.id);
      if (index !== -1) {
        state.timeEntries[index] = action.payload;
      }
    },
    removeTimeEntry: (state, action: PayloadAction<string>) => {
      state.timeEntries = state.timeEntries.filter(entry => entry.id !== action.payload);
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch projects
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;
        state.error = null;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch time entries
      .addCase(fetchTimeEntries.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTimeEntries.fulfilled, (state, action) => {
        state.loading = false;
        state.timeEntries = action.payload;
        state.error = null;

        // Calculate daily totals and grand total
        const dailyTotals: { [date: string]: number } = {};
        let grandTotal = 0;

        action.payload.forEach(entry => {
          if (!dailyTotals[entry.date]) {
            dailyTotals[entry.date] = 0;
          }
          dailyTotals[entry.date] += entry.hours;
        });

        grandTotal = Object.values(dailyTotals).reduce((sum, dayTotal) => sum + dayTotal, 0);

        state.dailyTotals = dailyTotals;
        state.grandTotal = grandTotal;
      })
      .addCase(fetchTimeEntries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create time entry
      .addCase(createTimeEntry.fulfilled, (state, action) => {
        state.timeEntries.unshift(action.payload);
        state.error = null;

        // Update daily totals
        if (!state.dailyTotals[action.payload.date]) {
          state.dailyTotals[action.payload.date] = 0;
        }
        state.dailyTotals[action.payload.date] += action.payload.hours;
        state.grandTotal += action.payload.hours;
      })
      .addCase(createTimeEntry.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Update time entry
      .addCase(updateTimeEntry.fulfilled, (state, action) => {
        const index = state.timeEntries.findIndex(entry => entry.id === action.payload.id);
        if (index !== -1) {
          // Update daily totals by subtracting old hours and adding new hours
          const oldEntry = state.timeEntries[index];
          state.dailyTotals[oldEntry.date] -= oldEntry.hours;
          state.dailyTotals[action.payload.date] = (state.dailyTotals[action.payload.date] || 0) + action.payload.hours;

          // Update grand total
          state.grandTotal = state.grandTotal - oldEntry.hours + action.payload.hours;

          state.timeEntries[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateTimeEntry.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Delete time entry
      .addCase(deleteTimeEntry.fulfilled, (state, action) => {
        const deletedEntry = state.timeEntries.find(entry => entry.id === action.payload);
        if (deletedEntry) {
          // Update daily totals
          state.dailyTotals[deletedEntry.date] -= deletedEntry.hours;
          if (state.dailyTotals[deletedEntry.date] <= 0) {
            delete state.dailyTotals[deletedEntry.date];
          }

          // Update grand total
          state.grandTotal -= deletedEntry.hours;
        }

        state.timeEntries = state.timeEntries.filter(entry => entry.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteTimeEntry.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const {
  setLoading,
  setError,
  addTimeEntry,
  updateLocalTimeEntry,
  removeTimeEntry,
  clearError
} = timeTrackerSlice.actions;

// Export reducer
export default timeTrackerSlice.reducer;