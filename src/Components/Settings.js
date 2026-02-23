import React, { useEffect, useState } from "react";
import "../Styles/Settings.css";
import { IoArrowBackOutline } from "react-icons/io5";
import { FiEdit2 } from "react-icons/fi";
import axios from "axios";
import { auth } from "../firebase";
import { sendPasswordResetEmail, deleteUser } from "firebase/auth";
const SettingsPage = ({ user, onBack }) => {
    const [firstName, setFirstName] = useState(user?.displayName || "Deepak");
    const [lastName, setLastName] = useState(user?.displayName || "uday");
    const [email, setEmail] = useState(user?.email || "");
    const [isSaving, setIsSaving] = useState(false);
    const [isEditingHeaderName, setIsEditingHeaderName] = useState(false);
    const [isEditingInputName, setIsEditingInputName] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmType, setConfirmType] = useState("");
    const handleResetPassword = async () => {
        try {
            await sendPasswordResetEmail(auth, user?.email);
            alert("Password reset email sent!");
        } catch (error) {
            console.error(error);
            alert("Failed to send reset email.");
        }
    };

    const handleDeleteAccount = async () => {
        try {
            const currentUser = auth.currentUser;

            if (!currentUser) {
                alert("No user found.");
                return;
            }

            await axios.delete(
                `https://curki-test-prod-auhyhehcbvdmh3ef.canadacentral-01.azurewebsites.net/api/user/delete?id=${currentUser.uid}`
            );

            await deleteUser(currentUser);

            alert("Account deleted successfully.");

            // window.location.reload();

        } catch (error) {
            console.error(error);

            if (error.code === "auth/requires-recent-login") {
                alert("Please log in again before deleting your account.");
            } else {
                alert("Failed to delete account.");
            }
        }
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);

            await axios.put(
                "https://curki-test-prod-auhyhehcbvdmh3ef.canadacentral-01.azurewebsites.net/api/user/update",
                {
                    id: user?.uid,
                    name: firstName
                }
            );

            setIsEditingHeaderName(false);
            setIsEditingInputName(false);

        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };


    const fetchUserData = async () => {
        try {
            if (!user?.email) return;

            const res = await axios.get(
                `https://curki-test-prod-auhyhehcbvdmh3ef.canadacentral-01.azurewebsites.net/api/user/get?userEmail=${user?.email}`
            );

            const dbUser = res.data.user;

            setFirstName(dbUser?.name || "");
            setLastName(dbUser?.organization || "");
            setEmail(dbUser?.userEmail || "");

        } catch (error) {
            console.error("Failed to fetch user:", error);
        }
    };
    useEffect(() => {
        fetchUserData();
    }, [user?.email]);

    return (
        <div className="settings-container">

            {/* BACK */}
            <div className="settings-back" onClick={onBack}>
                <IoArrowBackOutline size={18} />
                <span>Back</span>
            </div>

            {/* HEADER */}
            <p style={{ textAlign: "left", width: "88px", height: "24px", fontSize: "22px", fontWeight: "500", lineHeight: "24px", marginBottom: "25px" }}>Settings</p>
            <div className="settings-header">

                <div className="settings-user-info">
                    <img
                        src={
                            user?.photoURL ||
                            `https://ui-avatars.com/api/?name=${user?.displayName}`
                        }
                        className="settings-avatar"
                    />

                    <div>
                        <div className="settings-admin-badge">Admin</div>
                        <div className="settings-name-wrapper">

                            {isEditingHeaderName ? (
                                <input
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className="settings-header-input"
                                    autoFocus
                                />
                            ) : (
                                <div className="settings-name">{firstName}</div>
                            )}

                            <FiEdit2
                                size={16}
                                className="settings-name-edit-icon"
                                onClick={() => setIsEditingHeaderName(true)}
                            />

                        </div>
                    </div>

                </div>

                <button
                    className="settings-save-btn"
                    onClick={handleSave}
                    disabled={isSaving || (!isEditingHeaderName && !isEditingInputName)}

                >
                    {isSaving ? "Saving..." : "Save Changes"}
                </button>


            </div>

            {/* FORM */}
            <div className="settings-form">

                <div className="settings-input-group">

                    <label>Name</label>

                    <div className="settings-input-wrapper">

                        <input
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            disabled={!isEditingInputName}
                            className={!isEditingInputName ? "settings-disabled-input" : ""}
                        />

                        <FiEdit2
                            className="settings-edit-icon"
                            size={16}
                            onClick={() => setIsEditingInputName(true)}
                        />

                    </div>

                </div>



                <div className="settings-input-group">
                    <label>Organisation Name</label>
                    <div className="settings-input-wrapper">
                        <input
                            value={lastName}
                            disabled
                            className="settings-disabled-input"
                        />

                        <FiEdit2 className="settings-edit-icon" size={16} />
                    </div>
                </div>

                <div className="settings-input-group">
                    <label>Email</label>
                    <div className="settings-input-wrapper">
                        <input
                            value={email}
                            disabled
                        />

                        <FiEdit2 className="settings-edit-icon" size={16} />
                    </div>
                </div>

            </div>

            {/* ACTION BUTTONS */}
            {/* ACTION BUTTONS */}
            <div className="settings-actions">

                <button
                    className="delete-account-btn"
                    onClick={() => {
                        setConfirmType("delete");
                        setShowConfirmModal(true);
                    }}
                >
                    Delete Account
                </button>

                <button
                    className="reset-password-btn"
                    onClick={() => {
                        setConfirmType("reset");
                        setShowConfirmModal(true);
                    }}
                >
                    Reset Password
                </button>

            </div>


            {/* CONFIRM MODAL */}
            {showConfirmModal && (
                <div className="confirm-overlay">
                    <div className="confirm-modal">

                        <div className="confirm-title">
                            {confirmType === "delete"
                                ? "Delete Account?"
                                : "Reset Password?"}
                        </div>

                        <div className="confirm-message">
                            {confirmType === "delete"
                                ? "This action is permanent and cannot be undone."
                                : "We will send a password reset link to your email."}
                        </div>

                        <div className="confirm-buttons">

                            <button
                                className="confirm-cancel"
                                onClick={() => setShowConfirmModal(false)}
                            >
                                No
                            </button>

                            <button
                                className="confirm-confirm"
                                onClick={async () => {
                                    if (confirmType === "delete") {
                                        await handleDeleteAccount();
                                    } else {
                                        await handleResetPassword();
                                    }
                                    setShowConfirmModal(false);
                                }}
                            >
                                Yes
                            </button>

                        </div>
                    </div>
                </div>
            )}


        </div>
    );
};

export default SettingsPage;
