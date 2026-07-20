import { useState } from "react";
 
import Login from "./pages/Login";
import VerifyOtp from "./pages/VerifyOtp";
import Dashboard from "./pages/Dashboard";
 
function App() {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState("login");
 
  if (step === "login") {
    return (
      <Login
        onOtpSent={(email) => {
          setEmail(email);
          setStep("otp");
        }}
      />
    );
  }
 
  if (step === "otp") {
    return (
      <VerifyOtp
        email={email}
        onSuccess={() =>
          setStep("dashboard")
        }
      />
    );
  }
 
  return <Dashboard />;
}
 
export default App;