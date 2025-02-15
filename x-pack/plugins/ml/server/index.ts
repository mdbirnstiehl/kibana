/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { PluginConfigDescriptor, PluginInitializerContext } from '@kbn/core/server';
import { MlServerPlugin } from './plugin';
export type { MlPluginSetup, MlPluginStart } from './plugin';
export type {
  DatafeedStats as MlDatafeedStats,
  Job as MlJob,
  MlSummaryJob,
  SummaryJobState as MlSummaryJobState,
  AlertingService as MlAlertingService,
  AnomalyDetectors as MlAnomalyDetectors,
  JobService as MlJobService,
  MlSystem as MlMlSystem,
  Modules as MlModules,
  ResultsService as MlResultsService,
  TrainedModels as MlTrainedModels,
} from './shared';
export {
  UnknownMLCapabilitiesError,
  InsufficientMLCapabilities,
  MLPrivilegesUninitialized,
} from './shared';
import { configSchema, type ConfigSchema } from './config_schema';

export const config: PluginConfigDescriptor<ConfigSchema> = {
  schema: configSchema,
};

export const plugin = (ctx: PluginInitializerContext<ConfigSchema>) => new MlServerPlugin(ctx);
