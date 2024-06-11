import { Field, FinalFormSelect, TextField } from "@comet/admin";
import { EditBrevoContactFormValues } from "@comet/brevo-admin";
import { MenuItem } from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import { GQLBrevoContactSalutation } from "@src/graphql.generated";
import { DocumentNode } from "graphql";
import gql from "graphql-tag";
import React from "react";
import { FormattedMessage, IntlShape } from "react-intl";

import { GQLBrevoContactAttributesFragmentFragment } from "./brevoContactsPageAttributesConfig.generated";

const attributesFragment = gql`
    fragment BrevoContactAttributesFragment on BrevoContact {
        attributes {
            LASTNAME
            FIRSTNAME
            SALUTATION
        }
    }
`;

const salutationOptions: Array<{ label: React.ReactNode; value: GQLBrevoContactSalutation }> = [
    {
        label: <FormattedMessage id="brevoContact.filters.salutation.male" defaultMessage="Male" />,
        value: "MALE",
    },
    {
        label: <FormattedMessage id="brevoContact.filters.salutation.female" defaultMessage="Female" />,
        value: "FEMALE",
    },
];

interface AdditionalFormConfigInputProps extends EditBrevoContactFormValues {
    attributes: {
        SALUTATION?: GQLBrevoContactSalutation;
        FIRSTNAME?: string;
        LASTNAME?: string;
    };
}

export const additionalFormConfig = {
    nodeFragment: attributesFragment,
};

export const getBrevoContactConfig = (
    intl: IntlShape,
): {
    additionalGridFields: GridColDef<GQLBrevoContactAttributesFragmentFragment>[];
    additionalFormFields: React.ReactNode;
    additionalAttributesFragment: {
        fragment: DocumentNode;
        name: string;
    };
    input2State: (values?: AdditionalFormConfigInputProps) => {
        email: string;
        attributes: { SALUTATION?: GQLBrevoContactSalutation; FIRSTNAME?: string; LASTNAME?: string };
    };
    exportFields: {
        renderValue: (row: GQLBrevoContactAttributesFragmentFragment) => string;
        headerName: string;
    }[];
} => {
    return {
        additionalGridFields: [
            {
                field: "attributes.firstName",
                headerName: intl.formatMessage({ id: "brevoContact.firstName", defaultMessage: "First name" }),
                filterable: false,
                sortable: false,
                width: 150,
                renderCell: ({ row }) => row.attributes?.FIRSTNAME,
            },
            {
                field: "attributes.lastName",
                headerName: intl.formatMessage({ id: "brevoContact.lastName", defaultMessage: "Last name" }),
                filterable: false,
                sortable: false,
                width: 150,
                renderCell: ({ row }) => row.attributes?.LASTNAME,
            },
        ],
        additionalFormFields: (
            <>
                <Field
                    label={<FormattedMessage id="brevoContact.fields.salutation" defaultMessage="Salutation" />}
                    name="attributes.SALUTATION"
                    fullWidth
                >
                    {(props) => (
                        <FinalFormSelect {...props} fullWidth>
                            {salutationOptions.map((option) => (
                                <MenuItem value={option.value} key={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </FinalFormSelect>
                    )}
                </Field>
                <TextField
                    label={<FormattedMessage id="brevoContact.fields.salutation" defaultMessage="First name" />}
                    name="attributes.FIRSTNAME"
                    fullWidth
                />
                <TextField
                    label={<FormattedMessage id="brevoContact.fields.salutation" defaultMessage="Last name" />}
                    name="attributes.LASTNAME"
                    fullWidth
                />
            </>
        ),
        input2State: (values?: AdditionalFormConfigInputProps) => {
            return {
                email: values?.email ?? "",
                attributes: {
                    SALUTATION: values?.attributes?.SALUTATION,
                    FIRSTNAME: values?.attributes?.FIRSTNAME,
                    LASTNAME: values?.attributes?.LASTNAME,
                },
            };
        },
        additionalAttributesFragment: {
            fragment: attributesFragment,
            name: "BrevoContactAttributesFragment",
        },
        exportFields: [
            {
                renderValue: (row: GQLBrevoContactAttributesFragmentFragment) => row.attributes?.FIRSTNAME,
                headerName: intl.formatMessage({ id: "brevoContact.firstName", defaultMessage: "First name" }),
            },
            {
                renderValue: (row: GQLBrevoContactAttributesFragmentFragment) => row.attributes?.LASTNAME,
                headerName: intl.formatMessage({ id: "brevoContact.lastName", defaultMessage: "Last name" }),
            },
        ],
    };
};
