import React, { useState } from 'react';
import parse from 'html-react-parser';
import ReactTooltip from 'react-tooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons'
import XRegExp from 'xregexp';

const ValidableInput = (
    {
        name = "",
        placeholder = "",
        type = "text",
        defaultValue = "",
        classes,
        regex = ".*",
        isHtmlErrorMsg = false,
        errorMsg = "",
        tipMsg,
        inputAttributes = {}
    }
) => {

    const [value, setValue] = useState(defaultValue);
    const [isValid, setIsValid] = useState(true);

    const onChange = event => {
        setValue(event.target.value);
        setIsValid(XRegExp(regex).test(event.target.value));
    };

    if (!tipMsg) return <>
        <input
            name={name}
            type={type}
            placeholder={placeholder}
            className={`form-control ${classes}`}
            value={value}
            onChange={onChange}
            onInvalid={() => setIsValid(false)}
            required
            {...inputAttributes}
        />

        {
            !isValid &&
            <span className="text-danger">
                {
                    isHtmlErrorMsg
                        ? parse(errorMsg)
                        : errorMsg
                }
            </span>
        }
    </>

    return <>
        <div className="input-group mb-2">
            <input
                name={name}
                type={type}
                placeholder={placeholder}
                className={`form-control ${classes}`}
                value={value}
                onChange={onChange}
                onInvalid={() => setIsValid(false)}
                required
                {...inputAttributes}
            />

            <div className="input-group-prepend">
                <div className="input-group-text">
                    <FontAwesomeIcon icon={faQuestionCircle}
                        className="align-baseline"
                        style={{ color: 'gray', marginLeft: '2px' }}
                        size={'1x'}
                        data-tip={tipMsg}
                    />
                </div>
            </div>

            <ReactTooltip html={true} />
        </div>

        {
            !isValid &&
            <span className="text-danger">
                {
                    isHtmlErrorMsg
                        ? parse(errorMsg)
                        : errorMsg
                }
            </span>
        }
    </>
};

export default ValidableInput;