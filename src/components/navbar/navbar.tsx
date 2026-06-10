// src/Components/navbar/navbar.tsx

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import style from "../../styles/components/navBar.module.css";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faHome, faBook, faChair, faMartiniGlass, faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

library.add(faHome, faChair, faMartiniGlass, faRightFromBracket, faBook);

function Navbar() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const firstName = user?.firstName?.trim();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

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
        <div className={style.userName}>
          <span className={style.welcomeLabel}>Welcome</span>
          <strong className={style.welcomeName}>{firstName || "Guest"}</strong>
        </div>
        <div className={style.logOut}>
          <button type="button" onClick={handleLogout}>  <FontAwesomeIcon icon={faRightFromBracket} /> Logout</button>
        </div>
      </div>
    </>
  )
}

export default Navbar;
