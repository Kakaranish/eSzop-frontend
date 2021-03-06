import axios from 'axios';
import { authorizedRequestHandler, requestHandler } from 'common/utils';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import ReactTooltip from 'react-tooltip';
import DeliveryMethodsSection from '../components/OfferEditing/DeliveryMethodsSection';
import GeneralSection from '../components/OfferEditing/GeneralSection';
import ParametersSection from '../components/OfferEditing/ParametersSection';

const CreateOfferDraftPage = () => {

    const history = useHistory();

    const [state, setState] = useState({ loading: true, canSell: true, categoryOptions: [] });
    const [images, setImages] = useState([]);

    const [parameters, setParameters] = useState([{ key: '', value: '' }]);
    const [deliveryMethods, setDeliveryMethods] = useState([{ key: "", value: "" }]);
    const [predefinedDeliveryMethods, setPredefinedDeliveryMethods] = useState([]);

    // For test purposes
    const offerDefaultValues = {
        name: `Offer ${moment.utc().toISOString()}`,
        description: `Offer Description ${moment.utc().toISOString()}`,
        price: Math.floor(Math.random() * (1000 - 20 + 1)) + 20,
        totalStock: Math.floor(Math.random() * (40 - 1 + 1)) + 1
    };

    useEffect(() => {

        const fetchCanSell = async () => {
            const canSellUri = '/identity-api/seller/can-sell';
            const canSellAction = async () => await axios.get(canSellUri);
            const canSell = await authorizedRequestHandler(canSellAction,
                {
                    status: -1,
                    callback: result => {
                        toast.warn("Unknown error");
                        throw ({
                            type: "UNKNOWN",
                            message: result.data.Message
                        });
                    }
                }
            );
            if (!canSell) {
                setState({ loading: false, canSell: false });
                throw { type: "SKIP" }
            }
        };

        const fetchCategoryOptions = async () => {
            const categoriesUri = async () => await axios.get("/offers-api/categories");
            const categoriesResult = await requestHandler(categoriesUri);
            const categoryOptions = categoriesResult.map(cat =>
                ({ value: cat.id, label: cat.name })
            );
            return categoryOptions;
        };

        const fetchDeliveryMethods = async () => {
            const methodsUri = `/offers-api/delivery-methods`;
            const methodsAction = async () => await axios.get(methodsUri);
            const deliveryMethods = await authorizedRequestHandler(methodsAction);

            setPredefinedDeliveryMethods(deliveryMethods.map(x => {
                const labelPricePart = (x.price || x.price === 0)
                    ? ` - ${x.price.toFixed(2)} PLN`
                    : '';

                return ({
                    label: `${x.name}${labelPricePart}`,
                    value: `${x.name};${(x.price || x.price === 0) ? x.price : ""}`
                });
            }));
        };

        const fetch = async () => {

            try {
                await fetchCanSell();
                const categoryOptions = await fetchCategoryOptions();
                await fetchDeliveryMethods();

                setState({
                    loading: false,
                    canSell: true,
                    categoryOptions: categoryOptions,
                    offer: offerDefaultValues
                });
            } catch (error) {
                if (error.type === 'SKIP') return;
                else console.log(error);
            }
        };

        fetch();
    }, []);

    const prepareFormData = event => {
        let formData = new FormData(event.target);

        // Prepare images
        const imagesMetadata = images.map((img, index) => ({
            imageId: img.id,
            isRemote: false,
            isMain: img.isMain,
            sortId: index
        }));
        if (imagesMetadata.length === 0) {
            toast.warn("Your offer must have at least 1 image");
            throw "WARN";
        }
        formData.append("imagesMetadata", JSON.stringify(imagesMetadata));
        images.forEach(img => formData.append("images", img.file));

        // Prepare parameters
        let preparedParameters = parameters.filter(x => x.key && x.value);
        formData.append("keyValueInfos", JSON.stringify(preparedParameters));

        // Prepare delivery methods
        let preparedDeliveryMethods = deliveryMethods.filter(x => x.key && x.value);
        if (preparedDeliveryMethods.length === 0) {
            toast.warn("At least 1 delivery method required");
            throw "WARN";
        }
        if (new Set(preparedDeliveryMethods.map(x => x.key)).size !== preparedDeliveryMethods.length) {
            toast.warn("Delivery methods must be unique");
            throw "WARN";
        }

        preparedDeliveryMethods = preparedDeliveryMethods.map(x =>
            ({ name: x.key, price: x.value }));
        formData.append("deliveryMethods", JSON.stringify(preparedDeliveryMethods));

        return formData;
    }

    const createOfferDraft = async event => {
        event.preventDefault();

        const formData = prepareFormData(event);

        const action = async () => await axios.post("/offers-api/draft", formData);
        await authorizedRequestHandler(action,
            {
                status: 200,
                callback: () => {
                    toast.success("Offer draft saved");
                    history.push(`/user/offers`);
                }
            },
            {
                status: 400,
                callback: () => {
                    toast.error("Your creation request has been rejected");
                    throw {};
                }
            }
        );
    };

    const createOfferAndPublish = async event => {
        event.preventDefault();

        const formData = prepareFormData(event);

        const action = async () => await axios.post("/offers-api/draft", formData);
        const creationResult = await authorizedRequestHandler(action,
            {
                status: 200,
                callback: result => {
                    return result;
                }
            },
            {
                status: 400,
                callback: () => {
                    toast.error("Your creation request has been rejected");
                    throw {};
                }
            }
        );

        const offerId = creationResult.data;
        const publishUri = `/offers-api/draft/${offerId}/publish`;
        const publishAction = async () => await axios.post(publishUri);

        await authorizedRequestHandler(publishAction, {
            status: 200,
            callback: () => {
                history.push(`/offers/${offerId}`);
            }
        });
    };

    const onSubmitCb = async event => {
        event.preventDefault();

        try {
            switch (formAction) {
                case "Draft":
                    await createOfferDraft(event)
                    break;
                case "Publish":
                    await createOfferAndPublish(event)
                    break;
                default:
                    break;
            }
        } catch (error) { }
    };

    if (state.loading) return <></>

    if (!state.canSell) return <>
        <h3>You cannot create offers yet...</h3>

        <p>
            Fill&nbsp;
            <Link to='/user/settings/seller-info'>
                seller info
            </Link> and come back :)
        </p>
    </>

    let formAction = null;
    return <div className="pt-2 pb-4">
        <form onSubmit={onSubmitCb} onKeyPress={e => { if (e.key === 'Enter') e.preventDefault(); }}>

            <div className="bg-white px-4 pt-3 pb-4">
                <h2 style={{ display: 'inline' }}>
                    Create Offer
                </h2>
            </div>

            <GeneralSection
                state={state}
                offer={state.offer}
                images={images}
                setImages={setImages}
            />

            <ParametersSection
                parameters={parameters}
                setParameters={setParameters}
            />

            <DeliveryMethodsSection
                deliveryMethods={deliveryMethods}
                setDeliveryMethods={setDeliveryMethods}
                predefinedDeliveryMethods={predefinedDeliveryMethods}
            />

            <div className="bg-white pb-3">
                <div className="row px-3">
                    <div className="col-6">
                        <button type="submit" className="btn btn-outline-success btn-block" onClick={() => formAction = "Draft"}>
                            Save draft and continue later
                        </button>
                    </div>

                    <div className="col-6">
                        <button type="submit" className="btn btn-success btn-block" onClick={() => formAction = "Publish"}>
                            Publish Offer
                        </button>
                    </div>
                </div>
            </div>
        </form>

        <ReactTooltip />
    </div>
}

export default CreateOfferDraftPage;