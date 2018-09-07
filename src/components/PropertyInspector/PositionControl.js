import PropTypes from 'prop-types'
import React from 'react'

import Stepper from './Stepper'

const PositionControl = (props) => (
  <div className="alpine-control-group">
    <label>
      { 'Position' }
    </label>
    <div className="alpine-control-input">
      <div className="alpine-coords">
        <input
          value={ props.value.x }
          onChange={ (e) => props.onChangeX(parseInt(e.tatget.value)) }
        />
        <Stepper
          onUp={ (e) => props.onChangeX(props.value.x + 1) }
          onDown={ (e) => props.onChangeX(props.value.x - 1) }
        />
        <input
          value={ props.value.y }
          onChange={ (e) => props.onChangeY(parseInt(e.tatget.value)) }
        />
        <Stepper
        onUp={ (e) => props.onChangeY(props.value.y + 1) }
        onDown={ (e) => props.onChangeY(props.value.y - 1) }
        />
      </div>
    </div>
  </div>
)

PositionControl.propTypes = {
  value: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
  }).isRequired,
  onChangeX: PropTypes.func.isRequired,
  onChangeY: PropTypes.func.isRequired,
}

export default PositionControl
