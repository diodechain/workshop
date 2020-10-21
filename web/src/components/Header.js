import React from 'react';

function Header() {
  return (
    <div className="header">
      <div className="logo">
        <a href="https://diode.io">
          <img src="https://diode.io/images/logo.svg" />
        </a>
      </div>
      <ul className="navbar">
        <li><a href="https://diode.io/prenet/#/fleets" className="">Prenet</a></li>
        <li><a href="https://diode.io/blog" className="">Blog</a></li>
      </ul>
    </div>
  )
}

export default Header;