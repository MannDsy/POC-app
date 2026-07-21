// import { useState } from "react";
// import api from "../services/api";

// interface Props {
//   onOtpSent: (email: string) => void;
// }

// function Login({ onOtpSent }: Props) {
//   const [email, setEmail] = useState("");
//   const [loading, setLoading] =
//     useState(false);

//   const sendOtp = async () => {
//     try {
//       setLoading(true);

//       const response =
//         await api.post("/send-otp", {
//           email,
//         });

//       if (response.data.success) {
//         onOtpSent(email);
//       }
//     } catch (error: any) {
//       alert(
//         error?.response?.data?.message ||
//           "Something went wrong"
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="auth-wrapper">
//       <div className="card auth-card">

//         <div className="text-center mb-4">
//           <h1 className="logo-title">
//             Interview Management
//           </h1>

//           <p className="subtitle">
//             Secure OTP Authentication
//           </p>
//         </div>

//         <div className="mb-3">
//           <label className="form-label">
//             Email Address
//           </label>

//           <input
//             type="email"
//             className="form-control"
//             placeholder="name@company.com"
//             value={email}
//             onChange={(e) =>
//               setEmail(e.target.value)
//             }
//           />
//         </div>

//         <button
//           className="btn btn-primary w-100"
//           onClick={sendOtp}
//           disabled={loading}
//         >
//           {loading
//             ? "Sending..."
//             : "Send OTP"}
//         </button>

//       </div>
//     </div>
//   );
// }

// export default Login;



import { useState } from "react";
import api from "../services/api";
import "../index.css";

interface Props {
  onOtpSent: (email: string) => void;
}

function Login({ onOtpSent }: Props) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const sendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    try {
      setLoading(true);

      const response = await api.post("/send-otp", {
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
    <div className="custom-theme-black">
      <main
        id="pms-main-content"
        tabIndex={-1}
        className="wrapper loginContainerParent closedSideBarContaintContainer"
      >
        <div className="mainLoginContainer">
          <div className="outerDiv">
            {/* Tagline / Left Side Hero */}
            <div className="managerTxt">Manage Smart. Deliver Faster.</div>
            <div className="projectTxt">
              An Interview Management System that helps you plan, track, and manage
              evaluations effortlessly in one place.
            </div>

            {/* Login Card Form */}
            <div className="loginFormDiv">
              <div className="pmsTxt">Interview Management</div>
              <div className="loginHeading">Secure OTP Authentication</div>

              <form onSubmit={sendOtp} className="outerContainer">
                <div className="outerFormDiv">
                  {/* Email Field */}
                  <div className="labelTxt">Email Address</div>
                  <div className="txtFieldValue">
                    <div className="inputOuter">
                      <div className="MuiFormControl-root MuiFormControl-fullWidth css-17qa0m8">
                        <div className="MuiFormControl-root MuiFormControl-fullWidth MuiTextField-root muiTextInput css-1vbfw84">
                          <div className="MuiInputBase-root MuiOutlinedInput-root MuiInputBase-colorPrimary MuiInputBase-fullWidth MuiInputBase-formControl css-1i614xw">
                            <input
                              aria-invalid="false"
                              id="email"
                              name="email"
                              type="email"
                              data-testid="email"
                              className="MuiInputBase-input MuiOutlinedInput-input css-q9pwqh"
                              placeholder="name@company.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required
                              disabled={loading}
                            />
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

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="signInBtn"
                    aria-label="Send OTP"
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