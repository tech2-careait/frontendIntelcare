import React, { useState } from "react";
import "../../../Styles/ResumeScreening.css";
import "../../../Styles/NewSmartOnboardingHrView.css"
import StaffOnboarding from "./StaffOnboarding";
import StaffComplianceDashboard from "./StaffComplianceDashboard";
import UploadFiles from "../../UploadFiles";
import ScreeningTestCreation from "./ScreeningTestCreation";
import AdminDocumentVerification from "./AdminDocumentVerification";
import AdminCourseCreation from "./AdminCourseCreation";
import incrementAnalysisCount from "../FinancialModule/TLcAnalysisCount";
import incrementCareVoiceAnalysisCount from "./careVoiceCostAnalysis";

const HRAdminView = ({
  handleClick,
  setShowFeedbackPopup,
  role,
  selectedRole,
  user,
  setManualResumeZip,
  setShowAIChat,
  setMessages,
  setHrMode,
  setHrStep,
  organizationId,
  smartCandidates = [],
}) => {
  const [selectedFile, setSelectedFile] = useState([]);
  const [selectedJd, setSelectedJd] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState("Resume Screening");
  const [showResults, setShowResults] = useState(false);
  const [selectedCandidates, setSelectedCandidates] = useState(new Set());
  const [candidates, setCandidates] = useState([]);
  const [progress, setProgress] = useState(0);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  console.log("smartCandidates in HRAdminView", smartCandidates)
  const filteredCandidates = smartCandidates.filter((item) => {
    const query = searchTerm.toLowerCase().trim();

    if (!query) return true;

    const name = item.candidateName?.toLowerCase() || "";
    const email = item.candidateEmail?.toLowerCase() || "";
    const stage = item.stage?.toLowerCase() || "";
    const skills = (item.candidateSkills || [])
      .join(" ")
      .toLowerCase();

    return (
      name.includes(query) ||
      email.includes(query) ||
      stage.includes(query) ||
      skills.includes(query)
    );
  });
  console.log("Filtered candidates:", filteredCandidates);
  const handleAnalyze = async () => {
    if (!selectedFile.length || !selectedJd.length) {
      alert("Please upload both Resume ZIP and Job Description PDF.");
      return;
    }
    setManualResumeZip(selectedFile[0]);
    setIsAnalyzing(true);
    setProgress(1);

    // Dynamic Smart Progress — same behavior as FinancialHealth
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 90) return prev + 2;        // Fast progress
        if (prev < 98) return prev + 0.5;      // Slow near the end
        return prev;                           // Wait until API finishes
      });
    }, 1200);

    try {
      const formData = new FormData();
      formData.append("resume_zip_file", selectedFile[0]);
      formData.append("jd_file", selectedJd[0]);

      const response = await fetch(
        "https://curki-test-prod-auhyhehcbvdmh3ef.canadacentral-01.azurewebsites.net/api/process-zip",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze resumes");
      }

      // ✅ Map candidates
      const mappedCandidates = data.results.map((item, i) => ({
        id: i + 1,
        name: item.ApiResponse.candidate_name,
        score: item.ApiResponse["score out of 10"],
        skills: item.ApiResponse["Skills(keywords)"],
        resumeFile: item.resume,
      }));

      setCandidates(mappedCandidates);
      await incrementCareVoiceAnalysisCount(user?.email?.trim(), "resume-screening", 0, "staff-onboarding", 0);
      setProgress(100);
      clearInterval(interval);

      // Smooth UI transition
      setTimeout(() => {
        setShowResults(true);
      }, 400);

    } catch (error) {
      console.error("Analysis failed:", error);
      alert(error.message || "Analysis failed. Please try again.");
    } finally {
      clearInterval(interval);

      // Cleanup UI
      setTimeout(() => {
        setIsAnalyzing(false);
        setProgress(0);
      }, 800);
    }
  };


  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
    setShowResults(false);
    setSelectedCandidates(new Set());
  };

  const toggleCandidateSelection = (candidateId) => {
    setSelectedCandidates((prev) => {
      const newSelected = new Set(prev);
      if (newSelected.has(candidateId)) {
        newSelected.delete(candidateId);
      } else {
        newSelected.add(candidateId);
      }
      return newSelected;
    });
  };

  const handleSendScreeningTest = () => {
    if (selectedCandidates.size === 0) {
      alert("Please select at least one candidate to send screening test.");
      return;
    }
    alert(
      `Screening test link sent to ${selectedCandidates.size} selected candidate(s)!`
    );
    setSelectedCandidates(new Set());
  };



  return (
    <>
      <div className="hr-analysis-container">
        <div className="top-nav">
          <button
            className={`nav-tab ${activeTab === "Resume Screening" ? "active" : ""
              }`}
            onClick={() => handleTabClick("Resume Screening")}
          >
            Resume Screening
          </button>
          <button
            className={`nav-tab ${activeTab === "Screening Test Creation" ? "active" : ""
              }`}
            onClick={() => handleTabClick("Screening Test Creation")}
          >
            Screening Test Creation
          </button>
          {/* <button
          className={`nav-tab ${activeTab === "Document Verfication" ? "active" : ""
            }`}
          onClick={() => handleTabClick("Document Verfication")}
        >
          Document Verfication
        </button> */}
          <button
            className={`nav-tab ${activeTab === "Staff Onboarding" ? "active" : ""
              }`}
            onClick={() => handleTabClick("Staff Onboarding")}
          >
            Edit Training
          </button>
        </div>

        <div className="content-area" className={`content-area ${(activeTab === "Resume Screening" && activeTab !== "Smart Onboarding") ? "resume-screening-full" : ""
          }`}>
          {activeTab === "Resume Screening" && (
            <div className="resume-dashboard-wrapper">

              {/* Stats */}
              <div className="resume-top-cards">
                <div className="resume-top-card">
                  <div className="resume-icon blue">👥</div>
                  <div className="candidate-meta-data">
                    <p>OVERALL CANDIDATES</p>
                    <h2>{smartCandidates.length}</h2>
                  </div>
                </div>

                <div className="resume-top-card">
                  <div className="resume-icon purple">📊</div>
                  <div className="candidate-meta-data">
                    <p>ACTIVE PIPELINE</p>
                    <h2>
                      {
                        smartCandidates.filter(
                          item => item.docs_verification_status === "pending"
                        ).length
                      }
                    </h2>
                  </div>
                </div>

                <div className="resume-top-card">
                  <div className="resume-icon orange">📋</div>
                  <div className="candidate-meta-data">
                    <p>IN TEST STAGE</p>
                    <h2>
                      {
                        smartCandidates.filter(
                          item => item.screening_test_status === "pending"
                        ).length
                      }
                    </h2>
                  </div>
                </div>

                <div className="resume-top-card">
                  <div className="resume-icon green">✔</div>
                  <div className="candidate-meta-data">
                    <p>VERIFIED READY</p>
                    <h2>
                      {
                        smartCandidates.filter(
                          item => item.docs_verification_status === "verified"
                        ).length
                      }
                    </h2>
                  </div>
                </div>
              </div>

              {/* Header */}
              <div className="resume-header-row">
                <div className="resume-header-title-content">
                  <h2 className="resume-main-title">Active Onboarding Pipeline</h2>
                  <p className="resume-sub-title">
                    Real-time deep dive into candidate stages and AI analysis.
                  </p>
                </div>

                <div className="resume-header-actions">
                  <input
                    type="text"
                    placeholder="Find a candidate..."
                    className="resume-search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button
                    className="resume-add-btn"
                    onClick={() => {
                      setHrStep("UPLOAD");
                      setHrMode("resume_screening");
                      setShowAIChat(true);
                      // Make sure the upload prompt message is added
                      setTimeout(() => {
                        setMessages([
                          {
                            sender: "bot",
                            text: "Hello! I'm Alex, your AI recruitment partner. How can I help you add a new candidate today?"
                          },
                          {
                            sender: "bot",
                            text: "Please upload the Job Description and candidate resumes to start screening.",
                            isUploadPrompt: true  // This flag triggers the upload box rendering
                          }
                        ]);
                      }, 100);
                    }}
                  >
                    + Add Candidates
                  </button>
                </div>
              </div>

              {/* Candidate Cards */}
              <div className="resume-candidate-grid">
                {filteredCandidates.map((item) => {
                  const initials =
                    item.candidateName?.charAt(0)?.toUpperCase() || "U";

                  const score = item.candidateResumeScore || 0;

                  return (
                    <div className="resume-candidate-card" key={item.candidateId}>
                      <div className="resume-user-top">
                        <div className="resume-avatar">{initials}</div>

                        <div className="candidate-item-header">
                          <h3>
                            {item.candidateName || "Unknown Candidate"}
                          </h3>
                          <p>
                            {item.candidateEmail || "No email"}
                          </p>
                          <span className="resume-stage">
                            ● STAGE: {item.stage.replaceAll("_", " ").toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div className="resume-middle-section">
                        <div className="resume-summary-box" onClick={() => setSelectedAssessment(item)}>
                          <h4>RESUME ASSESSMENT</h4>
                          <p>
                            "
                            {item.resumeSummary?.slice(0, 120) ||
                              "Candidate profile available."}
                            "
                          </p>

                          <div className="resume-score-row">
                            <span>AI Fit Score</span>
                            <strong>{score} / 100</strong>
                          </div>
                        </div>

                        <div className="resume-right-progress">

                          <div className="resume-progress-block">
                            <div className="resume-progress-head">
                              <span>Documents</span>
                              <span>
                                {item.docs_verification_status === "verified"
                                  ? "3 / 3 verified"
                                  : "0 / 3 verified"}
                              </span>
                            </div>
                            <div className="resume-bar">
                              <div
                                className="resume-bar-fill green"
                                style={{
                                  width:
                                    item.docs_verification_status === "verified"
                                      ? "100%"
                                      : "0%"
                                }}
                              ></div>
                            </div>
                          </div>

                          <div className="resume-progress-block">
                            <div className="resume-progress-head">
                              <span>Training Modules</span>
                              <span>{score}% Done</span>
                            </div>
                            <div className="resume-bar">
                              <div
                                className="resume-bar-fill purple"
                                style={{ width: `${score}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>


                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === "Resume Screening" && showResults && (
            <div className="results-container">
              <h1 className="page-title">Resume Screening Results</h1>
              <p className="page-subtitle">
                Analysis complete - Review candidate profiles
              </p>

              <div className="candidates-list">
                {candidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    className={`candidate-card ${selectedCandidates.has(candidate.id) ? "selected" : ""
                      }`}
                    onClick={() => toggleCandidateSelection(candidate.id)}
                  >
                    <div className="candidate-info">
                      <div className="candidate-header">
                        <h3 className="candidate-name">{candidate.name}</h3>
                        <div className="candidate-score">
                          <span className="score-label">Score:</span>
                          <span className="score-value">
                            {candidate.score}/10
                          </span>
                        </div>
                      </div>

                      <div className="candidate-details">
                        {/* <p className="experience">
                        Experience: {candidate.experience}
                      </p> */}
                        <div className="star-rating">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span
                              key={i}
                              className={`star ${i < Math.floor(candidate.score / 2)
                                ? "filled"
                                : ""
                                }`}
                            >
                              {i < Math.floor(candidate.score / 2) ? "★" : "☆"}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="skills-container">
                        {candidate.skills.map((skill, index) => (
                          <span key={index} className="skill-tag">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="action-buttons">
                {selectedCandidates.size > 0 && (
                  <button
                    className="sent-test-btn"
                    onClick={handleSendScreeningTest}
                  >
                    Send Screening Test to {selectedCandidates.size} Candidate(s)
                  </button>
                )}
              </div>
            </div>
          )}
          {activeTab === "Screening Test Creation" && <ScreeningTestCreation user={user} organizationId={organizationId} />}
        </div>
        <div className="content-areasss">
          {activeTab === "Staff Onboarding" && <AdminCourseCreation user={user} />}
          {/* {activeTab === "Document Verfication" && <AdminDocumentVerification />} */}
        </div>
      </div>
      {selectedAssessment && (
        <div
          className="resume-assessment-overlay"
          onClick={() => setSelectedAssessment(null)}
        >
          <div
            className="resume-assessment-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="resume-assessment-header">
              <div className="resume-assessment-title-wrap">
                <div className="resume-assessment-icon">✦</div>

                <div>
                  <h2>
                    {selectedAssessment.candidateName}'s Resume Assessment
                  </h2>
                  <p>AI POWERED DEEP ANALYSIS</p>
                </div>
              </div>

              <button
                className="resume-assessment-close"
                onClick={() => setSelectedAssessment(null)}
              >
                ×
              </button>
            </div>

            <div className="resume-score-highlight">
              <span>TECHNICAL ASSESSMENT SCORE</span>
              <strong>
                {(selectedAssessment.candidateResumeScore / 10).toFixed(1)}/10
              </strong>
            </div>

            <div className="resume-insight-list">
              <div className="resume-insight-item">
                <span>1</span>
                <p>
                  {selectedAssessment.resumeSummary ||
                    "Strong candidate profile with relevant experience."}
                </p>
              </div>

              <div className="resume-insight-item">
                <span>2</span>
                <p>
                  Candidate score:{" "}
                  {selectedAssessment.candidateResumeScore}/100
                </p>
              </div>

              <div className="resume-insight-item">
                <span>3</span>
                <p>
                  Current stage:{" "}
                  {selectedAssessment.stage
                    ?.replaceAll("_", " ")
                    ?.toUpperCase()}
                </p>
              </div>
            </div>

            <div className="resume-modal-skills">
              {(selectedAssessment.candidateSkills || []).map(
                (skill, i) => (
                  <span key={i} className="resume-modal-skill">
                    {skill}
                  </span>
                )
              )}
            </div>

            <div className="resume-modal-footer">
              <button
                className="resume-close-btn"
                onClick={() => setSelectedAssessment(null)}
              >
                Close Insights
              </button>
            </div>
          </div>
        </div>
      )}
    </>

  );
};

export default HRAdminView;
