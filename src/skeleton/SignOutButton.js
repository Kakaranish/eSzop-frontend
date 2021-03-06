import axios from 'axios';
import React from 'react';
import { useHistory } from 'react-router-dom';
import AwareComponentBuilder from 'common/AwareComponentBuilder';
import { requestHandler } from 'common/utils';

const SignOutButton = (props) => {

    const history = useHistory();

    const onSignOut = async () => {
        const uri = '/identity-api/auth/sign-out';
        const action = async () => await axios.post(uri, {});
        await requestHandler(action, {
            status: 200,
            callback: () => {
                props.unsetIdentity();
                props.clearCart();
                history.push('/offers');
            }
        });
    };

    return <>
        <div className="px-3 py-2 text-center" onClick={onSignOut}
            style={{ backgroundColor: 'darkgray', cursor: 'pointer' }}>
            <b>LOG OUT</b>
        </div>
    </>
};

export default new AwareComponentBuilder()
    .withIdentityAwareness()
    .withCartAwareness()
    .build(SignOutButton);