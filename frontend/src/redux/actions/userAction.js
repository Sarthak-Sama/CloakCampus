import axios from "../../utils/axios";
import { loadUser } from "../reducers/userSlice";

// Action Creator
export const fetchUser = () => async (dispatch) => {
  try {
    // Send the token to the backend for verification
    const response = await axios.get("/user/profile");
    let userData = {
      username: response.data.user.username,
      email: response.data.user.email,
      university: response.data.user.university,
      createdAt: response.data.user.createdAt,
    };
    dispatch(loadUser(userData));
  } catch (error) {
    console.error("Error while fetching the user: ", error);
  }
};
