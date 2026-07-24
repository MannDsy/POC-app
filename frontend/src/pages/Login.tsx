import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../index.css";
import logo from "../assets/eInfochips_logo_black.svg";

function Login() {
  const navigate = useNavigate();

  // If someone already has a valid session and lands on /login anyway
  // (e.g. typed the URL directly, or pressed back), send them to /home.
  useEffect(() => {
    const user = sessionStorage.getItem("loggedInUserEmail");
    if (user) {
      navigate("/home", { replace: true });
    }
  }, [navigate]);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  // Replaces the old alert() popups — shown as a red banner instead,
  // right above whichever field the error relates to.
  const [emailError, setEmailError] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);

  // Single-user laptop — theme is just "whatever was last picked", with no
  // dependency on email at all. Reads once on mount, applies immediately,
  // before the email field has anything typed into it.
  const [themeClass] = useState(() => {
    const lastUsed = localStorage.getItem("lastUsedTheme");
    return lastUsed === "blue" ? "custom-theme-blue" : "custom-theme-black";
  });

  const sendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    setEmailError(null);

    try {
      setLoading(true);

      const response = await api.post("/send-otp", {
        email,
      });

      if (response.data.success) {
        setOtpSent(true);
      }

    } catch (error: any) {
      setEmailError(
        error?.response?.data?.message ||
        "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {

    setOtpError(null);

    try {

      setLoading(true);

      const response =
        await api.post("/verify-otp", {
          email,
          otp,
        });

      if (response.data.success) {

        sessionStorage.setItem(
          "loggedInUserEmail",
          email
        );

        navigate("/home");

      }

    } catch (error: any) {

      setOtpError(
        error?.response?.data?.message ||
        "OTP Verification Failed"
      );

    } finally {

      setLoading(false);

    }

  };

  const resetEmail = () => {

    setEmail("");
    setOtp("");
    setOtpSent(false);
    setEmailError(null);
    setOtpError(null);

  };

  const errorBannerStyle: React.CSSProperties = {
    padding: '8px 12px',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#b91c1c',
    borderRadius: '6px',
    fontSize: '13px',
    marginBottom: '8px',
  };

  return (
    <div className={themeClass}>
      <main
        id="pms-main-content"
        tabIndex={-1}
        className="wrapper loginContainerParent closedSideBarContaintContainer"
      >
        <div className="mainLoginContainer">
          <div className="outerDiv">
            {/* Login Card Form */}
            <div className="loginFormDiv">
              <img src={logo }alt="Company Logo" className="loginLogo"  />
              <div className="pmsTxt">Interview Management</div>
              <div className="loginHeading">Login</div>

              <form onSubmit={sendOtp} className="outerContainer" noValidate>
                <div className="outerFormDiv">
                  {/* Email Field */}
                  <div className="labelTxt">Email Address</div>
                  <div className="txtFieldValue">
                    <div className="inputOuter">
                      <div className="MuiFormControl-root MuiFormControl-fullWidth css-17qa0m8">
                        <div className="MuiFormControl-root MuiFormControl-fullWidth MuiTextField-root muiTextInput css-1vbfw84">
                          <div className="MuiInputBase-root MuiOutlinedInput-root MuiInputBase-colorPrimary MuiInputBase-fullWidth MuiInputBase-formControl css-1i614xw">
                            {!otpSent ? (

                              <>
                                {emailError && (
                                  <div style={errorBannerStyle}>{emailError}</div>
                                )}
                                <input
                                  aria-invalid="false"
                                  id="email"
                                  name="email"
                                  type="email"
                                  data-testid="email"
                                  className="MuiInputBase-input MuiOutlinedInput-input css-q9pwqh"
                                  placeholder="name@company.com"
                                  value={email}
                                  onChange={(e) => {
                                    setEmail(e.target.value);
                                    setEmailError(null);
                                  }}
                                  disabled={loading}
                                />
                              </>

                            ) : (

                              <div className="otp-email-display">

                                <span>{email}</span>

                                <button
                                  type="button"
                                  className="change-email-btn"
                                  onClick={resetEmail}
                                >
                                  ✕
                                </button>

                              </div>

                            )}
                            <fieldset
                              aria-hidden="true"
                              className="MuiOutlinedInput-notchedOutline css-1ewnf7k"
                              style={emailError ? { borderColor: '#ef4444' } : undefined}
                            >
                              <legend className="css-w4cd9x">
                                <span className="notranslate" aria-hidden="true">
                                  &#8203;
                                </span>
                              </legend>
                            </fieldset>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {otpSent && (

                    <div style={{ marginTop: "20px" }}>

                      <div className="labelTxt">
                        OTP
                      </div>

                      {otpError && (
                        <div style={errorBannerStyle}>{otpError}</div>
                      )}

                      <div className="txtFieldValue">

                        <input
                          type="text"
                          placeholder="Enter OTP"
                          value={otp}
                          onChange={(e) => {
                            setOtp(e.target.value);
                            setOtpError(null);
                          }}
                          className="MuiInputBase-input MuiOutlinedInput-input css-q9pwqh"
                          style={otpError ? { borderColor: '#ef4444' } : undefined}
                        />

                      </div>

                    </div>

                  )}

                  {/* Submit Button */}
                  {!otpSent ? (

                    <button
                      type="submit"
                      className="signInBtn"
                      disabled={loading}
                      style={{
                        border: "none",
                        width: "100%",
                        cursor: loading ? "not-allowed" : "pointer",
                        opacity: loading ? 0.7 : 1,
                        marginTop: "16px",
                      }}
                    >
                      {loading ? "Sending..." : "Send OTP"}
                    </button>

                  ) : (

                    <button
                      type="button"
                      className="signInBtn"
                      onClick={verifyOtp}
                      disabled={loading}
                      style={{
                        border: "none",
                        width: "100%",
                        cursor: loading ? "not-allowed" : "pointer",
                        opacity: loading ? 0.7 : 1,
                        marginTop: "16px",
                      }}
                    >
                      {loading ? "Verifying..." : "Verify OTP"}
                    </button>

                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Login;