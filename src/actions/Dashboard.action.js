import axios from "axios";
import { GET_DASHBOARD_DATA } from "../constants/Type";
import { BASE_URL } from "../constants/URL";
import { getRefreshToken } from "./Auth.action";

// GET DASHBOARD DATA
export const getDashboardData = () => async (dispatch) => {
  try {
    const res = await axios.get(`${BASE_URL}/api/v1/dashboard`, {
      withCredentials: true,
    });

    console.log("Dashboard", res);

    dispatch({
      type: GET_DASHBOARD_DATA,
      payload: res.data.data,
    });

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};
