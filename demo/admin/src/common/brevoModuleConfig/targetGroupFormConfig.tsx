import { gql } from "@apollo/client";
import { Field, FinalFormSelect } from "@comet/admin";
import { MenuItem } from "@mui/material";
import * as React from "react";
import { FormattedMessage } from "react-intl";

const salutationOptions = [
    {
        label: <FormattedMessage id="targetGroup.filters.salutation.male." defaultMessage="Male" />,
        value: "MALE",
    },
    {
        label: <FormattedMessage id="targetGroup.filters.salutation.female." defaultMessage="Female" />,
        value: "FEMALE",
    },
];

export const additionalPageTreeNodeFieldsFragment = {
    fragment: gql`
        fragment TargetGroupFilters on TargetGroup {
            filters {
                SALUTATION
            }
        }
    `,
    name: "TargetGroupFilters",
};

export const additionalFormConfig = {
    dataToInitialValues: (values?: { filters: { SALUTATION: string[] } }) => {
        return {
            filters: {
                SALUTATION: values?.filters?.SALUTATION ?? [],
            },
        };
    },
    nodeFragment: additionalPageTreeNodeFieldsFragment,
    additionalFormFields: (
        <>
            <Field label={<FormattedMessage id="targetGroup.fields.salutation" defaultMessage="Salutation" />} name="filters.SALUTATION" fullWidth>
                {(props) => (
                    <FinalFormSelect {...props} fullWidth multiple clearable>
                        {salutationOptions.map((option) => (
                            <MenuItem value={option.value} key={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </FinalFormSelect>
                )}
            </Field>
        </>
    ),
};
