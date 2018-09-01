import classnames from 'classnames'
import React from 'react'
import { connect } from 'react-redux'

import * as actions from '../actions'
import { editionTools as tools } from '../constants'

const EditionPalette = ({ activeTool, onToolChange }) => (
  <div className="alpine-palette">
    <button
      className = { classnames({ active: activeTool == tools.CURSOR }) }
      onClick   = { () => onToolChange(tools.CURSOR) }
    >
      <img src="/assets/cursor.svg" />Selection tool
    </button>
    <button
      className = { classnames({ active: activeTool == tools.PLACE }) }
      onClick   = { () => onToolChange(tools.PLACE) }
    >
      <img src="/assets/place.svg" />Place
    </button>
    <button
      className = { classnames({ active: activeTool == tools.TRANSITION }) }
      onClick   = { () => onToolChange(tools.TRANSITION) }
    >
      <img src="/assets/transition.svg" />Transition
    </button>
    <button
      className = { classnames({ active: activeTool == tools.ARC }) }
      onClick   = { () => onToolChange(tools.ARC) }
    >
      <img src="/assets/arc.svg" />Arc
    </button>
  </div>
)

const mapStateToProps    = (state)    => ({ activeTool: state.editor.editionTool })
const mapDispatchToProps = (dispatch) => ({
  onToolChange: (tool) => dispatch(actions.editor.editionPalette.changeTool(tool)),
})

export default connect(mapStateToProps, mapDispatchToProps)(EditionPalette)
