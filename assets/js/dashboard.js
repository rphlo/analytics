import React from 'react';
import ReactDOM from 'react-dom';
import 'url-search-params-polyfill';

import Router from './dashboard/router'
import ErrorBoundary from './dashboard/error-boundary'
import * as api from './dashboard/api'
import * as timer from './dashboard/util/realtime-update-timer'
import { filtersBackwardsCompatibilityRedirect } from './dashboard/query';

timer.start()

const container = document.getElementById('stats-react-container')

if (container) {
  const site = {
    domain: container.dataset.domain,
    offset: container.dataset.offset,
    hasGoals: container.dataset.hasGoals === 'true',
    hasProps: container.dataset.hasProps === 'true',
    funnelsAvailable: container.dataset.funnelsAvailable === 'true',
    propsAvailable: container.dataset.propsAvailable === 'true',
    conversionsOptedOut: container.dataset.conversionsOptedOut === 'true',
    funnelsOptedOut: container.dataset.funnelsOptedOut === 'true',
    propsOptedOut: container.dataset.propsOptedOut === 'true',
    revenueGoals: JSON.parse(container.dataset.revenueGoals),
    funnels: JSON.parse(container.dataset.funnels),
    statsBegin: container.dataset.statsBegin,
    nativeStatsBegin: container.dataset.nativeStatsBegin,
    embedded: container.dataset.embedded,
    background: container.dataset.background,
    isDbip: container.dataset.isDbip === 'true',
    flags: JSON.parse(container.dataset.flags),
    validIntervalsByPeriod: JSON.parse(container.dataset.validIntervalsByPeriod),
    showCities: container.dataset.showCities === 'true'
  }

  const loggedIn = container.dataset.loggedIn === 'true'
  const currentUserRole = container.dataset.currentUserRole
  const sharedLinkAuth = container.dataset.sharedLinkAuth
  if (sharedLinkAuth) {
    api.setSharedLinkAuth(sharedLinkAuth)
  }

  filtersBackwardsCompatibilityRedirect()

  const app = (
    <ErrorBoundary>
      <Router site={site} loggedIn={loggedIn} currentUserRole={currentUserRole} />
    </ErrorBoundary>
  )

  ReactDOM.render(app, container);
}
