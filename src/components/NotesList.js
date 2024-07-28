// NotesList.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { firestore } from "../firebase";
import Note from "./Note";
import "./NotesList.css";

const NotesList = ({ notebookId, userId, onAddNote }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchNotes = async () => {
    try {
      if (!notebookId) {
        navigate("/error", { state: { message: "Invalid notebook ID." } });
        return;
      }

      setLoading(true);
      setError(null);

      const notebookDocRef = doc(firestore, "notebooks", notebookId);
      const notebookDoc = await getDoc(notebookDocRef);

      if (!notebookDoc.exists()) {
        throw new Error("Invalid notebook ID.");
      }

      const notesRef = collection(firestore, "notebooks", notebookId, "notes");
      const notesSnapshot = await getDocs(notesRef);
      setNotes(
        notesSnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
      );
    } catch (error) {
      console.error("Error fetching notes: ", error);
      setError(error.message);
      navigate("/error", { state: { message: error.message } });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [notebookId]);

  const handleAddNote = () => {
    if (userId) {
      navigate(`/create-note?notebookId=${notebookId}`);
    } else {
      alert("You need to be logged in to create a note.");
    }
  };

  const handleDeleteNote = (noteId) => {
    setNotes((prevNotes) => prevNotes.filter((note) => note.id !== noteId));
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleRefresh = () => {
    fetchNotes();
  };

  return (
    <div className="notes-list">
      <div className="notes-list-header">
        <button className="back-button" onClick={handleBack}>
          Back
        </button>
        <button className="add-note-button" onClick={handleAddNote}>
          Add Note
        </button>
        <button className="refresh-button" onClick={handleRefresh}>
          Refresh
        </button>
      </div>
      <div className="notes-list-content">
        {loading ? (
          <p>Loading notes...</p>
        ) : error ? (
          <p>Error: {error}</p>
        ) : (
          notes.map((note) => (
            <Note
              key={note.id}
              noteId={note.id}
              userId={userId}
              notebookId={notebookId}
              onDelete={handleDeleteNote}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default NotesList;
