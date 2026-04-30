import "./App.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./Components/HomePage";
import InvitePage from "./Components/AcceptInvitation";
import CandidateScreeningTest from "./Components/Modules/SupportAtHomeModule/ScreeningTest";
import CandidateLogin from "./Components/CandidateLogin";
import CandidateDashboard from "./Components/CandidateDashboard";
import { isCandidateAuthenticated } from "./Components/candidateAuth";

const RequireCandidateAuth = ({ children }) => {
  if (!isCandidateAuthenticated()) {
    return <Navigate to="/hr-candidate" replace />;
  }
  return children;
};

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
        <Route path="/hr-candidate" element={<CandidateLogin />} />
        <Route
          path="/hr-candidate/dashboard"
          element={
            <RequireCandidateAuth>
              <CandidateDashboard />
            </RequireCandidateAuth>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;