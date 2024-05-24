import { GridColDef } from "@mui/x-data-grid";
import { DocumentNode } from "graphql";
import gql from "graphql-tag";
import { IntlShape } from "react-intl";

import { GQLBrevoContactAttributesFragmentFragment } from "./brevoContactsPageAttributesConfig.generated";

const attributesFragment = gql`
    fragment BrevoContactAttributesFragment on BrevoContact {
        attributes {
            LASTNAME
            FIRSTNAME
        }
    }
`;

export const getBrevoContactConfig = (
    intl: IntlShape,
): {
    additionalGridFields: GridColDef<GQLBrevoContactAttributesFragmentFragment>[];
    additionalAttributesFragment: {
        fragment: DocumentNode;
        name: string;
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
