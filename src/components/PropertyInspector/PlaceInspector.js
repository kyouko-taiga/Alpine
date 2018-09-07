import React from 'react'
import { connect } from 'react-redux'

import * as actions from '../../actions'
import { setProperty } from '../../utils'

import Stepper from './Stepper'

const PlaceInspector = (props) => (
  <div>
    <div className="alpine-title">
      { 'Identity and Positioning' }
    </div>
    <div className="alpine-control-group">
      <label htmlFor="place-name">
        { 'Name' }
      </label>
      <input
        id="place-name"
        className="alpine-control-input"
        value={ props.place.name }
        onChange={ (e) => props.onChange('name', e.target.value) }
      />
    </div>
    <div className="alpine-control-group">
      <label htmlFor="place-coords-x">
        { 'Position' }
      </label>
      <div className="alpine-control-input">
        <div className="alpine-coords">
          <input
            id="place-coords-x"
            value={ props.place.coords.x }
            onChange={ (e) => props.onChange('coords.x', parseInt(e.target.value)) }
          />
          <Stepper
            onUp={ (e) => props.onChange('coords.x', props.place.coords.x + 1) }
            onDown={ (e) => props.onChange('coords.x', props.place.coords.x - 1) }
          />
          <input
            id="place-coords-y"
            value={ props.place.coords.y }
            onChange={ (e) => props.onChange('coords.y', parseInt(e.target.value)) }
          />
          <Stepper
            onUp={ (e) => props.onChange('coords.y', props.place.coords.y + 1) }
            onDown={ (e) => props.onChange('coords.y', props.place.coords.y - 1) }
          />
        </div>
      </div>
    </div>

    <div className="alpine-divider" />

    <div className="alpine-title">
      { 'Marking' }
    </div>
    <div className="alpine-control-group">
      <textarea
        rows={ 8 }
        className="alpine-code"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        value={ props.place.marking }
        onChange={ (e) => props.onChange('marking', e.target.value) }
      />
    </div>

    <div className="alpine-divider" />
  </div>
)

const mapDispatchToProps = (dispatch) => ({
  onChange(place, property, value) {
    const updated = setProperty(place, property, value, true)
    dispatch(actions.graph.updateNode(place.id, updated))
  },
})

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  return {
  ...ownProps,
  ...stateProps,
  onChange: (...args) => dispatchProps.onChange(ownProps.place, ...args),
}}

export default connect(null, mapDispatchToProps, mergeProps)(PlaceInspector)
