/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import React, { useEffect, useRef } from 'react';
import semverLt from 'semver/functions/lt';
import semverCoerce from 'semver/functions/coerce';
import semverValid from 'semver/functions/valid';
import { css } from '@emotion/react';
import {
  EuiFieldText,
  EuiFormRow,
  EuiSpacer,
  EuiText,
  EuiTitle,
  EuiSelect,
  EuiForm,
  EuiCallOut,
  EuiTextArea,
  EuiHorizontalRule,
} from '@elastic/eui';
import type { NewPackagePolicy } from '@kbn/fleet-plugin/public';
import { NewPackagePolicyInput, PackageInfo } from '@kbn/fleet-plugin/common';
import { FormattedMessage } from '@kbn/i18n-react';
import { i18n } from '@kbn/i18n';
import {
  CLOUDBEAT_GCP,
  SETUP_ACCESS_CLOUD_SHELL,
  SETUP_ACCESS_MANUAL,
} from '../../../common/constants';
import { RadioGroup } from './csp_boxed_radio_group';
import {
  getCspmCloudShellDefaultValue,
  getPosturePolicy,
  NewPackagePolicyPostureInput,
} from './utils';
import { MIN_VERSION_GCP_CIS } from '../../common/constants';
import { cspIntegrationDocsNavigation } from '../../common/navigation/constants';
import { ReadDocumentation } from './aws_credentials_form/aws_credentials_form';

export const CIS_GCP_INPUT_FIELDS_TEST_SUBJECTS = {
  GOOGLE_CLOUD_SHELL_SETUP: 'google_cloud_shell_setup_test_id',
  PROJECT_ID: 'project_id_test_id',
  CREDENTIALS_TYPE: 'credentials_type_test_id',
  CREDENTIALS_FILE: 'credentials_file_test_id',
  CREDENTIALS_JSON: 'credentials_json_test_id',
};
type SetupFormatGCP = 'google_cloud_shell' | 'manual';
const GCPSetupInfoContent = () => (
  <>
    <EuiHorizontalRule margin="xl" />
    <EuiTitle size="xs">
      <h2>
        <FormattedMessage
          id="xpack.csp.gcpIntegration.setupInfoContentTitle"
          defaultMessage="Setup Access"
        />
      </h2>
    </EuiTitle>
    <EuiSpacer size="l" />
    <EuiText color={'subdued'} size="s">
      <FormattedMessage
        id="xpack.csp.gcpIntegration.setupInfoContent"
        defaultMessage="The integration will need elevated access to run some CIS benchmark rules. Select your preferred
    method of providing the GCP credentials this integration will use. You can follow these
    step-by-step instructions to generate the necessary credentials."
      />
    </EuiText>
  </>
);

const GoogleCloudShellSetup = () => {
  return (
    <>
      <EuiText
        color="subdued"
        size="s"
        data-test-subj={CIS_GCP_INPUT_FIELDS_TEST_SUBJECTS.GOOGLE_CLOUD_SHELL_SETUP}
      >
        <ol
          css={css`
            list-style: auto;
          `}
        >
          <li>
            <FormattedMessage
              id="xpack.csp.gcpIntegration.cloudShellSetupStep.login"
              defaultMessage="Log into your Google Cloud Console"
            />
          </li>
          <li>
            <FormattedMessage
              id="xpack.csp.gcpIntegration.cloudShellSetupStep.save"
              defaultMessage="Note down the GCP project ID of the project you wish to monitor"
            />
          </li>
          <li>
            <FormattedMessage
              id="xpack.csp.gcpIntegration.cloudShellSetupStep.launch"
              defaultMessage='Click "Save and Continue" at the bottom right of the page. Then, on the pop-up modal, click "Launch Google Cloud Shell"'
            />
          </li>
        </ol>
      </EuiText>
      <EuiSpacer size="l" />
    </>
  );
};

const credentialOptionsList = [
  {
    text: i18n.translate('xpack.csp.gcpIntegration.credentialsFileOption', {
      defaultMessage: 'Credentials File',
    }),
    value: 'credentials-file',
  },
  {
    text: i18n.translate('xpack.csp.gcpIntegration.credentialsJsonOption', {
      defaultMessage: 'Credentials JSON',
    }),
    value: 'credentials-json',
  },
];

type GcpFields = Record<string, { label: string; type?: 'password' | 'text'; value?: string }>;
interface GcpInputFields {
  fields: GcpFields;
}

export const gcpField: GcpInputFields = {
  fields: {
    'gcp.project_id': {
      label: i18n.translate('xpack.csp.gcpIntegration.projectidFieldLabel', {
        defaultMessage: 'Project ID',
      }),
      type: 'text',
    },
    'gcp.credentials.file': {
      label: i18n.translate('xpack.csp.findings.gcpIntegration.gcpInputText.credentialFileText', {
        defaultMessage: 'Path to JSON file containing the credentials and key used to subscribe',
      }),
      type: 'text',
    },
    'gcp.credentials.json': {
      label: i18n.translate('xpack.csp.findings.gcpIntegration.gcpInputText.credentialJSONText', {
        defaultMessage: 'JSON blob containing the credentials and key used to subscribe',
      }),
      type: 'text',
    },
    'gcp.credentials.type': {
      label: i18n.translate(
        'xpack.csp.findings.gcpIntegration.gcpInputText.credentialSelectBoxTitle',
        {
          defaultMessage: 'Credential',
        }
      ),
      type: 'text',
    },
  },
};

const getSetupFormatOptions = (): Array<{
  id: SetupFormatGCP;
  label: string;
  disabled: boolean;
}> => [
  {
    id: SETUP_ACCESS_CLOUD_SHELL,
    label: i18n.translate('xpack.csp.gcpIntegration.setupFormatOptions.googleCloudShell', {
      defaultMessage: 'Google Cloud Shell',
    }),
    disabled: false,
  },
  {
    id: SETUP_ACCESS_MANUAL,
    label: i18n.translate('xpack.csp.gcpIntegration.setupFormatOptions.manual', {
      defaultMessage: 'Manual',
    }),
    disabled: false,
  },
];

interface GcpFormProps {
  newPolicy: NewPackagePolicy;
  input: Extract<
    NewPackagePolicyPostureInput,
    { type: 'cloudbeat/cis_aws' | 'cloudbeat/cis_eks' | 'cloudbeat/cis_gcp' }
  >;
  updatePolicy(updatedPolicy: NewPackagePolicy): void;
  packageInfo: PackageInfo;
  setIsValid: (isValid: boolean) => void;
  onChange: any;
}

const getInputVarsFields = (input: NewPackagePolicyInput, fields: GcpFields) =>
  Object.entries(input.streams[0].vars || {})
    .filter(([id]) => id in fields)
    .map(([id, inputVar]) => {
      const field = fields[id];
      return {
        id,
        label: field.label,
        type: field.type || 'text',
        value: inputVar.value,
      } as const;
    });

const getSetupFormatFromInput = (
  input: Extract<
    NewPackagePolicyPostureInput,
    { type: 'cloudbeat/cis_aws' | 'cloudbeat/cis_eks' | 'cloudbeat/cis_gcp' }
  >
): SetupFormatGCP => {
  const credentialsType = input.streams[0].vars?.setup_access?.value;
  // Google Cloud shell is the default value
  if (!credentialsType) {
    return SETUP_ACCESS_CLOUD_SHELL;
  }
  if (credentialsType !== SETUP_ACCESS_CLOUD_SHELL) {
    return SETUP_ACCESS_MANUAL;
  }

  return SETUP_ACCESS_CLOUD_SHELL;
};

const getGoogleCloudShellUrl = (newPolicy: NewPackagePolicy) => {
  const template: string | undefined = newPolicy?.inputs?.find((i) => i.type === CLOUDBEAT_GCP)
    ?.config?.cloud_shell_url?.value;

  return template || undefined;
};

const updateCloudShellUrl = (
  newPolicy: NewPackagePolicy,
  updatePolicy: (policy: NewPackagePolicy) => void,
  templateUrl: string | undefined
) => {
  updatePolicy?.({
    ...newPolicy,
    inputs: newPolicy.inputs.map((input) => {
      if (input.type === CLOUDBEAT_GCP) {
        return {
          ...input,
          config: { cloud_shell_url: { value: templateUrl } },
        };
      }
      return input;
    }),
  });
};

const useCloudShellUrl = ({
  packageInfo,
  newPolicy,
  updatePolicy,
  setupFormat,
}: {
  packageInfo: PackageInfo;
  newPolicy: NewPackagePolicy;
  updatePolicy: (policy: NewPackagePolicy) => void;
  setupFormat: SetupFormatGCP;
}) => {
  useEffect(() => {
    const policyInputCloudShellUrl = getGoogleCloudShellUrl(newPolicy);

    if (setupFormat === SETUP_ACCESS_MANUAL) {
      if (!!policyInputCloudShellUrl) {
        updateCloudShellUrl(newPolicy, updatePolicy, undefined);
      }
      return;
    }
    const templateUrl = getCspmCloudShellDefaultValue(packageInfo);

    // If the template is not available, do not update the policy
    if (templateUrl === '') return;

    // If the template is already set, do not update the policy
    if (policyInputCloudShellUrl === templateUrl) return;

    updateCloudShellUrl(newPolicy, updatePolicy, templateUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newPolicy?.vars?.cloud_shell_url, newPolicy, packageInfo, setupFormat]);
};

export const GcpCredentialsForm = ({
  input,
  newPolicy,
  updatePolicy,
  packageInfo,
  setIsValid,
  onChange,
}: GcpFormProps) => {
  const fields = getInputVarsFields(input, gcpField.fields);
  const validSemantic = semverValid(packageInfo.version);
  const integrationVersionNumberOnly = semverCoerce(validSemantic) || '';
  const isInvalid = semverLt(integrationVersionNumberOnly, MIN_VERSION_GCP_CIS);
  const fieldsSnapshot = useRef({});
  const lastSetupAccessType = useRef<string | undefined>(undefined);
  const setupFormat = getSetupFormatFromInput(input);
  const getFieldById = (id: keyof GcpInputFields['fields']) => {
    return fields.find((element) => element.id === id);
  };

  useCloudShellUrl({
    packageInfo,
    newPolicy,
    updatePolicy,
    setupFormat,
  });
  const onSetupFormatChange = (newSetupFormat: SetupFormatGCP) => {
    if (newSetupFormat === SETUP_ACCESS_CLOUD_SHELL) {
      // We need to store the current manual fields to restore them later
      fieldsSnapshot.current = Object.fromEntries(
        fields.map((field) => [field.id, { value: field.value }])
      );
      // We need to store the last manual credentials type to restore it later
      lastSetupAccessType.current = input.streams[0].vars?.setup_access?.value;

      updatePolicy(
        getPosturePolicy(newPolicy, input.type, {
          setup_access: {
            value: SETUP_ACCESS_CLOUD_SHELL,
            type: 'text',
          },
          // Clearing fields from previous setup format to prevent exposing credentials
          // when switching from manual to cloud formation
          ...Object.fromEntries(fields.map((field) => [field.id, { value: undefined }])),
        })
      );
    } else {
      updatePolicy(
        getPosturePolicy(newPolicy, input.type, {
          setup_access: {
            // Restoring last manual credentials type
            value: SETUP_ACCESS_MANUAL,
            type: 'text',
          },
          // Restoring fields from manual setup format if any
          ...fieldsSnapshot.current,
        })
      );
    }
  };
  // Integration is Invalid IF Version is not at least 1.5.0 OR Setup Access is manual but Project ID is empty
  useEffect(() => {
    const isProjectIdEmpty =
      setupFormat === SETUP_ACCESS_MANUAL && !getFieldById('gcp.project_id')?.value;
    const isInvalidPolicy = isInvalid || isProjectIdEmpty;

    setIsValid(!isInvalidPolicy);

    onChange({
      isValid: !isInvalidPolicy,
      updatedPolicy: newPolicy,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, packageInfo, setupFormat]);

  if (isInvalid) {
    return (
      <>
        <EuiSpacer size="l" />
        <EuiCallOut color="warning">
          <FormattedMessage
            id="xpack.csp.gcpIntegration.gcpNotSupportedMessage"
            defaultMessage="CIS GCP is not supported on the current Integration version, please upgrade your integration to the latest version to use CIS GCP"
          />
        </EuiCallOut>
      </>
    );
  }
  return (
    <>
      <GCPSetupInfoContent />
      <EuiSpacer size="l" />
      <RadioGroup
        size="s"
        options={getSetupFormatOptions()}
        idSelected={setupFormat}
        onChange={onSetupFormatChange}
      />
      <EuiSpacer size="l" />
      {setupFormat === SETUP_ACCESS_MANUAL ? (
        <GcpInputVarFields
          fields={fields}
          onChange={(key, value) =>
            updatePolicy(getPosturePolicy(newPolicy, input.type, { [key]: { value } }))
          }
        />
      ) : (
        <GoogleCloudShellSetup />
      )}
      <EuiSpacer size="s" />
      <ReadDocumentation url={cspIntegrationDocsNavigation.cspm.getStartedPath} />
      <EuiSpacer />
    </>
  );
};

const GcpInputVarFields = ({
  fields,
  onChange,
}: {
  fields: Array<GcpFields[keyof GcpFields] & { value: string; id: string }>;
  onChange: (key: string, value: string) => void;
}) => {
  const getFieldById = (id: keyof GcpInputFields['fields']) => {
    return fields.find((element) => element.id === id);
  };
  const projectIdFields = getFieldById('gcp.project_id');
  const credentialsTypeFields = getFieldById('gcp.credentials.type');
  const credentialFilesFields = getFieldById('gcp.credentials.file');
  const credentialJSONFields = getFieldById('gcp.credentials.json');

  const credentialFieldValue = credentialOptionsList[0].value;
  const credentialJSONValue = credentialOptionsList[1].value;

  const credentialsTypeValue = credentialsTypeFields?.value || credentialOptionsList[0].value;

  return (
    <div>
      <EuiForm component="form">
        {projectIdFields && (
          <EuiFormRow fullWidth label={gcpField.fields['gcp.project_id'].label}>
            <EuiFieldText
              data-test-subj={CIS_GCP_INPUT_FIELDS_TEST_SUBJECTS.PROJECT_ID}
              id={projectIdFields.id}
              fullWidth
              value={projectIdFields.value || ''}
              onChange={(event) => onChange(projectIdFields.id, event.target.value)}
            />
          </EuiFormRow>
        )}
        {credentialsTypeFields && credentialFilesFields && credentialJSONFields && (
          <EuiFormRow fullWidth label={gcpField.fields['gcp.credentials.type'].label}>
            <EuiSelect
              data-test-subj={CIS_GCP_INPUT_FIELDS_TEST_SUBJECTS.CREDENTIALS_TYPE}
              fullWidth
              options={credentialOptionsList}
              value={credentialsTypeFields?.value || credentialOptionsList[0].value}
              onChange={(optionElem) => {
                onChange(credentialsTypeFields?.id, optionElem.target.value);
              }}
            />
          </EuiFormRow>
        )}
        {credentialsTypeValue === credentialFieldValue && credentialFilesFields && (
          <EuiFormRow fullWidth label={gcpField.fields['gcp.credentials.file'].label}>
            <EuiFieldText
              data-test-subj={CIS_GCP_INPUT_FIELDS_TEST_SUBJECTS.CREDENTIALS_FILE}
              id={credentialFilesFields.id}
              fullWidth
              value={credentialFilesFields.value || ''}
              onChange={(event) => onChange(credentialFilesFields.id, event.target.value)}
            />
          </EuiFormRow>
        )}
        {credentialsTypeValue === credentialJSONValue && credentialJSONFields && (
          <EuiFormRow fullWidth label={gcpField.fields['gcp.credentials.json'].label}>
            <EuiTextArea
              data-test-subj={CIS_GCP_INPUT_FIELDS_TEST_SUBJECTS.CREDENTIALS_JSON}
              id={credentialJSONFields.id}
              fullWidth
              value={credentialJSONFields.value || ''}
              onChange={(event) => onChange(credentialJSONFields.id, event.target.value)}
            />
          </EuiFormRow>
        )}
      </EuiForm>
    </div>
  );
};
