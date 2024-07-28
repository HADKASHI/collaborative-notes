import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { addDoc, collection, doc, setDoc, getDoc } from "firebase/firestore";
import { firestore } from "../firebase";
import "./CreateNote.css";

const CreateNote = ({ userId }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Extract notebookId from the query parameters
  const query = new URLSearchParams(location.search);
  const notebookId = query.get("notebookId");

  useEffect(() => {
    const validateNotebook = async () => {
      if (!userId) {
        navigate("/"); // Redirect to the home page if the user is not logged in
      } else if (notebookId) {
        try {
          const notebookDocRef = doc(firestore, "notebooks", notebookId);
          const notebookDoc = await getDoc(notebookDocRef);
          if (!notebookDoc.exists()) {
            navigate("/error", { state: { message: "Invalid notebook ID." } });
          }
        } catch (error) {
          console.error("Error validating notebook ID: ", error);
          navigate("/error", { state: { message: "An error occurred." } });
        }
      } else {
        navigate("/error", { state: { message: "No notebook ID provided." } });
      }
    };

    validateNotebook();
  }, [userId, notebookId, navigate]);

  const handleSaveNote = async () => {
    if (!title || !content) {
      alert("Title and content cannot be empty.");
      return;
    }

    try {
      if (userId && notebookId) {
        // 1. Add the new note to the notes collection
        const newNoteRef = await addDoc(
          collection(firestore, "notebooks", notebookId, "notes"),
          {
            title,
            content,
            createdBy: userId,
            createdAt: new Date(),
            currentVersionId: "", // Placeholder for the initial version ID
          }
        );

        // 2. Create the initial version for the new note
        const versionsRef = collection(
          firestore,
          "notebooks",
          notebookId,
          "notes",
          newNoteRef.id,
          "versions"
        );

        const initialVersionRef = doc(versionsRef);
        await setDoc(initialVersionRef, {
          title,
          note: content,
          updatedBy: userId,
          updatedAt: new Date(),
          versionNumber: 1, // The first version
        });

        // 3. Update the note with the reference to the initial version
        await setDoc(
          newNoteRef,
          {
            currentVersionId: initialVersionRef.id,
          },
          { merge: true }
        );

        // Navigate to the note's page or the list of notes
        navigate(`/notebooks/${notebookId}/notes`);
      } else {
        alert("Failed to save the note. Please try again.");
      }
    } catch (error) {
      console.error("Error saving note: ", error);
      alert("Error saving the note. Please try again.");
    }
  };

  const handleCancel = () => {
    navigate(-1); // Navigate back to the previous page
  };

  return (
    <div className="create-note">
      <h2>Create Note</h2>
      <input
        type="text"
        placeholder="Note Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        placeholder="Note Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <div className="create-note-buttons">
        <button onClick={handleSaveNote}>Save Note</button>
        <button onClick={handleCancel} className="cancel-button">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default CreateNote;
