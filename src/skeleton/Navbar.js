import React from 'react';

const Navbar = (props) => <>
    <nav className="navbar navbar-light bg-light justify-content-between">
        <a href='/' style={{ textDecoration: 'none' }}>
            <div className="navbar-brand d-flex align-items-center ml-2">
                <div>
                    {/* <img src={logoIcon} style={{ height: "30px" }} /> */}
                    <>Logo placeholder </>
                </div>
                <div className="ml-2">
                    eSzop
                </div>
            </div>
        </a>
    </nav>
</>

export default Navbar;