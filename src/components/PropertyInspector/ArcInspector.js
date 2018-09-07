import React from 'react'
import { connect } from 'react-redux'

import * as actions from '../../actions'
import { setProperty } from '../../utils'

import PositionControl from './PositionControl'
import Stepper from './Stepper'

const Handle = (props) => (
  <div className="alpine-handle">
    <input
      value={ props.x }
      onChange={ (e) => props.onChange(parseInt(e.target.value), props.y) }
    />
    <Stepper
    onUp={ (e) => props.onChange(props.x + 1, props.y) }
    onDown={ (e) => props.onChange(props.x - 1, props.y) }
    />
    <input
      value={ props.y }
      onChange={ (e) => props.onChange(props.x, parseInt(e.target.value)) }
    />
    <Stepper
      onUp={ (e) => props.onChange(props.x, props.y + 1) }
      onDown={ (e) => props.onChange(props.x, props.y - 1) }
    />
    <div className="alpine-handle-remove" onClick={ props.onRemove }>
      <i className="fa fa-fw fa-times" />
    </div>
  </div>
)

// ---------------------------------------------------------------------------

const ArcInspector = (props) => (
  <div>
    <div className="alpine-title">
      { 'Label' }
    </div>
    <div className="alpine-control-group">
      <textarea
        rows={ 4 }
        className="alpine-code"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        value={ props.arc.label.value }
        onChange={ (e) => props.onChange('label.value', e.target.value) }
      />
    </div>
    <PositionControl
      value={ { x: props.arc.label.coords.x, y: props.arc.label.coords.y } }
      onChangeX={ (x) => props.onChange('label.coords.x', x) }
      onChangeY={ (y) => props.onChange('label.coords.y', y) }
    />

    <div className="alpine-divider" />

    <div className="alpine-title">
      { 'Handles' }
    </div>
    <div className="alpine-control-group">
      { props.arc.handles.map((handle, i) => (
        <Handle
          key={ i }
          x={ handle.x } y={ handle.y }
          onChange={ (x, y) => props.onMoveHandle(i, { x, y }) }
          onRemove={ (e) => props.onRemoveHandle(i) }
        />
      )) }
      <button
        className="alpine-handle-add"
        onClick={ props.addHandle }
      >
        <i className="fa fa-fw fa-plus" />
      </button>
    </div>
  </div>
)

const mapStateToProps = (state) => ({
  nodes: state.nodes,
})

const mapDispatchToProps = (dispatch) => ({
  onChange: (arc, property, value) => {
    const updated = setProperty(arc, property, value, true)
    dispatch(actions.graph.updateArc(arc.id, updated))
  },
  addHandle: (arc, coords) => {
    dispatch(actions.graph.addHandle(arc.id, coords))
  },
  onMoveHandle: (arc, index, coords) => {
    dispatch(actions.graph.moveHandle(arc.id, index, coords))
  },
  onRemoveHandle: (arc, index) => {
    dispatch(actions.graph.removeHandle(arc.id, index))
  },
})

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  return {
  ...ownProps,
  onChange      : (...args) => dispatchProps.onChange(ownProps.arc, ...args),
  onMoveHandle  : (...args) => dispatchProps.onMoveHandle(ownProps.arc, ...args),
  onRemoveHandle: (...args) => dispatchProps.onRemoveHandle(ownProps.arc, ...args),
  addHandle     : () => {
    const coords = {
      x: stateProps.nodes[ownProps.arc.targetID].coords.x,
      y: stateProps.nodes[ownProps.arc.sourceID].coords.y,
    }
    dispatchProps.addHandle(ownProps.arc, coords)
  },
}}

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(ArcInspector)
