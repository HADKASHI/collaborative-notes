import React, { useState, useEffect } from "react";
import { firestore } from "../firebase";
import { collection, doc, onSnapshot } from "firebase/firestore";
import "./VersionHistory.css";

const VersionHistory = ({ noteId, notebookId, onRevert }) => {
  const [versions, setVersions] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (noteId) {
      const versionsRef = collection(
        firestore,
        "notebooks",
        notebookId,
        "notes",
        noteId,
        "versions"
      );
      const unsubscribe = onSnapshot(versionsRef, (snapshot) => {
        const versionsData = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          versionsData.push({ ...data, id: doc.id });
        });

        // Log the fetched versions for debugging
        console.log("Fetched versions: ", versionsData);

        // Sort versionsData by updatedAt in descending order
        versionsData.sort((a, b) => b.updatedAt.seconds - a.updatedAt.seconds);

        setVersions(versionsData);
      });

      return () => unsubscribe();
    }
  }, [noteId, notebookId]);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="version-history-container">
      <h3 onClick={toggleExpand} className="version-history-header">
        Version History {isExpanded ? "▲" : "▼"}
      </h3>
      {isExpanded && (
        <ul className="version-history-list">
          {versions.length ? (
            versions.map((version) => (
              <li key={version.id} className="version-history-item">
                <p>
                  Version {version.versionNumber} -{" "}
                  {new Date(version.updatedAt.seconds * 1000).toString()}
                </p>
                <button onClick={() => onRevert(version.id)}>Revert</button>
              </li>
            ))
          ) : (
            <li>No versions available.</li>
          )}
        </ul>
      )}
    </div>
  );
};

export default VersionHistory;
