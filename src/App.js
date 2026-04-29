import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./Components/HomePage";
import InvitePage from "./Components/AcceptInvitation";
import CandidateScreeningTest from "./Components/Modules/SupportAtHomeModule/ScreeningTest";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/invite" element={<InvitePage />} />
        <Route
          path="/test/:test_id"
          element={<CandidateScreeningTest />}
        />
      </Routes>
    </Router>
  );
}

export default App;