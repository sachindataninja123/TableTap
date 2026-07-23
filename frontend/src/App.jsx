import React, { useEffect } from "react";
import AppRoutes from "./routes/AppRoutes";
import { useDispatch } from "react-redux";
import { getMe } from "./features/auth/authSlice";
import Navbar from "./components/common/Navbar";

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  return (
    <>
    <Navbar />
      <AppRoutes />
    </>
  );
};

export default App;
