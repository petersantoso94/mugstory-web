import React, { useState, useCallback } from "react";

export enum ValidationType {
    REQUIRED = "Req",
    MIN6 = "Min6",
    CONFIRM = "Confirm",
    MAX500 = "Max500",
}
const ValidationErrorText: { [key: string]: string } = {
    Req: "This field is required",
    Min6: "Maximum 5",
    Confirm: "Value is different from password field",
    Max500: "This field must not exceed 500 characters",
};
type ValidationFunctionType = {
    [key: string]: (value: string, compareValue?: string) => boolean;
};
export type StateType = {
    [key: string]: StateTypeDetail;
};
type StateTypeDetail = {
    value: string;
    validation: { [key: string]: string } | ValidationType[];
    errorMsg: string;
};
// true=valid
const ValidationFunction: ValidationFunctionType = {
    Req: (value: string) => {
        return !!value.trim();
    },
    Min6: (value: string) => value.length >= 6,
    Confirm: (value: string, compareValue?: string) => value === compareValue,
    Max500: (value: string) => value.length <= 500,
};
const validate = (rule: string, value: string, compareValue?: string) => {
    if (typeof ValidationFunction[rule] !== "function") {
        console.error("validation rule invalid: ", rule);
        return false;
    }
    return ValidationFunction[rule](value, compareValue);
};
//consider to use form input dynamically so we can modify the for in runtime by manipulating the state
//expected ```name: { value: "", validation: [ValidationType.REQUIRED], errorMsg: "" }```

export const UseForm = (initialVal: StateType) => {
    const [state, setState] = useState(initialVal);

    const validateElement = useCallback(
        (name: string, value: string): StateTypeDetail => {
            const updatedState = { ...state };
            const updatedValue = { ...updatedState[name] };

            if (
                !updatedValue.validation ||
                (Array.isArray(updatedValue.validation) &&
                    updatedValue.validation.length === 0)
            ) {
                // no validation selected
                throw `No Form component with name: ${name}`;
            }
            // do the validation
            // use default error message for iterable validation
            let iterableRules = Array.isArray(updatedValue.validation)
                ? updatedValue.validation
                : Object.keys(updatedValue.validation);
            for (let idx in iterableRules) {
                const rule = iterableRules[idx];
                const pass =
                    updatedState["password"]?.value ||
                    updatedState["Password"]?.value;
                //if true then valid
                if (!validate(rule, value, pass)) {
                    // if not valid, set error message
                    updatedValue.errorMsg = Array.isArray(
                        updatedValue.validation
                    )
                        ? ValidationErrorText[rule]
                        : updatedValue.validation[rule];

                    break;
                } else {
                    // if valid, remove error message
                    updatedValue.errorMsg = "";
                }
            }
            return updatedValue;
        },
        [state]
    );

    return {
        form: state,
        updateForm: (newForm: StateType) => {
            const updatedState = { ...newForm };
            setState(updatedState);
        },
        onChangeHandler: (e: React.ChangeEvent<HTMLInputElement>) => {
            const updatedState = { ...state };
            const updatedValue = { ...updatedState[e.target.name] };
            updatedValue.value = e.target.value;
            updatedState[e.target.name] = updatedValue;
            setState(updatedState);
        },
        onChangeAreaHandler: (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            const updatedState = { ...state };
            const updatedValue = { ...updatedState[e.target.name] };
            updatedValue.value = e.target.value;
            updatedState[e.target.name] = updatedValue;
            setState(updatedState);
        },
        onBlurHandler: (e: React.ChangeEvent<HTMLInputElement>) => {
            const updatedState = { ...state };
            const updatedValue = validateElement(e.target.name, e.target.value);
            updatedState[e.target.name] = updatedValue;
            setState(updatedState);
        },
        onBlurAreaHandler: (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            const updatedState = { ...state };
            const updatedValue = validateElement(e.target.name, e.target.value);
            updatedState[e.target.name] = updatedValue;
            setState(updatedState);
        },
        isFormValid: () => {
            let isValid = true;
            const updatedState = { ...state };
            for (let key in state) {
                const updatedValue = validateElement(key, state[key].value);
                if (updatedValue) {
                    //there is invalid value for one rule
                    updatedState[key] = updatedValue;
                    if (updatedValue.errorMsg) isValid = false;
                }
            }
            setState(updatedState);
            return isValid;
        },
        reset: () => {
            const updatedState = { ...state };
            for (let key in state) {
                updatedState[key].errorMsg = "";
                updatedState[key].value = "";
            }
            setState(updatedState);
        },
        restore: (prevState: StateType) => {
            const updatedState = { ...prevState };
            for (let key in state) {
                updatedState[key].errorMsg = "";
            }
            setState(prevState);
        },
    };
};
