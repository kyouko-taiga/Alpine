import PropTypes from 'prop-types'
import React from 'react'

export class Tabs extends React.Component {

  static propTypes = {
    children   : PropTypes.node.isRequired,
    tabIndex   : PropTypes.number,
    onTabChange: PropTypes.func,
  }

  static defaultProps = {
    tabIndex   : null,
    onTabChange: null,
  }

  constructor(props) {
    super(props)
    this.state = { tabIndex: 0 }
  }

  render() {
    const children = React.Children.toArray(this.props.children)
    const tabIndex = this.props.tabIndex || this.state.tabIndex

    return (
      <div className="alpine-tabs">
        <div className="alpine-header">
          {
            children.map((child, index) => (
              <TabIndex
                key       = { index }
                index     = { index }
                active    = { index == tabIndex }
                onClick   = { this.props.onTabChange || ::this.handleTabChange }
              >
                { child.props.label }
              </TabIndex>
            ))
          }
        </div>
        <div className="alpine-body">
          { children[tabIndex] }
        </div>
      </div>
    )
  }

  handleTabChange(newTabIndex) {
    this.setState({ tabIndex: newTabIndex })
  }

}

export class Tab extends React.PureComponent {

  static propTypes = {
    label   : PropTypes.node.isRequired,
    children: PropTypes.node,
  }

  render() {
    return this.props.children || null
  }

}

class TabIndex extends React.PureComponent {

  static propTypes = {
    index   : PropTypes.number.isRequired,
    active  : PropTypes.bool.isRequired,
    children: PropTypes.node.isRequired,
    onClick : PropTypes.func.isRequired,
  }

  render() {
    return (
      <button className={ this.props.active ? 'active' : '' } onClick={ ::this.handleClick }>
        { this.props.children }
      </button>
    )
  }

  handleClick() {
    this.props.onClick(this.props.index)
  }

}
