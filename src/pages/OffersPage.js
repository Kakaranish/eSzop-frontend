import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { requestHandler } from "../common/utils";
import { Link } from "react-router-dom";

const OffersPage = () => {

    const [state, setState] = useState({ loading: true });

    useEffect(() => {
        const fetch = async () => {
            const uri = '/offers-api/offers';
            const action = async () => await axios.get(uri, {
                baseURL: "https://localhost:10000",
                validateStatus: false
            });

            const offers = await requestHandler(action);
            console.log(offers);
            setState({ loading: false, offers: offers });
        }

        fetch();
    }, []);


    if (state.loading) return <h3>Loading...</h3>
    else return <>
        <div className="container">
            <h3>Offers</h3>
            {
                state.offers.map(offer => (
                    <div key={offer.id}>
                        <Link to={"/offers/" + offer.id}>
                            {offer.name}
                        </Link>

                        | {offer.price}
                    </div>
                ))
            }
        </div>

    </>
}

export default OffersPage;