import axios from "../../utils/axios";
import { loadPost } from "../reducers/postsSlice";

export const fetchPosts = () => async (dispatch) => {
  try {
    const response = await axios.get("/post");

    dispatch(loadPost(response.data));
  } catch (error) {
    console.log("Error while fetching the posts: ", error);
  }
};
