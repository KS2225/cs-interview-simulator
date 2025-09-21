import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import QA from "./pages/qa";
import Suggested from "./pages/Suggested";
import Evaluation from "./pages/Evaluation";
import CodingPrep from "./pages/Codingprep";
import Patterns from "./pages/Patterns";

function Navigation() {
  const location = useLocation();
  
  const navItems = [
    { path: "/", label: "Q&A", icon: "💬" },
    { path: "/suggested", label: "Suggested", icon: "💡" },
    { path: "/evaluation", label: "Evaluation", icon: "📊" },
    { path: "/coding", label: "Coding Prep", icon: "💻" },
    { path: "/patterns", label: "Patterns", icon: "📝" }
  ];

  return (
    <nav style={{
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      padding: "0 20px",
      borderRadius: "12px",
      margin: "20px 0",
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)"
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: "70px"
      }}>
        <div style={{
          color: "white",
          fontSize: "24px",
          fontWeight: "bold",
          display: "flex",
          alignItems: "center",
          gap: "10px"
        }}>
          🚀 AI Interview Simulator
        </div>
        
        <div style={{
          display: "flex",
          gap: "8px",
          alignItems: "center"
        }}>
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                textDecoration: "none",
                padding: "10px 18px",
                borderRadius: "8px",
                color: "white",
                fontWeight: "500",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.3s ease",
                backgroundColor: location.pathname === item.path 
                  ? "rgba(255, 255, 255, 0.2)" 
                  : "transparent",
                backdropFilter: location.pathname === item.path 
                  ? "blur(10px)" 
                  : "none",
                border: location.pathname === item.path 
                  ? "1px solid rgba(255, 255, 255, 0.3)" 
                  : "1px solid transparent"
              }}
              onMouseEnter={(e) => {
                if (location.pathname !== item.path) {
                  e.target.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
                }
              }}
              onMouseLeave={(e) => {
                if (location.pathname !== item.path) {
                  e.target.style.backgroundColor = "transparent";
                }
              }}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div style={{ 
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: "20px",
        width: "100vw",
        boxSizing: "border-box"
      }}>
        <div style={{
          width: "100%",
          maxWidth: "1200px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}>
          <Navigation />
          
          <div style={{
            background: "white",
            borderRadius: "16px",
            padding: "40px",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.08)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            width: "100%",
            maxWidth: "900px"
          }}>
            <Routes>
              <Route path="/" element={<QA />} />
              <Route path="/suggested" element={<Suggested />} />
              <Route path="/evaluation" element={<Evaluation />} />
              <Route path="/coding" element={<CodingPrep />} />
              <Route path="/patterns" element={<Patterns />} />
            </Routes>
          </div>
          
          <footer style={{
            textAlign: "center",
            margin: "20px 0",
            color: "#666",
            fontSize: "14px"
          }}>
            © 2025 AI Interview Simulator - Powered by Gemini AI
          </footer>
        </div>
      </div>
    </Router>
  );
}

export default App;