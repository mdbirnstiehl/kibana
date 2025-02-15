/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiPopover,
  EuiContextMenu,
  EuiButton,
  EuiIcon,
  EuiPortal,
} from '@elastic/eui';
import { FormattedMessage } from '@kbn/i18n-react';

import type { Agent, AgentPolicy } from '../../../../types';
import {
  AgentReassignAgentPolicyModal,
  AgentUnenrollAgentModal,
  AgentUpgradeAgentModal,
} from '../../components';
import { useLicense, sendGetAgents, sendGetAgentPolicies } from '../../../../hooks';
import {
  LICENSE_FOR_SCHEDULE_UPGRADE,
  AGENTS_PREFIX,
  SO_SEARCH_LIMIT,
  AGENT_POLICY_SAVED_OBJECT_TYPE,
} from '../../../../../../../common/constants';
import { ExperimentalFeaturesService } from '../../../../services';

import { getCommonTags } from '../utils';

import { AgentRequestDiagnosticsModal } from '../../components/agent_request_diagnostics_modal';

import type { SelectionMode } from './types';
import { TagsAddRemove } from './tags_add_remove';

export interface Props {
  totalAgents: number;
  totalInactiveAgents: number;
  selectionMode: SelectionMode;
  currentQuery: string;
  selectedAgents: Agent[];
  visibleAgents: Agent[];
  refreshAgents: (args?: { refreshTags?: boolean }) => void;
  allTags: string[];
  agentPolicies: AgentPolicy[];
}

export const AgentBulkActions: React.FunctionComponent<Props> = ({
  totalAgents,
  totalInactiveAgents,
  selectionMode,
  currentQuery,
  selectedAgents,
  visibleAgents,
  refreshAgents,
  allTags,
  agentPolicies,
}) => {
  const licenseService = useLicense();
  const isLicenceAllowingScheduleUpgrade = licenseService.hasAtLeast(LICENSE_FOR_SCHEDULE_UPGRADE);

  // Bulk actions menu states
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const closeMenu = () => setIsMenuOpen(false);
  const onClickMenu = () => setIsMenuOpen(!isMenuOpen);

  // Actions states
  const [isReassignFlyoutOpen, setIsReassignFlyoutOpen] = useState<boolean>(false);
  const [isUnenrollModalOpen, setIsUnenrollModalOpen] = useState<boolean>(false);
  const [updateModalState, setUpgradeModalState] = useState({
    isOpen: false,
    isScheduled: false,
    isUpdating: false,
  });
  const [isTagAddVisible, setIsTagAddVisible] = useState<boolean>(false);
  const [isRequestDiagnosticsModalOpen, setIsRequestDiagnosticsModalOpen] =
    useState<boolean>(false);
  const [managedAgents, setManagedAgents] = useState<string[]>([]);

  // get all the managed policies
  const fetchManagedAgents = useCallback(async () => {
    if (selectionMode === 'query') {
      const managedPoliciesKuery = `${AGENT_POLICY_SAVED_OBJECT_TYPE}.is_managed:true`;

      const agentPoliciesResponse = await sendGetAgentPolicies({
        kuery: managedPoliciesKuery,
        perPage: SO_SEARCH_LIMIT,
        full: false,
      });

      if (agentPoliciesResponse.error) {
        throw new Error(agentPoliciesResponse.error.message);
      }

      const managedPolicies = agentPoliciesResponse.data?.items ?? [];

      if (managedPolicies.length === 0) {
        return [];
      }

      // find all the agents that have those policies and are not unenrolled
      const policiesKuery = managedPolicies
        .map((policy) => `policy_id:"${policy.id}"`)
        .join(' or ');
      const kuery = `NOT (status:unenrolled) and ${policiesKuery}`;
      const response = await sendGetAgents({
        kuery,
        perPage: SO_SEARCH_LIMIT,
        showInactive: true,
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.data?.items ?? [];
    }
    return [];
  }, [selectionMode]);

  useEffect(() => {
    async function fetchDataAsync() {
      const allManagedAgents = await fetchManagedAgents();
      setManagedAgents(allManagedAgents?.map((agent) => agent.id));
    }
    fetchDataAsync();
  }, [fetchManagedAgents]);

  // update the query removing the "managed" agents
  const selectionQuery = useMemo(() => {
    if (managedAgents.length) {
      const excludedKuery = `${AGENTS_PREFIX}.agent.id : (${managedAgents
        .map((id) => `"${id}"`)
        .join(' or ')})`;
      return `${currentQuery} AND NOT (${excludedKuery})`;
    } else {
      return currentQuery;
    }
  }, [currentQuery, managedAgents]);

  // Check if user is working with only inactive agents
  const atLeastOneActiveAgentSelected =
    selectionMode === 'manual'
      ? !!selectedAgents.find((agent) => agent.active)
      : totalAgents > totalInactiveAgents;
  const totalActiveAgents = totalAgents - totalInactiveAgents;

  const agentCount =
    selectionMode === 'manual' ? selectedAgents.length : totalActiveAgents - managedAgents?.length;

  const agents = selectionMode === 'manual' ? selectedAgents : selectionQuery;

  const [tagsPopoverButton, setTagsPopoverButton] = useState<HTMLElement>();
  const { diagnosticFileUploadEnabled } = ExperimentalFeaturesService.get();

  const menuItems = [
    {
      name: (
        <FormattedMessage
          id="xpack.fleet.agentBulkActions.addRemoveTags"
          data-test-subj="agentBulkActionsAddRemoveTags"
          defaultMessage="Add / remove tags"
        />
      ),
      icon: <EuiIcon type="tag" size="m" />,
      disabled: !atLeastOneActiveAgentSelected,
      onClick: (event: any) => {
        setTagsPopoverButton((event.target as Element).closest('button')!);
        setIsTagAddVisible(!isTagAddVisible);
      },
    },
    {
      name: (
        <FormattedMessage
          id="xpack.fleet.agentBulkActions.reassignPolicy"
          data-test-subj="agentBulkActionsReassign"
          defaultMessage="Assign to new policy"
        />
      ),
      icon: <EuiIcon type="pencil" size="m" />,
      disabled: !atLeastOneActiveAgentSelected,
      onClick: () => {
        closeMenu();
        setIsReassignFlyoutOpen(true);
      },
    },
    {
      name: (
        <FormattedMessage
          id="xpack.fleet.agentBulkActions.unenrollAgents"
          data-test-subj="agentBulkActionsUnenroll"
          defaultMessage="Unenroll {agentCount, plural, one {# agent} other {# agents}}"
          values={{
            agentCount,
          }}
        />
      ),
      icon: <EuiIcon type="trash" size="m" />,
      disabled: !atLeastOneActiveAgentSelected,
      onClick: () => {
        closeMenu();
        setIsUnenrollModalOpen(true);
      },
    },
    {
      name: (
        <FormattedMessage
          id="xpack.fleet.agentBulkActions.upgradeAgents"
          data-test-subj="agentBulkActionsUpgrade"
          defaultMessage="Upgrade {agentCount, plural, one {# agent} other {# agents}}"
          values={{
            agentCount,
          }}
        />
      ),
      icon: <EuiIcon type="refresh" size="m" />,
      disabled: !atLeastOneActiveAgentSelected,
      onClick: () => {
        closeMenu();
        setUpgradeModalState({ isOpen: true, isScheduled: false, isUpdating: false });
      },
    },
    {
      name: (
        <FormattedMessage
          id="xpack.fleet.agentBulkActions.scheduleUpgradeAgents"
          data-test-subj="agentBulkActionsScheduleUpgrade"
          defaultMessage="Schedule upgrade for {agentCount, plural, one {# agent} other {# agents}}"
          values={{
            agentCount,
          }}
        />
      ),
      icon: <EuiIcon type="timeRefresh" size="m" />,
      disabled: !atLeastOneActiveAgentSelected || !isLicenceAllowingScheduleUpgrade,
      onClick: () => {
        closeMenu();
        setUpgradeModalState({ isOpen: true, isScheduled: true, isUpdating: false });
      },
    },
  ];

  menuItems.push({
    name: (
      <FormattedMessage
        id="xpack.fleet.agentBulkActions.restartUpgradeAgents"
        data-test-subj="agentBulkActionsRestartUpgrade"
        defaultMessage="Restart upgrade {agentCount, plural, one {# agent} other {# agents}}"
        values={{
          agentCount,
        }}
      />
    ),
    icon: <EuiIcon type="refresh" size="m" />,
    disabled: !atLeastOneActiveAgentSelected,
    onClick: () => {
      closeMenu();
      setUpgradeModalState({ isOpen: true, isScheduled: false, isUpdating: true });
    },
  });

  if (diagnosticFileUploadEnabled) {
    menuItems.push({
      name: (
        <FormattedMessage
          id="xpack.fleet.agentBulkActions.requestDiagnostics"
          data-test-subj="agentBulkActionsRequestDiagnostics"
          defaultMessage="Request diagnostics for {agentCount, plural, one {# agent} other {# agents}}"
          values={{
            agentCount,
          }}
        />
      ),
      icon: <EuiIcon type="download" size="m" />,
      disabled: !atLeastOneActiveAgentSelected,
      onClick: () => {
        closeMenu();
        setIsRequestDiagnosticsModalOpen(true);
      },
    });
  }

  const panels = [
    {
      id: 0,
      items: menuItems,
    },
  ];

  const getSelectedTagsFromAgents = useMemo(
    () => getCommonTags(agents, visibleAgents ?? [], agentPolicies),
    [agents, visibleAgents, agentPolicies]
  );

  return (
    <>
      {isReassignFlyoutOpen && (
        <EuiPortal>
          <AgentReassignAgentPolicyModal
            agents={agents}
            onClose={() => {
              setIsReassignFlyoutOpen(false);
              refreshAgents();
            }}
          />
        </EuiPortal>
      )}
      {isUnenrollModalOpen && (
        <EuiPortal>
          <AgentUnenrollAgentModal
            agents={agents}
            agentCount={agentCount}
            onClose={() => {
              setIsUnenrollModalOpen(false);
              refreshAgents({ refreshTags: true });
            }}
          />
        </EuiPortal>
      )}
      {updateModalState.isOpen && (
        <EuiPortal>
          <AgentUpgradeAgentModal
            agents={agents}
            agentCount={agentCount}
            isScheduled={updateModalState.isScheduled}
            isUpdating={updateModalState.isUpdating}
            onClose={() => {
              setUpgradeModalState({ isOpen: false, isScheduled: false, isUpdating: false });
              refreshAgents();
            }}
          />
        </EuiPortal>
      )}
      {isTagAddVisible && (
        <TagsAddRemove
          agents={Array.isArray(agents) ? agents.map((agent) => agent.id) : agents}
          allTags={allTags ?? []}
          selectedTags={getSelectedTagsFromAgents}
          button={tagsPopoverButton!}
          onTagsUpdated={() => {
            refreshAgents({ refreshTags: true });
          }}
          onClosePopover={() => {
            setIsTagAddVisible(false);
            closeMenu();
          }}
        />
      )}
      {isRequestDiagnosticsModalOpen && (
        <EuiPortal>
          <AgentRequestDiagnosticsModal
            agents={agents}
            agentCount={agentCount}
            onClose={() => {
              setIsRequestDiagnosticsModalOpen(false);
            }}
          />
        </EuiPortal>
      )}
      <EuiFlexGroup gutterSize="m" alignItems="center">
        <EuiFlexItem grow={false}>
          <EuiPopover
            id="agentBulkActionsMenu"
            button={
              <EuiButton
                fill
                iconType="arrowDown"
                iconSide="right"
                onClick={onClickMenu}
                data-test-subj="agentBulkActionsButton"
              >
                <FormattedMessage
                  id="xpack.fleet.agentBulkActions.actions"
                  defaultMessage="Actions"
                />
              </EuiButton>
            }
            isOpen={isMenuOpen}
            closePopover={closeMenu}
            panelPaddingSize="none"
            anchorPosition="downLeft"
          >
            <EuiContextMenu initialPanelId={0} panels={panels} />
          </EuiPopover>
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  );
};
