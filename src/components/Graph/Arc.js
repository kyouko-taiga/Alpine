import React from 'react'
import { connect } from 'react-redux'

import * as actions from '../../actions'
import ArcLabel from './ArcLabel'
import {
  arcStyle,
  placeNodeDescription,
  transitionNodeDescription,
} from './constants'

const placeRadius      = placeNodeDescription.width / 2
const transitionRadius = transitionNodeDescription.width / 1.5

const Arc = (props) => {
  // Create the arc path.
  let points = []

  // Get the coordinates of the first pair of points.
  const p0 = props.source.coords
  const p1 = props.handles.length > 0 ? props.handles[0] : props.target.coords

  // Compute the position of the first point.
  const a1 = Math.atan2(p1.x - p0.x, p1.y - p0.y)
  const l1 = (props.source.type == 'place' ? placeRadius : transitionRadius) + 3
  points.push({ x: p0.x + Math.sin(a1) * l1, y: p0.y + Math.cos(a1) * l1 })

  // Append the coordinates of each handle.
  points = points.concat(props.handles)

  // If the target is defined, compute the position of the last point.
  if (props.target !== null) {
    // Get the coordinates of the last pair of points.
    const q0 = points[points.length - 1]
    const q1 = props.target.coords

    // Compute the position of the last point
    const b1 = Math.atan2(q1.x - q0.x, q1.y - q0.y)
    const k1 = (props.target.type == 'place' ? placeRadius : transitionRadius) + 3
    points.push({ x: q1.x - Math.sin(b1) * k1, y: q1.y - Math.cos(b1) * k1 })
  }

  // Build the SVG path string of the arc.
  const d = `M${points[0].x},${points[0].y}` + points.slice(1).map((p) => `L${p.x},${p.y}`)

  // Compute the position of the handle(s).
  const handles = []
  for (let i = 0; i < points.length - 1; ++i) {
    const dx = Math.abs(points[i].x - points[i + 1].x)
    const dy = Math.abs(points[i].y - points[i + 1].y)
    handles.push({ x: points[i].x + dx / 2, y: points[i].y + dy / 2 })
  }

  // Notice that we draw a thick white line under the arc, so as to catch click events even if they
  // are not *exactly* on the arc.
  return (
    <g onClick={ props.onClick }>
      <path fill="none" stroke="white" strokeWidth={ 15 } d={ d } />
      <path
        { ...arcStyle }
        d={ d }
        markerEnd="url(#end-arrow)"
        filter={ props.selected ? 'url(#alpine-glow-filter)' : null }
      />
      <ArcLabel
        { ...props.label }
        arcID={ props.id }
        selected={ props.selected }
        draggable={ props.selected }
        onDrag={ (e) => console.log(e) }
      />
      { handles.map(({ x, y }, i) => <circ key={ i } r={ 10 } cx={ x } cy={ y } />) }
    </g>
  )
}

const mapStateToProps = (state) => ({
  nodes      : state.nodes,
  selectedArc: state.graph.selectedArc,
})

const mapDispatchToProps = (dispatch) => ({
  onClick: (arcID) => dispatch(actions.graph.selectArc(arcID)),
})

const mergeProps = (stateProps, dispatchProps, ownProps) => ({
  ...ownProps,
  selected: stateProps.selectedArc == ownProps.id,
  source  : stateProps.nodes[ownProps.sourceID],
  target  : ownProps.targetID ? stateProps.nodes[ownProps.targetID] : null,
  onClick : () => dispatchProps.onClick(ownProps.id),
})

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(Arc)
