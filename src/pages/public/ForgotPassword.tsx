import React, { useState } from "react";
import { getAuth, sendPasswordResetEmail, confirmPasswordReset } from "firebase/auth";
import { TextField, Button, Typography, Container, Box, Alert, CircularProgress } from "@mui/material";
import { Link, useLocation, useNavigate } from "react-router-dom";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();

    // Grabbing the oobCode from the URL query string
    const query = new URLSearchParams(location.search);
    const oobCode = query.get("oobCode");

    const handleSendEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setMessage("");

        const auth = getAuth();
        try {
            await sendPasswordResetEmail(auth, email);
            setMessage("Check your inbox for the reset link!");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmReset = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!oobCode) return;

        setLoading(true);
        setError("");
        setMessage("");

        const auth = getAuth();
        try {
            await confirmPasswordReset(auth, oobCode, newPassword);
            setMessage("Password changed successfully! Redirecting to login...");
            setTimeout(() => navigate("/userlogin"), 3000);
        } catch (err: any) {
            setError("Invalid or expired link. Please request a new password reset.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="xs">
            <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="h5" gutterBottom>
                    {oobCode ? "Create New Password" : "Reset Password"}
                </Typography>

                <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 2 }}>
                    {oobCode
                        ? "Please enter your new password below."
                        : "Enter your email and we'll send you a link to reset your password."}
                </Typography>

                {message && <Alert severity="success" sx={{ width: '100%', mt: 2 }}>{message}</Alert>}
                {error && <Alert severity="error" sx={{ width: '100%', mt: 2 }}>{error}</Alert>}

                {oobCode ? (
                    <form onSubmit={handleConfirmReset} style={{ width: '100%', marginTop: '1rem' }}>
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            type="password"
                            label="New Password"
                            autoFocus
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            disabled={loading}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            sx={{ mt: 3, mb: 2 }}
                            disabled={loading || newPassword.length < 6}
                        >
                            {loading ? <CircularProgress size={24} /> : "Update Password"}
                        </Button>
                    </form>
                ) : (
                    <form onSubmit={handleSendEmail} style={{ width: '100%', marginTop: '1rem' }}>
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            label="Email Address"
                            name="email"
                            autoComplete="email"
                            autoFocus
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            sx={{ mt: 3, mb: 2 }}
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} /> : "Send Reset Link"}
                        </Button>
                    </form>
                )}

                <Box sx={{ mt: 2 }}>
                    <Link to="/userlogin" style={{ textDecoration: 'none' }}>
                        <Typography variant="body2" color="primary">
                            Back to Login
                        </Typography>
                    </Link>
                </Box>
            </Box>
        </Container>
    );
};

export default ForgotPassword;