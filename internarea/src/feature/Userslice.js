import { createSlice } from "@reduxjs/toolkit";

export const userslice = createSlice({
    name: "user",
    initialState: {
        // ❌ Changed 'value: null' to 'user: null' to match your reducer and selector
        user: null, 
    },
    reducers: {
        login: (state, action) => {
            // ✅ This now correctly updates the 'user' property in initialState
            state.user = action.payload;
        },
        logout: (state) => {
            state.user = null;
        },
    },
});

export const { login, logout } = userslice.actions;

// This looks for state.sliceName.propertyName
export const selectuser = (state) => state.user.user;

export default userslice.reducer;