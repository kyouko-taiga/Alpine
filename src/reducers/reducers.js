import { combineReducers } from 'redux'

import { types as actionTypes } from '../actions'
import { uiStates } from '../components/Graph/constants'
import { editionTools } from '../constants'

import contextMenu from './contextMenu'

const nodes = {
  'p0': { id: 'p0', type: 'place', name: 'p0', coords: { x: 100, y: 100 } },
  't0': { id: 't0', type: 'transition', name: 'p0', coords: {x: 400, y: 100} },
}

const arcs = {
  '0': { id: '0', sourceID: 'p0', targetID: 't0', handles: [] },
  // '1': { id: '1', sourceID: 'p1', targetID: 't0', handles: [] },
}

Object.update = (source, itemID, updates) => {
  const original = source[itemID] || {}
  return typeof updates === 'function'
    ? { ...source, [itemID]: { ...original, ...updates(original) } }
    : { ...source, [itemID]: { ...original, ...updates } }
}

Object.removing = (source, itemID) => {
  const result = { ...source }
  delete result[itemID]
  return result
}

Object.filter = (source, predicate) => {
  const result = {}
  for (let key in source) {
    if (predicate(key, source[key])) {
      result[key] = source[key]
    }
  }
  return result
}

Array.removing = (source, item) => {
  const index = source.indexOf(item)
  return index > -1
    ? source.slice(0, index).concat(source.slice(index + 1))
    : source
}

export const state = combineReducers({
  nodes: (state = nodes, action) => {
    switch (action.type) {
    case actionTypes.GRAPH_NODE_CREATE:
      return Object.update(state, action.payload.id, action.payload)
    case actionTypes.GRAPH_NODE_REMOVE:
      return Object.removing(state, action.payload)
    case actionTypes.GRAPH_NODE_MOVE:
      return Object.update(state, action.payload.id, (node) => ({
        coords: {
          x: node.coords.x + action.payload.dx,
          y: node.coords.y + action.payload.dy,
        }
      }))

    default:
      return state
    }
  },

  arcs: (state = arcs, action) => {
    switch (action.type) {
    case actionTypes.GRAPH_ARC_CREATE:
      return { ...state, [action.payload.id]: { ...action.payload } }
    case actionTypes.GRAPH_ARC_UPDATE:
      return Object.update(state, action.payload.id, action.payload.updates)
    case actionTypes.GRAPH_ARC_REMOVE:
      return Object.removing(state, action.payload)
    case actionTypes.GRAPH_NODE_REMOVE:
      return Object.filter(
        state,
        (key, value) => (value.sourceID !== action.payload) && (value.targetID !== action.payload))
    default:
      return state
    }
  },

  // Stores the data specific to the state of the editor.
  editor: combineReducers({
    editionTool: (state = editionTools.CURSOR, action) => {
      switch (action.type) {
      case actionTypes.EDITION_PALETTE_CHANGE : return action.payload
      default                                 : return state
      }
    }
  }),

  // Stores the data specific to state of the graph editor/simulator.
  graph: combineReducers({
    // Keep track of the UI state of the graph.
    uiState: (state = { name: uiStates.EDIT }, action) => {
      switch (action.type) {
      case actionTypes.GRAPH_UI_STATE_CHANGE  : return action.payload
      default                                 : return state
      }
    },

    // Keep track of the cursor position within the graph.
    cursorCoords: (state = { x: 0, y: 0 }, action) => {
      switch (action.type) {
      case actionTypes.GRAPH_MOUSE_MOVE       : return action.payload
      default                                 : return state
      }
    },

    // Keep track of the selected node.
    selectedNode: (state = null, action) => {
      switch (action.type) {
      case actionTypes.GRAPH_NODE_SELECT      : return action.payload
      case actionTypes.GRAPH_NODE_UNSELECT    : return null
      case actionTypes.GRAPH_ARC_CREATE       : return null
      case actionTypes.GRAPH_ARC_SELECT       : return null
      default                                 : return state
      }
    },

    // Keep track of the selected arc.
    selectedArc: (state = null, action) => {
      switch (action.type) {
      case actionTypes.GRAPH_ARC_CREATE       : return action.payload.id
      case actionTypes.GRAPH_ARC_SELECT       : return action.payload
      case actionTypes.GRAPH_ARC_UNSELECT     : return null
      case actionTypes.GRAPH_NODE_SELECT      : return null
      default                                 : return state
      }
    },

    // Keep track of the registered drag listeners. See the `draggable` higher order component for
    // an explanation about why this store is needed.
    dragListeners: (state = [], action) => {
      switch (action.type) {
      case actionTypes.GRAPH_ADD_DRAG_LISTENER:
        return [ ...state, action.payload.listener ]
      case actionTypes.GRAPH_REMOVE_DRAG_LISTENER:
        return Array.removing(state, action.payload.listener)
      default:
        return state
      }
    },

    // Keep track of the state of the graph's context menu.
    contextMenu,
  }),
})
