import React, { useState, useContext } from "react";

import { Dialog, DialogOverlay, DialogContent } from "@reach/dialog";
import "@reach/dialog/styles.css";

import { Input, Textarea, FileInput, MapInput } from "./generic/Form";

import SessionContext from '../context/SessionContext';

function DlgItemNew() {

  const { itemAdd, showDlgItemNew, setShowDlgItemNew, mapSetCoords, setMapSetCoords } = useContext(SessionContext);
  const [showWarning, setShowWarning] = React.useState(false);  
  const buttonRef = React.useRef();

  const emptyForm = { title:"", text:"", coords:[] }
  const [form, setForm] = useState(emptyForm);

  const hideDlg = () => setShowDlgItemNew(false);
  const closeDlg = () => { setShowDlgItemNew(false); clearForm(); }
  
  const clearForm = () => { setMapSetCoords([]); setForm(emptyForm); }

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  
  const submitDlg = async(e) => { e.preventDefault(); 
    if(itemAdd(form)) closeDlg();
  }  

  return (
      <Dialog className="dlg-item-new" isOpen={showDlgItemNew} onDismiss={hideDlg} initialFocusRef={buttonRef} aria-label="New Item Dialog">
        <form className="create-note">
          <Input name="title" label="Title" placeholder="Title" onChange={onChange} value={form.title} />
          <Textarea name="text" label="Description" placeholder="Can be a text upto 200 characters" onChange={onChange} value={form.text} />
          <MapInput name="coords" label="Coordinates" placeholder="Choose a place on the map" setForm={setForm} />
          <div>Coords: {mapSetCoords}</div>
        </form>
        <br />
        <div className="btn-wrapper">
          <button onClick={clearForm}>Clear All Fields</button>
          <div style={{flexGrow:1}}></div>
          {showWarning && (<p className="inline-error">You must make a choice here -&gt;</p>)}
          <button onClick={submitDlg} className="space-left">Save</button>
          <button onClick={closeDlg} className="space-left">Cancel</button>
        </div>
      </Dialog>
  );
}

export default DlgItemNew;
