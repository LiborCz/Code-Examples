import React, {useState} from "react";
import axios from 'axios';

function TestBE() {

  const[msg, setMsg] = useState("");  
  
  var onSubmit = (event) => {
    event.preventDefault();

    axios.post( '/api/user/test', { msg })
    .then( response => { console.log(response) })
    .catch((err) => { 
      console.log("Oops, request failed!");
      console.log(err);
    })
  }

  return (
    <form onSubmit={onSubmit}>
      <input type="text" value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Message"/>
      <input type="submit" value="Submit"/>
    </form>
  );
}

export default TestBE;
