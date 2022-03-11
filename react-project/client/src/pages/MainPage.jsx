import React, { useState, useEffect, useContext } from "react";
import axios from "axios";

import SessionContext from "../context/SessionContext";

import Item from "../components/Item";
import NoteNew from "../components/NoteNew";
import DlgItemNew from "../components/DlgItemNew";
import MapSetOverlay from "../components/map/MapSetOverlay";
import MapShowOverlay from "../components/map/MapShowOverlay";

function App() {
  const { session, items, setItems, itemDelete } = useContext(SessionContext);

  useEffect(() => {
    try {
      if(session.user) {
        async function fetchData() {
          const res = await axios.get("/api/items/list/" + session.user.id, 
            { headers: {"x-auth-token":session.token }});

          console.log("res", res.data)  
          setItems(res.data);
        }
        fetchData();
      }
      else {
      // history.push("/login");
      }
    }
    catch(e) {}
    
  }, [session.user, session.token]);

  const onDelete = (id) => itemDelete(id);

  return (<>
    <MapSetOverlay />
    <MapShowOverlay />
    <DlgItemNew setItems={setItems} />
    {items.map((item, index) => 
      <Item key={index} id={item._id} title={item.title} text={item.text} onDelete={onDelete} />
    )}
  </>);
}

export default App;
