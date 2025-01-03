import { setNotifications } from "../reducers/notificationsSlice";
import axios from "../../utils/axios";

export const fetchNotifications = () => async (dispatch, userId) => {
  try {
    console.log("fetching noti");
    console.log(userId);
    const response = await axios.get(`/notifications/${userId}`);
    console.log(response);
    dispatch(setNotifications(response.data));
  } catch (error) {
    console.log("error while fetching notifications.", error);
  }
};
