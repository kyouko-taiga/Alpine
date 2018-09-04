import PropTypes from 'prop-types'
import React from 'React'
import { connect } from 'react-redux'

import * as actions from '../../actions'
import { uiStates } from './constants'

/**
 * Wrapper for SVG elements, as those do not support drag events natively.
 *
 * The underlying implementation of the SVG DOM does not support HTML5 drag events in most (all?)
 * browsers. This wrapper implements dragging events on the top of more basic mouse events. Note
 * that this wrapper does not update the coordinate of the wrapped component. It only fires drag
 * events mimicking the behaviour of that of HTML5.
 *
 * For convenience, drag events are fired with an additional `delta` argument that contains the
 * delta between the coordinates before and after the event, as a two-dimensional array.
 *
 * Implementation note:
 *   It appears that if small elements are dragged very quickly, the cursor might "escape",
 *   therefore triggering a `mouseleave` or `mouseup` event. The workaround is to listen to the
 *   mouse move from the parent container. We use redux to let this component register drag event
 *   listeners when we capture a `mousedown` event, and remove this listener as soon as we capture
 *   a `mouseup` event. Check the implementation of the `Graph` component to see how `mousemove`
 *   events are captured and passed down to all listeners.
 */
export default (Component) => {

  class Draggable extends React.Component {

    static propTypes = {
      draggable   : PropTypes.bool,
      onDragStart : PropTypes.func,
      onDrag      : PropTypes.func,
      onDragEnd   : PropTypes.func,
    }

    static defaultProps = {
      draggable   : true,
      onDragStart : () => {},
      onDrag      : () => {},
      onDragEnd   : () => {},
    }

    static displayName = `Draggable(${Component.displayName})`

    constructor(props) {
      super(props)
      this.isBeingDragged = false
      this.lastCoords     = { x: 0, y: 0 }
      this.handleDrag     = this.handleDrag.bind(this)
    }

    render() {
      const { addDragListener, removeDragListener, draggable, ...rest } = this.props
      return (
        <Component
          { ...rest }
          onMouseDown={ ::this.handleMouseDown }
          onMouseUp={ ::this.handleMouseUp }
        />
      )
    }

    handleMouseDown(e) {
      if (typeof this.props.onMouseDown === 'function') {
        this.props.onMouseDown(e)
      }

      // Ignore the node if the element isn't dragable.
      if (!this.props.draggable) { return }

      // Initiate the drag event.
      this.isBeingDragged = true
      this.lastCoords = { x: e.clientX, y: e.clientY }
      this.props.onDragStart(e)
      this.props.addDragListener(this.handleDrag)
    }

    handleDrag(e) {
      if (this.isBeingDragged) {
        this.props.onDrag(e, [ e.clientX - this.lastCoords.x, e.clientY - this.lastCoords.y ])
        this.lastCoords = { x: e.clientX, y: e.clientY }
      }

      // TODO: clip to grid or align to other nodes.
    }

    handleMouseUp(e) {
      if (typeof this.props.onMouseUp === 'function') {
        this.props.onMouseUp(e)
      }

      // End the drag event.
      this.isBeingDragged = false
      this.props.onDragEnd(e)
      this.props.removeDragListener(this.handleDrag)
    }

  }

  const mapDispatchToProps = (dispatch) => ({
    addDragListener   : (fn) => dispatch(actions.graph.addDragListener(fn)),
    removeDragListener: (fn) => dispatch(actions.graph.removeDragListener(fn)),
  })

  return connect(null, mapDispatchToProps)(Draggable)

}
