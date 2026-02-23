import React, { useEffect, useState } from "react";
import "../Styles/TeamMembers.css";
import { FiPlus, FiChevronDown } from "react-icons/fi";
import { IoArrowBackOutline } from "react-icons/io5";

const TeamMembers = ({ onBack, loggedInUserEmail }) => {
  const [members, setMembers] = useState([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteData, setInviteData] = useState({
    email: "",
    name: "",
    role: "Staff",
  });
  const [loading, setLoading] = useState(false);

  const BASE_URL =
    "https://curki-test-prod-auhyhehcbvdmh3ef.canadacentral-01.azurewebsites.net/api/teamMembers";

  const fetchMembers = async () => {
    try {
      if (!loggedInUserEmail) return;

      const res = await fetch(
        `${BASE_URL}?userEmail=${encodeURIComponent(loggedInUserEmail)}`
      );

      const data = await res.json();
      setMembers(data);
    } catch (error) {
      console.error("Fetch members error:", error);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [loggedInUserEmail]);

  const handleChange = (e) => {
    setInviteData({
      ...inviteData,
      [e.target.name]: e.target.value,
    });
  };

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...inviteData,
          invitedBy: loggedInUserEmail,
        }),
      });

      const data = await res.json();
      alert(data.message);

      setShowInviteModal(false);
      setInviteData({ email: "", name: "", role: "Staff" });
    } catch (error) {
      console.error("Invite error:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (member) => {
    try {
      const newStatus =
        member.status === "Active" ? "Restricted" : "Active";

      await fetch(`${BASE_URL}/${member.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail: member.userEmail,
          status: newStatus,
        }),
      });

      fetchMembers();
    } catch (error) {
      console.error("Update status error:", error);
    }
  };

  return (
    <div className="team-container">
      <div className="team-back" onClick={onBack}>
        <IoArrowBackOutline size={18} />
        Back
      </div>

      <div className="team-header">
        <div>
          <h2>Team Members</h2>
          <p>{members.length} members</p>
        </div>

        <button
          className="invite-btn"
          onClick={() => setShowInviteModal(true)}
        >
          <FiPlus size={18} />
          Invite members
        </button>
      </div>

      <div className="team-table-card">
        <div className="team-table-header">
          <div>Email ID</div>
          <div>Name</div>
          <div>Role</div>
          <div>Status</div>
        </div>

        {members.map((member) => (
          <div key={member.id} className="team-row">
            <div>{member.userEmail}</div>
            <div>{member.name}</div>
            <div>{member.role}</div>
            <div style={{ marginRight: "auto" }}>
              <button
                className={`status-pill ${
                  member.status === "Active"
                    ? "active-pill"
                    : "restricted-pill"
                }`}
                onClick={() => toggleStatus(member)}
              >
                {member.status}
                <FiChevronDown size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showInviteModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>Invite Team Member</h3>

            <form onSubmit={handleInviteSubmit}>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={inviteData.email}
                onChange={handleChange}
                required
              />

              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={inviteData.name}
                onChange={handleChange}
                required
              />

              <select
                name="role"
                value={inviteData.role}
                onChange={handleChange}
              >
                <option value="Staff">Staff</option>
                <option value="Admin">Admin</option>
              </select>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowInviteModal(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="submit-btn"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send Invite"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamMembers;