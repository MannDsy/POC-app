import { useState } from "react";
import Login from "./pages/Login";
import HomePage from "./pages/homepage";

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