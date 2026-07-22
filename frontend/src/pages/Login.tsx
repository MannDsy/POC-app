import { useState, useEffect } from "react";
import api from "../services/api";
import "../index.css";
import logo from "../assets/eInfochips_logo_black.svg";
interface Props {
  onSuccess: () => void;
}

function Login({ onSuccess }: Props) {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  // Theme is a per-user preference, keyed by email (e.g. "theme:jane@company.com").
  // Anyone without a saved preference — including every new login — gets black by default.
  const [themeClass, setThemeClass] = useState("custom-theme-black");

  useEffect(() => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setThemeClass("custom-theme-black");
      return;
    }
    const savedTheme = localStorage.getItem(`theme:${normalizedEmail}`);
    setThemeClass(savedTheme === "blue" ? "custom-theme-blue" : "custom-theme-black");
  }, [email]);

  const sendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    try {
      setLoading(true);

      const response = await api.post("/send-otp", {
        email,
      });

      if (response.data.success) {
        setOtpSent(true);
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

  const verifyOtp = async () => {

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
        
        onSuccess();

      }

    } catch (error: any) {

      alert(
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

              <form onSubmit={sendOtp} className="outerContainer">
                <div className="outerFormDiv">
                  {/* Email Field */}
                  <div className="labelTxt">Email Address</div>
                  <div className="txtFieldValue">
                    <div className="inputOuter">
                      <div className="MuiFormControl-root MuiFormControl-fullWidth css-17qa0m8">
                        <div className="MuiFormControl-root MuiFormControl-fullWidth MuiTextField-root muiTextInput css-1vbfw84">
                          <div className="MuiInputBase-root MuiOutlinedInput-root MuiInputBase-colorPrimary MuiInputBase-fullWidth MuiInputBase-formControl css-1i614xw">
                            {!otpSent ? (

                              <input
                                aria-invalid="false"
                                id="email"
                                name="email"
                                type="email"
                                data-testid="email"
                                className="MuiInputBase-input MuiOutlinedInput-input css-q9pwqh"
                                placeholder="name@company.com"
                                value={email}
                                onChange={(e) =>
                                  setEmail(e.target.value)
                                }
                                required
                                disabled={loading}
                              />

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

                      <div className="txtFieldValue">

                        <input
                          type="text"
                          placeholder="Enter OTP"
                          value={otp}
                          onChange={(e) =>
                            setOtp(e.target.value)
                          }
                          className="MuiInputBase-input MuiOutlinedInput-input css-q9pwqh"
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