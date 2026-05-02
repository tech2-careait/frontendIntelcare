import React, { useEffect, useState } from "react";
import "../../../../Styles/SmartOnboardingAccessManagement.css";

const ROLE_OPTIONS = [
  { label: "Admin", value: "admin" },
  { label: "Staff", value: "staff" },
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Smart Onboarding has its own access-management namespace on the
// middleware so it can evolve independently of VoiceModule's
// /api/v2d/users/* routes. Override with REACT_APP_SO_ACCESS_BASE_URL.
const PROD_HOST =
  "https://curki-test-prod-auhyhehcbvdmh3ef.canadacentral-01.azurewebsites.net";
const LOCAL_HOST = "http://localhost:5000";
const isLocalhost =
  typeof window !== "undefined" &&
  /^(localhost|127\.0\.0\.1|0\.0\.0\.0)$/.test(window.location.hostname);
const API_BASE =
  process.env.REACT_APP_SO_ACCESS_BASE_URL ||
  `${isLocalhost ? LOCAL_HOST : PROD_HOST}/api/staff-onboarding/access`;

const SmartOnboardingAccessManagement = ({ onClose, userEmail, organizationId }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("staff");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const requestHeaders = () => {
    const headers = { "Content-Type": "application/json" };
    if (userEmail) headers["x-user-email"] = userEmail;
    if (organizationId) headers["x-organization-id"] = String(organizationId);
    return headers;
  };

  const fetchUsers = async () => {
    if (!userEmail) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/users`, {
        method: "GET",
        headers: requestHeaders(),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to load users");
      }
      const list = Array.isArray(data?.data) ? data.data : [];
      console.log("[SmartOnboarding/Access] users", list);
      setUsers(list);
    } catch (err) {
      console.error("[SmartOnboarding/Access] fetch users failed", err);
      setError(err.message || "Failed to load users for this organization");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userEmail, organizationId]);

  const handleInvite = async () => {
    setError("");
    setSuccess("");

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName) {
      setError("Name is required");
      return;
    }
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setError("A valid email is required");
      return;
    }
    if (!["admin", "staff"].includes(role)) {
      setError("Role must be admin or staff");
      return;
    }

    setInviting(true);
    try {
      console.log("[SmartOnboarding/Access] invite", {
        name: trimmedName,
        email: trimmedEmail,
        role,
      });
      const res = await fetch(`${API_BASE}/invite`, {
        method: "POST",
        headers: requestHeaders(),
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          role,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to invite user");
      }

      setSuccess(
        data?.already_invited
          ? "User already invited to this organization"
          : "Invite created successfully"
      );

      setName("");
      setEmail("");
      setRole("staff");

      await fetchUsers();
    } catch (err) {
      console.error("[SmartOnboarding/Access] invite failed", err);
      setError(err.message || "Failed to invite user");
    } finally {
      setInviting(false);
    }
  };

  const roleClass = (value) =>
    `so-access-badge so-access-role-${(value || "").toLowerCase()}`;
  const statusClass = (value) =>
    `so-access-badge so-access-status-${(value || "").toLowerCase()}`;

  return (
    <div className="so-access-overlay" role="presentation" onClick={onClose}>
      <div
        className="so-access-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="so-access-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="so-access-scroll">
          <div className="so-access-header">
            <div>
              <div id="so-access-title" className="so-access-title">
                Access Management
              </div>
              <div className="so-access-subtitle">
                Invite teammates and manage who can access Smart Onboarding for
                this organization.
              </div>
            </div>
            <button
              type="button"
              className="so-access-close"
              onClick={onClose}
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <div className="so-access-section-title">Invite a new member</div>

          <div className="so-access-row">
            <div className="so-access-field">
              <label className="so-access-label">
                Name <sup className="so-access-required">*</sup>
              </label>
              <input
                className="so-access-input"
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="so-access-field">
              <label className="so-access-label">
                Email <sup className="so-access-required">*</sup>
              </label>
              <input
                className="so-access-input"
                type="email"
                placeholder="user@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="so-access-row so-access-row-invite">
            <div className="so-access-field">
              <label className="so-access-label">
                Role <sup className="so-access-required">*</sup>
              </label>
              <select
                className="so-access-select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                {ROLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="so-access-invite-cell">
              <button
                type="button"
                className="so-access-invite-btn"
                onClick={handleInvite}
                disabled={inviting}
              >
                {inviting ? "Inviting..." : "Invite User"}
              </button>
            </div>
          </div>

          {error && <div className="so-access-error">{error}</div>}
          {success && <div className="so-access-success">{success}</div>}

          <div className="so-access-list-section">
            <div className="so-access-section-title so-access-list-title">
              <span>Team Members</span>
              {!loading && users.length > 0 && (
                <span className="so-access-count">{users.length}</span>
              )}
            </div>

            {loading ? (
              <div className="so-access-state">Loading users...</div>
            ) : users.length === 0 ? (
              <div className="so-access-state">
                No users in this organization yet
              </div>
            ) : (
              <div className="so-access-table-wrapper">
                <div className="so-access-table">
                  <div className="so-access-table-header">
                    <div>Name</div>
                    <div>Email</div>
                    <div>Role</div>
                    <div>Status</div>
                  </div>
                  {users.map((u) => (
                    <div key={u.id || u.email} className="so-access-table-row">
                      <div className="so-access-name-cell">{u.name}</div>
                      <div className="so-access-email">{u.email}</div>
                      <div>
                        <span className={roleClass(u.role)}>{u.role}</span>
                      </div>
                      <div>
                        <span className={statusClass(u.status)}>{u.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartOnboardingAccessManagement;
