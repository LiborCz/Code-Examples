import React, {useState, useCallback, useRef, useContext} from 'react'

import { GoogleMap, useLoadScript, Marker, InfoWindow } from "@react-google-maps/api";
import { formatRelative } from "date-fns";

import SessionContext from '../../context/SessionContext';

import Loader from './Loader'
import Search, {Locate} from './Search'
// import LocationMarker from './LocationMarker'
// import LocationInfoBox from './LocationInfoBox'

import mapDefaults from './mapDefaults';

const libraries = ["places"];

export const Map = ({setMapSetState, setCoords}) => {

  const { mapSetCoords, setMapSetCoords } = useContext(SessionContext);

  const onOkClick = () => { 
    setMapSetState("none");
    let arrMarker = [markers[0].lng, markers[0].lat];
    console.log("markers: ", arrMarker);
    if(markers.length>0)  setMapSetCoords(arrMarker);
  }

  const onClearClick = () => {
    setMapSetCoords([]);
    setMarkers([]);
  }

  const onCancelClick = () => setMapSetState("none");

  const [markers, setMarkers]  = useState([]);

  const mapRef = useRef();
  const onMapLoad = useCallback(map => (mapRef.current = map), []);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GCP_MAPS_API,
    libraries
  });

  const onMapClick = useCallback((e) => {
    setMarkers(() => [{ lng: e.latLng.lng(), lat: e.latLng.lat(), time: new Date() }]);
  }, []);

  const panTo = React.useCallback(({lat, lng}) => {
    mapRef.current.panTo({lat, lng});
    mapRef.current.setZoom(14);
  }, []);  

  if(loadError) return "Load Error";
  if(!isLoaded) return <Loader />;

  return <div>
    
    <h2 className="map-title">Select Map</h2>

    <Search panTo={panTo} />

    <div className="dialog-button-wrapper">
      <button className="map-button" onClick={onOkClick}>OK - Set</button>
      <button className="map-button" onClick={onClearClick}>Clear</button>
      <button className="map-button" onClick={onCancelClick}>Cancel</button>
    </div>
    
    <Locate panTo={panTo} />

    <GoogleMap
      mapContainerClassName={mapDefaults.mapContainerClassName} 
      mapContainerStyle={mapDefaults.containerStyle} 
      zoom={8} center={mapDefaults.center}
      options={mapDefaults.options}
      onClick={onMapClick}
      onLoad={onMapLoad}
      >
        {markers.map(marker => 
        <Marker 
          key={marker.time.toISOString()} 
          position = {{lat:marker.lat, lng:marker.lng}}
          />)}
      </GoogleMap>

  </div>
}

export default Map;