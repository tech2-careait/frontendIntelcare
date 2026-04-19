import React, { useEffect, useMemo, useState } from "react";
import { FiX, FiDownload, FiEdit2, FiSave, FiRefreshCw } from "react-icons/fi";
import mammoth from "mammoth";
import ReactQuill from "react-quill";
import htmlDocx from "html-docx-js/dist/html-docx";
import "react-quill/dist/quill.snow.css";
import { Document, Packer, Paragraph, TextRun } from "docx";
const FilePreviewModal = ({
  doc,
  fileIndex,
  isOpen,
  onClose,
  careVoiceFiles,
  setCareVoiceFiles
}) => {
  const [html, setHtml] = useState("");
  const [originalHtml, setOriginalHtml] = useState("");
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  const fileName = doc?.name || "Document.docx";
  const ext = fileName.split(".").pop()?.toLowerCase();

  const fileUrl = useMemo(() => {
    if (!doc) return "";
    return URL.createObjectURL(doc);
  }, [doc]);

  useEffect(() => {
    if (!doc || !isOpen) return;

    const loadFile = async () => {
      try {
        setLoading(true);

        // ✅ If already edited before, use saved HTML directly
        if (doc.__editedHtml) {
          setHtml(doc.__editedHtml);
          setOriginalHtml(doc.__editedHtml);
          setLoading(false);
          return;
        }

        if (ext === "docx") {
          const buffer = await doc.arrayBuffer();

          const result = await mammoth.convertToHtml({
            arrayBuffer: buffer
          });

          const safeHtml = result.value || "<p></p>";

          setHtml(safeHtml);
          setOriginalHtml(safeHtml);
        }

        setLoading(false);
      } catch (error) {
        console.error(error);
        setHtml("<p></p>");
        setOriginalHtml("<p></p>");
        setLoading(false);
      }
    };

    loadFile();

    return () => {
      if (fileUrl) URL.revokeObjectURL(fileUrl);
    };
  }, [doc, isOpen, ext, fileUrl]);
  useEffect(() => {
    const style = document.createElement("style");

    style.innerHTML = `
    .doc-preview-content img {
      max-width: 78% !important;
      max-height: 520px !important;
      width: auto !important;
      height: auto !important;
      display: block !important;
      margin: 22px auto !important;
      object-fit: contain !important;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.08);
      background: #fff;
      padding: 6px;
    }

    .doc-preview-content table {
      width: 100% !important;
      border-collapse: collapse;
      display: block;
      overflow-x: auto;
      margin-top: 20px;
    }

    .doc-preview-content td,
    .doc-preview-content th {
      border: 1px solid #ddd;
      padding: 8px;
    }

    .doc-preview-content p,
    .doc-preview-content span,
    .doc-preview-content div {
      max-width: 100%;
      word-break: break-word;
    }
  `;

    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
  
  if (!isOpen || !doc) return null;


  const saveToCareVoiceFiles = async () => {
    try {
      setSaving(true);

      // convert html to plain text
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = html;
      const text = tempDiv.innerText || tempDiv.textContent || "";

      const docxFile = new Document({
        sections: [
          {
            children: text.split("\n").map(
              line =>
                new Paragraph({
                  children: [
                    new TextRun({
                      text: line || " ",
                      size: 24
                    })
                  ]
                })
            )
          }
        ]
      });

      const blob = await Packer.toBlob(docxFile);

      const updatedFile = new File(
        [blob],
        fileName,
        {
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        }
      );

      updatedFile.__editedHtml = html;

      const updated = [...careVoiceFiles];
      updated[fileIndex] = updatedFile;

      setCareVoiceFiles(updated);

      setOriginalHtml(html);
      setEditMode(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const downloadCurrent = async () => {
    let fileToDownload = doc;

    if (ext === "docx") {
      const blob = htmlDocx.asBlob(`
                <html>
                  <head><meta charset="utf-8"></head>
                  <body>${html}</body>
                </html>
            `);

      fileToDownload = new File([blob], fileName, {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      });
    }

    const url = URL.createObjectURL(fileToDownload);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const replaceWord = () => {
    const from = prompt("Find word:");
    if (!from) return;

    const to = prompt("Replace with:");
    setHtml((prev) => prev.split(from).join(to || ""));
  };

  const aiRewrite = () => {
    const selected = window.getSelection()?.toString();

    if (!selected) {
      alert("Select text first");
      return;
    }

    const rewritten = selected + " (AI Rewritten)";
    setHtml((prev) => prev.replace(selected, rewritten));
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.title}>{fileName}</div>

          <div style={styles.actions}>
            <button style={styles.iconBtn} onClick={() => setEditMode(!editMode)}>
              <FiEdit2 />
            </button>

            <button style={styles.iconBtn} onClick={replaceWord}>
              Replace
            </button>

            <button style={styles.iconBtn} onClick={aiRewrite}>
              AI
            </button>

            <button style={styles.iconBtn} onClick={() => setHtml(originalHtml)}>
              <FiRefreshCw />
            </button>

            <button style={styles.iconBtn} onClick={downloadCurrent}>
              <FiDownload />
            </button>

            <button style={styles.iconBtn} onClick={onClose}>
              <FiX />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={styles.body}>
          {loading ? (
            <div style={styles.center}>Loading...</div>
          ) : editMode ? (
            <ReactQuill
              theme="snow"
              value={html}
              onChange={setHtml}
              style={{ height: "100%" }}
            />
          ) : (
            <div
              style={styles.preview}
              className="doc-preview-content"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          )}
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <button style={styles.closeBtn} onClick={onClose}>
            Close
          </button>

          <button
            style={styles.saveBtn}
            onClick={saveToCareVoiceFiles}
            disabled={saving}
          >
            <FiSave />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,0.72)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    zIndex: 999999,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px"
  },

  modal: {
    width: "96vw",
    height: "94vh",
    background: "#ffffff",
    borderRadius: "22px",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    boxShadow: "0 25px 60px rgba(0,0,0,0.28)",
    border: "1px solid rgba(255,255,255,0.15)"
  },

  header: {
    minHeight: "70px",
    background: "linear-gradient(135deg, #6D4CFF, #5B34E6)",
    color: "#fff",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 22px",
    borderBottom: "1px solid rgba(255,255,255,0.08)"
  },

  title: {
    fontSize: "18px",
    fontWeight: "700",
    maxWidth: "60%",
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    letterSpacing: "0.2px"
  },

  actions: {
    display: "flex",
    alignItems: "center",
    gap: "10px"
  },

  iconBtn: {
    border: "none",
    background: "rgba(255,255,255,0.14)",
    color: "#fff",
    borderRadius: "10px",
    padding: "10px 14px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.25s ease"
  },

  body: {
    flex: 1,
    overflowY: "auto",
    padding: "34px",
    background:
      "linear-gradient(to bottom right, #eef2ff, #f8fafc, #eef2ff)"
  },

  preview: {
    width: "100%",
    maxWidth: "960px",
    minHeight: "calc(100vh - 240px)",
    margin: "0 auto",
    background: "#fff",
    padding: "55px 65px",
    borderRadius: "16px",
    boxShadow:
      "0 20px 50px rgba(15,23,42,0.12), 0 2px 8px rgba(15,23,42,0.08)",
    border: "1px solid #e5e7eb",
    color: "#111827",
    fontSize: "16px",
    lineHeight: "1.7",
    overflowWrap: "break-word",
    overflowX: "auto"
  },

  footer: {
    minHeight: "76px",
    borderTop: "1px solid #eef2f7",
    background: "#ffffff",
    padding: "0 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 -4px 16px rgba(0,0,0,0.04)"
  },

  closeBtn: {
    border: "1px solid #d1d5db",
    background: "#f9fafb",
    color: "#111827",
    padding: "11px 20px",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "600",
    transition: "all 0.25s ease"
  },

  saveBtn: {
    border: "none",
    background: "linear-gradient(135deg, #6D4CFF, #4F46E5)",
    color: "#fff",
    padding: "12px 22px",
    borderRadius: "12px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "15px",
    fontWeight: "700",
    boxShadow: "0 10px 25px rgba(79,70,229,0.25)",
    transition: "all 0.25s ease"
  },

  center: {
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "#475569",
    fontSize: "18px",
    fontWeight: "600"
  }
};

export default FilePreviewModal;