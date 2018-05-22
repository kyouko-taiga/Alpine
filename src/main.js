import React                    from 'react'
import { render }               from 'react-dom'
import { Provider }             from 'react-redux'
import {
  createStore,
  applyMiddleware,
}                               from 'redux'
import { createLogger }         from 'redux-logger'

import { types as actionTypes } from './actions'
import { state }                from './reducers'
import Editor                   from './components/Editor'
import { uiStates }             from './components/Graph/constants'

// Define an assert function.
if (typeof window.assert === 'undefined') {
  window.assert = (condition, message) => {
    if (!condition) {
      message = message || "Assertion failed"
      throw new Error(message)
    }
  }
}

// ----------------

let lastActionType = null
const store = createStore(
  state,
  applyMiddleware(
    createLogger({
      // Collapse actions that don't have errors
      collapsed: (getState, action, logEntry) => !logEntry.error,
      predicate: (getState, action) => {
        // Don't log mouse move actions.
        if (action.type == actionTypes.GRAPH_MOUSE_MOVE ) {
          return false
        }

        // Don't log update actions in `DRAG`, `PAN` or `CREATE_ARC` mode.
        const uiStateName = getState().graph.uiState.name
        if ((uiStateName == uiStates.DRAG) || (uiStateName == uiStates.CREATE_ARC)) {
          if (action.type == actionTypes.GRAPH_ARC_UPDATE) { return false }
          if (action.type == actionTypes.GRAPH_NODE_MOVE)  { return false }
        }

        // Throttle actions with the same type so they don't flood the logger.
        if (action.type != lastActionType) {
          lastActionType = action.type
          window.setTimeout(() => { lastActionType = null }, 500)
          return true
        }
        return false
      },
    })
  ))

const App = () => (
  <Provider store={ store }>
    <Editor />
  </Provider>
)

// Checks if the browser is supported by mxGraph.
render(<App />, document.getElementById('app'))
