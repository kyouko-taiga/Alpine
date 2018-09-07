import React from 'react'

import CodeEditor from './CodeEditor'
import Graph from './Graph'
import Palette from './Palette'
import PropertyInspector from './PropertyInspector'
import { Tabs, Tab } from './Tabs'

export default class Editor extends React.Component {

  constructor(props) {
    super(props)
    this.state = { tabIndex: 0 }
  }

  render() {
    return (
      <div className="alpine-editor">
        <div className="alpine-header" />
        <div className="alpine-body">
          <LeftSidebar />
          <div className="alpine-content">
            <Tabs tabIndex={ this.state.tabIndex } onTabChange={ ::this.handleTabChange }>
              <Tab label="Net">
                <Graph />
              </Tab>
              <Tab label="Semantics">
                <CodeEditor />
              </Tab>
            </Tabs>
          </div>
          <div className="alpine-sidebar">
            <PropertyInspector />
          </div>
        </div>
      </div>
    )
  }

  handleTabChange(newTabIndex) {
    this.setState({ tabIndex: newTabIndex })
  }

}

const LeftSidebar = (props) => (
  <div className="alpine-sidebar">
    <Tabs>
      <Tab label={ <i className="fas fa-paint-brush" /> }>
        <Palette />
      </Tab>
      <Tab label={ <i className="fas fa-play" /> }>
        { 'Execution palette' }
      </Tab>
      <Tab label={ <i className="fas fa-list" /> }>
        { 'List of graph entities' }
      </Tab>
      <Tab label={ <i className="fas fa-exclamation-triangle" /> }>
        { 'No error' }
      </Tab>
    </Tabs>
  </div>
)
