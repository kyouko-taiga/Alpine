import classnames from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'

import * as actions from '../../actions'

class ContextMenu extends React.PureComponent {

  static propTypes = {
    open: PropTypes.bool.isRequired,
    coords: PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
    }).isRequired,
    hide: PropTypes.func.isRequired,
  }

  componentDidMount() {
    this.clickListener = window.addEventListener('click', ::this.handleClick)
  }

  componentWillUnmount() {
    if (this.clickListener) {
      window.removeEventListener('click', this.clickListener)
    }
  }

  render() {
    const { open, coords } = this.props
    return (
      <div
        ref       = { (el) => this.el = el }
        className = { classnames('alpine-context-menu', { open }) }
        style     = { { top: coords.y, left: coords.x } }
      >
        <button>
          Option 1
        </button>
        <button>
          Option 2
        </button>
      </div>
    )
  }

  handleClick(e) {
    if (this.props.open && !this.el.contains(event.target)) {
      this.props.hide()
    }
  }

}

const mapStateToProps = (state) => state.graph.contextMenu

const mapDispatchToProps = (dispatch) => ({
  hide: () => dispatch(actions.graph.hideContextMenu()),
})

export default connect(mapStateToProps, mapDispatchToProps)(ContextMenu)
