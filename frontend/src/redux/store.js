import { configureStore } from '@reduxjs/toolkit'
import memberReducer from './memberSlice'

const store = configureStore({
  reducer: {
    members: memberReducer
  }
})

export default store
