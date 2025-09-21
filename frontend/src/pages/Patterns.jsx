// src/pages/Patterns.jsx
import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

export default function Patterns() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState(null);
  const [explanation, setExplanation] = useState("");
  const [explainLoading, setExplainLoading] = useState(false);

  const [attemptCode, setAttemptCode] = useState("");
  const [attemptLang, setAttemptLang] = useState("Python");
  const [attemptFeedback, setAttemptFeedback] = useState("");
  const [attemptLoading, setAttemptLoading] = useState(false);

  const languages = [
    { value: "Python", icon: "🐍" },
    { value: "Java", icon: "☕" },
    { value: "C++", icon: "⚡" },
    { value: "JavaScript", icon: "💛" },
    { value: "Go", icon: "🐹" }
  ];

  async function loadPatterns() {
    setLoading(true);
    try {
      const r = await fetch("http://127.0.0.1:8000/patterns");
      if (!r.ok) throw new Error(`HTTP ${r.status}: ${r.statusText}`);
      const data = await r.json();
      setProblems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Error loading patterns:", e);
      setProblems([]);
      alert("Failed to load patterns. Check console for details.");
    } finally {
      setLoading(false);
    }
  }

  async function explainProblem(problem) {
    setSelected(problem);
    setExplanation("");
    setExplainLoading(true);
    try {
      const payload = {
        title: problem.title || "Unknown Problem",
        url: problem.url || problem.link || "",
        difficulty: problem.difficulty || "Medium",
        pattern: Array.isArray(problem.pattern) ? problem.pattern.join(", ") : problem.pattern || "General"
      };

      const resp = await fetch("http://127.0.0.1:8000/explain_pattern", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${await resp.text()}`);

      const reader = resp.body.getReader();
      const decoder = new TextDecoder("utf-8");
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        chunk.split("\n").forEach(line => {
          if (line.startsWith("data: ")) {
            try {
              const jsonStr = line.replace("data: ", "");
              if (jsonStr.trim()) {
                const payload = JSON.parse(jsonStr);
                if (payload.text) setExplanation(prev => prev + payload.text);
              }
            } catch {}
          }
        });
      }
    } catch (e) {
      console.error("Error explaining problem:", e);
      setExplanation(`⚠️ Error fetching explanation: ${e.message}`);
    } finally {
      setExplainLoading(false);
    }
  }

  async function submitAttemptForReview() {
    if (!attemptCode.trim()) return alert("Please enter some code to review.");

    setAttemptLoading(true);
    setAttemptFeedback("");
    try {
      const body = {
        language: attemptLang,
        code: attemptCode,
        title: selected?.title || "Code Review",
      };
      const r = await fetch("http://127.0.0.1:8000/code_review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}: ${await r.text()}`);
      const data = await r.json();
      setAttemptFeedback(data.feedback || "No feedback returned.");
    } catch (e) {
      console.error("Error reviewing code:", e);
      setAttemptFeedback(`⚠️ Error connecting to reviewer: ${e.message}`);
    } finally {
      setAttemptLoading(false);
    }
  }

  const filtered = React.useMemo(() => {
    if (!Array.isArray(problems)) return [];
    if (!filter.trim()) return problems;
    const filterLower = filter.toLowerCase();
    return problems.filter(p => {
      if (!p) return false;
      const pattern = Array.isArray(p.pattern) ? p.pattern.join(", ").toLowerCase() : (p.pattern || "").toLowerCase();
      const title = (p.title || "").toLowerCase();
      const difficulty = (p.difficulty || "").toLowerCase();
      return pattern.includes(filterLower) || title.includes(filterLower) || difficulty.includes(filterLower);
    });
  }, [problems, filter]);

  useEffect(() => { loadPatterns(); }, []);

  return (
    <div style={{ maxWidth: "100%", padding: 16 }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <h1 style={{
          fontSize: 32,
          fontWeight: 700,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          marginBottom: 8
        }}>LeetCode Patterns</h1>
        <p style={{ color: "#666", fontSize: 16, margin: 0 }}>
          Master coding interview patterns with curated problems and AI explanations
        </p>
      </div>

      {/* Controls */}
      <div style={{
        display: "flex",
        gap: 20,
        marginBottom: 32,
        flexWrap: "wrap",
        alignItems: "center"
      }}>
        <button onClick={loadPatterns} disabled={loading} style={{
          padding: "12px 24px",
          borderRadius: 10,
          border: "none",
          fontSize: 16,
          fontWeight: 600,
          cursor: loading ? "not-allowed" : "pointer",
          color: "white",
          background: loading ? "#9ca3af" : "#10b981",
          transition: "all 0.3s"
        }}>
          {loading ? "Loading..." : problems.length > 0 ? "Reload Patterns" : "Load Patterns"}
        </button>
        <input
          value={filter}
          onChange={e => setFilter(e.target.value)}
          placeholder="Search by pattern, title, or difficulty..."
          style={{ padding: "10px 16px", borderRadius: 10, border: "2px solid #e5e7eb", flex: 1, minWidth: 250 }}
        />
      </div>

      {/* Fancy Problems Grid */}
      <div style={{
        background: "white",
        border: "1px solid #e2e8f0",
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
        marginBottom: 32
      }}>
        <div style={{
          background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
          padding: "16px 24px",
          color: "white"
        }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
            <span>📚</span> Problem Collection
          </h3>
        </div>

        <div style={{ maxHeight: 500, overflow: "auto" }}>
          {loading && (
            <div style={{ padding: "60px 20px", textAlign: "center", color: "#6b7280" }}>
              <p>Loading LeetCode patterns...</p>
            </div>
          )}
          {!loading && filtered.length === 0 && problems.length === 0 && (
            <div style={{ padding: "60px 20px", textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📚</div>
              <h4>No Problems Loaded</h4>
              <p>Click "Load Patterns" to fetch LeetCode problems</p>
            </div>
          )}

          <div>
            {filtered.slice(0, 200).map((p, index) => (
              <div
                key={p.id || index}
                style={{
                  padding: "20px 24px",
                  borderBottom: index < filtered.length - 1 ? "1px solid #f1f5f9" : "none",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 16
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = "#f8fafc"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 8,
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 600
                }}>{index + 1}</div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h4 style={{ margin: 0, fontSize: 18, fontWeight: 600 }} onClick={() => explainProblem(p)}>
                      {p.title || "Untitled Problem"}
                    </h4>
                    <div style={{ display: "flex", gap: 8 }}>
                      {(p.url || p.link) && (
                        <a href={p.url || p.link} target="_blank" rel="noreferrer" style={{
                          padding: "6px 12px",
                          backgroundColor: "#f97316",
                          color: "white",
                          borderRadius: 6,
                          textDecoration: "none",
                          fontSize: 12
                        }}>🔗 LeetCode</a>
                      )}
                      <button onClick={() => explainProblem(p)} style={{
                        padding: "6px 12px",
                        backgroundColor: "#3b82f6",
                        color: "white",
                        border: "none",
                        borderRadius: 6,
                        cursor: "pointer",
                        fontSize: 12
                      }}>✨ Explain</button>
                    </div>
                  </div>

                  <div style={{ marginTop: 8, display: "flex", gap: 12 }}>
                    <span style={{
                      padding: "4px 8px",
                      borderRadius: 4,
                      fontSize: 12,
                      fontWeight: 500,
                      backgroundColor: p.difficulty === "Easy" ? "#dcfce7" : p.difficulty === "Hard" ? "#fee2e2" : "#fef3c7",
                      color: p.difficulty === "Easy" ? "#166534" : p.difficulty === "Hard" ? "#991b1b" : "#92400e"
                    }}>{p.difficulty || "Unknown"}</span>
                    {p.pattern && (
                      <span style={{
                        padding: "4px 8px",
                        backgroundColor: "#e0e7ff",
                        color: "#3730a3",
                        borderRadius: 4,
                        fontSize: 12,
                        fontWeight: 500
                      }}>
                        {Array.isArray(p.pattern) ? p.pattern.join(", ") : p.pattern}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Explanation and Code Attempt Section */}
      {selected && (
        <div style={{ background: "white", borderRadius: 16, padding: 24, boxShadow: "0 10px 25px rgba(0,0,0,0.08)" }}>
          <h2>🤖 AI Explanation: {selected.title}</h2>
          <div style={{ minHeight: 200, border: "1px solid #e2e8f0", padding: 16, borderRadius: 12 }}>
            {explainLoading ? <em>Streaming explanation...</em> :
             explanation ? <ReactMarkdown>{explanation}</ReactMarkdown> :
             <em>Click "Explain" to get AI explanation</em>}
          </div>

          <h3 style={{ marginTop: 32 }}>💻 Your Solution Attempt (Optional)</h3>
          <div style={{ marginBottom: 8 }}>
            <label>Language: </label>
            <select value={attemptLang} onChange={e => setAttemptLang(e.target.value)}>
              {languages.map(lang => <option key={lang.value} value={lang.value}>{lang.icon} {lang.value}</option>)}
            </select>
          </div>
          <textarea
            rows={12}
            style={{ width: "100%", fontFamily: "monospace", border: "1px solid #ddd", padding: 8 }}
            placeholder={`Paste your ${attemptLang} code here...`}
            value={attemptCode}
            onChange={e => setAttemptCode(e.target.value)}
          />
          <br/>
          <button
            onClick={submitAttemptForReview}
            disabled={attemptLoading || !attemptCode.trim()}
            style={{ marginTop: 8, padding: "8px 16px", backgroundColor: attemptCode.trim() ? "#28a745" : "#6c757d", color: "white", border: "none", borderRadius: 4 }}
          >
            {attemptLoading ? "Reviewing..." : "Get AI Code Review"}
          </button>

          {attemptFeedback && (
            <div style={{ marginTop: 15, padding: 15, borderRadius: 4, backgroundColor: "#f8f9fa", border: "1px solid #ddd" }}>
              <strong>AI Code Review:</strong>
              <ReactMarkdown>{attemptFeedback}</ReactMarkdown>
            </div>
          )}
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
