import axios from 'axios';
import { authorizedRequestHandler } from 'common/utils';
import DeliveryAddressForm from 'common/components/DeliveryAddressForm';
import React, { useState } from 'react';
import HyperModal from 'react-hyper-modal';

const DeliveryAddressesModal = (props) => {

    const { setDeliveryAddressState } = props;

    const [isOpen, setIsOpen] = useState(false);

    const [state, setState] = useState({
        loaded: false,
        deliveryAddresses: null,
        primaryDeliveryAddressId: null
    });

    const onOpen = async () => {
        setIsOpen(true);

        if (state.loaded) return;

        const uri = `/identity-api/delivery-addresses`
        const action = async () => await axios.get(uri);
        await authorizedRequestHandler(action,
            {
                status: 200,
                callback: result => {
                    setState({
                        loaded: true,
                        deliveryAddresses: result.data.deliveryAddresses,
                        primaryDeliveryAddressId: result.data.primaryDeliveryAddressId
                    });
                }
            },
            {
                status: 204,
                callback: () => {
                    setState({
                        loaded: true,
                        deliveryAddresses: null,
                        primaryDeliveryAddressId: null
                    });
                }
            }
        );
    };

    const onFillWith = async deliveryAddress => {
        setDeliveryAddressState({
            firstName: deliveryAddress.firstName,
            lastName: deliveryAddress.lastName,
            phoneNumber: deliveryAddress.phoneNumber,
            country: deliveryAddress.country,
            zipCode: deliveryAddress.zipCode,
            city: deliveryAddress.city,
            street: deliveryAddress.street,
        });

        setIsOpen(false);
    };

    if (!state.deliveryAddresses) return <>
        <button type="button" className="pull-right btn btn-outline-success"
            onClick={onOpen}>
            Fill with existing delivery address
        </button>
    </>

    return <>
        <button type="button" className="pull-right btn btn-outline-success"
            onClick={onOpen}>
            Fill with existing delivery address
        </button>

        <HyperModal
            afterClose={() => setIsOpen(false)}
            isOpen={isOpen}
            classes={{ contentClassName: "z-999 h-100 d-flex", wrapperClassName: "z-999" }}
        >
            <div className="row">
                {
                    state.deliveryAddresses.map((deliveryAddress, index) =>
                        <div className="col-lg-6 py-3 px-5" key={`da-modal-${index}`}>
                            <h4 className="mb-3">
                                Address {index + 1}
                                {
                                    deliveryAddress.id === state.primaryDeliveryAddressId &&
                                    <span className="ml-2 badge badge-success">Primary</span>
                                }
                            </h4>

                            <DeliveryAddressForm
                                deliveryAddress={deliveryAddress}
                                index={index + 1}
                                editable={false}
                            />

                            <button type="button" className="btn btn-success btn-block mt-3 mb-3"
                                onClick={() => onFillWith(deliveryAddress)}>
                                Fill with this address
                            </button>
                        </div>
                    )
                }
            </div>
        </HyperModal>
    </>
};

export default DeliveryAddressesModal;