import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { firestore } from "../firebase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import "./NotebooksList.css";

const NotebooksList = ({ onSelectNotebook }) => {
  const [notebooks, setNotebooks] = useState([]);
  const [newNotebookName, setNewNotebookName] = useState("");

  useEffect(() => {
    const fetchNotebooks = async () => {
      const notebooksRef = collection(firestore, "notebooks");
      const notebooksSnapshot = await getDocs(notebooksRef);
      const notebooksData = notebooksSnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setNotebooks(notebooksData);
    };

    fetchNotebooks();
  }, []);

  const handleAddNotebook = async () => {
    if (newNotebookName.trim()) {
      const notebooksRef = collection(firestore, "notebooks");
      await addDoc(notebooksRef, { name: newNotebookName });
      setNewNotebookName("");
      // Refresh the list of notebooks
      const notebooksSnapshot = await getDocs(notebooksRef);
      setNotebooks(
        notebooksSnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
      );
    }
  };

  const handleDeleteNotebook = async (notebookId) => {
    const notebookRef = doc(firestore, "notebooks", notebookId);
    await deleteDoc(notebookRef);
    // Refresh the list of notebooks
    const notebooksSnapshot = await getDocs(collection(firestore, "notebooks"));
    setNotebooks(
      notebooksSnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
    );
  };

  return (
    <div className="notebooks-list">
      <h2>Notebooks</h2>
      <ul>
        {notebooks.map((notebook) => (
          <li key={notebook.id} className="notebook-item">
            <span
              onClick={() => onSelectNotebook(notebook.id)}
              className="notebook-name"
            >
              {notebook.name}
            </span>
            <button
              className="delete-button"
              onClick={() => handleDeleteNotebook(notebook.id)}
              aria-label="Delete Notebook"
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
          </li>
        ))}
      </ul>
      <div className="add-notebook">
        <input
          type="text"
          value={newNotebookName}
          onChange={(e) => setNewNotebookName(e.target.value)}
          placeholder="New Notebook Name"
        />
        <button onClick={handleAddNotebook}>Add Notebook</button>
      </div>
    </div>
  );
};

export default NotebooksList;
