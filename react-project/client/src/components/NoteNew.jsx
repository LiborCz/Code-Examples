import React, { useState, useContext } from "react";
import axios from 'axios';

import SessionContext from '../context/SessionContext'

function NoteNew({setItems}) {

  const { session } = useContext(SessionContext);

  const [form, setForm] = useState({ title: "", note: "" });

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async(e) => { e.preventDefault();
    try {
      const res = await axios.post("/api/items/add", {
        title: form.title,
        text: form.note
      }, { headers: {"x-auth-token": session.token }});

      if (res.data.ok) {
        const newItem = res.data.item;
        setItems(curNotes => ([...curNotes, {title: newItem.title, text: newItem.text}]));
      }
    }

    catch (err) { console.log("error:", err); }

    setForm({ title: "", note: "" });
  }

  return (
    <div>
      <form className="create-note">
        
        <input name="title" onChange={onChange} value={form.title} placeholder="Title" />

        <textarea name="note" onChange={onChange} value={form.note} placeholder="Take a note..." rows="3" />

        <button onClick={onSubmit}>Add</button>

      </form>
    </div>
  );
}

export default NoteNew;
