import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import QA from "./pages/qa";
import Evaluation from "./pages/Evaluation";
import CodingPrep from "./pages/Codingprep";

function App() {
  return (
    <Router>
      <div style={{ padding: "20px" }}>
        <h1>AI Interview Simulator</h1>
        <nav>
          <Link to="/">Q&A</Link> |{" "}
          <Link to="/evaluation">Evaluation</Link> |{" "}
          <Link to="/coding">Coding Prep</Link>
        </nav>
        <hr />

        <Routes>
          <Route path="/" element={<QA />} />
          <Route path="/evaluation" element={<Evaluation />} />
          <Route path="/coding" element={<CodingPrep />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
