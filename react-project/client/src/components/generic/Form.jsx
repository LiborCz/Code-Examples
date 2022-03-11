import React, { useState, useContext } from "react";

import SessionContext from "../../context/SessionContext";

import mapIcon from '../../img/map-point-50.png';

export const Input = ({name, label, placeholder, onChange, value, isInline, hasError}) => {

  const errClass = (hasError!==undefined)?"is-danger":"";

  return (
  <div className="field is-horizontal">
    <div className="field-label is-normal">
      <label className="label">{label}</label>
    </div>

    <div className="field-body">
      <div className="field">
        <div className="control">
          <input type="text" name={name} className={`input ${errClass}`} placeholder={placeholder} onChange={onChange} value={value} />
        </div>
        {hasError && (<p className="help is-danger">This field is required</p>)}
      </div>
    </div>
  </div>     
)}



export const Textarea = ({name, label, placeholder, onChange, value, isInline, hasError}) => {
  
  const errClass = (hasError!==undefined)?"is-danger":"";

return (
  <div className="field">
    <label className="label">{label}</label>
    <div className="control">
      <textarea name={name} className={`textarea ${errClass}`} placeholder={placeholder} onChange={onChange} value={value}></textarea>
    </div>
    {hasError && (<p className="help is-danger">This field is required</p>)}
  </div>
)}

export const FileInput = ({name, label, placeholder, onChange, value, isInline, hasError}) => {
  
  const errClass = (hasError!==undefined)?"is-danger":"";

return (
<div className="field">
  <label className="file-label">
    <input className="file-input" type="file" name="resume" />
    <span className="file-cta">
      <span className="file-icon"><i className="fa fa-upload"></i></span>
      <span className="file-label">Choose a file…</span>
    </span>
    <span className="file-name"></span>
  </label>
</div>
)}


export const MapInput = ({name, label, placeholder, setForm, isInline, hasError}) => {
  
  const { setMapSetState, mapSetCoords } = useContext(SessionContext);
  const errClass = (hasError!==undefined)?"is-danger":"";

  const onBtnClick = () => setMapSetState("block");

  return (
    <div className="field">
      <label className="field-label">
        <input className="file-input" type="button" name={name} onClick={onBtnClick}/>
        <span className="file-cta">
          <span className="btn-icon"><i className="fa fa-map-marker"></i></span>
          <span>Choose on the Map</span>
        </span>
        <span className="field-input map-symb">
          <img className={`map-symb-img ${mapSetCoords!=undefined?"":"grey"}`} src={mapIcon} />
        </span>
      </label>
    </div>
  )
}


export default Input;

   
