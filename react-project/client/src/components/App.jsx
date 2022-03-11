import React, { useState, useEffect } from "react";
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import axios from 'axios';

import SessionContext from "../context/SessionContext";

import Header from "../components/Header";
import Footer from "../components/Footer";

import MainPage from "../pages/MainPage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";

function App() {

  const [session, setSession] = useState({ token: undefined, user: undefined });

  const [showDlgItemNew, setShowDlgItemNew] = useState(false);
  const [mapShowState, setMapShowState] = useState("none");
  const [mapSetState, setMapSetState] = useState("none");
  const [mapSetCoords, setMapSetCoords] = useState([]);

  const [items, setItems] = useState([]);

  const itemAdd = async (form) => {
    try {
      const res = await axios.post("/api/items/add", {
        title: form.title,
        text: form.text,
        location: { type: "Point", coords: mapSetCoords }
      }, { headers: {"x-auth-token": session.token }});

      if (res.data.ok) {
        const newItem = res.data.item;
        setItems(curItems => ([...curItems, {
          title: newItem.title, 
          text: newItem.text,
          location: { type: "Point", coords: mapSetCoords }
        }]));
        setMapSetCoords([]);
        return true;
        }
      else return false;
      }

    catch (err) { console.log("error:", err); return false; }
  }

  const itemDelete = async (id) => {
    try {
      if(session.user) {
        const res = await axios.delete("/api/items/delete/" + id, 
          { headers: {"x-auth-token":session.token }});

        console.log("deleted: ", res.data)
        setItems(prevItems => prevItems.filter((item, index) => item._id !== id ));
      }
      else {
      // history.push("/login");
      }
    }
    catch (err) { console.log("error:", err); }
  }

  useEffect(() => {
    const checkLoggedIn = async () => {
      let token = localStorage.getItem("auth-token");
      
      try {
        const res = await axios.post("/api/users/validateToken", null, { headers:{"x-auth-token":token} });

        if (res.data.token && res.data.user) { 
          setSession({ token:res.data.token, user:res.data.user });
        }
      }

      catch (err) { console.log("error:", err); }
    };

    checkLoggedIn();
  }, []);

  return (
    <BrowserRouter>
      <SessionContext.Provider value={{ 
        session, setSession, 
        mapSetState, setMapSetState, 
        mapSetCoords, setMapSetCoords, 
        mapShowState, setMapShowState,
        showDlgItemNew, setShowDlgItemNew,
        items, setItems, itemAdd, itemDelete
        }}>

        <Header />
        <Switch>
          <Route exact path="/" component={MainPage} />
          <Route path="/login" component={LoginPage} />
          <Route path="/register" component={RegisterPage} />
        </Switch>
        <Footer />


      </SessionContext.Provider>
    </BrowserRouter>
  );
}

export default App;
