import React, { useMemo, useState } from "react";
import InfoStep from "./InfoStep";
import CurriculumStep from "./CurriculumStep";
import PublishStep from "./PublishStep";

const STEPS = [
  { id: "info", label: "Course Info", num: "1" },
  { id: "curriculum", label: "Curriculum", num: "2" },
  { id: "publish", label: "Publish", num: "3" },
];

const CourseEditor = ({ course, onChange, onBack, saveStatus, organizationId }) => {
  const [step, setStep] = useState("info");

  const completion = useMemo(() => {
    const infoOk =
      !!(course.title && course.title.trim()) &&
      !!(course.desc && course.desc.trim());
    const lessonCount = (course.sections || []).reduce(
      (s, sec) => s + (sec.lessons || []).length,
      0
    );
    const curriculumOk = lessonCount > 0;
    return { info: infoOk, curriculum: curriculumOk };
  }, [course]);

  const idx = STEPS.findIndex((s) => s.id === step);
  const isLast = idx === STEPS.length - 1;
  const isFirst = idx === 0;

  const goNext = () => {
    if (!isLast) setStep(STEPS[idx + 1].id);
  };
  const goPrev = () => {
    if (!isFirst) setStep(STEPS[idx - 1].id);
  };

  const togglePublish = () => {
    onChange((c) => ({
      ...c,
      status: c.status === "published" ? "draft" : "published",
    }));
  };

  return (
    <>
      {/* Topbar */}
      <div className="ulms-topbar">
        <div className="ulms-topbar-left">
          <button className="ulms-back-btn" onClick={onBack}>
            ← Back to Courses
          </button>
          <div className="ulms-course-title-bar">
            <span>{course.title || "Untitled Course"}</span>
            <span className={`ulms-status-badge ${course.status}`}>
              {course.status === "published" ? "Published" : "Draft"}
            </span>
          </div>
        </div>
        <div className="ulms-topbar-right">
          <span
            className="ulms-save-indicator"
            data-status={saveStatus || "idle"}
            style={{
              fontSize: 12,
              color:
                saveStatus === "saving" ? "#888" :
                saveStatus === "saved" ? "#1a7a3f" :
                saveStatus === "error" ? "#c0392b" : "#bbb",
              marginRight: 6,
              minWidth: 90,
              textAlign: "right",
            }}
          >
            {saveStatus === "saving" && "Saving…"}
            {saveStatus === "saved" && "✓ Saved"}
            {saveStatus === "error" && "Save failed"}
            {(!saveStatus || saveStatus === "idle") && "Auto-save on"}
          </span>
          <button
            className={`ulms-btn-publish ${course.status === "published" ? "published" : ""}`}
            onClick={togglePublish}
          >
            {course.status === "published" ? "Unpublish" : "Publish"}
          </button>
        </div>
      </div>

      {/* Editor body */}
      <div className="ulms-editor">
        <div className="ulms-editor-nav">
          {STEPS.map((s) => {
            const done =
              (s.id === "info" && completion.info) ||
              (s.id === "curriculum" && completion.curriculum);
            return (
              <div
                key={s.id}
                className={`ulms-nav-item ${step === s.id ? "active" : ""} ${done ? "done" : ""}`}
                onClick={() => setStep(s.id)}
              >
                <div className="ulms-nav-dot">{done ? "✓" : s.num}</div>
                <span>{s.label}</span>
              </div>
            );
          })}
          <div className="ulms-nav-spacer" />
          <div className="ulms-nav-tip">
            <strong>Tip</strong>
            <p>You can jump between steps anytime — your work auto-saves locally.</p>
          </div>
        </div>

        <div className="ulms-editor-main">
          {step === "info" && <InfoStep course={course} onChange={onChange} />}
          {step === "curriculum" && (
            <CurriculumStep
              course={course}
              onChange={onChange}
              organizationId={organizationId}
            />
          )}
          {step === "publish" && (
            <PublishStep
              course={course}
              completion={completion}
              onPublishToggle={togglePublish}
            />
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="ulms-editor-footer">
        <div className="ulms-footer-info">
          Step {idx + 1} of {STEPS.length} · {STEPS[idx].label}
        </div>
        <div className="ulms-footer-btns">
          <button
            className="ulms-footer-back-btn"
            onClick={isFirst ? onBack : goPrev}
          >
            {isFirst ? "Cancel" : "← Back"}
          </button>
          {!isLast && (
            <button className="ulms-footer-next-btn" onClick={goNext}>
              Next →
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default CourseEditor;
