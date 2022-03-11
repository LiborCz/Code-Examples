import React, { useContext } from "react";

import SessionContext from "../../context/SessionContext";

import MapSet from "./MapSet";

function MapOverlay({setCoords}) {

  const {mapSetState, setMapSetState} = useContext(SessionContext);

  return (
    <div className="map-overlay" style={{display:mapSetState}}>
      <div className="map"><MapSet setMapSetState={setMapSetState} setCoords={setCoords}/></div>
    </div>
  );
}

export default MapOverlay;
