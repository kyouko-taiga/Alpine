import React        from 'react'
import { connect }  from 'react-redux'
import { Toolbar }  from 'material-ui'

class Graph extends React.Component {

  componentDidMount() {
    // this.model = new mxGraphModel()
    // this.graph = new mxGraph(this.container, this.model)

    // const config = mxUtils.load('editors/config/keyhandler-commons.xml').getDocumentElement()
    this.editor = new mxEditor()
    this.editor.setGraphContainer(this.container)

    this.graph = this.editor.graph
    this.model = this.graph.model

    this.graph.setConnectable(true)
    this.graph.setCellsResizable(false)

    const parent = this.graph.getDefaultParent()
    this.model.beginUpdate()
    try {
      for (const place of Object.values(this.props.places)) {
          let p = this.graph.insertVertex(
            parent,
            place.id,
            '',
            place.coordinates.x,
            place.coordinates.y,
            50,
            50,
            "shape=ellipse")
          // p.setVertex(true)
      }
    } finally {
      this.model.endUpdate()
    }

    // console.log(this.graph)

    // Setup a keyHandler for delete keys.
    const keyHandler = new mxKeyHandler(this.graph)
    keyHandler.bindKey(8, (evt, x) => {
      // getSelectionCell returns `undefined` if no cell is selected.
      console.log(evt, this.graph.getSelectionCell().getId())
    })

    console.log(this.graph)
    // this.graph.addListener(mxEvent.CLICK, () => { console.log('koala') })
    // this.graph.getSelectionModel().addListener(mxEvent.CHANGE, (sender, evt) => {
    //   console.log(sender, evt)
    // })
    // this.graph.addListener(mxEvent.ADD_CELLS, (a,b) => {
    //   console.log(a,b, b.properties)
    // })
    this.graph.connectionHandler.addListener(mxEvent.CONNECT, (sender, evt) => {
      console.log(evt.getProperty('cell'))
    });

  }

  render() {
    return (
      <div className="alpine-graph" ref={ (el) => this.container = el } />
    )
  }

}

const mapStateToProps = (state) => ({
  places     : state.places,
  transitions: state.transitions,
})

export default connect(mapStateToProps)(Graph)
