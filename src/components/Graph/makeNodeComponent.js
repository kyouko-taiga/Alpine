import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'

import * as actions from '../../actions'
import draggable from './draggable'

export default (options) => {

  let   GraphicComponent = null
  const graphicStyle     = options.style || {}
  const width            = options.width || 50

  switch (options.shape) {
  case 'square':
    GraphicComponent    = draggable('rect')
    graphicStyle.width  = width
    graphicStyle.height = width
    graphicStyle.x      = width / -2
    graphicStyle.y      = width / -2
    break

  case 'circle':
  default:
    GraphicComponent = draggable('circle')
    graphicStyle.r   = width / 2
    break
  }

  const textStyle = {
    alignmentBaseline: "central",
    dx               : width * 0.75,
    dy               : width * -0.75,
  }

  const NodeComponent = (props) => (
    <g
      transform = { `translate(${props.coords.x}, ${props.coords.y})` }
      onClick   = { props.onSelect }
    >
      <GraphicComponent
        { ...graphicStyle }
        data-id   = { props.id }
        draggable = { props.draggable }
        onDrag    = { props.onDrag }
      />
      <text { ...textStyle }>
        { props.name }
      </text>
    </g>
  )

  const mapDispatchToProps = (dispatch) => ({
    onDrag      : (id, e, delta) => dispatch(actions.graph.moveNode(id, delta[0], delta[1])),
    onMouseEnter: (id)           => dispatch(actions.graph.enterNode(id)),
  })

  const mergeProps = (stateProps, dispatchProps, ownProps) => ({
    ...ownProps,
    onDrag      : (e, delta) => dispatchProps.onDrag(ownProps.id, e, delta),
    onSelect    : () => {},
  })

  return connect(null, mapDispatchToProps, mergeProps)(NodeComponent)

}
