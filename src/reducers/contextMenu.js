import { types as actionTypes } from '../actions'

const initialState = {
  // Whether or not the context menu is open.
  open: false,
  // The coordinates of the context menu origin.
  coords: { x: 0, y: 0 },
  // The entries of the context menu.
  entries: [],
}

const contextMenu = (state = initialState, action) => {
  switch (action.type) {
  case actionTypes.GRAPH_CONTEXTMENU_SHOW:
    return {
      open: true,
      coords: action.payload.coords,
      entries: action.payload.entries,
    }

  case actionTypes.GRAPH_CONTEXTMENU_HIDE:
    return { ...state, open: false }

  default:
    return state
  }
}

export default contextMenu
