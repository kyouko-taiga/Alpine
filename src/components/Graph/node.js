import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'

import * as actions from '../../actions'
import draggable from './draggable'

export default (options) => {

  const graphicStyle = options.style || {}
  const width = options.width || 50

  let Graphics
  switch (options.shape) {
  case 'square':
    Graphics = draggable('rect')
    graphicStyle.width  = width
    graphicStyle.height = width
    graphicStyle.x      = width / -2
    graphicStyle.y      = width / -2
    break

  case 'circle':
  default:
    Graphics = draggable('circle')
    graphicStyle.r = width / 2
    break
  }

  const textStyle = {
    alignmentBaseline: "central",
    dx: width * 0.75,
    dy: width * -0.75,
  }

  const NodeComponent = (props) => (
    <g
      transform={ `translate(${props.coords.x}, ${props.coords.y})` }
      onClick={ props.onSelect }
    >
      <Graphics
        { ...graphicStyle }
        data-id={ props.id }
        draggable={ props.draggable }
        onDrag={ props.onDrag }
        onMouseUp={ (e) => (e.button == 2) && props.onContextMenu() }
        filter={ props.selected ? 'url(#alpine-glow-filter)' : null }
      />
      <text { ...textStyle }>
        { props.name }
      </text>
    </g>
  )

  const mapStateToProps = (state) => ({
    selectedNode: state.graph.selectedNode,
  })

  const mapDispatchToProps = (dispatch) => ({
    onDrag: (id, e, delta) => dispatch(actions.graph.moveNode(id, delta[0], delta[1])),
    onSelect: (id) => dispatch(actions.graph.selectNode(id)),
  })

  const mergeProps = (stateProps, dispatchProps, ownProps) => ({
    ...ownProps,
    selected: stateProps.selectedNode == ownProps.id,
    onDrag: (e, delta) => dispatchProps.onDrag(ownProps.id, e, delta),
    onSelect: () => dispatchProps.onSelect(ownProps.id),
  })

  return connect(mapStateToProps, mapDispatchToProps, mergeProps)(NodeComponent)

}
