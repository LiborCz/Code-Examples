import React from 'react'

import usePlacesAutoComplete, {getGeocode, getLatLng} from "use-places-autocomplete";
import { Combobox, ComboboxInput, ComboboxPopover, ComboboxList, ComboboxOption} from "@reach/combobox";
import "@reach/combobox/styles.css";

import mapDefaults from './mapDefaults';

import geoIcon from '../../img/geolocate.png';
import { ConnectionStates } from 'mongoose';


const Search = ({ panTo }) => {

  const { ready, value,  suggestions:{status, data}, setValue, clearSuggestions } = 
  usePlacesAutoComplete({
    requestOptions: { 
      location: { lat: () => mapDefaults.center.lat,  lng: () => mapDefaults.center.lng },
      radius: 200 * 1000
    }
  });

  const handleInput = (e) => {
    setValue(e.target.value);
    console.log(status);
    console.log(data);
  };

  const handleSelect = async (address) => {
    setValue(address, false);
    clearSuggestions();

    try {
      const results = await getGeocode({ address });
      const { lat, lng } = await getLatLng(results[0]);
      panTo({ lat, lng });
    } catch (error) {
      console.log("😱 Error: ", error);
    }
  };

  return <div className="searchbox">
    <Combobox onSelect={handleSelect}>

      <ComboboxInput 
        value={value} 
        onChange={handleInput} 
        disabled={!ready} 
        placeholder="Enter an address"
      />

      <ComboboxPopover>
        <ComboboxList>
          {status==="OK" && data.map( ({place_id, description}) => 
            <ComboboxOption key={place_id} value={description} />
          )}
        </ComboboxList>
      </ComboboxPopover>

    </Combobox>
  </div>
}

export const Locate = ({ panTo }) => {

  return <button className="locate" onClick={() => {
    navigator.geolocation.getCurrentPosition((position) => {
      panTo({lat:position.coords.latitude, lng:position.coords.longitude});
    }, () => null );
  }}>
    <img src={geoIcon} />
  </button>
}


export default Search
