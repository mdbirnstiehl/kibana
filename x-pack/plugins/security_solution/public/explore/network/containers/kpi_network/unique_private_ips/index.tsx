/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import deepEqual from 'fast-deep-equal';
import { noop } from 'lodash/fp';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Subscription } from 'rxjs';

import { isCompleteResponse } from '@kbn/data-plugin/common';
import type { NetworkKpiUniquePrivateIpsRequestOptionsInput } from '../../../../../../common/api/search_strategy';
import { useAppToasts } from '../../../../../common/hooks/use_app_toasts';
import type { inputsModel } from '../../../../../common/store';
import { createFilter } from '../../../../../common/containers/helpers';
import { useKibana } from '../../../../../common/lib/kibana';
import type {
  NetworkKpiHistogramData,
  NetworkKpiUniquePrivateIpsStrategyResponse,
} from '../../../../../../common/search_strategy';
import { NetworkKpiQueries } from '../../../../../../common/search_strategy';
import type { ESTermQuery } from '../../../../../../common/typed_json';

import * as i18n from './translations';
import { getInspectResponse } from '../../../../../helpers';
import type { InspectResponse } from '../../../../../types';

export const ID = 'networkKpiUniquePrivateIpsQuery';

export interface NetworkKpiUniquePrivateIpsArgs {
  uniqueDestinationPrivateIps: number;
  uniqueDestinationPrivateIpsHistogram: NetworkKpiHistogramData[] | null;
  uniqueSourcePrivateIps: number;
  uniqueSourcePrivateIpsHistogram: NetworkKpiHistogramData[] | null;
  id: string;
  inspect: InspectResponse;
  isInspected: boolean;
  refetch: inputsModel.Refetch;
}

interface UseNetworkKpiUniquePrivateIps {
  filterQuery?: ESTermQuery | string;
  endDate: string;
  indexNames: string[];
  skip?: boolean;
  startDate: string;
}

export const useNetworkKpiUniquePrivateIps = ({
  filterQuery,
  endDate,
  indexNames,
  skip = false,
  startDate,
}: UseNetworkKpiUniquePrivateIps): [boolean, NetworkKpiUniquePrivateIpsArgs] => {
  const { data } = useKibana().services;
  const refetch = useRef<inputsModel.Refetch>(noop);
  const abortCtrl = useRef(new AbortController());
  const searchSubscription$ = useRef(new Subscription());
  const [loading, setLoading] = useState(false);
  const [networkKpiUniquePrivateIpsRequest, setNetworkKpiUniquePrivateIpsRequest] =
    useState<NetworkKpiUniquePrivateIpsRequestOptionsInput | null>(null);

  const [networkKpiUniquePrivateIpsResponse, setNetworkKpiUniquePrivateIpsResponse] =
    useState<NetworkKpiUniquePrivateIpsArgs>({
      uniqueDestinationPrivateIps: 0,
      uniqueDestinationPrivateIpsHistogram: null,
      uniqueSourcePrivateIps: 0,
      uniqueSourcePrivateIpsHistogram: null,
      id: ID,
      inspect: {
        dsl: [],
        response: [],
      },
      isInspected: false,
      refetch: refetch.current,
    });
  const { addError } = useAppToasts();

  const networkKpiUniquePrivateIpsSearch = useCallback(
    (request: NetworkKpiUniquePrivateIpsRequestOptionsInput | null) => {
      if (request == null || skip) {
        return;
      }

      const asyncSearch = async () => {
        abortCtrl.current = new AbortController();
        setLoading(true);

        searchSubscription$.current = data.search
          .search<
            NetworkKpiUniquePrivateIpsRequestOptionsInput,
            NetworkKpiUniquePrivateIpsStrategyResponse
          >(request, {
            strategy: 'securitySolutionSearchStrategy',
            abortSignal: abortCtrl.current.signal,
          })
          .subscribe({
            next: (response) => {
              if (isCompleteResponse(response)) {
                setLoading(false);
                setNetworkKpiUniquePrivateIpsResponse((prevResponse) => ({
                  ...prevResponse,
                  uniqueDestinationPrivateIps: response.uniqueDestinationPrivateIps,
                  uniqueDestinationPrivateIpsHistogram:
                    response.uniqueDestinationPrivateIpsHistogram,
                  uniqueSourcePrivateIps: response.uniqueSourcePrivateIps,
                  uniqueSourcePrivateIpsHistogram: response.uniqueSourcePrivateIpsHistogram,
                  inspect: getInspectResponse(response, prevResponse.inspect),
                  refetch: refetch.current,
                }));
                searchSubscription$.current.unsubscribe();
              }
            },
            error: (msg) => {
              setLoading(false);
              addError(msg, {
                title: i18n.FAIL_NETWORK_KPI_UNIQUE_PRIVATE_IPS,
              });
              searchSubscription$.current.unsubscribe();
            },
          });
      };
      searchSubscription$.current.unsubscribe();
      abortCtrl.current.abort();
      asyncSearch();
      refetch.current = asyncSearch;
    },
    [data.search, addError, skip]
  );

  useEffect(() => {
    setNetworkKpiUniquePrivateIpsRequest((prevRequest) => {
      const myRequest: NetworkKpiUniquePrivateIpsRequestOptionsInput = {
        ...(prevRequest ?? {}),
        defaultIndex: indexNames,
        factoryQueryType: NetworkKpiQueries.uniquePrivateIps,
        filterQuery: createFilter(filterQuery),
        timerange: {
          interval: '12h',
          from: startDate,
          to: endDate,
        },
      };
      if (!deepEqual(prevRequest, myRequest)) {
        return myRequest;
      }
      return prevRequest;
    });
  }, [indexNames, endDate, filterQuery, startDate]);

  useEffect(() => {
    networkKpiUniquePrivateIpsSearch(networkKpiUniquePrivateIpsRequest);
    return () => {
      searchSubscription$.current.unsubscribe();
      abortCtrl.current.abort();
    };
  }, [networkKpiUniquePrivateIpsRequest, networkKpiUniquePrivateIpsSearch]);

  useEffect(() => {
    if (skip) {
      setLoading(false);
      searchSubscription$.current.unsubscribe();
      abortCtrl.current.abort();
    }
  }, [skip]);

  return [loading, networkKpiUniquePrivateIpsResponse];
};
