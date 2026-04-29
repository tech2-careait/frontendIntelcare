// ScreeningTestCreation.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FiUsers,
  FiPlus,
  FiTrash2,
  FiSave,
  FiLoader,
  FiFileText,
  FiClock,
  FiAward,
  FiX,
  FiCheckSquare,
  FiSquare
} from "react-icons/fi";
import "../../../Styles/NewScreeningTestCreation.css";

const BASE_URL = "https://curki-test-prod-auhyhehcbvdmh3ef.canadacentral-01.azurewebsites.net/api";

const ScreeningTestCreation = (props) => {
  const ORG_ID = props?.organizationId;
  const [showForm, setShowForm] = useState(true);
  const [testTitle, setTestTitle] = useState("");
  const [duration, setDuration] = useState("30");
  const [passingMarks, setPassingMarks] = useState("50");
  const [questions, setQuestions] = useState([
    {
      question: "",
      options: ["", "", "", ""],
      answer: "",  // For single correct: string, For multiple correct: array
      questionType: "single", // "single" or "multiple"
      selectedOptions: [] // For UI to track selected checkboxes
    }
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [previousTests, setPreviousTests] = useState([]);
  const [loadingTests, setLoadingTests] = useState(true);
  const [candidateEmails, setCandidateEmails] = useState("");

  useEffect(() => {
    fetchTests();
  }, []);

// FRONTEND - Replace fetchTests

const fetchTests = async () => {
  try {
    if (!props?.user?.email || !ORG_ID) return;

    setLoadingTests(true);

    const res = await axios.get(
      `${BASE_URL}/get-tests`,
      {
        params: {
          admin_email: props?.user?.email,
          organization_id: ORG_ID
        }
      }
    );
    console.log("fetchTests response:", res.data);
    if (res.data?.ok) {
      setPreviousTests(res.data.tests || []);
    }
  } catch (error) {
    console.log("fetchTests error:", error);
  } finally {
    setLoadingTests(false);
  }
};

  const addQuestion = () => {
    setQuestions([...questions, {
      question: "",
      options: ["", "", "", ""],
      answer: "",
      questionType: "single",
      selectedOptions: []
    }]);
  };

  const removeQuestion = (index) => {
    const updated = [...questions];
    updated.splice(index, 1);
    setQuestions(updated);
  };

  const updateQuestion = (index, value) => {
    const updated = [...questions];
    updated[index].question = value;
    setQuestions(updated);
  };

  const updateOption = (qIndex, oIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
  };

  const updateQuestionType = (index, type) => {
    const updated = [...questions];
    updated[index].questionType = type;
    if (type === "single") {
      updated[index].answer = "";
      updated[index].selectedOptions = [];
    } else {
      updated[index].answer = [];
      updated[index].selectedOptions = [];
    }
    setQuestions(updated);
  };

  // For single correct answer (radio)
  const updateSingleAnswer = (index, value) => {
    const updated = [...questions];
    updated[index].answer = value;
    setQuestions(updated);
  };

  // For multiple correct answers (checkbox)
  const toggleMultipleAnswer = (qIndex, optionIndex, optionValue) => {
    const updated = [...questions];
    let currentAnswers = updated[qIndex].answer;
    if (!Array.isArray(currentAnswers)) {
      currentAnswers = [];
    }

    const uniqueValue = `${optionIndex}_${optionValue}`;

    if (currentAnswers.includes(uniqueValue)) {
      updated[qIndex].answer = currentAnswers.filter(ans => ans !== uniqueValue);
    } else {
      updated[qIndex].answer = [...currentAnswers, uniqueValue];
    }

    setQuestions(updated);
  };

  const resetAll = () => {
    setShowForm(false);
    setTestTitle("");
    setDuration("30");
    setPassingMarks("50");
    setQuestions([{
      question: "",
      options: ["", "", "", ""],
      answer: "",
      questionType: "single",
      selectedOptions: []
    }]);
    setCandidateEmails("");
  };

  const handleCreateAndSend = async () => {
    try {
      setMessage("");

      if (!testTitle.trim()) {
        setMessage("Please enter test title");
        return;
      }

      // Validate each question
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (!q.question.trim()) {
          setMessage(`Question ${i + 1} is empty`);
          return;
        }

        // Check if at least one option is filled
        const hasOption = q.options.some(opt => opt.trim());
        if (!hasOption) {
          setMessage(`Question ${i + 1} needs at least one option`);
          return;
        }

        // Validate answer based on question type
        if (q.questionType === "single") {
          if (!q.answer) {
            setMessage(`Please select correct answer for Question ${i + 1}`);
            return;
          }
        } else {
          if (!q.answer || q.answer.length === 0) {
            setMessage(`Please select at least one correct answer for Question ${i + 1}`);
            return;
          }
        }
      }

      setSubmitting(true);

      const createRes = await axios.post(`${BASE_URL}/create-test`, {
        organisation_id: ORG_ID,
        test_name: testTitle,
        duration_minutes: Number(duration),
        passing_marks: Number(passingMarks),
        questions: questions.map(q => ({
          question: q.question,
          options: q.options,
          answer: q.questionType === 'multiple'
            ? (q.answer || []).map(ans => {
              const parts = ans.split('_');
              return parts.slice(1).join('_');
            })
            : q.answer,
          questionType: q.questionType
        })),
        admin_email: props?.user?.email
      });

      if (createRes.data?.ok) {
        setMessage(`Test created successfully!`);
        resetAll();
        fetchTests();
        setTimeout(() => setMessage(""), 5000);
      } else {
        setMessage("Failed to create test");
      }
    } catch (error) {
      setMessage("Something went wrong");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="stc_main_wrapper">
      <div className="stc_container">

        {/* Header Section */}
        <div className="stc_header_box stc_fade_in">
          <div className="stc_header_left">
            <div className="stc_icon_box">
              <FiUsers />
            </div>
            <div>
              <h2 className="stc_main_heading">Create Screening Test</h2>
              <p className="stc_section_sub">Create tests with mix of single and multiple answer questions</p>
            </div>
          </div>
        </div>

        {message && (
          <div className="stc_alert_box stc_slide_down">
            {message}
          </div>
        )}

        {/* Create Test Form */}
        <div className="stc_candidate_section stc_fade_in" style={{ animationDelay: '0.1s' }}>
          <div className="stc_section_head">
            <div className="stc_section_head_full">
              <div className="stc_section_head_row">
                <div>
                  <h3>Configure Screening Test</h3>
                  <p className="stc_section_sub">
                    Define test parameters and questions. Mix single and multiple answer questions.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="stc_form_card">
            <div className="stc_input_group">
              <label>Test Title</label>
              <input
                type="text"
                placeholder="e.g. Frontend Developer React Assessment"
                className="stc_input_full"
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
              />
            </div>

            <div className="stc_grid_two">
              <div className="stc_input_group">
                <label>Duration (Minutes)</label>
                <input
                  type="number"
                  placeholder="30"
                  className="stc_input_full"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="stc_questions_container">
            <div style={{ marginBottom: '16px', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4>Test Questions</h4>
              <span style={{ fontSize: '12px', color: '#666' }}>💡 Mix of Single & Multiple Answer questions allowed</span>
            </div>

            {questions.map((item, index) => (
              <div className="stc_question_card" key={index}>
                <div className="stc_question_top">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <h4>Question {index + 1}</h4>

                    {/* Question Type Toggle */}
                    <div className="stc_question_type_toggle">
                      <button
                        type="button"
                        className={`stc_type_btn ${item.questionType === 'single' ? 'active' : ''}`}
                        onClick={() => updateQuestionType(index, 'single')}
                      >
                        Single Answer
                      </button>
                      <button
                        type="button"
                        className={`stc_type_btn ${item.questionType === 'multiple' ? 'active' : ''}`}
                        onClick={() => updateQuestionType(index, 'multiple')}
                      >
                        Multiple Answer
                      </button>
                    </div>
                  </div>

                  {questions.length > 1 && (
                    <button
                      className="stc_delete_btn"
                      onClick={() => removeQuestion(index)}
                      title="Remove Question"
                    >
                      <FiTrash2 />
                    </button>
                  )}
                </div>

                <div className="stc_input_group">
                  <input
                    className="stc_input_full stc_q_input"
                    placeholder="Type your question here..."
                    value={item.question}
                    onChange={(e) => updateQuestion(index, e.target.value)}
                  />
                </div>

                <div className="stc_options_box">
                  {item.options.map((opt, oIndex) => (
                    <div className="stc_input_group" key={oIndex}>
                      <input
                        className="stc_input_full"
                        placeholder={`Option ${oIndex + 1}`}
                        value={opt}
                        onChange={(e) => updateOption(index, oIndex, e.target.value)}
                      />
                    </div>
                  ))}
                </div>

                <div className="stc_input_group stc_answer_group">
                  <label>
                    {item.questionType === 'single' ? 'Correct Answer (Select one)' : 'Correct Answers (Select one or more)'}
                  </label>

                  {item.questionType === 'single' ? (
                    // Radio buttons for single answer
                    <div className="stc_radio_group">
                      {item.options.map((opt, optIndex) => (
                        opt.trim() && (
                          <label key={optIndex} className="stc_radio_label">
                            <input
                              type="radio"
                              name={`question_${index}`}
                              value={opt}
                              checked={item.answer === opt}
                              onChange={(e) => updateSingleAnswer(index, e.target.value)}
                            />
                            <span>{opt}</span>
                          </label>
                        )
                      ))}
                    </div>
                  ) : (
                    // Checkboxes for multiple answers
                    <div className="stc_checkbox_group">
                      {item.options.map((opt, optIndex) => (
                        opt.trim() && (
                          <label key={optIndex} className="stc_checkbox_label">
                            <input
                              type="checkbox"
                              value={`${optIndex}_${opt}`}
                              checked={(item.answer || []).includes(`${optIndex}_${opt}`)}
                              onChange={() => toggleMultipleAnswer(index, optIndex, opt)}
                            />
                            <span>{opt}</span>
                          </label>
                        )
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button className="stc_add_btn" onClick={addQuestion}>
            <FiPlus /> Add Another Question
          </button>

          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
            <button
              className="stc_save_btn"
              onClick={handleCreateAndSend}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <FiLoader className="stc_spin_icon" /> Creating...
                </>
              ) : (
                <>
                  <FiSave /> Create Test
                </>
              )}
            </button>
          </div>
        </div>

        {/* Previous Tests Section */}
        <div className="stc_candidate_section stc_fade_in" style={{ animationDelay: '0.2s' }}>
          <div className="stc_section_head">
            <div>
              <h3>Test Library</h3>
              <p className="stc_section_sub">Previously generated screening tests</p>
            </div>
          </div>

          {loadingTests ? (
            <div className="stc_loading_box">
              <FiLoader className="stc_spin_icon" />
              <span>Fetching tests...</span>
            </div>
          ) : previousTests.length === 0 ? (
            <div className="stc_empty_state">
              <div className="stc_empty_icon"><FiFileText /></div>
              <p>No screening tests have been created yet.</p>
            </div>
          ) : (
            <div className="stc_candidate_grid">
              {previousTests.map((test) => (
                <div className="stc_test_card" key={test.testId}>
                  <div className="stc_test_icon_wrap"><FiFileText /></div>
                  <div className="stc_test_content">
                    <h4>{test.testName}</h4>
                    <div className="stc_test_meta">
                      <span><FiAward /> {test.totalQuestions} Qs</span>
                      <span><FiClock /> {test.durationMinutes} Min</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScreeningTestCreation;