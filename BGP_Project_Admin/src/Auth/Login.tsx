import { Button, Input, Spinner } from "@heroui/react";
import { useNavigate } from "react-router-dom";
import cover from "../assets/images/cover.webp";
import logo from "../assets/images/logo.png";
import { useState } from "react";

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [generalError, setGeneralError] = useState("");
  const [validationErrors, setValidationErrors] = useState<{
    username?: string;
    password?: string;
  }>({});
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const validateForm = () => {
    const newErrors: { username?: string; password?: string } = {};
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    let isValid = true;

    if (!username) {
      newErrors.username = "Username wajib diisi.";
      isValid = false;
    } else if (username.length < 5) {
      newErrors.username = "Username minimal 5 karakter.";
      isValid = false;
    } else if (username.length > 100) {
      newErrors.username = "Username maksimal 100 karakter.";
      isValid = false;
    } else if (!usernameRegex.test(username)) {
      newErrors.username = "Hanya huruf, angka, dan underscore (_).";
      isValid = false;
    }

    if (!password) {
      newErrors.password = "Password wajib diisi.";
      isValid = false;
    } else if (password.length < 8) {
      newErrors.password = "Password minimal 8 karakter.";
      isValid = false;
    } else if (password.length > 16) {
      newErrors.password = "Password maksimal 16 karakter.";
      isValid = false;
    }

    setValidationErrors(newErrors);
    return isValid;
  };

  const handleLogin = async () => {
    setGeneralError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setGeneralError(
          data.message || "Login gagal, periksa kembali data Anda!",
        );
        setLoading(false);
        return;
      }

      document.cookie = `token=${data.token}; path=/;`;

      try {
        const base64Url = data.token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          window
            .atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join(""),
        );

        const decoded = JSON.parse(jsonPayload);
        const userRole = decoded.role;

        document.cookie = `role=${userRole}; path=/;`;

        if (userRole === "Admin" || userRole === "SuperAdmin") {
          navigate("/AdminDashboard");
        } else {
          navigate("/AdminDashboard");
        }
      } catch (decodeErr) {
        console.error("Error decoding token:", decodeErr);
        setGeneralError("Format token tidak dikenali.");
      }
    } catch (err) {
      console.error("Login Error:", err);
      setGeneralError("Terjadi kesalahan koneksi ke server.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div className="flex w-full h-screen overflow-hidden bg-white">
      <div className="hidden lg:flex w-1/2 relative bg-[#122C93] items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={cover}
            alt="Background"
            className="w-full h-full object-cover opacity-50 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#122C93] to-blue-900/90 mix-blend-multiply" />
        </div>

        <div className="relative z-10 p-12 text-white max-w-lg">
          <div className="w-30 h-30 flex items-center justify-center mb-6">
            <img src={logo} alt="Logo" />
          </div>
          <h1 className="text-4xl font-bold mb-4 leading-tight">
            Sistem Keamanan Terpadu
          </h1>
          <p className="text-base text-blue-100 font-light leading-relaxed opacity-90">
            PT. Bima Global Security System.
            <br />
            Kelola operasional keamanan dengan efisien dan aman.
          </p>
        </div>
      </div>

      <div className="form-section w-1/2 flex flex-col items-start justify-center px-[100px] lg:px-[200px]">
        <h2 className="font-bold text-[33px] text-[#122C93]">Login</h2>

        <h2 className="font-semibold text-[20px] mt-20 text-[#122C93]">
          Username
        </h2>
        <Input
          variant="bordered"
          type="text"
          size="lg"
          placeholder="Masukkan Username Anda"
          className="mt-5"
          value={username}
          isInvalid={!!validationErrors.username}
          errorMessage={validationErrors.username}
          onChange={(e) => {
            setUsername(e.target.value);
            if (validationErrors.username) {
              setValidationErrors({ ...validationErrors, username: undefined });
            }
          }}
          onKeyDown={handleKeyDown}
        />

        <h2 className="font-semibold text-[20px] mt-5 text-[#122C93]">
          Password
        </h2>
        <Input
          type="password"
          size="lg"
          placeholder="Masukkan Password Anda"
          variant="bordered"
          className="mt-5"
          value={password}
          isInvalid={!!validationErrors.password}
          errorMessage={validationErrors.password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (validationErrors.password) {
              setValidationErrors({ ...validationErrors, password: undefined });
            }
          }}
          onKeyDown={handleKeyDown}
        />

        {generalError && (
          <p className="text-red-500 mt-3 font-medium text-sm bg-red-50 p-2 rounded w-full">
            {generalError}
          </p>
        )}

        <h2 className="text-[#122C93] text-[15px] font-light mt-5">
          Lupa Password ?{" "}
          <span className="font-semibold">Silahkan Konfirmasi Admin</span>
        </h2>

        <Button
          variant="solid"
          color="primary"
          size="lg"
          className="mt-10 w-full font-semibold bg-[#122C93] flex items-center justify-center"
          onClick={handleLogin}
          isDisabled={loading}
        >
          {loading ? (
            <>
              <Spinner color="white" size="sm" />
              <span className="ml-2">Memproses...</span>
            </>
          ) : (
            "Login"
          )}
        </Button>
      </div>
    </div>
  );
};

export default Login;
