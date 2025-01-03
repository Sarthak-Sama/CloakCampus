import { setNotifications } from "../reducers/notificationsSlice";
import axios from "../../utils/axios";

export const fetchNotifications = () => async (dispatch) => {
  try {
    const response = await axios.get(`/notifications`);
    dispatch(setNotifications(response.data));
  } catch (error) {
    console.log("error while fetching notifications.", error);
  }
};
