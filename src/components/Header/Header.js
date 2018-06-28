import React from "react"
import { Link } from "react-router-dom"
import "./style.css"

import { auth } from "../../"

const Header = () => (
  <div className="main-header">
    <div className="main-header__inner">
      <h1>JWT API Middleware</h1>
      <nav className="main-header__nav">
        <Link className="main-header__nav-link" to="/">
          Home
        </Link>
        {auth.isAuthed() ? (
          <Link className="main-header__nav-link" to="/profile">
            Profile
          </Link>
        ) : (
          <Link className="main-header__nav-link" to="/login">
            Login
          </Link>
        )}
      </nav>
    </div>
  </div>
)

export default Header
