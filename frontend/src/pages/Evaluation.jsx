import React, { useState } from "react";

function Evaluation() {
  const [question, setQuestion] = useState("");
  const [candidateAnswer, setCandidateAnswer] = useState("");
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(false);

  const evaluateAnswer = async () => {
    setEvaluation(null);
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, user_answer: candidateAnswer }),
      });

      const data = await response.json();
      setEvaluation(data);
    } catch (err) {
      console.error("Error fetching evaluation:", err);
      setEvaluation({ error: "⚠️ Error connecting to backend" });
    }

    setLoading(false);
  };

  const getScoreColor = (score) => {
    if (score >= 4) return "#10b981"; // Green
    if (score >= 3) return "#f59e0b"; // Yellow
    return "#ef4444"; // Red
  };

  const getScoreIcon = (score) => {
    if (score >= 4) return "🌟";
    if (score >= 3) return "⚡";
    return "💡";
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
          Answer Evaluation
        </h1>
        <p style={{
          color: "#666",
          fontSize: "16px",
          margin: "0"
        }}>
          Get detailed feedback on your interview answers with AI-powered analysis
        </p>
      </div>

      {/* Input Section */}
      <div style={{
        background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
        padding: "32px",
        borderRadius: "20px",
        marginBottom: "32px",
        border: "1px solid #e2e8f0"
      }}>
        <div style={{ marginBottom: "24px" }}>
          <label style={{
            display: "block",
            fontSize: "16px",
            fontWeight: "600",
            color: "#374151",
            marginBottom: "12px",
            // display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <span>❓</span>
            Interview Question
          </label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter the interview question you were asked..."
            style={{
              width: "100%",
              minHeight: "100px",
              padding: "16px",
              border: "2px solid #e5e7eb",
              borderRadius: "12px",
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

        <div style={{ marginBottom: "24px" }}>
          <label style={{
            display: "block",
            fontSize: "16px",
            fontWeight: "600",
            color: "#374151",
            marginBottom: "12px",
            // display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <span>💬</span>
            Your Answer
          </label>
          <textarea
            value={candidateAnswer}
            onChange={(e) => setCandidateAnswer(e.target.value)}
            placeholder="Type your answer here for evaluation..."
            style={{
              width: "100%",
              minHeight: "150px",
              padding: "16px",
              border: "2px solid #e5e7eb",
              borderRadius: "12px",
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

        <button
          onClick={evaluateAnswer}
          disabled={loading || !candidateAnswer.trim() || !question.trim()}
          style={{
            background: loading || !candidateAnswer.trim() || !question.trim()
              ? "linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)"
              : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            border: "none",
            padding: "16px 32px",
            borderRadius: "12px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: loading || !candidateAnswer.trim() || !question.trim() ? "not-allowed" : "pointer",
            transition: "all 0.3s ease",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: loading || !candidateAnswer.trim() || !question.trim()
              ? "none"
              : "0 4px 15px rgba(102, 126, 234, 0.4)",
            width: "fit-content"
          }}
          onMouseEnter={(e) => {
            if (!loading && candidateAnswer.trim() && question.trim()) {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 6px 20px rgba(102, 126, 234, 0.5)";
            }
          }}
          onMouseLeave={(e) => {
            if (!loading && candidateAnswer.trim() && question.trim()) {
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
              Evaluating...
            </>
          ) : (
            <>
              <span>🎯</span>
              Evaluate My Answer
            </>
          )}
        </button>
      </div>

      {/* Evaluation Results */}
      {evaluation && (
        <div style={{
          background: "white",
          border: "1px solid #e2e8f0",
          borderRadius: "20px",
          padding: "32px",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.08)"
        }}>
          {evaluation.error ? (
            <div style={{
              textAlign: "center",
              padding: "40px",
              color: "#ef4444"
            }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚠️</div>
              <h3 style={{ fontSize: "20px", fontWeight: "600", margin: "0 0 8px 0" }}>
                Evaluation Failed
              </h3>
              <p style={{ margin: "0", fontSize: "16px" }}>{evaluation.error}</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                marginBottom: "32px",
                paddingBottom: "24px",
                borderBottom: "2px solid #f1f5f9"
              }}>
                <div style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px"
                }}>
                  🎯
                </div>
                <div>
                  <h2 style={{
                    fontSize: "24px",
                    fontWeight: "700",
                    color: "#1e293b",
                    margin: "0 0 4px 0"
                  }}>
                    Evaluation Results
                  </h2>
                  <p style={{
                    fontSize: "16px",
                    color: "#64748b",
                    margin: "0"
                  }}>
                    Detailed analysis of your interview answer
                  </p>
                </div>
              </div>

              {/* Scores Grid */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "20px",
                marginBottom: "32px"
              }}>
                {[
                  { key: "clarity", label: "Clarity", description: "How clear and well-structured your answer is" },
                  { key: "correctness", label: "Correctness", description: "Technical accuracy of your response" },
                  { key: "completeness", label: "Completeness", description: "How thoroughly you addressed the question" }
                ].map(metric => (
                  <div
                    key={metric.key}
                    style={{
                      background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                      padding: "24px",
                      borderRadius: "16px",
                      border: "1px solid #e2e8f0",
                      position: "relative",
                      overflow: "hidden"
                    }}
                  >
                    <div style={{
                      position: "absolute",
                      top: "0",
                      left: "0",
                      right: "0",
                      height: "4px",
                      backgroundColor: getScoreColor(evaluation[`${metric.key}_score`]),
                      borderRadius: "16px 16px 0 0"
                    }} />
                    
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "12px"
                    }}>
                      <h3 style={{
                        fontSize: "18px",
                        fontWeight: "600",
                        color: "#1e293b",
                        margin: "0",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px"
                      }}>
                        <span>{getScoreIcon(evaluation[`${metric.key}_score`])}</span>
                        {metric.label}
                      </h3>
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px"
                      }}>
                        <div style={{
                          fontSize: "24px",
                          fontWeight: "700",
                          color: getScoreColor(evaluation[`${metric.key}_score`])
                        }}>
                          {evaluation[`${metric.key}_score`]}
                        </div>
                        <div style={{
                          fontSize: "16px",
                          color: "#9ca3af"
                        }}>
                          /5
                        </div>
                      </div>
                    </div>
                    
                    <p style={{
                      fontSize: "14px",
                      color: "#6b7280",
                      margin: "0 0 12px 0"
                    }}>
                      {metric.description}
                    </p>
                    
                    <p style={{
                      fontSize: "16px",
                      color: "#374151",
                      margin: "0",
                      fontWeight: "500"
                    }}>
                      {evaluation[`${metric.key}_feedback`]}
                    </p>
                  </div>
                ))}
              </div>

              {/* Advice Section */}
              {evaluation.advice && evaluation.advice.length > 0 && (
                <div style={{
                  background: "linear-gradient(135deg, #fefce8 0%, #fef3c7 100%)",
                  padding: "24px",
                  borderRadius: "16px",
                  border: "1px solid #fbbf24"
                }}>
                  <h3 style={{
                    fontSize: "20px",
                    fontWeight: "600",
                    color: "#92400e",
                    margin: "0 0 16px 0",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}>
                    <span>💡</span>
                    Improvement Suggestions
                  </h3>
                  <ul style={{
                    margin: "0",
                    padding: "0",
                    listStyle: "none"
                  }}>
                    {evaluation.advice.map((item, idx) => (
                      <li
                        key={idx}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "12px",
                          padding: "12px 0",
                          borderBottom: idx < evaluation.advice.length - 1 ? "1px solid rgba(251, 191, 36, 0.3)" : "none"
                        }}
                      >
                        <div style={{
                          width: "24px",
                          height: "24px",
                          borderRadius: "50%",
                          backgroundColor: "#f59e0b",
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "12px",
                          fontWeight: "600",
                          flexShrink: 0,
                          marginTop: "2px"
                        }}>
                          {idx + 1}
                        </div>
                        <p style={{
                          margin: "0",
                          fontSize: "16px",
                          color: "#92400e",
                          lineHeight: "1.5"
                        }}>
                          {item}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Empty State */}
      {!evaluation && !loading && (
        <div style={{
          textAlign: "center",
          padding: "80px 20px",
          background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
          borderRadius: "20px",
          border: "2px dashed #cbd5e1"
        }}>
          <div style={{ fontSize: "64px", marginBottom: "24px" }}>🎯</div>
          <h3 style={{
            fontSize: "24px",
            fontWeight: "600",
            color: "#374151",
            margin: "0 0 12px 0"
          }}>
            Ready for Evaluation?
          </h3>
          <p style={{
            color: "#6b7280",
            fontSize: "18px",
            margin: "0 0 32px 0",
            maxWidth: "500px",
            marginLeft: "auto",
            marginRight: "auto",
            lineHeight: "1.5"
          }}>
            Enter both the interview question and your answer above, then click "Evaluate My Answer" to get detailed feedback on clarity, correctness, and completeness.
          </p>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default Evaluation;