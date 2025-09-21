import React, { useState } from "react";
import ReactMarkdown from "react-markdown";

function ChatBox() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState("General");
  const [difficulty, setDifficulty] = useState("Medium");
  const [suggested, setSuggested] = useState([]);
  const [candidateAnswer, setCandidateAnswer] = useState("");
  const [evaluation, setEvaluation] = useState("");

  // ---------------- ASK BACKEND ----------------
  const askBackend = async (q = question, explicitMode) => {
    setAnswer("");
    setLoading(true);
    setQuestion(q);

    // auto-detect mode
    const inferredMode =
      explicitMode || (q.trim().endsWith("?") ? "answer" : "question");

    try {
      const response = await fetch("http://127.0.0.1:8000/ask_stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q,
          topic,
          difficulty,
          mode: inferredMode,
        }),
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

  // ---------------- SUGGESTIONS ----------------
  const fetchSuggestions = async () => {
    setSuggested([]);
    try {
      const response = await fetch("http://127.0.0.1:8000/suggest_questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, difficulty }),
      });
      const data = await response.json();
      const list = data.questions
        .split("\n")
        .map((q) => q.trim())
        .filter((q) => q.length > 0);
      setSuggested(list);
    } catch (err) {
      console.error("Error fetching suggestions:", err);
    }
  };

  // ---------------- EVALUATE ----------------
  const evaluateAnswer = async () => {
    setEvaluation("");
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/evaluate_stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          user_answer: candidateAnswer,
        }),
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
            setEvaluation((prev) => prev + payload.text);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching evaluation:", err);
      setEvaluation("⚠️ Error connecting to backend");
    }

    setLoading(false);
  };

  // ---------------- UI ----------------
  return (
    <div style={{ width: "600px", margin: "auto", padding: "20px" }}>
      <h2>AI Interview Simulator</h2>

      {/* Topic + Difficulty */}
      <div>
        <label>Topic: </label>
        <select value={topic} onChange={(e) => setTopic(e.target.value)}>
          <option>General</option>
          <option>DSA</option>
          <option>OS</option>
          <option>DBMS</option>
          <option>ML</option>
          <option>System Design</option>
        </select>

        <label style={{ marginLeft: "15px" }}>Difficulty: </label>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
        >
          <option>Easy</option>
          <option>Medium</option>
          <option>Hard</option>
        </select>

        <button style={{ marginLeft: "15px" }} onClick={fetchSuggestions}>
          Suggest Questions
        </button>
      </div>

      {/* Suggested Questions */}
      <ul>
        {suggested.map((q, idx) => (
          <li
            key={idx}
            onClick={() => askBackend(q, "answer")}
            style={{ cursor: "pointer", margin: "5px 0", color: "blue" }}
          >
            {q}
          </li>
        ))}
      </ul>

      {/* Input box */}
      <div style={{ marginTop: "20px" }}>
        <textarea
          rows="2"
          style={{ width: "100%" }}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Type a question or request..."
        />
        <br />
        <button onClick={() => askBackend()} disabled={loading || !question}>
          {loading ? "Loading..." : "Ask"}
        </button>
      </div>

      {/* AI Answer */}
      <div style={{ marginTop: "20px" }}>
        <strong>AI Response:</strong>
        <ReactMarkdown>{answer}</ReactMarkdown>
      </div>

      {/* Candidate Answer Section */}
      <div style={{ marginTop: "20px" }}>
        <strong>Your Turn:</strong>
        <textarea
          rows="3"
          style={{ width: "100%", marginTop: "10px" }}
          value={candidateAnswer}
          onChange={(e) => setCandidateAnswer(e.target.value)}
          placeholder="Type your answer here..."
        />
        <br />
        <button
          onClick={evaluateAnswer}
          disabled={loading || !candidateAnswer}
        >
          {loading ? "Evaluating..." : "Evaluate My Answer"}
        </button>
      </div>

      {/* Evaluation Feedback */}
      <div style={{ marginTop: "20px" }}>
        <strong>Feedback:</strong>
        <ReactMarkdown>{evaluation}</ReactMarkdown>
      </div>
    </div>
  );
}

export default ChatBox;
