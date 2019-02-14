import React from 'react'
import {NavLink} from 'react-router-dom'
import AuthContext from '../../context/auth-context'
import './mainNavigation.css'
const mainNavigation = props => {

     return   <AuthContext.Consumer>
            {(context)=> {
                return (<header className="main-navigation">
                    <div className="main-navigation__logo">
                        <h2>EasyEvent</h2>
                    </div>
                    <div className="main-navigation__items">
                        <ul>
                            { !context.token && <li><NavLink to="/auth">Authenticate</NavLink></li>}
                            <li><NavLink to="/events">Events</NavLink></li>
                            { context.token && <React.Fragment>
                                <li><NavLink to="/bookings">Bookings</NavLink></li>
                                <li><button   className="main-navigation__items" onClick={context.logout}>Logout</button></li>
                                </React.Fragment>}
                        </ul>
                    </div>

                </header>);
            }}

    </AuthContext.Consumer>

}
export  default mainNavigation