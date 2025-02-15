/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { dataViewMock } from '@kbn/discover-utils/src/__mocks__';
import { getEuiGridColumns, getVisibleColumns } from './data_table_columns';
import { dataViewWithTimefieldMock } from '../../__mocks__/data_view_with_timefield';
import { dataTableContextMock } from '../../__mocks__/table_context';
import { servicesMock } from '../../__mocks__/services';

const columns = ['extension', 'message'];
const columnsWithTimeCol = getVisibleColumns(
  ['extension', 'message'],
  dataViewWithTimefieldMock,
  true
) as string[];

describe('Data table columns', function () {
  describe('getEuiGridColumns', () => {
    it('returns eui grid columns showing default columns', async () => {
      const actual = getEuiGridColumns({
        columns,
        settings: {},
        dataView: dataViewWithTimefieldMock,
        defaultColumns: true,
        isSortEnabled: true,
        isPlainRecord: false,
        valueToStringConverter: dataTableContextMock.valueToStringConverter,
        rowsCount: 100,
        services: {
          uiSettings: servicesMock.uiSettings,
          toastNotifications: servicesMock.toastNotifications,
        },
        hasEditDataViewPermission: () =>
          servicesMock.dataViewFieldEditor.userPermissions.editIndexPattern(),
        onFilter: () => {},
      });
      expect(actual).toMatchInlineSnapshot(`
              Array [
                Object {
                  "actions": Object {
                    "additional": Array [
                      Object {
                        "data-test-subj": "gridCopyColumnNameToClipBoardButton",
                        "iconProps": Object {
                          "size": "m",
                        },
                        "iconType": "copyClipboard",
                        "label": <FormattedMessage
                          defaultMessage="Copy name"
                          id="unifiedDataTable.grid.copyColumnNameToClipBoardButton"
                          values={Object {}}
                        />,
                        "onClick": [Function],
                        "size": "xs",
                      },
                      Object {
                        "data-test-subj": "gridCopyColumnValuesToClipBoardButton",
                        "iconProps": Object {
                          "size": "m",
                        },
                        "iconType": "copyClipboard",
                        "label": <FormattedMessage
                          defaultMessage="Copy column"
                          id="unifiedDataTable.grid.copyColumnValuesToClipBoardButton"
                          values={Object {}}
                        />,
                        "onClick": [Function],
                        "size": "xs",
                      },
                    ],
                    "showHide": false,
                    "showMoveLeft": false,
                    "showMoveRight": false,
                  },
                  "cellActions": Array [
                    [Function],
                    [Function],
                    [Function],
                  ],
                  "displayAsText": "extension",
                  "id": "extension",
                  "isSortable": false,
                  "schema": "string",
                  "visibleCellActions": undefined,
                },
                Object {
                  "actions": Object {
                    "additional": Array [
                      Object {
                        "data-test-subj": "gridCopyColumnNameToClipBoardButton",
                        "iconProps": Object {
                          "size": "m",
                        },
                        "iconType": "copyClipboard",
                        "label": <FormattedMessage
                          defaultMessage="Copy name"
                          id="unifiedDataTable.grid.copyColumnNameToClipBoardButton"
                          values={Object {}}
                        />,
                        "onClick": [Function],
                        "size": "xs",
                      },
                      Object {
                        "data-test-subj": "gridCopyColumnValuesToClipBoardButton",
                        "iconProps": Object {
                          "size": "m",
                        },
                        "iconType": "copyClipboard",
                        "label": <FormattedMessage
                          defaultMessage="Copy column"
                          id="unifiedDataTable.grid.copyColumnValuesToClipBoardButton"
                          values={Object {}}
                        />,
                        "onClick": [Function],
                        "size": "xs",
                      },
                    ],
                    "showHide": false,
                    "showMoveLeft": false,
                    "showMoveRight": false,
                  },
                  "cellActions": Array [
                    [Function],
                  ],
                  "displayAsText": "message",
                  "id": "message",
                  "isSortable": false,
                  "schema": "string",
                  "visibleCellActions": undefined,
                },
              ]
          `);
    });

    it('returns eui grid columns with time column', async () => {
      const actual = getEuiGridColumns({
        columns: columnsWithTimeCol,
        settings: {},
        dataView: dataViewWithTimefieldMock,
        defaultColumns: false,
        isSortEnabled: true,
        isPlainRecord: false,
        valueToStringConverter: dataTableContextMock.valueToStringConverter,
        rowsCount: 100,
        services: {
          uiSettings: servicesMock.uiSettings,
          toastNotifications: servicesMock.toastNotifications,
        },
        hasEditDataViewPermission: () =>
          servicesMock.dataViewFieldEditor.userPermissions.editIndexPattern(),
        onFilter: () => {},
      });
      expect(actual).toMatchInlineSnapshot(`
        Array [
          Object {
            "actions": Object {
              "additional": Array [
                Object {
                  "data-test-subj": "gridCopyColumnNameToClipBoardButton",
                  "iconProps": Object {
                    "size": "m",
                  },
                  "iconType": "copyClipboard",
                  "label": <FormattedMessage
                    defaultMessage="Copy name"
                    id="unifiedDataTable.grid.copyColumnNameToClipBoardButton"
                    values={Object {}}
                  />,
                  "onClick": [Function],
                  "size": "xs",
                },
                Object {
                  "data-test-subj": "gridCopyColumnValuesToClipBoardButton",
                  "iconProps": Object {
                    "size": "m",
                  },
                  "iconType": "copyClipboard",
                  "label": <FormattedMessage
                    defaultMessage="Copy column"
                    id="unifiedDataTable.grid.copyColumnValuesToClipBoardButton"
                    values={Object {}}
                  />,
                  "onClick": [Function],
                  "size": "xs",
                },
              ],
              "showHide": false,
              "showMoveLeft": true,
              "showMoveRight": true,
            },
            "cellActions": Array [
              [Function],
              [Function],
              [Function],
            ],
            "display": <div
              aria-label="timestamp - this field represents the time that events occurred."
            >
              <EuiToolTip
                content="This field represents the time that events occurred."
                delay="regular"
                display="inlineBlock"
                position="top"
              >
                <React.Fragment>
                  timestamp
                   
                  <EuiIcon
                    type="clock"
                  />
                </React.Fragment>
              </EuiToolTip>
            </div>,
            "displayAsText": "timestamp",
            "id": "timestamp",
            "initialWidth": 212,
            "isSortable": true,
            "schema": "datetime",
            "visibleCellActions": undefined,
          },
          Object {
            "actions": Object {
              "additional": Array [
                Object {
                  "data-test-subj": "gridCopyColumnNameToClipBoardButton",
                  "iconProps": Object {
                    "size": "m",
                  },
                  "iconType": "copyClipboard",
                  "label": <FormattedMessage
                    defaultMessage="Copy name"
                    id="unifiedDataTable.grid.copyColumnNameToClipBoardButton"
                    values={Object {}}
                  />,
                  "onClick": [Function],
                  "size": "xs",
                },
                Object {
                  "data-test-subj": "gridCopyColumnValuesToClipBoardButton",
                  "iconProps": Object {
                    "size": "m",
                  },
                  "iconType": "copyClipboard",
                  "label": <FormattedMessage
                    defaultMessage="Copy column"
                    id="unifiedDataTable.grid.copyColumnValuesToClipBoardButton"
                    values={Object {}}
                  />,
                  "onClick": [Function],
                  "size": "xs",
                },
              ],
              "showHide": Object {
                "iconType": "cross",
                "label": "Remove column",
              },
              "showMoveLeft": true,
              "showMoveRight": true,
            },
            "cellActions": Array [
              [Function],
              [Function],
              [Function],
            ],
            "displayAsText": "extension",
            "id": "extension",
            "isSortable": false,
            "schema": "string",
            "visibleCellActions": undefined,
          },
          Object {
            "actions": Object {
              "additional": Array [
                Object {
                  "data-test-subj": "gridCopyColumnNameToClipBoardButton",
                  "iconProps": Object {
                    "size": "m",
                  },
                  "iconType": "copyClipboard",
                  "label": <FormattedMessage
                    defaultMessage="Copy name"
                    id="unifiedDataTable.grid.copyColumnNameToClipBoardButton"
                    values={Object {}}
                  />,
                  "onClick": [Function],
                  "size": "xs",
                },
                Object {
                  "data-test-subj": "gridCopyColumnValuesToClipBoardButton",
                  "iconProps": Object {
                    "size": "m",
                  },
                  "iconType": "copyClipboard",
                  "label": <FormattedMessage
                    defaultMessage="Copy column"
                    id="unifiedDataTable.grid.copyColumnValuesToClipBoardButton"
                    values={Object {}}
                  />,
                  "onClick": [Function],
                  "size": "xs",
                },
              ],
              "showHide": Object {
                "iconType": "cross",
                "label": "Remove column",
              },
              "showMoveLeft": true,
              "showMoveRight": true,
            },
            "cellActions": Array [
              [Function],
            ],
            "displayAsText": "message",
            "id": "message",
            "isSortable": false,
            "schema": "string",
            "visibleCellActions": undefined,
          },
        ]
      `);
    });

    it('returns eui grid with in memory sorting', async () => {
      const actual = getEuiGridColumns({
        columns: columnsWithTimeCol,
        settings: {},
        dataView: dataViewWithTimefieldMock,
        defaultColumns: false,
        isSortEnabled: true,
        isPlainRecord: true,
        valueToStringConverter: dataTableContextMock.valueToStringConverter,
        rowsCount: 100,
        services: {
          uiSettings: servicesMock.uiSettings,
          toastNotifications: servicesMock.toastNotifications,
        },
        hasEditDataViewPermission: () =>
          servicesMock.dataViewFieldEditor.userPermissions.editIndexPattern(),
        onFilter: () => {},
      });
      expect(actual).toMatchInlineSnapshot(`
        Array [
          Object {
            "actions": Object {
              "additional": Array [
                Object {
                  "data-test-subj": "gridCopyColumnNameToClipBoardButton",
                  "iconProps": Object {
                    "size": "m",
                  },
                  "iconType": "copyClipboard",
                  "label": <FormattedMessage
                    defaultMessage="Copy name"
                    id="unifiedDataTable.grid.copyColumnNameToClipBoardButton"
                    values={Object {}}
                  />,
                  "onClick": [Function],
                  "size": "xs",
                },
                Object {
                  "data-test-subj": "gridCopyColumnValuesToClipBoardButton",
                  "iconProps": Object {
                    "size": "m",
                  },
                  "iconType": "copyClipboard",
                  "label": <FormattedMessage
                    defaultMessage="Copy column"
                    id="unifiedDataTable.grid.copyColumnValuesToClipBoardButton"
                    values={Object {}}
                  />,
                  "onClick": [Function],
                  "size": "xs",
                },
              ],
              "showHide": false,
              "showMoveLeft": true,
              "showMoveRight": true,
            },
            "cellActions": Array [
              [Function],
              [Function],
              [Function],
            ],
            "display": <div
              aria-label="timestamp - this field represents the time that events occurred."
            >
              <EuiToolTip
                content="This field represents the time that events occurred."
                delay="regular"
                display="inlineBlock"
                position="top"
              >
                <React.Fragment>
                  timestamp
                   
                  <EuiIcon
                    type="clock"
                  />
                </React.Fragment>
              </EuiToolTip>
            </div>,
            "displayAsText": "timestamp",
            "id": "timestamp",
            "initialWidth": 212,
            "isSortable": true,
            "schema": "datetime",
            "visibleCellActions": undefined,
          },
          Object {
            "actions": Object {
              "additional": Array [
                Object {
                  "data-test-subj": "gridCopyColumnNameToClipBoardButton",
                  "iconProps": Object {
                    "size": "m",
                  },
                  "iconType": "copyClipboard",
                  "label": <FormattedMessage
                    defaultMessage="Copy name"
                    id="unifiedDataTable.grid.copyColumnNameToClipBoardButton"
                    values={Object {}}
                  />,
                  "onClick": [Function],
                  "size": "xs",
                },
                Object {
                  "data-test-subj": "gridCopyColumnValuesToClipBoardButton",
                  "iconProps": Object {
                    "size": "m",
                  },
                  "iconType": "copyClipboard",
                  "label": <FormattedMessage
                    defaultMessage="Copy column"
                    id="unifiedDataTable.grid.copyColumnValuesToClipBoardButton"
                    values={Object {}}
                  />,
                  "onClick": [Function],
                  "size": "xs",
                },
              ],
              "showHide": Object {
                "iconType": "cross",
                "label": "Remove column",
              },
              "showMoveLeft": true,
              "showMoveRight": true,
            },
            "cellActions": Array [
              [Function],
              [Function],
              [Function],
            ],
            "displayAsText": "extension",
            "id": "extension",
            "isSortable": true,
            "schema": "string",
            "visibleCellActions": undefined,
          },
          Object {
            "actions": Object {
              "additional": Array [
                Object {
                  "data-test-subj": "gridCopyColumnNameToClipBoardButton",
                  "iconProps": Object {
                    "size": "m",
                  },
                  "iconType": "copyClipboard",
                  "label": <FormattedMessage
                    defaultMessage="Copy name"
                    id="unifiedDataTable.grid.copyColumnNameToClipBoardButton"
                    values={Object {}}
                  />,
                  "onClick": [Function],
                  "size": "xs",
                },
                Object {
                  "data-test-subj": "gridCopyColumnValuesToClipBoardButton",
                  "iconProps": Object {
                    "size": "m",
                  },
                  "iconType": "copyClipboard",
                  "label": <FormattedMessage
                    defaultMessage="Copy column"
                    id="unifiedDataTable.grid.copyColumnValuesToClipBoardButton"
                    values={Object {}}
                  />,
                  "onClick": [Function],
                  "size": "xs",
                },
              ],
              "showHide": Object {
                "iconType": "cross",
                "label": "Remove column",
              },
              "showMoveLeft": true,
              "showMoveRight": true,
            },
            "cellActions": Array [
              [Function],
            ],
            "displayAsText": "message",
            "id": "message",
            "isSortable": true,
            "schema": "string",
            "visibleCellActions": undefined,
          },
        ]
      `);
    });
  });

  describe('getVisibleColumns', () => {
    it('returns grid columns without time column when data view has no timestamp field', () => {
      const actual = getVisibleColumns(['extension', 'message'], dataViewMock, true) as string[];
      expect(actual).toEqual(['extension', 'message']);
    });

    it('returns grid columns without time column when showTimeCol is falsy', () => {
      const actual = getVisibleColumns(
        ['extension', 'message'],
        dataViewWithTimefieldMock,
        false
      ) as string[];
      expect(actual).toEqual(['extension', 'message']);
    });

    it('returns grid columns with time column when data view has timestamp field', () => {
      const actual = getVisibleColumns(
        ['extension', 'message'],
        dataViewWithTimefieldMock,
        true
      ) as string[];
      expect(actual).toEqual(['timestamp', 'extension', 'message']);
    });
  });
});
