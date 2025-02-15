/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { useMemo } from 'react';
import styled from '@emotion/styled';
import { EuiContextMenu, EuiHorizontalRule, EuiTab, EuiTabs } from '@elastic/eui';
import { useIntersectionRef } from '../../hooks/use_intersection_ref';
import {
  DATA_VIEW_POPOVER_CONTENT_WIDTH,
  integrationsLabel,
  INTEGRATIONS_PANEL_ID,
  INTEGRATIONS_TAB_ID,
  uncategorizedLabel,
  UNCATEGORIZED_PANEL_ID,
  UNCATEGORIZED_TAB_ID,
} from './constants';
import { useDatasetSelector } from './state_machine/use_dataset_selector';
import { DatasetsPopover } from './sub_components/datasets_popover';
import { SearchControls } from './sub_components/search_controls';
import { SelectorActions } from './sub_components/selector_actions';
import { DatasetSelectorProps } from './types';
import {
  buildIntegrationsTree,
  createIntegrationStatusItem,
  createUncategorizedStatusItem,
} from './utils';

export function DatasetSelector({
  datasets,
  datasetsError,
  datasetSelection,
  integrations,
  integrationsError,
  isLoadingIntegrations,
  isLoadingStreams,
  isSearchingIntegrations,
  onIntegrationsLoadMore,
  onIntegrationsReload,
  onIntegrationsSearch,
  onIntegrationsSort,
  onIntegrationsStreamsSearch,
  onIntegrationsStreamsSort,
  onSelectionChange,
  onStreamsEntryClick,
  onUnmanagedStreamsReload,
  onUnmanagedStreamsSearch,
  onUnmanagedStreamsSort,
}: DatasetSelectorProps) {
  const {
    panelId,
    search,
    tabId,
    isOpen,
    isAllMode,
    changePanel,
    closePopover,
    scrollToIntegrationsBottom,
    searchByName,
    selectAllLogDataset,
    selectDataset,
    sortByOrder,
    switchToIntegrationsTab,
    switchToUncategorizedTab,
    togglePopover,
  } = useDatasetSelector({
    initialContext: { selection: datasetSelection },
    onIntegrationsLoadMore,
    onIntegrationsReload,
    onIntegrationsSearch,
    onIntegrationsSort,
    onIntegrationsStreamsSearch,
    onIntegrationsStreamsSort,
    onUnmanagedStreamsSearch,
    onUnmanagedStreamsSort,
    onUnmanagedStreamsReload,
    onSelectionChange,
  });

  const [setSpyRef] = useIntersectionRef({ onIntersecting: scrollToIntegrationsBottom });

  const { items: integrationItems, panels: integrationPanels } = useMemo(() => {
    if (!integrations || integrations.length === 0) {
      return {
        items: [
          createIntegrationStatusItem({
            data: integrations,
            error: integrationsError,
            isLoading: isLoadingIntegrations,
            onRetry: onIntegrationsReload,
          }),
        ],
        panels: [],
      };
    }

    return buildIntegrationsTree({
      integrations,
      onDatasetSelected: selectDataset,
      spyRef: setSpyRef,
    });
  }, [
    integrations,
    integrationsError,
    isLoadingIntegrations,
    selectDataset,
    onIntegrationsReload,
    setSpyRef,
  ]);

  const uncategorizedItems = useMemo(() => {
    if (!datasets || datasets.length === 0) {
      return [
        createUncategorizedStatusItem({
          data: datasets,
          error: datasetsError,
          isLoading: isLoadingStreams,
          onRetry: onUnmanagedStreamsReload,
        }),
      ];
    }

    return datasets.map((dataset) => ({
      name: dataset.title,
      onClick: () => selectDataset(dataset),
    }));
  }, [datasets, datasetsError, isLoadingStreams, selectDataset, onUnmanagedStreamsReload]);

  const tabs = [
    {
      id: INTEGRATIONS_TAB_ID,
      name: integrationsLabel,
      onClick: switchToIntegrationsTab,
      'data-test-subj': 'datasetSelectorIntegrationsTab',
    },
    {
      id: UNCATEGORIZED_TAB_ID,
      name: uncategorizedLabel,
      onClick: () => {
        onStreamsEntryClick(); // Lazy-load uncategorized datasets only when accessing the Uncategorized tab
        switchToUncategorizedTab();
      },
      'data-test-subj': 'datasetSelectorUncategorizedTab',
    },
  ];

  const tabEntries = tabs.map((tab) => (
    <EuiTab
      key={tab.id}
      onClick={tab.onClick}
      isSelected={tab.id === tabId}
      data-test-subj={tab['data-test-subj']}
    >
      {tab.name}
    </EuiTab>
  ));

  return (
    <DatasetsPopover
      selection={datasetSelection.selection}
      isOpen={isOpen}
      closePopover={closePopover}
      onClick={togglePopover}
    >
      <Tabs>{tabEntries}</Tabs>
      <SelectorActions>
        <SelectorActions.ShowAllLogs isSelected={isAllMode} onClick={selectAllLogDataset} />
      </SelectorActions>
      <EuiHorizontalRule margin="none" />
      <SearchControls
        key={panelId}
        search={search}
        onSearch={searchByName}
        onSort={sortByOrder}
        isLoading={isSearchingIntegrations || isLoadingStreams}
      />
      <EuiHorizontalRule margin="none" />
      {/* For a smoother user experience, we keep each tab content mount and we only show the select one
      "hiding" all the others. Unmounting mounting each tab content on change makes it feel glitchy,
      while the tradeoff of keeping the contents in memory provide a better UX. */}
      {/* Integrations tab content */}
      <ContextMenu
        hidden={tabId !== INTEGRATIONS_TAB_ID}
        initialPanelId={panelId}
        panels={[
          {
            id: INTEGRATIONS_PANEL_ID,
            title: integrationsLabel,
            width: DATA_VIEW_POPOVER_CONTENT_WIDTH,
            items: integrationItems,
          },
          ...integrationPanels,
        ]}
        onPanelChange={changePanel}
        className="eui-yScroll"
        data-test-subj="integrationsContextMenu"
        size="s"
      />
      {/* Uncategorized tab content */}
      <ContextMenu
        hidden={tabId !== UNCATEGORIZED_TAB_ID}
        initialPanelId={UNCATEGORIZED_PANEL_ID}
        panels={[
          {
            id: UNCATEGORIZED_PANEL_ID,
            title: uncategorizedLabel,
            width: DATA_VIEW_POPOVER_CONTENT_WIDTH,
            items: uncategorizedItems,
          },
        ]}
        className="eui-yScroll"
        data-test-subj="uncategorizedContextMenu"
        size="s"
      />
    </DatasetsPopover>
  );
}

const Tabs = styled(EuiTabs)`
  padding: 0 8px;
`;

const ContextMenu = styled(EuiContextMenu)`
  max-height: 440px;
  transition: none !important;
`;
