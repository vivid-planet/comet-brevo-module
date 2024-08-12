import { Csv } from "@comet/admin-icons";
import { Button, CircularProgress, lighten, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import * as React from "react";
import Dropzone from "react-dropzone";
import { FieldRenderProps } from "react-final-form";
import { FormattedMessage } from "react-intl";

interface CsvUploadFieldProps extends FieldRenderProps<File, HTMLDivElement> {
    buttonText: React.ReactNode;
    submitting: boolean;
}

export const CsvUploadField: React.FC<CsvUploadFieldProps> = ({ buttonText, submitting, input: { onChange, value } }) => {
    return (
        <>
            {submitting && (
                <LoadingWrapper>
                    <CircularProgress />
                </LoadingWrapper>
            )}
            <Dropzone
                onDrop={(acceptedFiles) => {
                    if (acceptedFiles.length) {
                        onChange(acceptedFiles[0]);
                    }
                }}
                multiple={false}
                accept={{ "text/csv": [] }}
                disabled={submitting}
            >
                {({ getRootProps, getInputProps, isDragActive, isDragReject }) => (
                    <Root {...getRootProps()} isDragActive={isDragActive} isDragReject={isDragReject}>
                        <input
                            {...getInputProps()}
                            onChange={(event) => {
                                onChange(event.target.files?.[0]);
                            }}
                        />
                        <Button size="small" color="primary" variant="text" startIcon={<Csv fontSize="small" />} disabled={submitting}>
                            {value ? <FormattedMessage id="common.changeFile" defaultMessage="Change file" /> : buttonText}
                        </Button>
                    </Root>
                )}
            </Dropzone>
            {!!value && <CsvFileName variant="body2">{value.name}</CsvFileName>}
        </>
    );
};

const CsvFileName = styled(Typography)`
    text-align: center;
    margin-top: 15px;
`;

const Root = styled("div")<{ isDragActive: boolean; isDragReject: boolean }>`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 2px dashed
        ${({ theme, isDragActive, isDragReject }) =>
            isDragReject ? theme.palette.error["main"] : isDragActive ? theme.palette.primary["main"] : theme.palette.divider};
    min-height: 100px;
    background: ${({ theme, isDragActive, isDragReject }) =>
        isDragReject ? lighten(theme.palette.error["main"], 0.95) : isDragActive ? lighten(theme.palette.primary["main"], 0.95) : "transparent"};
`;

const LoadingWrapper = styled("div")`
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(255, 255, 255, 0.7);
    pointer-events: none;
    z-index: 1;
`;
