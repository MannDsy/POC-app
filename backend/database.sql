SELECT
    id,
    email,
    otp,
    datetime(createdAt, '+5 hours', '+30 minutes') AS IST_Time
FROM otp_verification;