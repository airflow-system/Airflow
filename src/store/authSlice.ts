import { createSlice } from '@reduxjs/toolkit';

interface AuthState {
  loggedIn: boolean;
}

const initialState: AuthState = { loggedIn: false };

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state) {
      state.loggedIn = true;
    },
    logout(state) {
      state.loggedIn = false;
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
