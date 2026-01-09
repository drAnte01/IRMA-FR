// src/Components/navbar/navbar.tsx

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import style from "../../styles/navbar/navBar.module.css";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faHome, faBook, faChair, faMartiniGlass, faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { NavLink } from "react-router-dom";

library.add(faHome, faChair, faMartiniGlass, faRightFromBracket, faBook);

function Navbar() {


  return (
    <>
      <div className={style.navbar}>
        <h1 className={style.title}>IRMA</h1>
        <div className={style.navigationMenu}>
          <ul className={style.navigationMenu}>
            <NavLink to="/dashboard">
              {({ isActive }) => (
                <li className={`${style.navLink} ${isActive ? style.active : ""}`}>
                  <FontAwesomeIcon icon={faHome} />
                  <span>Dashboard</span>
                </li>
              )}
            </NavLink>

            <NavLink to="/items">
              {({ isActive }) => (
                <li className={`${style.navLink} ${isActive ? style.active : ""}`}>
                  <FontAwesomeIcon icon={faMartiniGlass} />
                  <span>Items</span>
                </li>
              )}
            </NavLink>

            <NavLink to="/orders">
              {({ isActive }) => (
                <li className={`${style.navLink} ${isActive ? style.active : ""}`}>
                  <FontAwesomeIcon icon={faBook} />
                  <span>Orders</span>
                </li>
              )}
            </NavLink>

            <NavLink to="/tables">
              {({ isActive }) => (
                <li className={`${style.navLink} ${isActive ? style.active : ""}`}>
                  <FontAwesomeIcon icon={faChair} />
                  <span>Tables</span>
                </li>
              )}
            </NavLink>
          </ul>



        </div>
        <div className={style.logOut}>
          <button>  <FontAwesomeIcon icon={faRightFromBracket} /> Logout</button>
        </div>
      </div>
    </>
  )
}

export default Navbar;
