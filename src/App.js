// App.js
import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import NotebooksList from "./components/NotebooksList";
import NotesList from "./components/NotesList";
import CreateNote from "./components/CreateNote";
import NavBar from "./components/NavBar";
import Auth from "./components/Auth";
import ErrorPage from "./components/ErrorPage"; // Import the ErrorPage component
import { auth } from "./firebase";
import "./App.css";

const App = () => {
  const [selectedNotebookId, setSelectedNotebookId] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  const handleNotebookSelect = (notebookId) => {
    setSelectedNotebookId(notebookId);
    navigate(`/notebooks/${notebookId}/notes`);
  };

  return (
    <div className="App">
      <NavBar user={user} />
      <Routes>
        <Route
          path="/"
          element={
            user ? (
              <NotebooksList onSelectNotebook={handleNotebookSelect} />
            ) : (
              <Auth />
            )
          }
        />
        <Route
          path="/notebooks/:notebookId/notes"
          element={
            user ? (
              <NotesList userId={user.uid} notebookId={selectedNotebookId} />
            ) : (
              <Auth />
            )
          }
        />
        <Route
          path="/create-note"
          element={user ? <CreateNote userId={user.uid} /> : <Auth />}
        />
        <Route
          path="/error"
          element={<ErrorPage message="Invalid notebook ID." />}
        />
        <Route path="*" element={<ErrorPage message="Page not found." />} />
      </Routes>
    </div>
  );
};

export default App;
