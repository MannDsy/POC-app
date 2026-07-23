import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import HomePage from "./pages/homepage";
import StartInterviewPage from "./pages/StartInterview";
import "./App.css";

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          sessionStorage.getItem("loggedInUserEmail")
            ? <Navigate to="/home" replace />
            : <Navigate to="/login" replace />
        }
      />
      <Route path="/login" element={<Login />} />
      <Route path="/home" element={<HomePage />} />
      <Route
        path="/interview/new"
        element={<StartInterviewPage primaryThemeColor="#0069aa" />}
      />
      <Route
        path="*"
        element={
          <Navigate
            to={sessionStorage.getItem("loggedInUserEmail") ? "/home" : "/login"}
            replace
          />
        }
      />
    </Routes>
  );
}

export default App;