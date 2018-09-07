export const types = {
  // Fired when the tool of the edition palette changes.
  EDITION_PALETTE_CHANGE    : '@@alpine/editor/edition-palette-change',

  // Fired when the UI state of the graph editor changes.
  GRAPH_UI_STATE_CHANGE     : '@@alpine/graph/ui-state-change',
  // Fired when the mouse moves within the graph area.
  GRAPH_MOUSE_MOVE          : '@@alpine/graph/mouse-move',
  // Fired when a drag listener is added to the graph.
  GRAPH_ADD_DRAG_LISTENER   : '@@alpine/graph/add-drag-listener',
  // Fired when a drag listener is removed from the graph.
  GRAPH_REMOVE_DRAG_LISTENER: '@@alpine/graph/remove-drag-listener',

  // Fired when a node is created.
  GRAPH_NODE_CREATE         : '@@alpine/graph/node-create',
  // Fired when a node is updated.
  GRAPH_NODE_UPDATE          : '@@alpine/graph/node-update',
  // Fired when an node is removed.
  GRAPH_NODE_REMOVE         : '@@alpine/graph/node-remove',
  // Fired when a node (place or transition) is being dragged.
  GRAPH_NODE_MOVE           : '@@alpine/graph/node-move',
  // Fired when a node is selected.
  GRAPH_NODE_SELECT         : '@@alpine/graph/node-select',
  // Fired when a node is unselected.
  GRAPH_NODE_UNSELECT       : '@@alpine/graph/node-unselect',

  // Fired when an arc creator initiates a drag event.
  GRAPH_ARC_CREATE          : '@@alpine/graph/arc-create',
  // Fired when an arc is updated.
  GRAPH_ARC_UPDATE          : '@@alpine/graph/arc-update',
  // Fired when an arc is removed.
  GRAPH_ARC_REMOVE          : '@@alpine/graph/arc-remove',
  // Fired when an arc is selected.
  GRAPH_ARC_SELECT          : '@@alpine/graph/arc-select',
  // Fired when an arc is unselected.
  GRAPH_ARC_UNSELECT        : '@@alpine/graph/arc-unselect',
  // Fired when a handle is added to an arc.
  GRAPH_ARC_HANDLE_ADD      : '@@alpine/graph/arc-add-handle',
  // Fired when a handle is removed from an arc.
  GRAPH_ARC_HANDLE_REMOVE   : '@@alpine/graph/arc-remove-handle',
  // Fired when a handle is moved.
  GRAPH_ARC_HANDLE_MOVE     : '@@alpine/graph/arc-move-handle',

  // Fired when the graph's context menu is about to show.
  GRAPH_CONTEXTMENU_SHOW    : '@@alpine/graph/contextmenu-show',
  // Fired when the graph's context menu is about to hide.
  GRAPH_CONTEXTMENU_HIDE    : '@@alpine/graph/contextmenu-hide',

  GRAPH_NEW_PLACE           : '@@alpine/graph/new-place',
  GRAPH_NEW_TRANSITION      : '@@alpine/graph/new-transition',
}

export const editor = {

  editionPalette: {

    changeTool: (tool) => ({
      type   : types.EDITION_PALETTE_CHANGE,
      payload: tool,
    })

  },

}

export const graph = {

  // MARK: General UI actions.

  setUIState: (name, args) => ({
    type   : types.GRAPH_UI_STATE_CHANGE,
    payload: { name, args: args || null },
  }),

  moveMouse: (coords) => ({
    type   : types.GRAPH_MOUSE_MOVE,
    payload: coords,
  }),

  addDragListener: (listener) => ({
    type   : types.GRAPH_ADD_DRAG_LISTENER,
    payload: { listener },
  }),

  removeDragListener: (listener) => ({
    type   : types.GRAPH_REMOVE_DRAG_LISTENER,
    payload: { listener },
  }),

  // MARK: Node actions.

  createNode: (id, data) => ({
    type   : types.GRAPH_NODE_CREATE,
    payload: { ...data, id },
  }),

  updateNode: (id, updates) => ({
    type   : types.GRAPH_NODE_UPDATE,
    payload: { id, updates },
  }),

  removeNode: (id) => ({
    type   : types.GRAPH_NODE_REMOVE,
    payload: id,
  }),

  moveNode: (id, dx, dy) => ({
    type   : types.GRAPH_NODE_MOVE,
    payload: { id, dx, dy },
  }),

  selectNode: (id) => ({
    type   : types.GRAPH_NODE_SELECT,
    payload: id,
  }),

  unselectNode: () => ({
    type   : types.GRAPH_NODE_UNSELECT,
    payload: null,
  }),

  // MARK: Arc actions.

  createArc: (id, sourceID, targetID, handles) => ({
    type   : types.GRAPH_ARC_CREATE,
    payload: { id, sourceID, targetID, handles: handles || [] },
  }),

  updateArc: (id, updates) => ({
    type   : types.GRAPH_ARC_UPDATE,
    payload: { id, updates },
  }),

  removeArc: (id) => ({
    type   : types.GRAPH_ARC_REMOVE,
    payload: id,
  }),

  selectArc: (id) => ({
    type   : types.GRAPH_ARC_SELECT,
    payload: id,
  }),

  unselectArc: () => ({
    type   : types.GRAPH_ARC_UNSELECT,
    payload: null,
  }),

  addHandle: (arcID, coords) => ({
    type   : types.GRAPH_ARC_HANDLE_ADD,
    payload: { arcID, coords },
  }),

  removeHandle: (arcID, index) => ({
    type   : types.GRAPH_ARC_HANDLE_REMOVE,
    payload: { arcID, index },
  }),

  moveHandle: (arcID, index, coords) => ({
    type   : types.GRAPH_ARC_HANDLE_MOVE,
    payload: { arcID, index, coords },
  }),

  // MARK: Context menu actions.

  showContextMenu: (coords, entries) => ({
    type   : types.GRAPH_CONTEXTMENU_SHOW,
    payload: { coords, entries },
  }),

  hideContextMenu: () => ({
    type   : types.GRAPH_CONTEXTMENU_HIDE,
    payload: null,
  })

}
