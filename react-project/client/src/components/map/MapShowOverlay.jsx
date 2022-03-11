import React, { useContext } from "react";

import SessionContext from "../../context/SessionContext";

import MapShow from "./MapShow";

function MapOverlay() {

  const {mapShowState} = useContext(SessionContext);

  return (
    <div className="map-overlay" style={{display:mapShowState}}>
      <div className="map"><MapShow /></div>
    </div>
  );
}

export default MapOverlay;
