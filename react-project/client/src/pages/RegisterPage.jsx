import React, { useContext, useState } from "react";
import axios from "axios";
import { useHistory } from 'react-router-dom';

import SessionContext from '../context/SessionContext';

const RegisterPage = () => {

  const {setSession} = useContext(SessionContext);

  const iRegState = { dName:"", email:"", password:"", password2:"", errMessage:"", isSubmitting:false };

  const [formData, setFormData] = useState(iRegState);
  const history = useHistory();  

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value, errMessage: "" });
  };

  const onSubmit = async e => {
    e.preventDefault();

    // Password2 = passwordCheck has been tested here, but is also checked in BE
    // Can be modified later
    if(formData.password!==formData.password2) {
      setFormData({ ...formData, errMessage: "Hesla se neshodují !" });
      return;
    }

    setFormData({ ...formData, isSubmitting: true, errMessage: null });

    try {
      const res = await axios.post("/api/users/register", {
        email: formData.email, 
        displayName: formData.dName, 
        password: formData.password,
        passwordCheck: formData.password2
      })

      setFormData({ ...formData, isSubmitting:false });

      if(res.data.ok) {
        setSession({ token:res.data.token, user:res.data.user });
        localStorage.setItem("auth-token", res.data.token);
        alert(res.data.msg);
        history.push("/");
      }
      else {
        setFormData({ ...formData, errMessage: res.data.msg });
        // console.log(res.data)
      }
    }

    catch(err) { 
      setFormData({ ...formData, isSubmitting: false, errMessage: err.statusText });
    }

  };

  return (
    <div className="register section">
      <div className="container is-fluid">
        <div className="box">
          <form onSubmit={onSubmit}>

            {/* Display Name */}
            <div className="field">
              <label className="label">Oslovení / Přezdívka</label>
              <div className="control">
                <input className="input" type="text" name="dName" onChange={onChange} value={formData.dName} />
              </div>
            </div>
            
            {/* Email */}
            <div className="field">
              <label className="label">Emailová adresa</label>
              <div className="control has-icons-left">
                <input className="input" type="email" name="email" onChange={onChange} value={formData.email} required />
                <span className="icon is-small is-left"><i className="fa fa-envelope"></i></span>
              </div>
            </div>

            {/* Password */}
            <div className="field">
              <label className="label">Heslo</label>
              <div className="control has-icons-left">
                <input className="input" type="password" name="password" onChange={onChange} value={formData.password} required />
                <span className="icon is-small is-left"><i className="fa fa-lock"></i></span>
              </div>
            </div>

            {/* PasswordConfirmation */}
            <div className="field">
              <label className="label">Potvrzení hesla</label>
              <div className="control has-icons-left">
                <input id="passwordConf" className="input" type="password" name="password2" onChange={onChange} value={formData.password2} required />
                <span className="icon is-small is-left"><i className="fa fa-lock"></i></span>
              </div>
            </div>

            <div className="error has-text-danger has-text-weight-bold is-paddingless">
              {formData.errMessage}
            </div>

            <button type="submit" className="button is-info is-pulled-right" disabled={formData.isSubmitting} >
              Registrovat
            </button>
          </form>

          <div className="block">
            <a href="/login" className="button is-white">{"<"} Zpět na Login stránku</a>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
