import React from 'react';
import { Link, useHistory } from 'react-router-dom';
import axios from 'axios';
import { authorizedRequestHandler, getFormDataJsonFromEvent, requestHandler } from 'common/utils';
import AwareComponentBuilder from 'common/AwareComponentBuilder';
import { toast } from 'react-toastify';

const SignInPage = (props) => {

    const history = useHistory();

    const onSubmit = async event => {
        event.preventDefault();

        let formDataJson = getFormDataJsonFromEvent(event);

        const signInUri = "/identity-api/auth/sign-in";
        const signInAction = async () => await axios.post(signInUri, formDataJson);
        await requestHandler(signInAction,
            {
                status: 200,
                callback: () => { }
            },
            {
                status: -1,
                callback: result => {
                    toast.warn(`Error ${result.status}`);
                    history.push('/refresh');
                }
            }
        );

        const getMeUri = "/identity-api/user/me";
        const getMeAction = async () => await axios.get(getMeUri);
        await requestHandler(getMeAction,
            {
                status: 200,
                callback: async getMeResult => {
                    props.setIdentity(getMeResult);
                }
            },
            {
                status: -1,
                callback: result => {
                    toast.error(`Error ${result.status}. Please sign out and try again...`);
                    history.push('/refresh');
                }
            }
        );

        const getCartUri = `/carts-api/cart`;
        const getCartAction = async () => await axios.get(getCartUri);

        authorizedRequestHandler(getCartAction,
            {
                status: 200,
                callback: result => {
                    result.cartItems.forEach(cartItem => props.addOrUpdateCartItem(cartItem));
                    history.push('/');
                }
            },
            {
                status: -1,
                callback: result => {
                    toast.error(`Error ${result.status}. Please sign out and try again...`);
                    history.push('/refresh');
                }
            }
        );
    };

    return <>
        <div className="offset-md-2 col-md-8 col-12">
            <h4 className="mb-3">Sign in to your account</h4>

            <form onSubmit={onSubmit}>
                <div className="form-group">
                    <input name="email" type="email" className="form-control"
                        id="emailInput" placeholder="Email..." required
                    />
                </div>
                <div className="form-group mb-1">
                    <input name="password" type="password" className="form-control"
                        id="passwordInput" placeholder="Password..." required
                    />
                </div>

                <div className="text-secondary mb-3">
                    You have no account? No problem!&nbsp;
                    <Link to='/auth/sign-up'>
                        Create it
                    </Link>
                </div>

                <button type="submit" className="btn btn-block btn-outline-success">
                    Sign In
                </button>
            </form>
        </div>
    </>
}

export default new AwareComponentBuilder()
    .withIdentityAwareness()
    .withCartAwareness()
    .build(SignInPage);