import React from "react";
import Entry from "./Entry.jsx";
import emojipedia from "../emojipedia.js";

function createEntry(emojipediaListItem) {
  return (
    <Entry
      key={emojipediaListItem.id}
      emoji={emojipediaListItem.emoji}
      name={emojipediaListItem.name}
      meaning={emojipediaListItem.meaning}
    />
  );
}

function App() {
  return (
    <div>
      <h1>
        <span>emojipedia</span>
      </h1>
      <dl className="dictionary">{emojipedia.map(createEntry)}</dl>
    </div>
  );
}

export default App;
