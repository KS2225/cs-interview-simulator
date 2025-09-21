import React, { useState } from "react";
import ReactMarkdown from "react-markdown";

function QA() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState("General");
  const [difficulty, setDifficulty] = useState("Medium");

  const topics = ["General", "DSA", "OS", "DBMS", "ML", "System Design"];
  const difficulties = ["Easy", "Medium", "Hard"];

  const askBackend = async () => {
    setAnswer("");
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/ask_stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, topic, difficulty }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data:")) {
            const payload = JSON.parse(line.replace("data: ", ""));
            setAnswer((prev) => prev + payload.text);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching:", err);
      setAnswer("⚠️ Error connecting to backend");
    }

    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey && question.trim()) {
      askBackend();
    }
  };

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
          Ask Your Questions
        </h1>
        <p style={{
          color: "#666",
          fontSize: "16px",
          margin: "0"
        }}>
          Get AI-powered answers tailored to your interview preparation needs
        </p>
      </div>

      {/* Controls */}
      <div style={{
        display: "flex",
        gap: "16px",
        marginBottom: "24px",
        flexWrap: "wrap",
        alignItems: "center"
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={{
            fontSize: "14px",
            fontWeight: "600",
            color: "#374151"
          }}>Topic</label>
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            style={{
              padding: "10px 16px",
              border: "2px solid #e5e7eb",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: "500",
              backgroundColor: "white",
              cursor: "pointer",
              transition: "all 0.3s ease",
              minWidth: "120px"
            }}
            onFocus={(e) => e.target.style.borderColor = "#667eea"}
            onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
          >
            {topics.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={{
            fontSize: "14px",
            fontWeight: "600",
            color: "#374151"
          }}>Difficulty</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            style={{
              padding: "10px 16px",
              border: "2px solid #e5e7eb",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: "500",
              backgroundColor: "white",
              cursor: "pointer",
              transition: "all 0.3s ease",
              minWidth: "100px"
            }}
            onFocus={(e) => e.target.style.borderColor = "#667eea"}
            onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
          >
            {difficulties.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div style={{
          padding: "8px 12px",
          backgroundColor: "#f3f4f6",
          borderRadius: "8px",
          fontSize: "12px",
          color: "#6b7280"
        }}>
          💡 Tip: Press Ctrl+Enter to ask
        </div>
      </div>

      {/* Question Input */}
      <div style={{ marginBottom: "24px" }}>
        <label style={{
          display: "block",
          fontSize: "16px",
          fontWeight: "600",
          color: "#374151",
          marginBottom: "12px"
        }}>
          Your Question
        </label>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Ask anything about algorithms, system design, databases, or any technical topic..."
          style={{
            width: "100%",
            minHeight: "120px",
            padding: "16px",
            border: "2px solid #e5e7eb",
            borderRadius: "12px",
            fontSize: "16px",
            fontFamily: "inherit",
            resize: "vertical",
            transition: "all 0.3s ease",
            backgroundColor: "#fafafa"
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "#667eea";
            e.target.style.backgroundColor = "white";
            e.target.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "#e5e7eb";
            e.target.style.backgroundColor = "#fafafa";
            e.target.style.boxShadow = "none";
          }}
        />
      </div>

      {/* Ask Button */}
      <button
        onClick={askBackend}
        disabled={loading || !question.trim()}
        style={{
          background: loading || !question.trim() 
            ? "linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)"
            : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          border: "none",
          padding: "14px 28px",
          borderRadius: "12px",
          fontSize: "16px",
          fontWeight: "600",
          cursor: loading || !question.trim() ? "not-allowed" : "pointer",
          transition: "all 0.3s ease",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          boxShadow: loading || !question.trim() 
            ? "none" 
            : "0 4px 15px rgba(102, 126, 234, 0.4)",
          transform: loading ? "none" : "translateY(0)",
          marginBottom: "32px"
        }}
        onMouseEnter={(e) => {
          if (!loading && question.trim()) {
            e.target.style.transform = "translateY(-2px)";
            e.target.style.boxShadow = "0 6px 20px rgba(102, 126, 234, 0.5)";
          }
        }}
        onMouseLeave={(e) => {
          if (!loading && question.trim()) {
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
            Processing...
          </>
        ) : (
          <>
            <span>🚀</span>
            Ask AI
          </>
        )}
      </button>

      {/* AI Response */}
      {(answer || loading) && (
        <div style={{
          background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
          border: "1px solid #e2e8f0",
          borderRadius: "16px",
          padding: "24px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)"
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "16px",
            paddingBottom: "16px",
            borderBottom: "1px solid #e2e8f0"
          }}>
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px"
            }}>
              🤖
            </div>
            <div>
              <h3 style={{
                margin: "0",
                fontSize: "18px",
                fontWeight: "600",
                color: "#1e293b"
              }}>
                AI Assistant
              </h3>
              <p style={{
                margin: "0",
                fontSize: "14px",
                color: "#64748b"
              }}>
                {loading ? "Thinking..." : "Here's your answer"}
              </p>
            </div>
          </div>
          
          <div style={{
            fontSize: "16px",
            lineHeight: "1.6",
            color: "#374151"
          }}>
            {loading && !answer && (
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                color: "#6b7280"
              }}>
                <div style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  backgroundColor: "#667eea",
                  animation: "pulse 1.5s ease-in-out infinite"
                }} />
                <div style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  backgroundColor: "#667eea",
                  animation: "pulse 1.5s ease-in-out infinite 0.2s"
                }} />
                <div style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  backgroundColor: "#667eea",
                  animation: "pulse 1.5s ease-in-out infinite 0.4s"
                }} />
                <span>Generating response...</span>
              </div>
            )}
            <ReactMarkdown>{answer}</ReactMarkdown>
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

export default QA;