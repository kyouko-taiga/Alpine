import React from 'react'
import { connect } from 'react-redux'

import * as actions from '../../actions'
import { setProperty } from '../../utils'

import Stepper from './Stepper'

const TransitionInspector = (props) => (
  <div>
    <div className="alpine-title">
      { 'Identity and Positioning' }
    </div>
    <div className="alpine-control-group">
      <label htmlFor="transition-name">
        { 'Name' }
      </label>
      <input
        id="transition-name"
        className="alpine-control-input"
        value={ props.transition.name }
        onChange={ (e) => props.onChange('name', e.target.value) }
      />
    </div>
    <div className="alpine-control-group">
      <label htmlFor="transition-coords-x">
        { 'Position' }
      </label>
      <div className="alpine-control-input">
        <div className="alpine-coords">
          <input
            id="transition-coords-x"
            value={ props.transition.coords.x }
            onChange={ (e) => props.onChange('coords.x', parseInt(e.target.value)) }
          />
          <Stepper
            onUp={ (e) => props.onChange('coords.x', props.transition.coords.x + 1) }
            onDown={ (e) => props.onChange('coords.x', props.transition.coords.x - 1) }
          />
          <input
            id="transition-coords-y"
            value={ props.transition.coords.y }
            onChange={ (e) => props.onChange('coords.y', parseInt(e.target.value)) }
          />
          <Stepper
            onUp={ (e) => props.onChange('coords.y', props.transition.coords.y + 1) }
            onDown={ (e) => props.onChange('coords.y', props.transition.coords.y - 1) }
          />
        </div>
      </div>
    </div>

    <div className="alpine-divider" />

    <div className="alpine-title">
      { 'Guard' }
    </div>
    <div className="alpine-control-group">
      <textarea
        rows={ 4 }
        className="alpine-code"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        value={ props.transition.guard }
        onChange={ (e) => props.onChange('guard', e.target.value) }
      />
    </div>

    <div className="alpine-divider" />
  </div>
)

const mapDispatchToProps = (dispatch) => ({
  onChange(transition, property, value) {
    const updated = setProperty(transition, property, value, true)
    dispatch(actions.graph.updateNode(transition.id, updated))
  },
})

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  return {
  ...ownProps,
  ...stateProps,
  onChange: (...args) => dispatchProps.onChange(ownProps.transition, ...args),
}}

export default connect(null, mapDispatchToProps, mergeProps)(TransitionInspector)
