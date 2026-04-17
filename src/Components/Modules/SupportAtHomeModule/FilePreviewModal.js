import React, { useState, useEffect } from "react";
import { FiX, FiDownload, FiFileText, FiEye } from "react-icons/fi";

const FilePreviewModal = ({ doc, onClose, isOpen }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [preferPdf, setPreferPdf] = useState(true); // Prefer PDF by default for better preview

  useEffect(() => {
    if (doc && isOpen) {
      setLoading(false);
      setError(null);
    }
  }, [doc, isOpen]);

  if (!isOpen || !doc) return null;

  const getFileIcon = () => {
    return '📘';
  };

  const getFileTypeLabel = () => {
    return 'Word Document';
  };

  const formatFileSize = () => {
    return 'Unknown size';
  };

  const handleDownload = async (url, fileName) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Download failed:", error);
      setError("Failed to download file");
    }
  };

  const renderPreviewContent = () => {
    if (loading) {
      return (
        <div style={styles.loadingContainer}>
          <div className="round-loader" style={{ margin: "0 auto" }}></div>
          <p style={styles.loadingText}>Loading preview...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div style={styles.errorContainer}>
          <span style={styles.errorIcon}>⚠️</span>
          <p style={styles.errorText}>{error}</p>
          <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
            <button onClick={() => handleDownload(doc.docxUrl, doc.fileName)} style={styles.primaryButton}>
              <FiDownload size={16} /> Download DOCX
            </button>
            {doc.pdfUrl && (
              <button onClick={() => handleDownload(doc.pdfUrl, doc.fileName.replace('.docx', '.pdf'))} style={styles.primaryButton}>
                <FiDownload size={16} /> Download PDF
              </button>
            )}
          </div>
        </div>
      );
    }

    // Use docxViewerUrl for preview (Google Docs viewer works for both DOCX and PDF)
    const viewerUrl = preferPdf && doc.pdfViewerUrl ? doc.pdfViewerUrl : doc.docxViewerUrl;
    
    return (
      <div style={styles.previewContainer}>
        <div style={styles.viewerToggle}>
          {doc.pdfUrl && (
            <div style={styles.toggleButtons}>
              <button
                onClick={() => setPreferPdf(true)}
                style={{
                  ...styles.toggleButton,
                  background: preferPdf ? "#4F46E5" : "#e5e7eb",
                  color: preferPdf ? "#fff" : "#374151"
                }}
              >
                Preview PDF
              </button>
              <button
                onClick={() => setPreferPdf(false)}
                style={{
                  ...styles.toggleButton,
                  background: !preferPdf ? "#4F46E5" : "#e5e7eb",
                  color: !preferPdf ? "#fff" : "#374151"
                }}
              >
                Preview DOCX
              </button>
            </div>
          )}
          {!doc.pdfUrl && (
            <div style={styles.infoBadge}>
              <span>📄 Previewing DOCX format (PDF not available)</span>
            </div>
          )}
        </div>
        
        <iframe
          src={viewerUrl}
          style={styles.iframePreview}
          title="Document Preview"
          onError={() => setError("Unable to preview this document. Please download it instead.")}
        />
      </div>
    );
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <span style={styles.fileIcon}>{getFileIcon()}</span>
            <div>
              <h3 style={styles.fileName}>
                {doc.fileName?.split(".")[0]?.length > 50
                  ? doc.fileName?.split(".")[0]?.slice(0, 50) + "..."
                  : doc.fileName?.split(".")[0]}
              </h3>
              <p style={styles.fileInfo}>
                {getFileTypeLabel()} • {doc.pdfUrl ? "PDF + DOCX" : "DOCX Only"}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={styles.closeButton}>
            <FiX size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={styles.content}>
          {renderPreviewContent()}
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <button onClick={onClose} style={styles.secondaryButton}>
            Close
          </button>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={() => handleDownload(doc.docxUrl, doc.fileName)} style={styles.primaryButton}>
              <FiDownload size={16} /> Download DOCX
            </button>
            {doc.pdfUrl && (
              <button onClick={() => handleDownload(doc.pdfUrl, doc.fileName.replace('.docx', '.pdf'))} style={styles.primaryButton}>
                <FiDownload size={16} /> Download PDF
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    backdropFilter: "blur(5px)",
    zIndex: 999999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    animation: "fadeIn 0.2s ease"
  },
  modal: {
    width: "90vw",
    maxWidth: "1200px",
    height: "85vh",
    backgroundColor: "#fff",
    borderRadius: "20px",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    animation: "slideUp 0.3s ease"
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px 24px",
    borderBottom: "1px solid #e5e7eb",
    background: "#6C4CDC"
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },
  fileIcon: {
    fontSize: "32px"
  },
  fileName: {
    margin: 0,
    color: "#fff",
    fontSize: "18px",
    fontWeight: 600
  },
  fileInfo: {
    margin: "4px 0 0 0",
    color: "rgba(255,255,255,0.85)",
    fontSize: "12px"
  },
  closeButton: {
    background: "rgba(255,255,255,0.2)",
    border: "none",
    borderRadius: "50%",
    width: "36px",
    height: "36px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s",
    color: "#fff",
    ':hover': {
      background: "rgba(255,255,255,0.3)"
    }
  },
  content: {
    flex: 1,
    overflow: "auto",
    backgroundColor: "#f9fafb"
  },
  previewContainer: {
    height: "100%",
    display: "flex",
    flexDirection: "column"
  },
  viewerToggle: {
    padding: "12px 20px",
    backgroundColor: "#fff",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "center"
  },
  toggleButtons: {
    display: "flex",
    gap: "10px",
    borderRadius: "8px",
    overflow: "hidden",
    border: "1px solid #e5e7eb"
  },
  toggleButton: {
    padding: "8px 20px",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 500,
    transition: "all 0.2s"
  },
  infoBadge: {
    padding: "8px 16px",
    backgroundColor: "#fef3c7",
    borderRadius: "8px",
    fontSize: "13px",
    color: "#92400e"
  },
  iframePreview: {
    width: "100%",
    height: "100%",
    border: "none",
    flex: 1
  },
  loadingContainer: {
    textAlign: "center",
    padding: "60px 20px"
  },
  loadingText: {
    marginTop: "16px",
    color: "#6b7280"
  },
  errorContainer: {
    textAlign: "center",
    padding: "60px 20px"
  },
  errorIcon: {
    fontSize: "48px",
    display: "block",
    marginBottom: "16px"
  },
  errorText: {
    color: "#ef4444",
    fontSize: "14px",
    marginBottom: "20px"
  },
  footer: {
    padding: "16px 24px",
    borderTop: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff"
  },
  secondaryButton: {
    padding: "8px 20px",
    background: "#f3f4f6",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 500,
    color: "#374151",
    transition: "all 0.2s"
  },
  primaryButton: {
    padding: "8px 20px",
    background: "#4F46E5",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 500,
    color: "#fff",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "all 0.2s",
    ':hover': {
      background: "#4338ca"
    }
  }
};

// Add CSS animations
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
if (!document.head.querySelector('#file-preview-styles')) {
  styleSheet.id = 'file-preview-styles';
  document.head.appendChild(styleSheet);
}

export default FilePreviewModal;