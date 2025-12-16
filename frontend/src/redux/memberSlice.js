import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { membersAPI } from '../services/membershipAPI'

export const fetchMembers = createAsyncThunk('members/fetchAll', async (_, thunkAPI) => {
  const res = await membersAPI.list()
  return res.data
})

const memberSlice = createSlice({
  name: 'members',
  initialState: { list: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMembers.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchMembers.fulfilled, (state, action) => {
        state.loading = false
        state.list = action.payload.members || action.payload
      })
      .addCase(fetchMembers.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
  }
})

export default memberSlice.reducer
