import React from 'react'

import waiter from '../../img/waiter.gif';

const Loader = () => {
  return (
    <div className="loader">
      <img src={waiter} alt="Loading..." />
      <h1>Fetching data...</h1>
    </div>
  )
}

export default Loader
