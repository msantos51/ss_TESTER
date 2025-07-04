import React, { useState } from 'react';
import './DashboardMenu.css';

export default function DashboardMenu({ children }) {
  const [open, setOpen] = useState(false);

  const toggle = () => setOpen(o => !o);

  // wrap each child so the CSS transition applies nicely
  const wrapped = React.Children.map(children, (child, idx) => (
    <div className="menu-list" key={idx}>
      {child}
    </div>
  ));

  return (
    <div className="event-wrapper">
      <input
        type="checkbox"
        className="event-wrapper-inp"
        checked={!open}
        onChange={toggle}
      />
      <div className="arrow" onClick={toggle} />
      <nav className="menu-container" onClick={() => setOpen(false)}>
        {wrapped}
      </nav>
      <div className="bar" onClick={toggle}>
        <span className="bar-list top" />
        <span className="bar-list middle" />
        <span className="bar-list bottom" />
      </div>
    </div>
  );
}
