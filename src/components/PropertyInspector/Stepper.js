import React from 'react'

const Stepper = (props) => (
  <div className="alpine-stepper">
    <div onClick={ props.onUp }>{ '▲' }</div>
    <div onClick={ props.onDown }>{ '▼' }</div>
  </div>
)

export default Stepper
