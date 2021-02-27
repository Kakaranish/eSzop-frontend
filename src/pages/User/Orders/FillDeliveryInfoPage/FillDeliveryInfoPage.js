import axios from 'axios';
import { authorizedRequestHandler, getFormDataJsonFromEvent } from 'common/utils';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import DeliveryAddressesModal from './DeliveryAddressesModal';
import DeliveryMethodsSection from './DeliveryMethodsSection';
import OrderDeliveryAddressForm from './OrderDeliveryAddressForm';

const FillDeliveryInfoPage = (props) => {

    const orderId = props.match.params.id;

    const history = useHistory();

    const [state, setState] = useState({
        loading: true,
        deliveryMethods: null
    });

    const [deliveryAddress, setDeliveryAddress] = useState();

    useEffect(() => {
        const fetch = async () => {
            const deliveryMethodsUri = `/orders-api/orders/${orderId}/available-delivery-methods`;
            const deliveryMethodsAction = async () => await axios.get(deliveryMethodsUri);
            const deliveryMethods =  await authorizedRequestHandler(deliveryMethodsAction);
            
            const deliveryInfoUri = `/orders-api/orders/${orderId}/delivery-info`;
            const deliveryInfoAction = async () => await axios.get(deliveryInfoUri);
            const deliveryInfo = await authorizedRequestHandler(deliveryInfoAction);

            setDeliveryAddress({
                firstName: deliveryInfo.deliveryAddress.firstName ?? "",
                lastName: deliveryInfo.deliveryAddress.lastName ?? "",
                phoneNumber: deliveryInfo.deliveryAddress.phoneNumber ?? "",
                country: deliveryInfo.deliveryAddress.country ?? "",
                zipCode: deliveryInfo.deliveryAddress.zipCode ?? "",
                city: deliveryInfo.deliveryAddress.city ?? "",
                street: deliveryInfo.deliveryAddress.street ?? ""
            });

            setState({
                loading: false,
                deliveryMethods: deliveryMethods,
                deliveryInfo: deliveryInfo
            });
        };
        fetch();
    }, []);

    const onSubmit = async event => {
        event.preventDefault();

        const dataJson = getFormDataJsonFromEvent(event);
        const uri = `/orders-api/orders/${orderId}/delivery-info`;
        const action = async () => await axios.put(uri, dataJson);

        await authorizedRequestHandler(action,
            {
                status: 200,
                callback: () => {
                    history.push(`/user/orders/${orderId}/summary`);
                }
            }
        );
    };

    if (state.loading) return <></>

    if (!state.deliveryMethods?.length) return <>
        <h3>Error. No delivery methods to choose...</h3>
    </>

    return <>
        <h3>Delivery address</h3>

        <OrderDeliveryAddressForm
            deliveryAddress={deliveryAddress}
            setDeliveryAddress={setDeliveryAddress}
            onSubmit={onSubmit}
        >
            <DeliveryAddressesModal
                setDeliveryAddressState={setDeliveryAddress}
            />

            <DeliveryMethodsSection
                deliveryMethods={state.deliveryMethods}
                defaultSelected={state.deliveryInfo.deliveryMethod.name}
            />

            <button className="btn btn-success btn-block mt-4">
                Go to order summary
            </button>
        </OrderDeliveryAddressForm>
    </>
};

export default FillDeliveryInfoPage;