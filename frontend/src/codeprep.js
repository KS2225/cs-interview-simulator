import React, { useState } from "react";
import ReactMarkdown from "react-markdown";

function CodingPrep() {
  const [language, setLanguage] = useState("Python");
  const [code, setCode] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  const submitCode = async () => {
    setLoading(true);
    setFeedback("");

    try {
      const response = await fetch("http://127.0.0.1:8000/code_review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, code }),
      });
      const data = await response.json();
      setFeedback(data.feedback);
    } catch (err) {
      console.error("Error:", err);
      setFeedback("⚠️ Error connecting to backend.");
    }

    setLoading(false);
  };

  return (
    <div>
      <h2>Coding Prep</h2>
      <label>Language: </label>
      <select value={language} onChange={(e) => setLanguage(e.target.value)}>
        <option>Python</option>
        <option>Java</option>
        <option>C++</option>
      </select>

      <textarea
        rows="10"
        style={{ width: "100%", marginTop: "10px" }}
        placeholder="Paste your code here..."
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />

      <br />
      <button onClick={submitCode} disabled={loading || !code}>
        {loading ? "Reviewing..." : "Submit for Review"}
      </button>

      <div style={{ marginTop: "20px" }}>
        <strong>Feedback:</strong>
        <ReactMarkdown>{feedback}</ReactMarkdown>
      </div>
    </div>
  );
}

export default CodingPrep;
