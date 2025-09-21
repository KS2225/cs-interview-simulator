import React, { useState } from "react";
import ReactMarkdown from "react-markdown";

function Evaluation() {
  const [question, setQuestion] = useState("");
  const [candidateAnswer, setCandidateAnswer] = useState("");
  const [evaluation, setEvaluation] = useState("");
  const [loading, setLoading] = useState(false);

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

  return (
    <div>
      <h2>Evaluation Page</h2>
      <textarea
        rows="2"
        style={{ width: "100%" }}
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Enter the interview question..."
      />
      <textarea
        rows="3"
        style={{ width: "100%", marginTop: "10px" }}
        value={candidateAnswer}
        onChange={(e) => setCandidateAnswer(e.target.value)}
        placeholder="Type your answer here..."
      />
      <br />
      <button onClick={evaluateAnswer} disabled={loading || !candidateAnswer}>
        {loading ? "Evaluating..." : "Evaluate My Answer"}
      </button>

      <div style={{ marginTop: "20px" }}>
        <strong>Feedback:</strong>
        <ReactMarkdown>{evaluation}</ReactMarkdown>
      </div>
    </div>
  );
}

export default Evaluation;
