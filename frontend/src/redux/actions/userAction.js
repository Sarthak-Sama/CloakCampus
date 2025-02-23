import axios from "../../utils/axios";
import {
  loadUser,
  setLoading,
  setLoadingCompleted,
} from "../reducers/userSlice";

export const fetchUser = () => async (dispatch) => {
  dispatch(setLoading());
  try {
    // Send the token to the backend for verification
    const response = await axios.get("/user/profile", {
      withCredentials: true,
    });

    const userData = {
      _id: response.data.user._id,
      profilePictureSrc: response.data.user.profilePictureSrc,
      username: response.data.user.username,
      email: response.data.user.email,
      university: response.data.user.university.universityName,
      categories: response.data.user.university.universityCategories,
      createdAt: response.data.user.createdAt,
    };

    dispatch(loadUser(userData));
  } catch (error) {
    console.error("Error while fetching the user: ", error);
  } finally {
    dispatch(setLoadingCompleted());
  }
};
