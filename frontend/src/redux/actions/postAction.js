import { addPost, setPosts } from "../reducers/postsSlice";
import axios from "../../utils/axios";

// Action to fetch posts from the API
export const fetchPosts = () => async (dispatch) => {
  try {
    const response = await axios.get("/posts");
    // Dispatch the setPosts action to add the fetched posts to the state
    dispatch(setPosts(response.data.posts));
  } catch (error) {
    console.error("Error fetching posts: ", error);
  }
};

// Action to add a new post to the API
export const createPost = (formData, navigate) => async (dispatch) => {
  try {
    const response = await axios.post("/posts/create-post", formData, {
      headers: {
        "Content-Type": "multipart/form-data", // Make sure to set this header for file uploads
      },
    });
    // Dispatch the addPost action to append the new post to the state
    dispatch(addPost(response.data));
    navigate("/");
  } catch (error) {
    console.error("Error creating post: ", error);
    throw new Error("An error occured while posting.");
  }
};

export const deletePost = (postId) => async (dispatch) => {
  try {
  } catch (error) {}
};
