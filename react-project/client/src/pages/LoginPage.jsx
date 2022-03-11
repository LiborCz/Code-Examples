import React, { useContext } from "react";
import { useHistory } from 'react-router-dom';

import SessionContext from '../context/SessionContext';

import axios from 'axios'

function LoginPage() {

  const initLogin = { email:"",  password:"", isSubmitting:false, errorMessage:null };

  const [formData, setFormData] = React.useState(initLogin);

  const {setSession} = useContext(SessionContext);  

  const history = useHistory();

  const hOnChange = e => {
      setFormData({...formData, [e.target.name]: e.target.value, errorMessage: ""});
  };
  
  const hOnSubmit = async e => {
    e.preventDefault();

    setFormData({ ...formData, isSubmitting: true, errorMessage: null });

    try {

      const res = await axios.post("/api/users/login", { email: formData.email, password: formData.password });

      setFormData({ ...formData, isSubmitting: false });

      if (res.data.ok) {
        setSession({ token:res.data.token, user:res.data.user });
        localStorage.setItem("auth-token", res.data.token);
        history.push('/');
      }
      else setFormData({ ...formData, errorMessage: res.data.msg });
    }

    catch (err) { 
      console.log("error:", err);
      setFormData({ ...formData, isSubmitting:false, errorMessage: err.msg });
    }
  };  

  return (
    <div className="login section">
      <div className="container is-fluid">
        <div className="box">
          <div className="block">

            <form onSubmit={hOnSubmit}>

              <div className="field">
                <label className="label">Emailová Adresa</label>
                <div className="control">
                  <input className="input" type="email" name="email" onChange={hOnChange} value={formData.email} required />
                </div>
              </div>

              <div className="field">
                <label className="label">Heslo</label>
                <div className="control">
                  <input className="input" type="password" name="password" onChange={hOnChange} value={formData.password} required />
                </div>
              </div>

              <div className="notification has-text-danger has-text-weight-bold is-paddingless has-text-centered">
                {formData.errorMessage}
              </div>

              <button type="submit" className="button is-info is-pulled-right" disabled={formData.isSubmitting} >
                Login
              </button>

            </form>

          </div>

          <div className="block">
            <a href="/register" className="button is-white">Registrace</a>
            <a href="/pwdlost" className="button is-white">Zapomenuté heslo</a>
          </div>

        </div>
      </div>
    </div>
  );
}

export default LoginPage;
