import React, { useContext } from "react";
import { useHistory } from 'react-router-dom';
import $ from 'jquery';

import SessionContext from "../context/SessionContext";

function Header() {

  $(document).ready(function() {

    // Check for click events on the navbar burger icon
    $(".navbar-burger").click(function() {
  
        // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
        $(".navbar-burger").toggleClass("is-active");
        $(".navbar-menu").toggleClass("is-active");
  
    });
  });

  const {session, setSession, setMapShowState, setShowDlgItemNew} = useContext(SessionContext);

  const history = useHistory();

  const home = () => history.push("/");

  const logout = () => { 
    setSession({ token: undefined, user: undefined });
    localStorage.setItem("auth-token", "" );
  }

  const toggleMapShow = () => {
    setMapShowState(curState => (curState==="none") ? "block" : "none");
  }

  const openNewNoteDlg = () => {
    setMapShowState(
      "none");
    setShowDlgItemNew(true);
  }

  return (
    <nav className="navbar is-fixed-top is-info" role="navigation" aria-label="dropdown navigation">

      <div className="navbar-brand">

        <div className="navbar-item">
          <b className="logo is-size-4 has-text-light" onClick={home}>Keeper</b>
        </div>

        <button className="header space-left" onClick={toggleMapShow}>Overview Map</button>
        <button className="header note-new space-left" onClick={openNewNoteDlg}>Insert New Note</button>

        <div role="button" className="navbar-burger" aria-label="menu" aria-expanded="false">
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </div>        
      </div>
      
      <div className="navbar-menu">

        <div className="navbar-item navbar-end has-dropdown is-hoverable">
          
          { !session.user ? (
            <div className="navbar-item">
              <div className="buttons">
                <a className="button is-info" href="/register"><strong>Register</strong></a>
                <a className="button is-light" href="/login">Log in</a>
              </div>
            </div>
          ) : (
            <>
              <span className="navbar-link"> {session.user.displayName} </span>

              <div className="navbar-dropdown is-right">
                <a className="navbar-item" href="/pwdchange">Změna hesla</a>
                <hr className="navbar-divider" />
                <a className="navbar-item" href="/" onClick={logout}>Logout</a>
              </div>
            </>
          )}

        </div>
      </div>

    </nav>
  );
}

export default Header;
