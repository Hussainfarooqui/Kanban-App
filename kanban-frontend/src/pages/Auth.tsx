import { useState } from "react";
import { register, login } from "../api/auth";
import { useNavigate } from "react-router-dom";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        const data = await login(email, password);
        console.log("Logged in:", data);

        if (data.access_token) {
          localStorage.setItem("token", data.access_token);
          navigate("/board");
        }
      } else {
        const data = await register(email, name, password);
        console.log("Registered:", data);
        setIsLogin(true);
        setError("Registration successful! Please login.");
      }
    } catch (err: unknown) {
      if (
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        typeof (err as unknown as { response?: unknown }).response === "object"
      ) {
        const response = (err as { response?: unknown }).response as {
          data?: { error?: string } | string;
          message?: string;
        };
        const errorMsg = typeof response?.data === "object" && response?.data !== null && "error" in response.data
          ? (response.data as { error?: string }).error
          : typeof response?.data === "string"
            ? response.data
            : response?.message;
        console.error(errorMsg || "Something went wrong");
        setError(errorMsg || "Something went wrong");
      } else if (
        typeof err === "object" &&
        err !== null &&
        "message" in err &&
        typeof (err as unknown as { message?: unknown }).message === "string"
      ) {
        const message = (err as { message?: string }).message;
        console.error(message);
        setError(message || "Something went wrong");
      } else {
        console.error(String(err));
        setError("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setError("");
    setEmail("");
    setName("");
    setPassword("");
  };

  return (
    <div style={{ 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center", 
      minHeight: "100vh",
      background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
      fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, sans-serif",
      position: "relative",
      overflow: "hidden"
    }}>
  {/* Decorative background elements (visual only) */}
      <div style={{
        position: "absolute",
        top: "10%",
        left: "10%",
        width: 60,
        height: 60,
        background: "linear-gradient(135deg, #ff6b9d 0%, #c44569 100%)",
        borderRadius: "50%",
        opacity: 0.3,
        animation: "bounce 3s infinite"
      }}></div>
      <div style={{
        position: "absolute",
        top: "20%",
        right: "15%",
        width: 40,
        height: 40,
        background: "linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)",
        borderRadius: "50%",
        opacity: 0.4,
        animation: "pulse 2s infinite"
      }}></div>
      <div style={{
        position: "absolute",
        bottom: "20%",
        left: "20%",
        width: 30,
        height: 30,
        background: "linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)",
        borderRadius: "50%",
        opacity: 0.5,
        animation: "wiggle 4s infinite"
      }}></div>
      
      <div style={{ 
        backgroundColor: "rgba(26, 26, 46, 0.9)", 
        padding: "48px 40px", 
        borderRadius: 24, 
        boxShadow: "0 25px 50px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,107,157,0.2)",
        width: "100%",
        maxWidth: 420,
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,107,157,0.3)",
        position: "relative",
        zIndex: 10
      }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ 
            width: 80, 
            height: 80, 
            background: "linear-gradient(135deg, #ff6b9d 0%, #c44569 100%)", 
            borderRadius: "50%", 
            margin: "0 auto 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 32,
            color: "white",
            fontWeight: "bold",
            boxShadow: "0 10px 30px rgba(255,107,157,0.4)",
            animation: "pulse 2s infinite"
          }}>
            KB
          </div>
          <h2 style={{ 
            margin: 0, 
            color: "#e2e8f0", 
            fontSize: 32, 
            fontWeight: 800,
            letterSpacing: "-0.5px",
            background: "linear-gradient(135deg, #ff6b9d 0%, #4ecdc4 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text"
          }}>
            {isLogin ? "Welcome back" : "Create an account"}
          </h2>
          <p style={{ 
            margin: "12px 0 0", 
            color: "#a0aec0", 
            fontSize: 16,
            fontWeight: 400
          }}>
            {isLogin ? "Sign in to your workspace" : "Create your first board"}
          </p>
        </div>
        
        {error && (
          <div style={{ 
            background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)", 
            color: "white", 
            padding: 16, 
            borderRadius: 16, 
            marginBottom: 24,
            border: "1px solid rgba(255,107,107,0.3)",
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            gap: 8,
            boxShadow: "0 8px 25px rgba(255,107,107,0.3)",
            animation: "wiggle 0.5s ease-in-out"
          }}>
            {/* status icon removed for formal tone */}
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ 
              display: "block", 
              marginBottom: 8, 
              color: "#e2e8f0", 
              fontSize: 14, 
              fontWeight: 600 
            }}>
              Email address
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "16px 20px",
                borderRadius: 16,
                border: "2px solid rgba(255,107,157,0.3)",
                fontSize: 16,
                boxSizing: "border-box",
                transition: "all 0.3s ease",
                backgroundColor: "rgba(255,255,255,0.05)",
                color: "#e2e8f0",
                backdropFilter: "blur(10px)"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#ff6b9d";
                e.target.style.backgroundColor = "rgba(255,255,255,0.1)";
                e.target.style.boxShadow = "0 0 0 3px rgba(255,107,157,0.2)";
                e.target.style.transform = "translateY(-2px)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(255,107,157,0.3)";
                e.target.style.backgroundColor = "rgba(255,255,255,0.05)";
                e.target.style.boxShadow = "none";
                e.target.style.transform = "translateY(0)";
              }}
            />
          </div>
          
          {!isLogin && (
            <div style={{ marginBottom: 20 }}>
              <label style={{ 
                display: "block", 
                marginBottom: 8, 
                color: "#4a5568", 
                fontSize: 14, 
                fontWeight: 500 
              }}>
                Full Name
              </label>
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "16px 20px",
                  borderRadius: 12,
                  border: "2px solid #e2e8f0",
                  fontSize: 16,
                  boxSizing: "border-box",
                  transition: "all 0.2s ease",
                  backgroundColor: "#f7fafc"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#667eea";
                  e.target.style.backgroundColor = "white";
                  e.target.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e2e8f0";
                  e.target.style.backgroundColor = "#f7fafc";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>
          )}
          
          <div style={{ marginBottom: 32 }}>
            <label style={{ 
              display: "block", 
              marginBottom: 8, 
              color: "#4a5568", 
              fontSize: 14, 
              fontWeight: 500 
            }}>
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "16px 20px",
                borderRadius: 12,
                border: "2px solid #e2e8f0",
                fontSize: 16,
                boxSizing: "border-box",
                transition: "all 0.2s ease",
                backgroundColor: "#f7fafc"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#667eea";
                e.target.style.backgroundColor = "white";
                e.target.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e2e8f0";
                e.target.style.backgroundColor = "#f7fafc";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            style={{
              width: "100%",
              padding: "16px 20px",
              background: loading 
                ? "linear-gradient(135deg, #a0aec0 0%, #718096 100%)" 
                : "linear-gradient(135deg, #ff6b9d 0%, #c44569 100%)",
              color: "white",
              border: "none",
              borderRadius: 12,
              fontSize: 16,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              marginBottom: 24,
              transition: "all 0.2s ease",
              boxShadow: loading ? "none" : "0 4px 15px rgba(102, 126, 234, 0.4)"
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 6px 20px rgba(102, 126, 234, 0.5)";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 15px rgba(102, 126, 234, 0.4)";
              }
            }}
          >
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <div style={{ 
                  width: 16, 
                  height: 16, 
                  border: "2px solid transparent", 
                  borderTop: "2px solid white", 
                  borderRadius: "50%", 
                  animation: "spin 1s linear infinite" 
                }}></div>
                Processing...
              </span>
            ) : (
              isLogin ? "Sign In" : "Create Account"
            )}
          </button>
        </form>
        
        <div style={{ textAlign: "center" }}>
          <button 
            onClick={switchMode}
            style={{
              background: "none",
              border: "none",
              color: "#667eea",
              fontSize: 14,
              cursor: "pointer",
              textDecoration: "underline",
              padding: 8,
              transition: "color 0.2s ease"
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = "#5a67d8"}
            onMouseLeave={(e) => e.currentTarget.style.color = "#667eea"}
          >
            {isLogin ? "Don't have an account? Create one" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
