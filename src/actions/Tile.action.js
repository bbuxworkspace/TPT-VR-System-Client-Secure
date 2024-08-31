import axios from "axios";
import { toast } from "react-toastify";
import {
  GET_TILE_LIST,
  GET_TILE_DETAILS,
  CREATE_TILE,
  UPDATE_TILE,
  DELETE_TILE,
  CREATE_TILE_ERROR,
  UPDATE_TILE_ERROR,
  DELETE_TILE_ERROR,
  GET_TILE_DETAILS_ERROR,
} from "../constants/Type"; // Make sure the constants are updated as per your needs
import { BASE_URL } from "../constants/URL";
import { getRefreshToken } from "./Auth.action";

// GET Tile LIST
export const getTileList = (page) => async (dispatch) => {
  try {
    const res = await axios.get(`${BASE_URL}/api/v1/tile?page=${page}&limit=9999999`);

    console.log('Get Tiles Response:', res);

    const tiles = res.data.tiles.items;
    // Store the tile data in local storage
    localStorage.setItem('tiles', JSON.stringify(tiles));

    dispatch({
      type: GET_TILE_LIST,
      payload: res.data.tiles.items,
    });
  } catch (err) {
    if (err.response.status === 401) {
      await dispatch(getRefreshToken());
      await dispatch(getTileList(page));
    } else {
      console.log(err);
    }
  }
};

// GET Tile DETAILS
export const getTileDetails = (id) => async (dispatch) => {
  try {
    const res = await axios.get(`${BASE_URL}/api/v1/tile/${id}`);
    dispatch({
      type: GET_TILE_DETAILS,
      payload: res.data.tile,
    });
  } catch (err) {
    if (err.response.status === 401) {
      await dispatch(getRefreshToken());
      await dispatch(getTileDetails(id));
    } else {
      dispatch({
        type: GET_TILE_DETAILS_ERROR,
      });
      console.log(err);
    }
  }
};

// CREATE Tile
export const createTile = (values, image) => async (dispatch) => {
  const formData = new FormData();
  formData.append("name", values.name);
  formData.append("size", values.size);
  formData.append("areaCoverage", values.areaCoverage);
  formData.append("price", values.price);
  formData.append("category", values.category);
  formData.append("brand", values.brand || "TPT"); // Default to 'TPT' if not provided

  if (image) {
    formData.append("image", image);
  }

  const config = {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  };

  try {
    await axios.post(`${BASE_URL}/api/v1/tile`, formData, config);
    dispatch({
      type: CREATE_TILE,
    });
    dispatch(getTileList(1));
    return true;
  } catch (err) {
    if (err.response.status === 401) {
      await dispatch(getRefreshToken());
      await dispatch(createTile(values, image));
      return true;
    } else {
      dispatch({
        type: CREATE_TILE_ERROR,
      });
      console.log(err);
    }
    return false;
  }
};

// UPDATE Tile
export const updateTile = (values, image, id) => async (dispatch) => {
  const formData = new FormData();
  formData.append("name", values.name);
  formData.append("size", values.size);
  formData.append("areaCoverage", values.areaCoverage);
  formData.append("price", values.price);
  formData.append("category", values.category);
  formData.append("brand", values.brand || "TPT"); // Default to 'TPT' if not provided

  if (image) {
    formData.append("image", image);
  }

  const config = {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  };

  try {
    await axios.patch(`${BASE_URL}/api/v1/tile/${id}`, formData, config);
    dispatch({
      type: UPDATE_TILE,
    });
    dispatch(getTileList(1));
    return true;
  } catch (err) {
    if (err.response.status === 401) {
      await dispatch(getRefreshToken());
      await dispatch(updateTile(values, image, id));
      return true;
    } else {
      dispatch({
        type: UPDATE_TILE_ERROR,
      });
      console.log(err);
    }
    return false;
  }
};

// DELETE Tile
export const deleteTile = (id) => async (dispatch) => {
  try {
    await axios.delete(`${BASE_URL}/api/v1/tile/${id}`);
    dispatch({
      type: DELETE_TILE,
      payload: id,
    });
    dispatch(getTileList(1));
    return true;
  } catch (err) {
    if (err.response.status === 401) {
      await dispatch(getRefreshToken());
      await dispatch(deleteTile(id));
      return true;
    } else {
      dispatch({
        type: DELETE_TILE_ERROR,
      });
      console.log(err);
    }
    return false;
  }
};
