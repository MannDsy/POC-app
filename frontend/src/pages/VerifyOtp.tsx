import { useState } from "react";
import api from "../services/api";

interface Props {
  email: string;
  onSuccess: () => void;
}

function VerifyOtp({
  email,
  onSuccess,
}: Props) {
  const [otp, setOtp] = useState("");

  const verifyOtp = async () => {
    const response =
      await api.post("/verify-otp", {
        email,
        otp,
      });

    if (response.data.success) {
      onSuccess();
    } else {
      alert("Invalid OTP");
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="card auth-card">

        <div className="text-center mb-4">
          <h2>OTP Verification</h2>

          <p className="subtitle">
            {email}
          </p>
        </div>

        <input
          type="text"
          className="form-control mb-3"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) =>
            setOtp(e.target.value)
          }
        />

        <button
          className="btn btn-success w-100"
          onClick={verifyOtp}
        >
          Verify OTP
        </button>
      </div>
    </div>
  );
}

export default VerifyOtp;