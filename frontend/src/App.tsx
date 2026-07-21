import { useState } from "react";
import Login from "./pages/Login";
import HomePage from "./pages/homepage";
import "./App.css";
function App() {

  const [loggedIn, setLoggedIn] =
    useState(false);

  if (!loggedIn) {

    return (
      <Login
        onSuccess={() =>
          setLoggedIn(true)
        }
      />
    );

  }

  return <HomePage />;
}

export default App;