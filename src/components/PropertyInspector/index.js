import React from 'react'
import { connect } from 'react-redux'

import ArcInspector from './ArcInspector'
import PlaceInspector from './PlaceInspector'
import TransitionInspector from './TransitionInspector'

const PropertyInspector = ({ node, arc }) => (
  <div className="alpine-property-inspector">
    { node && (
      (node.type === 'place') && <PlaceInspector place={ node } /> ||
      (node.type === 'transition') && <TransitionInspector transition={ node } />
    ) }
    { arc && <ArcInspector arc={ arc } /> }
  </div>
)

const mapStateToProps = (state) => ({
  node: state.nodes[state.graph.selectedNode] || null,
  arc : state.arcs[state.graph.selectedArc] || null,
})

export default connect(mapStateToProps)(PropertyInspector)
