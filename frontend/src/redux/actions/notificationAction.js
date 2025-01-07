import {
  setNotifications,
  setMarkAsRead,
} from "../reducers/notificationsSlice";
import axios from "../../utils/axios";

export const fetchNotifications = () => async (dispatch) => {
  try {
    const response = await axios.get(`/notifications`);
    dispatch(setNotifications(response.data));
  } catch (error) {
    console.log("error while fetching notifications.", error);
  }
};

export const markAsRead = () => async (dispatch) => {
  try {
    await axios.patch(`/notifications/mark-as-read`);
    dispatch(setMarkAsRead());
  } catch (error) {
    console.log("error while marking notifications as read.", error);
  }
};
