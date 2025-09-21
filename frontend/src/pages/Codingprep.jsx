import React, { useState } from "react";
import ReactMarkdown from "react-markdown";

export default function CodingPrep() {
  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState("Python");
  const [code, setCode] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  const languages = [
    { value: "Python", icon: "🐍", color: "#3776ab" },
    { value: "Java", icon: "☕", color: "#ed8b00" },
    { value: "C++", icon: "⚡", color: "#00599c" },
    { value: "JavaScript", icon: "💛", color: "#f7df1e" },
    { value: "Go", icon: "🐹", color: "#00add8" },
    { value: "Rust", icon: "🦀", color: "#000000" }
  ];

  async function submitCode() {
    if (!code.trim()) {
      alert("Please enter some code to review.");
      return;
    }

    setFeedback("");
    setLoading(true);
    
    try {
      const r = await fetch("http://127.0.0.1:8000/code_review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, code, title }),
      });
      
      if (!r.ok) {
        throw new Error(`HTTP ${r.status}: ${r.statusText}`);
      }
      
      const data = await r.json();
      setFeedback(data.feedback || "No feedback returned.");
    } catch (e) {
      console.error(e);
      setFeedback(`⚠️ Error connecting to backend: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.target;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      // Insert tab character
      const value = textarea.value;
      textarea.value = value.substring(0, start) + "    " + value.substring(end);
      textarea.selectionStart = textarea.selectionEnd = start + 4;
      setCode(textarea.value);
    }
  };

  const selectedLang = languages.find(l => l.value === language);

  return (
    <div style={{ maxWidth: "100%" }}>
      {/* Header */}
      <div style={{ marginBottom: "32px", textAlign: "center" }}>
        <h1 style={{
          fontSize: "32px",
          fontWeight: "700",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          marginBottom: "8px"
        }}>
          Code Review & Analysis
        </h1>
        <p style={{
          color: "#666",
          fontSize: "16px",
          margin: "0"
        }}>
          Get detailed feedback on your code with AI-powered analysis and suggestions
        </p>
      </div>

      {/* Problem Title Section */}
      <div style={{
        background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
        padding: "24px",
        borderRadius: "16px",
        marginBottom: "24px",
        border: "1px solid #e2e8f0"
      }}>
        <label style={{
          display: "block",
          fontSize: "16px",
          fontWeight: "600",
          color: "#374151",
          marginBottom: "12px",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          <span>📝</span>
          Problem/Question Title (Optional)
        </label>
        <textarea
          rows={2}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Describe the problem you're solving (e.g., 'Two Sum', 'Binary Tree Traversal', etc.)"
          style={{
            width: "100%",
            padding: "12px 16px",
            border: "2px solid #e5e7eb",
            borderRadius: "10px",
            fontSize: "16px",
            fontFamily: "inherit",
            resize: "vertical",
            transition: "all 0.3s ease",
            backgroundColor: "white"
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "#667eea";
            e.target.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "#e5e7eb";
            e.target.style.boxShadow = "none";
          }}
        />
      </div>

      {/* Language Selection & Code Input */}
      <div style={{
        background: "white",
        border: "1px solid #e2e8f0",
        borderRadius: "16px",
        marginBottom: "24px",
        overflow: "hidden",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)"
      }}>
        {/* Language Selector Header */}
        <div style={{
          background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px"
          }}>
            <span style={{
              fontSize: "20px",
              color: "white"
            }}>
              💻
            </span>
            <h3 style={{
              fontSize: "18px",
              fontWeight: "600",
              color: "white",
              margin: "0"
            }}>
              Code Editor
            </h3>
          </div>
          
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px"
          }}>
            <label style={{
              fontSize: "14px",
              fontWeight: "500",
              color: "#cbd5e1"
            }}>
              Language:
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              style={{
                padding: "8px 12px",
                border: "1px solid #475569",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "500",
                backgroundColor: "#0f172a",
                color: "white",
                cursor: "pointer",
                outline: "none"
              }}
            >
              {languages.map(lang => (
                <option key={lang.value} value={lang.value}>
                  {lang.icon} {lang.value}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Code Input Area */}
        <div style={{ position: "relative" }}>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={`Write your ${language} code here...\n\n// Example:\nfunction twoSum(nums, target) {\n    // Your solution here\n    return [];\n}`}
            style={{
              width: "100%",
              minHeight: "400px",
              padding: "20px",
              border: "none",
              fontSize: "14px",
              fontFamily: "'Fira Code', 'Monaco', 'Consolas', monospace",
              lineHeight: "1.6",
              resize: "vertical",
              backgroundColor: "#0f172a",
              color: "#e2e8f0",
              outline: "none"
            }}
          />
          
          {/* Code Stats */}
          <div style={{
            position: "absolute",
            bottom: "8px",
            right: "12px",
            display: "flex",
            gap: "16px",
            fontSize: "12px",
            color: "#64748b",
            backgroundColor: "rgba(15, 23, 42, 0.8)",
            padding: "4px 8px",
            borderRadius: "4px"
          }}>
            <span>Lines: {code.split('\n').length}</span>
            <span>Chars: {code.length}</span>
          </div>
        </div>

        {/* Code Editor Footer */}
        <div style={{
          background: "#f8fafc",
          padding: "12px 20px",
          borderTop: "1px solid #e2e8f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "12px",
          color: "#64748b"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span>💡 Press Tab for indentation</span>
            <span>🎨 {selectedLang?.icon} {language}</span>
          </div>
          <div>
            Ready for review
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <button
          onClick={submitCode}
          disabled={loading || !code.trim()}
          style={{
            background: loading || !code.trim()
              ? "linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)"
              : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            border: "none",
            padding: "16px 32px",
            borderRadius: "12px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: loading || !code.trim() ? "not-allowed" : "pointer",
            transition: "all 0.3s ease",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: loading || !code.trim()
              ? "none"
              : "0 4px 15px rgba(102, 126, 234, 0.4)",
            margin: "0 auto"
          }}
          onMouseEnter={(e) => {
            if (!loading && code.trim()) {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 6px 20px rgba(102, 126, 234, 0.5)";
            }
          }}
          onMouseLeave={(e) => {
            if (!loading && code.trim()) {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 15px rgba(102, 126, 234, 0.4)";
            }
          }}
        >
          {loading ? (
            <>
              <div style={{
                width: "20px",
                height: "20px",
                border: "2px solid rgba(255,255,255,0.3)",
                borderTop: "2px solid white",
                borderRadius: "50%",
                animation: "spin 1s linear infinite"
              }} />
              Analyzing Code...
            </>
          ) : (
            <>
              <span>🔍</span>
              Get AI Code Review
            </>
          )}
        </button>
      </div>

      {/* Feedback Section */}
      {(feedback || loading) && (
        <div style={{
          background: "white",
          border: "1px solid #e2e8f0",
          borderRadius: "16px",
          padding: "32px",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.08)"
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "24px",
            paddingBottom: "20px",
            borderBottom: "2px solid #f1f5f9"
          }}>
            <div style={{
              width: "50px",
              height: "50px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px"
            }}>
              🤖
            </div>
            <div>
              <h2 style={{
                fontSize: "20px",
                fontWeight: "700",
                color: "#1e293b",
                margin: "0 0 4px 0"
              }}>
                AI Code Review
              </h2>
              <p style={{
                fontSize: "14px",
                color: "#64748b",
                margin: "0"
              }}>
                {loading ? "Analyzing your code..." : "Detailed analysis and suggestions"}
              </p>
            </div>
            {!loading && selectedLang && (
              <div style={{
                marginLeft: "auto",
                padding: "8px 12px",
                backgroundColor: selectedLang.color,
                color: "white",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "4px"
              }}>
                <span>{selectedLang.icon}</span>
                {selectedLang.value}
              </div>
            )}
          </div>

          {title && !loading && (
            <div style={{
              background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
              padding: "16px",
              borderRadius: "10px",
              marginBottom: "24px",
              border: "1px solid #0ea5e9"
            }}>
              <h4 style={{
                margin: "0 0 8px 0",
                fontSize: "14px",
                fontWeight: "600",
                color: "#0369a1",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}>
                Problem Context
              </h4>
              <p style={{
                margin: "0",
                fontSize: "16px",
                color: "#0c4a6e",
                fontWeight: "500"
              }}>
                {title}
              </p>
            </div>
          )}

          <div style={{
            fontSize: "16px",
            lineHeight: "1.7",
            color: "#374151"
          }}>
            {loading && !feedback && (
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "16px",
                padding: "40px 20px",
                color: "#6b7280"
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px"
                }}>
                  <div style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: "#667eea",
                    animation: "pulse 1.5s ease-in-out infinite"
                  }} />
                  <div style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: "#667eea",
                    animation: "pulse 1.5s ease-in-out infinite 0.2s"
                  }} />
                  <div style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: "#667eea",
                    animation: "pulse 1.5s ease-in-out infinite 0.4s"
                  }} />
                </div>
                <div style={{
                  textAlign: "center"
                }}>
                  <p style={{ fontSize: "18px", fontWeight: "500", margin: "0 0 8px 0" }}>
                    Analyzing your code...
                  </p>
                  <p style={{ fontSize: "14px", margin: "0" }}>
                    Checking correctness, complexity, style, and edge cases
                  </p>
                </div>
              </div>
            )}
            {feedback && <ReactMarkdown>{feedback}</ReactMarkdown>}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!feedback && !loading && (
        <div style={{
          textAlign: "center",
          padding: "60px 20px",
          background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
          borderRadius: "16px",
          border: "2px dashed #cbd5e1"
        }}>
          <div style={{ fontSize: "64px", marginBottom: "20px" }}>💻</div>
          <h3 style={{
            fontSize: "24px",
            fontWeight: "600",
            color: "#374151",
            margin: "0 0 12px 0"
          }}>
            Ready for Code Review?
          </h3>
          <p style={{
            color: "#6b7280",
            fontSize: "16px",
            margin: "0 0 24px 0",
            maxWidth: "500px",
            marginLeft: "auto",
            marginRight: "auto"
          }}>
            Paste your code above and get detailed feedback on correctness, complexity, readability, and suggestions for improvement.
          </p>
          <div style={{
            display: "flex",
            justifyContent: "center",
            gap: "20px",
            flexWrap: "wrap",
            marginTop: "20px"
          }}>
            {["🐍 Python", "☕ Java", "⚡ C++", "💛 JavaScript"].map(lang => (
              <div key={lang} style={{
                padding: "8px 16px",
                backgroundColor: "white",
                borderRadius: "20px",
                fontSize: "14px",
                fontWeight: "500",
                color: "#6b7280",
                border: "1px solid #e5e7eb"
              }}>
                {lang}
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}