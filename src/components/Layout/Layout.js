import React from "react"
import PropTypes from "prop-types"
import Header from "../Header/Header"

import "./style.css"

const Layout = ({ children }) => (
  <div className="main-layout">
    <Header />
    <div className="main-layout__content">{children}</div>
  </div>
)

Layout.propTypes = {
  children: PropTypes.node.isRequired
}

export default Layout
