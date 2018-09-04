import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'

import * as actions from '../../actions'
import { editionTools } from '../../constants'
import { guid } from '../../utils'
import Arc from './Arc'
import ContextMenu from './ContextMenu'
import GlowFilter from './GlowFilter'
import node from './node'
import {
  placeNodeDescription,
  transitionNodeDescription,
  uiStates,
} from './constants'

const Place = node(placeNodeDescription)
const Transition = node(transitionNodeDescription)

let placeCounter = 0
let transitionCounter = 0

class Graph extends React.Component {

  componentDidMount() {
    this.pt = this.svg.createSVGPoint()
    this.keyListener = window.addEventListener('keypress', ::this.handleKeyPress)
  }

  componentWillUnmount() {
    if (this.keyListener) {
      window.removeEventListener('keypress', this.keyListener)
    }
  }

  render() {
    // Nodes are only draggable if the editor is in edit mode, and the selected tool is the cursor.
    const { nodes, arcs, uiState, editionTool } = this.props
    const draggable = (uiState.name == uiStates.EDIT) && (editionTool == editionTools.CURSOR)

    return (
      <div>
        <ContextMenu />
        <svg
          className   = "alpine-graph"
          ref         = { (el) => this.svg = el }
          onMouseDown = { ::this.handleMouseDown }
          onMouseMove = { ::this.handleMouseMove }
          onMouseUp   = { ::this.handleMouseUp }
        >
          <marker
            id           = "end-arrow"
            viewBox      = "0 -10 20 20"
            refX         = "18"
            markerWidth  = "6"
            markerHeight = "6"
            orient       = "auto"
          >
            <path d="M0,-10L20,0L0,10" fill="#000" />
          </marker>
          <defs>
            <GlowFilter />
          </defs>
          {
            Object.values(arcs).map((arc) => (
              <Arc key={ arc.id } { ...arc } />
            ))
          }
          {
            Object.values(nodes).map((node) => (
              node.type == 'place'
                ? <Place      key={ node.id } draggable={ draggable } { ...node } />
                : <Transition key={ node.id } draggable={ draggable } { ...node } />
            ))
          }
        </svg>
      </div>
    )
  }

  handleMouseDown(e) {
    const { uiState, editionTool } = this.props

    // Check `EDIT` mode ...
    if (uiState.name == uiStates.EDIT) {
      // Compute the relative position of the cursor.
      this.pt.x = e.clientX
      this.pt.y = e.clientY
      const cursor = this.pt.matrixTransform(this.svg.getScreenCTM().inverse())

      switch (editionTool) {
      // If the selected edition tool is the place, create a place at the cursor position.
      case editionTools.PLACE:
        {
          // Create the new place.
          const nodeID = guid()
          this.props.createNode(nodeID, {
            id    : nodeID,
            type  : 'place',
            name  : `p${placeCounter++}`,
            coords: { x: cursor.x, y: cursor.y },
          })
        }
        break

      // If the selected edition tool is the transition, create a place at the cursor position.
      case editionTools.TRANSITION:
        {
          // Create the new place.
          const nodeID = guid()
          this.props.createNode(nodeID, {
            id    : nodeID,
            type  : 'transision',
            name  : `t${transitionCounter++}`,
            coords: { x: cursor.x, y: cursor.y },
          })
        }
        break

      // If the selected edition tool is the arc, start an arc creation event.
      //
      // About the arc creation process:
      // We use a data attribute (`data-id`) on the nodes to determine the source and target of new
      // arcs. Although this may seem not so "reacty", it lets this component encapsulate the logic
      // of arc creation, while other approaches would require complex event registration or a
      // heavy use of the Redux store, for the sole purpose of identifying what's under the cursor.
      // The problem is of course that children cannot listen to events on their siblings directly.
      case editionTools.ARC:
        {
          // Identify the source node (if any).
          const source = this.props.nodes[e.target.dataset.id]
          if (typeof source === 'undefined') { break }

          // Create the new arc.
          const arcID = guid()
          this.props.createArc (arcID, source.id, null, [cursor])
          this.props.setUIState(uiStates.CREATE_ARC, { arcID, sourceType: source.type })
        }
        break
      }
    }
  }

  handleMouseMove(e) {
    // Compute the relative position of the cursor.
    this.pt.x = e.clientX
    this.pt.y = e.clientY
    const cursor = this.pt.matrixTransform(this.svg.getScreenCTM().inverse())

    // Update the store with the cursor coordinates.
    // this.props.onMouseMove(cursor)

    const { uiState } = this.props

    // In `CREATE_ARC` state, we should update the position of the arc target/handle.
    if (uiState.name == uiStates.CREATE_ARC) {
      // If the cursor hovers a compatible target, is it as last coordinates, otherwise use the
      // current cursor position.
      const target = this.props.nodes[e.target.dataset.id]
      if ((typeof target !== 'undefined') && (target.type != uiState.args.sourceType)) {
        this.props.updateArc(this.props.uiState.args.arcID, {
          targetID: target.id,
          handles : [],
        })
      } else {
        this.props.updateArc(this.props.uiState.args.arcID, {
          targetID: null,
          handles : [ cursor ],
        })
      }
    }

    // Call the drag listeners.
    this.props.dragListeners.forEach((fn) => fn(e))
  }

  handleMouseUp(e) {
    // In `CREATE_ARC` mode, we should end the arc creation event.
    if (this.props.uiState.name == uiStates.CREATE_ARC) {
      // Remove the new arc if it doesn't point on a valid target.
      const arc = this.props.arcs[this.props.uiState.args.arcID]
      if (arc.targetID === null) {
        this.props.removeArc(arc.id)
      }

      // Exit the `CREATE_ARC` mode.
      this.props.setUIState(uiStates.EDIT, null)
    }
  }

  handleKeyPress(e) {
    if (e.key === 'Backspace') {
      if (this.props.selectedNode !== null) {
        this.props.removeNode(this.props.selectedNode)
      } else if (this.props.selectedArc !== null) {
        this.props.removeArc(this.props.selectedArc)
      }
    }
  }

}

const mapStateToProps = (state) => ({
  nodes        : state.nodes,
  arcs         : state.arcs,
  selectedNode : state.graph.selectedNode,
  selectedArc  : state.graph.selectedArc,
  editionTool  : state.editor.editionTool,
  uiState      : state.graph.uiState,
  dragListeners: state.graph.dragListeners,
})

const mapDispatchToProps = (dispatch) => ({
  // onMouseMove: (coords)     => dispatch(actions.graph.moveMouse(coords)),
  setUIState: (name, args)  => dispatch(actions.graph.setUIState(name, args)),
  createNode: (id, data)    => dispatch(actions.graph.createNode(id, data)),
  removeNode: (id)          => dispatch(actions.graph.removeNode(id)),
  createArc : (...args)     => dispatch(actions.graph.createArc(...args)),
  updateArc : (id, updates) => dispatch(actions.graph.updateArc(id, updates)),
  removeArc : (id)          => dispatch(actions.graph.removeArc(id)),
})

export default connect(mapStateToProps, mapDispatchToProps)(Graph)
