import React from 'react'
import { connect } from 'react-redux'

import * as actions from '../../actions'
import draggable from './draggable'

const Text = draggable('text')

const ArcLabel = (props) => {
  const labelStyle = {
    alignmentBaseline: "central",
    fill: props.selected ? 'rgb(61,145,254)': 'black',
    dx: props.coords.x,
    dy: props.coords.y,
  }
  console.log(props)

  return (
    <Text
      { ...labelStyle }
      onDrag={
        (e, delta) => props.onUpdate(
          props.arcID,
          { ...props, coords: { x: props.coords.x + delta[0], y: props.coords.y + delta[1] } })
      }
    >
      { props.value }
    </Text>
  )
}

const mapDispatchToProps = (dispatch) => ({
  onUpdate: (arcID, label) => dispatch(actions.graph.updateArc(arcID, { label })),
})

export default connect(null, mapDispatchToProps)(ArcLabel)
