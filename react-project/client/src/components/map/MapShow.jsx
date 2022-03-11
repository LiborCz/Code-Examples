import React, {useState, useCallback, useRef, useEffect, useContext} from 'react'
import SessionContext from '../../context/SessionContext'

import { GoogleMap, useLoadScript, Marker, InfoWindow } from "@react-google-maps/api";
import { formatRelative } from "date-fns";
import axios from 'axios';

import Loader from './Loader'
import Search, {Locate} from './Search'
// import LocationMarker from './LocationMarker'
// import LocationInfoBox from './LocationInfoBox'

import mapDefaults from './mapDefaults';

const libraries = ["places"];

export const Map = () => {

  const { items } = useContext(SessionContext);

  const [itemSel, setItemSel] = useState(null);

  const mapRef = useRef();
  const onMapLoad = useCallback(map => (mapRef.current = map), []);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GCP_MAPS_API,
    libraries
  });

  const onMapClick = useCallback((e) => {
    // setItems(current => {
    //   console.log(current);
    //   return [...current, { lat: e.latLng.lat(), lng: e.latLng.lng(), time: new Date() }]
    // });
  }, []);

  const panTo = React.useCallback(({lat, lng}) => {
    mapRef.current.panTo({lat, lng});
    mapRef.current.setZoom(14);
  }, []);

  if(loadError) return "Load Error";
  if(!isLoaded) return <Loader />;

  return <div>

    <h2 className="map-title">Show Map</h2>

    <Search panTo={panTo} />
    <Locate panTo={panTo} />

    <GoogleMap
      mapContainerClassName={mapDefaults.mapContainerClassName} 
      mapContainerStyle={mapDefaults.containerStyle} 
      zoom={8} center={mapDefaults.center}
      options={mapDefaults.options}
      onClick={onMapClick}
      onLoad={onMapLoad}
      >
        {items.map((item, index) => {
          if (item.location.type=="Point") 
            return (<Marker key={index}
            position = {{lng:item.location.coords[0], lat:item.location.coords[1]}}
            onClick = {() => setItemSel(item)}
            />)
        })}
        
        {/* {itemSel ? <InfoWindow 
          position={{lat:itemSel.lat, lng:itemSel.lng}}
          onCloseClick={() => setItemSel(null)}><div>
            <h2>Marker placed</h2>
            <p>Placed {formatRelative(itemSel.time, new Date())}</p>
          </div>
          </InfoWindow> : null} */}
      </GoogleMap>
  </div>
}

export default Map;