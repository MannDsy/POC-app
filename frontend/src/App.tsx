import { useState } from "react";
 
import Login from "./pages/Login";
import VerifyOtp from "./pages/VerifyOtp";
import HomePage from './pages/homepage'
 
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
          setStep("homepage")
        }
      />
    );
  }
 
  return <HomePage />;
}
 
export default App;