import { setNotifications } from "../reducers/notificationsSlice";
import axios from "../../utils/axios";

export const fetchNotifications = () => async (dispatch, userId) => {
  try {
    const response = await axios.get(`/notifications/${userId}`);
    dispatch(setNotifications(response.data));
  } catch (error) {
    console.log("error while fetching notifications.", error);
  }
};
