import * as d3      from 'd3'
import React        from 'react'
import { connect }  from 'react-redux'

import * as actions from './actions'

const PLACE_RADIUS    = 20
const TRANSITION_SIDE = 30

const MODES = {
  EDIT   : 'EDIT',
  ADD_ARC: 'ADD_ARC',
}

/// Factory that generates a conversion function for any given element and SVG context.
/// See also https://stackoverflow.com/questions/26049488
function makeAbsoluteContext(element, svg) {
  return (x, y) => {
    const offset = svg.getBoundingClientRect()
    const matrix = element.getScreenCTM()
    return {
      x: (matrix.a * x) + (matrix.c * y) + matrix.e - offset.left,
      y: (matrix.b * x) + (matrix.d * y) + matrix.f - offset.top,
    }
  }
}

/// Constructs an array of points between two nodes.
///
/// This function builds an array of points from one location to another, optionally including
/// handles in between, representing a path between them. If the source (resp. target) entity is a
/// node, the first (resp. last) point coordinates are shifted so that the path starts (resp. ends)
/// at its edge.
///
///     const source = { coord: { x: 40 , y: 40 }, type: 'place' }
///     const target = { coord: { x: 200 , y: 200 } }
///     console.log(makePath(source, target))
///     // Prints '[[48.94427190999916, 57.88854381999832], [200, 200]]'
///
/// - Parameters:
///   - s: { coord: { x: Int, y: Int }, type: String }
///     The source entity of the path.
///   - t: { coord: { x: Int, y: Int }, type: String? }
///     The target entity of the path.
///   - handles: [ { x: Int, y: Int } ]?
///     The optional handles to add between the start and end points.
function makePathPoints(s, t, handles = []) {
  // Get the coordinates of the second and penultimate point.
  const p = handles.length > 0 ? handles[0]                  : t.coord
  const q = handles.length > 0 ? handles[handles.length - 1] : s.coord

  let points = []

  // Compute the position of the first point.
  const a1 = Math.atan2(p.x - s.coord.x, p.y - s.coord.y)
  const l1 = s.type == 'place' ? PLACE_RADIUS : TRANSITION_SIDE / 1.5
  points.push([ s.coord.x + Math.sin(a1) * l1, s.coord.y + Math.cos(a1) * l1 ])

  // Append the coordinates of each handle.
  points = points.concat(handles.map((coord) => [ coord.x, coord.y ]))

  // Compute the position of the last point.
  if (typeof t.type !== 'undefined') {
    const a2 = Math.atan2(t.coord.x - q.x, t.coord.y - q.y)
    const l2 = t.type == 'place' ? PLACE_RADIUS : TRANSITION_SIDE / 1.5
    points.push([ t.coord.x - Math.sin(a2) * l2, t.coord.y - Math.cos(a2) * l2 ])
  } else {
    points.push([ t.coord.x , t.coord.y ])
  }

  return points
}

/// Constructs the SVG path between two nodes.
/// See also `makePathPoints`
function makePath(s, t, handles = []) {
  const points = makePathPoints(s, t, handles)
  return `M${points[0][0]},${points[0][1]}` + points.slice(1).map((p) => `L${p[0]},${p[1]}`)
}

/// A wrapper component for a D3 powered Petri net graph editor.
///
/// NOTE: Although dragging actions (i.e. moving nodes and creating arcs) mutate the state of the
/// represented Petri net, they aren't synchronized with the data store until after the action
/// finishes. This makes undoable actions easier to implement.
class Graph extends React.Component {

  constructor(props) {
    super(props)

    // NOTE: We do not use the component's `state` to handle the graph editor's mode, as we don't
    // need React to trigger additional rendering, since internal rendering updates are handled by
    // d3 on the SVG child directly.
    this.mode          = [ MODES.EDIT ]

    // In `EDIT` mode, the coordinates of the node being dragged.
    // NOTE: As nodes are being dragged, we can't store their coordinates within their datum (I'm
    // not sure extacly why, but I guess this has to do with Redux' store). Instead we temporarily
    // store them in this property, until we commit them in the data store when the drag ends.
    this.draggedCoord  = null

    // In all modes, a description of the node the mouse hovers (if any).
    this.hoveredNode   = null

    // In `ADD_ARC` mode, a reference to the arc that's being created.
    this.newArc        = null

    // Bind the key down handler manually, so we can call `removeEventListener` with it.
    this.handleKeyDown = this.handleKeyDown.bind(this)
  }

  componentDidMount() {
    this.svg = d3.select(this.container)

    // Arrowhead setup.
    // Draws from Mobile Patent Suits example:
    // http://bl.ocks.org/mbostock/1153292
    this.svg.append('defs')
      .append('marker')
        .attr('id', 'arrow')
        .attr('orient', 'auto')
        .attr('preserveAspectRatio', 'none')
        // See also http://www.w3.org/TR/SVG/coords.html#ViewBoxAttribute
        //.attr('viewBox', '0 -' + arrowWidth + ' 10 ' + (2 * arrowWidth))
        .attr('viewBox', '0 -5 10 10')
        // See also http://www.w3.org/TR/SVG/painting.html#MarkerElementRefXAttribute
        .attr('refX', 10)
        .attr('refY', 0)
        .attr('markerWidth', 8)
        .attr('markerHeight', 6)
      .append('path')
        .attr('d', 'M0,-5L10,0L0,5')

    // Create groups for arcs and vertices.
    this.nodesGroup = this.svg.append('g').attr('class', 'nodes')
    this.edgesGroup = this.svg.append('g').attr('class', 'edges')

    // Generate the net.
    this.updateNet(this.props)

    // Register a keyboard listener, to catch delete and escape keys.
    document.addEventListener('keydown', this.handleKeyDown)
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown)
  }

  componentWillReceiveProps(newProps) {
    this.updateNet(newProps)
  }

  /// Perform the actual update of the Petri net in the SVG container.
  updateNet(props) {
    // Adapt places, transitions and arcs data to d3. The goal is to create an array that contains
    // all vertices and another that contains all arcs.
    const edgesData = Object.values(props.arcs)
    const nodesData = [
      ...Object.values(props.places)
        .map((node) => ({ ...node, type: 'place' })),
      ...Object.values(props.transitions)
        .map((node) => ({ ...node, type: 'transition' })),
    ]

    // Update the data for places and transitions.
    let nodes = this.nodesGroup.selectAll('g')
      .data(nodesData, (d) => d.id)

    // Remove the old nodes.
    nodes.exit().remove()

    // Create the new nodes.
    const nodesEnter = nodes.enter().append('g')
      .attr('id'       , (d) => d.id)
      .attr('class'    , (d) => d.type)
      .attr('transform', (d) => `translate(${d.coord.x}, ${d.coord.y})`)
      .on  ('mouseover', ::this.handleMouseOver)
      .on  ('mouseout' , ::this.handleMouseOut)

    const places      = nodesEnter.filter('.place')
    const transitions = nodesEnter.filter('.transition')

    // Create the places' graphics.
    places.append('circle')
      .attr('class'             , 'graphics')
      .attr('r'                 , PLACE_RADIUS)
      .call(d3.drag()
        .on('start', ::this.handleDragStart)
        .on('drag' , ::this.handleDrag)
        .on('end'  , ::this.handleDragEnd))

    // Create the places' name.
    places.append('text')
      .attr('text-anchor'       , 'left')
      .attr('alignment-baseline', 'central')
      .attr('dx'                , PLACE_RADIUS * 1.25)
      .attr('dy'                , PLACE_RADIUS * -1.25)
      .text((place) => place.name)

    // Create the transitions's graphics.
    transitions.append('rect')
      .attr('class'             , 'graphics')
      .attr('width'             , TRANSITION_SIDE)
      .attr('height'            , TRANSITION_SIDE)
      .attr('x'                 , -TRANSITION_SIDE / 2)
      .attr('y'                 , -TRANSITION_SIDE / 2)
      .call(d3.drag()
        .on('start', ::this.handleDragStart)
        .on('drag' , ::this.handleDrag)
        .on('end'  , ::this.handleDragEnd))

    // Create the transitions' name.
    transitions.append('text')
      .attr('text-anchor'       , 'left')
      .attr('alignment-baseline', 'central')
      .attr('dx'                , TRANSITION_SIDE * 0.75)
      .attr('dy'                , TRANSITION_SIDE * -0.75)
      .text((transition) => transition.name)

    // // Create the places' content label.
    // places.append('text')
    //   .attr('class'             , 'marking')
    //   .attr('text-anchor'       , 'middle')
    //   .attr('alignment-baseline', 'central')

    // Create the nodes' handles.
    // Note that we do it at the end, so that they appear above other graphics.
    nodesEnter.append('circle')
      .attr('class'    , 'handle hidden')
      .attr('r'        , PLACE_RADIUS / 3)
      .attr('transform', (d) => {
        const l = d.type == 'place' ? PLACE_RADIUS : TRANSITION_SIDE / 1.5
        return `translate(0,${l})`
      })
      .call(d3.drag()
        .on('start', ::this.handleLinkStart)
        .on('drag' , ::this.handleLinkDrag)
        .on('end'  , ::this.handleLinkEnd))

    // Update the data for arcs
    let edges = this.edgesGroup.selectAll('g')
      .data(edgesData, (d) => d.id)

    // Remove the old nodes.
    edges.exit().remove()

    // Create the new edges.
    const entities   = { ...props.places, ...props.transitions }
    const edgesEnter = edges.enter().append('g')
      .attr('id'   , (d) => d.id)
      .attr('class', 'arc')

    // Create the edges' graphics.
    edgesEnter.selectAll('path')
      .data((d) => [ makePathPoints(entities[d.sourceID], entities[d.targetID], d.handles) ])
      .enter().append('svg:path')
        .attr('marker-end', 'url(#arrow)')
        .attr('d'         , d3.line().curve(d3.curveLinear))

    // Create the edges' handles.
    edgesEnter.selectAll('circle')
      .data((d) => d.handles)
      .enter().append('circle')
        .attr('class'    , 'handle')
        .attr('r'        , PLACE_RADIUS / 3)
        .attr('transform', (d) => `translate(${d.x},${d.y})`)
        .call(d3.drag()
          .on('start', ::this.handleLinkStart)
          .on('drag' , ::this.handleLinkDrag)
          .on('end'  , ::this.handleLinkEnd))
  }

  render() {
    return <svg className="alpine-graph" ref={ (el) => this.container = el } />
  }

  handleKeyDown(e) {
    switch (this.mode[this.mode.length - 1]) {
    // In `ADD_ARC` mode, cancel the action if the key is DELETE or BACKSPACE.
    case MODES.ADD_ARC:
      switch (e.key) {
      case 'Backspace':
      case 'Delete':
      case 'Escape':
        this.newArc.remove()
        this.mode.pop()
      }
    }
  }

  handleMouseOver(d) {
    // Store the hovered node description.
    this.hoveredNode = d

    switch (this.mode[this.mode.length - 1]) {
    // In `EDIT` mode, show the hovered node's handle.
    case MODES.EDIT:
      this.nodesGroup.select(`#${d.id}`).select('.handle').classed('hidden', false)
      break
    }
  }

  handleMouseOut(d) {
    // Clear the hovered node description.
    this.hoveredNode = null

    switch (this.mode[this.mode.length - 1]) {
    // In `ADD_LINK` mode, hide the handle of the node that the mouse leaves.
    case MODES.EDIT:
      this.nodesGroup.select(`#${d.id}`).select('.handle').classed('hidden', true)
      break
    }
  }

  handleDragStart(d) {
    this.draggedCoord = d.coord
  }

  handleDrag(d) {
    switch (this.mode[this.mode.length - 1]) {
    // In `EDIT` mode, move the dragged node.
    case MODES.EDIT:
      this.draggedCoord = {
        x: Math.round((this.draggedCoord.x + d3.event.x) / 10) * 10,
        y: Math.round((this.draggedCoord.y + d3.event.y) / 10) * 10,
      }
      this.nodesGroup.select(`#${d.id}`)
        .attr('transform', (d) => {
          return `translate(${this.draggedCoord.x}, ${this.draggedCoord.y})`
        })
      break
    }
  }

  handleDragEnd(d) {
    // TODO: Commit changes in the data store.
  }

  handleLinkStart(d) {
    switch (this.mode[this.mode.length - 1]) {
    // In `EDIT` mode, start the creation of a new node.
    case MODES.EDIT:
      // Create a new arc.
      this.newArc = this.edgesGroup.append('g')
        .attr('class', 'arc')
        .append('svg:path')
          .attr('marker-end', 'url(#arrow)')

      // Hide the handles of the source node.
      this.nodesGroup.select(`#${d.id}`).select('.handle').classed('hidden', true)

      // Push the `ADD_ARC` mode.
      this.mode.push(MODES.ADD_ARC)
      break
    }
  }

  handleLinkDrag(d) {
    assert(this.mode[this.mode.length - 1] == MODES.ADD_ARC)

    // Determine whether the mouse's hovering a valid target node.
    const isConnectable = (
        (this.hoveredNode      !== null) &&
        (this.hoveredNode.id   != d.id) &&
        (this.hoveredNode.type != d.type))

    const target = isConnectable
      ? this.hoveredNode
      : { coord: { x: (d.coord.x + d3.event.x), y: (d.coord.y + d3.event.y) } }
    this.newArc.attr('d', makePath(d, target))
  }

  handleLinkEnd(d) {
    assert(this.mode[this.mode.length - 1] == MODES.ADD_ARC)

    // Determine whether the mouse's hovering a valid target node.
    const isConnectable = (
        (this.hoveredNode      !== null) &&
        (this.hoveredNode.id   != d.id) &&
        (this.hoveredNode.type != d.type))

    if (isConnectable) {
      this.props.dispatch(
        actions.newArc(d.id, this.hoveredNode.id))
    }

    // Note that we delete the new arc whether even if the created link was valid. That's because
    // in case of a success, a "new arc" action will have been dispatch, so that actual new arc
    // will be passed as a property.
    this.newArc.remove()
    this.mode.pop()
  }

}

const mapStateToProps = (state) => ({
  places     : state.places,
  transitions: state.transitions,
  arcs       : state.arcs,
})

export default connect(mapStateToProps)(Graph)
