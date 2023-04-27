import React, { TextareaHTMLAttributes } from "react";

interface IProp extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    errortext: string;
    label?: string;
    labelclass?: string[];
    inputclass?: string[];
    children?: React.ReactNode;
}
export default function MTxtArea(props: IProp) {
    const { errortext, label, labelclass, inputclass } = props;
    const arrInputElementStyles = inputclass ?? [];
    if (errortext) arrInputElementStyles.push("border border-red-500");

    return (
        <>
            {label && (
                <label className={`block ${labelclass?.join(" ")}`}>
                    {label}
                </label>
            )}
            {
                <textarea
                    className={`shadow appearance-none border rounded w-full py-2 px-3 ${arrInputElementStyles.join(
                        " "
                    )}`}
                    {...props}
                />
            }
            {errortext ? <p className="text-red-500">{errortext}</p> : null}
        </>
    );
}
