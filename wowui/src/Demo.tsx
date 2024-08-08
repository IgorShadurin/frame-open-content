import { DemoDiagram } from './DemoDiagram'
import React from 'react'
import { DemoChat } from './DemoChat'

export function Demo() {
  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-9">
          <DemoDiagram />
        </div>
        <div className="col-3">
          <DemoChat />
        </div>
      </div>
    </div>
  )
}
