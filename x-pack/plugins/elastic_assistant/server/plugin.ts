/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import {
  PluginInitializerContext,
  CoreSetup,
  CoreStart,
  Plugin,
  Logger,
  IContextProvider,
} from '@kbn/core/server';

import {
  ElasticAssistantPluginSetup,
  ElasticAssistantPluginSetupDependencies,
  ElasticAssistantPluginStart,
  ElasticAssistantPluginStartDependencies,
  ElasticAssistantRequestHandlerContext,
} from './types';
import {
  deleteKnowledgeBaseRoute,
  getKnowledgeBaseStatusRoute,
  postActionsConnectorExecuteRoute,
  postKnowledgeBaseRoute,
} from './routes';

export class ElasticAssistantPlugin
  implements
    Plugin<
      ElasticAssistantPluginSetup,
      ElasticAssistantPluginStart,
      ElasticAssistantPluginSetupDependencies,
      ElasticAssistantPluginStartDependencies
    >
{
  private readonly logger: Logger;

  constructor(initializerContext: PluginInitializerContext) {
    this.logger = initializerContext.logger.get();
  }

  private createRouteHandlerContext = (
    core: CoreSetup<ElasticAssistantPluginStart, unknown>,
    logger: Logger
  ): IContextProvider<ElasticAssistantRequestHandlerContext, 'elasticAssistant'> => {
    return async function elasticAssistantRouteHandlerContext(context, request) {
      const [_, pluginsStart] = await core.getStartServices();

      return {
        actions: pluginsStart.actions,
        logger,
      };
    };
  };

  public setup(core: CoreSetup, plugins: ElasticAssistantPluginSetupDependencies) {
    this.logger.debug('elasticAssistant: Setup');
    const router = core.http.createRouter<ElasticAssistantRequestHandlerContext>();

    core.http.registerRouteHandlerContext<
      ElasticAssistantRequestHandlerContext,
      'elasticAssistant'
    >(
      'elasticAssistant',
      this.createRouteHandlerContext(
        core as CoreSetup<ElasticAssistantPluginStart, unknown>,
        this.logger
      )
    );

    deleteKnowledgeBaseRoute(router);
    getKnowledgeBaseStatusRoute(router);
    postKnowledgeBaseRoute(router);
    postActionsConnectorExecuteRoute(router);
    return {
      actions: plugins.actions,
    };
  }

  public start(core: CoreStart, plugins: ElasticAssistantPluginStartDependencies) {
    this.logger.debug('elasticAssistant: Started');

    return {
      actions: plugins.actions,
    };
  }

  public stop() {}
}
