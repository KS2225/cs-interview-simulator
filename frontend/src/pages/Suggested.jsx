import React, { useState } from "react";
import ReactMarkdown from "react-markdown";

function Suggested() {
  const [topic, setTopic] = useState("General");
  const [difficulty, setDifficulty] = useState("Medium");
  const [suggested, setSuggested] = useState([]);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingQuestions, setFetchingQuestions] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState("");

  const topics = ["General", "DSA", "OS", "DBMS", "ML", "System Design"];
  const difficulties = ["Easy", "Medium", "Hard"];

  const fetchSuggestions = async () => {
    setSuggested([]);
    setAnswer("");
    setSelectedQuestion("");
    setFetchingQuestions(true);
    
    try {
      const response = await fetch("http://127.0.0.1:8000/suggest_questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, difficulty }),
      });
      const data = await response.json();
      const list = data.questions
        .split("\n")
        .map((q) => q.replace(/^\d+\.\s*/, "").trim())
        .filter((q) => q.length > 0);
      setSuggested(list);
    } catch (err) {
      console.error("Error fetching suggestions:", err);
      setSuggested([]);
    } finally {
      setFetchingQuestions(false);
    }
  };

  const askBackend = async (q) => {
    setAnswer("");
    setSelectedQuestion(q);
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/ask_stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, topic, difficulty }),
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
          Suggested Questions
        </h1>
        <p style={{
          color: "#666",
          fontSize: "16px",
          margin: "0"
        }}>
          Get AI-curated interview questions based on your preferred topic and difficulty
        </p>
      </div>

      {/* Controls */}
      <div style={{
        background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
        padding: "24px",
        borderRadius: "16px",
        marginBottom: "32px",
        border: "1px solid #e2e8f0"
      }}>
        <div style={{
          display: "flex",
          gap: "20px",
          alignItems: "end",
          flexWrap: "wrap"
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: "1", minWidth: "120px" }}>
            <label style={{
              fontSize: "14px",
              fontWeight: "600",
              color: "#374151"
            }}>Topic</label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              style={{
                padding: "12px 16px",
                border: "2px solid #e5e7eb",
                borderRadius: "10px",
                fontSize: "16px",
                fontWeight: "500",
                backgroundColor: "white",
                cursor: "pointer",
                transition: "all 0.3s ease"
              }}
              onFocus={(e) => e.target.style.borderColor = "#667eea"}
              onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
            >
              {topics.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: "1", minWidth: "100px" }}>
            <label style={{
              fontSize: "14px",
              fontWeight: "600",
              color: "#374151"
            }}>Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              style={{
                padding: "12px 16px",
                border: "2px solid #e5e7eb",
                borderRadius: "10px",
                fontSize: "16px",
                fontWeight: "500",
                backgroundColor: "white",
                cursor: "pointer",
                transition: "all 0.3s ease"
              }}
              onFocus={(e) => e.target.style.borderColor = "#667eea"}
              onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
            >
              {difficulties.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <button
            onClick={fetchSuggestions}
            disabled={fetchingQuestions}
            style={{
              background: fetchingQuestions 
                ? "linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)"
                : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              border: "none",
              padding: "12px 24px",
              borderRadius: "10px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: fetchingQuestions ? "not-allowed" : "pointer",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: fetchingQuestions 
                ? "none" 
                : "0 4px 15px rgba(102, 126, 234, 0.4)",
              minWidth: "180px",
              justifyContent: "center"
            }}
            onMouseEnter={(e) => {
              if (!fetchingQuestions) {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 6px 20px rgba(102, 126, 234, 0.5)";
              }
            }}
            onMouseLeave={(e) => {
              if (!fetchingQuestions) {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 15px rgba(102, 126, 234, 0.4)";
              }
            }}
          >
            {fetchingQuestions ? (
              <>
                <div style={{
                  width: "16px",
                  height: "16px",
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderTop: "2px solid white",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite"
                }} />
                Generating...
              </>
            ) : (
              <>
                <span>✨</span>
                Get Questions
              </>
            )}
          </button>
        </div>
      </div>

      {/* Questions Grid */}
      {suggested.length > 0 && (
        <div style={{ marginBottom: "32px" }}>
          <h3 style={{
            fontSize: "20px",
            fontWeight: "600",
            color: "#1e293b",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <span>📝</span>
            Suggested Questions ({suggested.length})
          </h3>
          
          <div style={{
            display: "grid",
            gap: "12px",
            gridTemplateColumns: "1fr"
          }}>
            {suggested.map((q, idx) => (
              <div
                key={idx}
                onClick={() => askBackend(q)}
                style={{
                  padding: "20px",
                  background: selectedQuestion === q && loading 
                    ? "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)"
                    : selectedQuestion === q 
                    ? "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)"
                    : "white",
                  border: selectedQuestion === q 
                    ? "2px solid #3b82f6" 
                    : "2px solid #e5e7eb",
                  borderRadius: "12px",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
                  position: "relative",
                  overflow: "hidden"
                }}
                onMouseEnter={(e) => {
                  if (selectedQuestion !== q) {
                    e.target.style.borderColor = "#667eea";
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 8px 25px rgba(102, 126, 234, 0.15)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedQuestion !== q) {
                    e.target.style.borderColor = "#e5e7eb";
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.05)";
                  }
                }}
              >
                <div style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px"
                }}>
                  <div style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: "14px",
                    fontWeight: "600",
                    flexShrink: 0
                  }}>
                    {idx + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{
                      margin: "0",
                      fontSize: "16px",
                      lineHeight: "1.5",
                      color: "#374151",
                      fontWeight: "500"
                    }}>
                      {q}
                    </p>
                    {selectedQuestion === q && loading && (
                      <div style={{
                        marginTop: "8px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        color: "#f59e0b",
                        fontSize: "14px"
                      }}>
                        <div style={{
                          width: "16px",
                          height: "16px",
                          border: "2px solid rgba(245, 158, 11, 0.3)",
                          borderTop: "2px solid #f59e0b",
                          borderRadius: "50%",
                          animation: "spin 1s linear infinite"
                        }} />
                        Generating answer...
                      </div>
                    )}
                  </div>
                  <div style={{
                    color: "#9ca3af",
                    fontSize: "20px"
                  }}>
                    →
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Answer */}
      {(answer || (loading && selectedQuestion)) && (
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
            <div style={{ flex: 1 }}>
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
                {loading ? "Processing your question..." : "Here's your detailed answer"}
              </p>
            </div>
            {selectedQuestion && (
              <div style={{
                fontSize: "12px",
                padding: "4px 8px",
                backgroundColor: "#e0e7ff",
                color: "#3730a3",
                borderRadius: "6px",
                fontWeight: "500"
              }}>
                {topic} • {difficulty}
              </div>
            )}
          </div>

          {selectedQuestion && (
            <div style={{
              background: "white",
              padding: "16px",
              borderRadius: "8px",
              marginBottom: "20px",
              border: "1px solid #e5e7eb"
            }}>
              <h4 style={{
                margin: "0 0 8px 0",
                fontSize: "14px",
                fontWeight: "600",
                color: "#6b7280",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}>
                Question
              </h4>
              <p style={{
                margin: "0",
                fontSize: "16px",
                color: "#374151",
                fontWeight: "500"
              }}>
                {selectedQuestion}
              </p>
            </div>
          )}
          
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
                <span>Generating comprehensive answer...</span>
              </div>
            )}
            <ReactMarkdown>{answer}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* Empty State */}
      {suggested.length === 0 && !fetchingQuestions && (
        <div style={{
          textAlign: "center",
          padding: "60px 20px",
          background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
          borderRadius: "16px",
          border: "2px dashed #cbd5e1"
        }}>
          <div style={{
            fontSize: "48px",
            marginBottom: "16px"
          }}>
            💡
          </div>
          <h3 style={{
            fontSize: "20px",
            fontWeight: "600",
            color: "#374151",
            margin: "0 0 8px 0"
          }}>
            Ready to Practice?
          </h3>
          <p style={{
            color: "#6b7280",
            fontSize: "16px",
            margin: "0 0 24px 0"
          }}>
            Select your preferred topic and difficulty, then click "Get Questions" to start
          </p>
          <button
            onClick={fetchSuggestions}
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              border: "none",
              padding: "12px 24px",
              borderRadius: "10px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)"
            }}
          >
            ✨ Get Started
          </button>
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

export default Suggested;