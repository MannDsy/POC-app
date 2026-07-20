import { useState } from "react";
import api from "../services/api";

interface Props {
  onOtpSent: (email: string) => void;
}

function Login({ onOtpSent }: Props) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] =
    useState(false);

  const sendOtp = async () => {
    try {
      setLoading(true);

      const response =
        await api.post("/send-otp", {
          email,
        });

      if (response.data.success) {
        onOtpSent(email);
      }
    } catch (error: any) {
      alert(
        error?.response?.data?.message ||
          "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="card auth-card">

        <div className="text-center mb-4">
          <h1 className="logo-title">
            Interview Management
          </h1>

          <p className="subtitle">
            Secure OTP Authentication
          </p>
        </div>

        <div className="mb-3">
          <label className="form-label">
            Email Address
          </label>

          <input
            type="email"
            className="form-control"
            placeholder="name@company.com"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />
        </div>

        <button
          className="btn btn-primary w-100"
          onClick={sendOtp}
          disabled={loading}
        >
          {loading
            ? "Sending..."
            : "Send OTP"}
        </button>

      </div>
    </div>
  );
}

export default Login;