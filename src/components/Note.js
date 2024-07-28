import React, { useState, useEffect } from "react";
import {
  doc,
  collection,
  onSnapshot,
  updateDoc,
  deleteDoc,
  addDoc,
  setDoc,
  getDocs,
  getDoc,
} from "firebase/firestore";
import { firestore } from "../firebase";
import VersionHistory from "./VersionHistory";
import "./Note.css";

const Note = ({ noteId, userId, notebookId, onDelete }) => {
  const [note, setNote] = useState("");
  const [title, setTitle] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [currentVersion, setCurrentVersion] = useState({
    versionNumber: "",
    updatedAt: "",
  });

  useEffect(() => {
    if (noteId) {
      const noteRef = doc(firestore, "notebooks", notebookId, "notes", noteId);
      const unsubscribe = onSnapshot(noteRef, async (docSnap) => {
        if (!docSnap.exists()) {
          console.log(`Note with ID ${noteId} has been deleted.`);
          onDelete(noteId); // Notify the parent component
          return;
        }

        const data = docSnap.data();
        setTitle(data.title);
        setNote(data.note);

        if (data.currentVersionId) {
          const versionRef = doc(
            firestore,
            "notebooks",
            notebookId,
            "notes",
            noteId,
            "versions",
            data.currentVersionId
          );
          const versionSnap = await getDoc(versionRef);
          if (versionSnap.exists()) {
            const versionData = versionSnap.data();
            setCurrentVersion({
              versionNumber: versionData.versionNumber,
              updatedAt: versionData.updatedAt.toDate().toString(),
            });
          }
        }
      });

      return () => unsubscribe();
    }
  }, [noteId, notebookId, onDelete]);

  const handleSave = async () => {
    if (!title || !note) {
      alert("Please fill out both the title and the note.");
      return;
    }
    if (noteId) {
      const noteRef = doc(firestore, "notebooks", notebookId, "notes", noteId);
      const versionsRef = collection(
        firestore,
        "notebooks",
        notebookId,
        "notes",
        noteId,
        "versions"
      );

      const versionsSnap = await getDocs(versionsRef);
      let newVersionNumber = 1;
      if (!versionsSnap.empty) {
        newVersionNumber =
          Math.max(
            ...versionsSnap.docs.map((doc) => doc.data().versionNumber)
          ) + 1;
      }

      const newVersionRef = doc(versionsRef);
      await setDoc(newVersionRef, {
        title,
        note,
        updatedBy: userId,
        updatedAt: new Date(),
        versionNumber: newVersionNumber,
      });

      await updateDoc(noteRef, {
        title,
        note,
        updatedBy: userId,
        updatedAt: new Date(),
        currentVersionId: newVersionRef.id,
      });
    } else {
      // Creating a new note
      const notesRef = collection(firestore, "notebooks", notebookId, "notes");
      const newNoteRef = await addDoc(notesRef, {
        title,
        note,
        createdBy: userId,
        createdAt: new Date(),
        currentVersionId: "", // Initial version ID is empty
      });

      // Create the initial version for the new note
      const versionsRef = collection(
        firestore,
        "notebooks",
        notebookId,
        "notes",
        newNoteRef.id,
        "versions"
      );
      const newVersionRef = doc(versionsRef);
      await setDoc(newVersionRef, {
        title,
        note,
        updatedBy: userId,
        updatedAt: new Date(),
        versionNumber: 1, // The first version
      });

      // Update the note with the reference to the first version
      await updateDoc(newNoteRef, {
        currentVersionId: newVersionRef.id,
      });
    }

    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (noteId) {
      const noteRef = doc(firestore, "notebooks", notebookId, "notes", noteId);
      await deleteDoc(noteRef);
      onDelete(noteId); // Notify the parent component
    }
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleRevert = async (versionId) => {
    const versionRef = doc(
      firestore,
      "notebooks",
      notebookId,
      "notes",
      noteId,
      "versions",
      versionId
    );
    const versionSnap = await getDoc(versionRef);

    if (versionSnap.exists()) {
      const data = versionSnap.data();
      const noteRef = doc(firestore, "notebooks", notebookId, "notes", noteId);

      await updateDoc(noteRef, {
        title: data.title,
        note: data.note,
        updatedBy: userId,
        updatedAt: new Date(),
        currentVersionId: versionId,
      });

      // Update the current version display
      setCurrentVersion({
        versionNumber: data.versionNumber,
        updatedAt: data.updatedAt.toDate().toString(),
      });
    }
  };

  return (
    <div className="note-container">
      {isEditing ? (
        <div>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="note-title-input"
          />
          <textarea
            placeholder="Write your note here..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="note-content-input"
          />
          <div className="note-buttons">
            <button onClick={handleSave}>Save</button>
            <button onClick={toggleEdit}>Cancel</button>
          </div>
        </div>
      ) : (
        <div>
          <h2 className="note-title">{title}</h2>
          <p className="note-content">{note}</p>
          {currentVersion.versionNumber && (
            <div className="note-version-info">
              <p className="current-version">
                Current Version Number: {currentVersion.versionNumber}
              </p>
              <p className="current-version-date">
                Last Updated: {currentVersion.updatedAt}
              </p>
            </div>
          )}
          <div className="note-buttons">
            <button onClick={toggleEdit}>Edit</button>
            <button onClick={handleDelete}>Delete</button>
          </div>
          <VersionHistory
            noteId={noteId}
            onRevert={handleRevert}
            notebookId={notebookId}
          />
        </div>
      )}
    </div>
  );
};

export default Note;
