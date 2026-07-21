import { useState } from "react";
import api from "../services/api";
import toast from "react-hot-toast"; // Replaced native alerts with toasters

interface Props {
  email: string;
  onSuccess: () => void;
}

function VerifyOtp({ email, onSuccess }: Props) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false); // Tracks server state

  const verifyOtp = async () => {
    if (!otp) {
      toast.error("Please enter the verification code.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/verify-otp", {
        email,
        otp,
      });

      if (response.data.success) {
        // 1. Save the validated corporate email to session storage
        sessionStorage.setItem("loggedInUserEmail", email);
        
        // 2. Trigger a clean toaster notice
        toast.success("Identity verified successfully!");
        
        // 3. Fire your completion prop callback (which handles routing to /home)
        onSuccess();
      } else {
        toast.error("Invalid verification code. Please try again.");
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "An error occurred during verification."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="card auth-card">
        <div className="text-center mb-4">
          <h2>OTP Verification</h2>
          <p className="subtitle">{email}</p>
        </div>

        <input
          type="text"
          className="form-control mb-3"
          placeholder="Enter OTP"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} // Only allows numbers
        />

        <button
          className="btn btn-success w-100"
          onClick={verifyOtp}
          disabled={loading}
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </div>
    </div>
  );
}

export default VerifyOtp;