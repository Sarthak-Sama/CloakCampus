import { addPost, setPosts, removePost } from "../reducers/postsSlice";
import axios from "../../utils/axios";

// Action to fetch posts from the API
export const fetchPosts =
  (pageNumber = 1) =>
  async (dispatch) => {
    try {
      const response = await axios.get(`/posts?page=${pageNumber}`);
      // Dispatch the setPosts action to add the fetched posts to the state
      dispatch(setPosts(response.data.posts));
      console.log(response.data);
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
    await axios.delete(`/posts/delete-post/${postId}`);
    // Dispatch the removePost action to update the state
    dispatch(removePost(postId));
  } catch (error) {
    console.log("Error occurred while deleting the post: ", error);
  }
};
