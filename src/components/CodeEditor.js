import React from 'react'
import { UnControlled as CodeMirror } from 'react-codemirror2'

 export default class CodeEditor extends React.Component {

   render() {
     return (
       <CodeMirror
         value='<h1>I ♥ react-codemirror2</h1>'
         options={{
           mode: 'xml',
           theme: 'material',
           lineNumbers: true,
         }}
         onChange={(editor, data, value) => {
         }}
       />
     )
   }

 }
