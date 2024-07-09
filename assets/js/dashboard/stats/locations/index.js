import React from 'react';

import * as storage from '../../util/storage'
import CountriesMap from './map'

import * as api from '../../api'
import {apiPath, sitePath} from '../../util/url'
import ListReport from '../reports/list'
import { VISITORS_METRIC, maybeWithCR } from '../reports/metrics';
import { getFiltersByKeyPrefix } from '../../util/filters';
import ImportedQueryUnsupportedWarning from '../imported-query-unsupported-warning';

function Countries({query, site, onClick, afterFetchData}) {
  function fetchData() {
    return api.get(apiPath(site, '/countries'), query, { limit: 9 })
  }

  function renderIcon(country) {
    return <span className="mr-1">{country.flag}</span>
  }

  function getFilterFor(listItem) {
    return {
      prefix: "country",
      filter: ["is", "country", [listItem['code']]],
      labels: { [listItem['code']]: listItem['name'] }
    }
  }

  return (
    <ListReport
      fetchData={fetchData}
      afterFetchData={afterFetchData}
      getFilterFor={getFilterFor}
      onClick={onClick}
      keyLabel="Country"
      metrics={maybeWithCR([VISITORS_METRIC], query)}
      detailsLink={sitePath(site, '/countries')}
      query={query}
      renderIcon={renderIcon}
      color="bg-orange-50"
    />
  )
}

function Regions({query, site, onClick, afterFetchData}) {
  function fetchData() {
    return api.get(apiPath(site, '/regions'), query, {limit: 9})
  }

  function renderIcon(region) {
    return <span className="mr-1">{region.country_flag}</span>
  }

  function getFilterFor(listItem) {
    return {
      prefix: "region",
      filter: ["is", "region", [listItem['code']]],
      labels: { [listItem['code']]: listItem['name'] }
    }
  }

  return (
    <ListReport
      fetchData={fetchData}
      afterFetchData={afterFetchData}
      getFilterFor={getFilterFor}
      onClick={onClick}
      keyLabel="Region"
      metrics={maybeWithCR([VISITORS_METRIC], query)}
      detailsLink={sitePath(site, '/regions')}
      query={query}
      renderIcon={renderIcon}
      color="bg-orange-50"
    />
  )
}

function Cities({query, site, afterFetchData}) {
  function fetchData() {
    return api.get(apiPath(site, '/cities'), query, {limit: 9})
  }

  function renderIcon(city) {
    return <span className="mr-1">{city.country_flag}</span>
  }

  function getFilterFor(listItem) {
    return {
      prefix: "city",
      filter: ["is", "city", [listItem['code']]],
      labels: { [listItem['code']]: listItem['name'] }
    }
  }

  return (
    <ListReport
      fetchData={fetchData}
      afterFetchData={afterFetchData}
      getFilterFor={getFilterFor}
      keyLabel="City"
      metrics={maybeWithCR([VISITORS_METRIC], query)}
      detailsLink={sitePath(site, '/cities')}
      query={query}
      renderIcon={renderIcon}
      color="bg-orange-50"
    />
  )
}


const labelFor = {
	'countries': 'Countries',
	'regions': 'Regions',
	'cities': 'Cities',
}

export default class Locations extends React.Component {
	constructor(props) {
    super(props)
    this.onCountryFilter = this.onCountryFilter.bind(this)
    this.onRegionFilter = this.onRegionFilter.bind(this)
    this.afterFetchData = this.afterFetchData.bind(this)
    this.tabKey = `geoTab__${  props.site.domain}`
    const storedTab = storage.getItem(this.tabKey)
    this.state = {
      mode: storedTab || 'map',
      importedQueryUnsupported: false
    }
  }

  componentDidUpdate(prevProps) {
    const isRemovingFilter = (filterName) => {
      return getFiltersByKeyPrefix(prevProps.query, filterName).length > 0 &&
        getFiltersByKeyPrefix(this.props.query, filterName).length == 0
    }

    if (this.state.mode === 'cities' && isRemovingFilter('region')) {
      this.setMode('regions')()
    }

    if (this.state.mode === 'regions' && isRemovingFilter('country')) {
      this.setMode(this.countriesRestoreMode || 'countries')()
    }
  }

  setMode(mode) {
    return () => {
      storage.setItem(this.tabKey, mode)
      this.setState({mode})
    }
  }

  onCountryFilter(mode) {
    return () => {
      this.countriesRestoreMode = mode
      this.setMode('regions')()
    }
  }

  onRegionFilter() {
    this.setMode('cities')()
  }

  afterFetchData(apiResponse) {
    const unsupportedQuery = apiResponse.skip_imported_reason === 'unsupported_query'
    const isRealtime = this.props.query.period === 'realtime'
    this.setState({importedQueryUnsupported: unsupportedQuery && !isRealtime})
  }

	renderContent() {
    switch(this.state.mode) {
		case "cities":
      return <Cities site={this.props.site} query={this.props.query} afterFetchData={this.afterFetchData} />
		case "regions":
      return <Regions onClick={this.onRegionFilter} site={this.props.site} query={this.props.query} afterFetchData={this.afterFetchData} />
		case "countries":
      return <Countries onClick={this.onCountryFilter('countries')} site={this.props.site} query={this.props.query} afterFetchData={this.afterFetchData} />
    case "map":
    default:
      return <CountriesMap onClick={this.onCountryFilter('map')} site={this.props.site} query={this.props.query} afterFetchData={this.afterFetchData} />
    }
  }

	renderPill(name, mode) {
    const isActive = this.state.mode === mode

    if (isActive) {
      return (
        <button
          className="inline-block h-5 text-indigo-700 dark:text-indigo-500 font-bold active-prop-heading"
        >
          {name}
        </button>
      )
    }

    return (
      <button
        className="hover:text-indigo-600 cursor-pointer"
        onClick={this.setMode(mode)}
      >
        {name}
      </button>
    )
  }

	render() {
    return (
      <div>
        <div className="w-full flex justify-between">
          <div className="flex gap-x-1">
            <h3 className="font-bold dark:text-gray-100">
              {labelFor[this.state.mode] || 'Locations'}
            </h3>
            <ImportedQueryUnsupportedWarning condition={this.state.importedQueryUnsupported} />
          </div>
          <div className="flex text-xs font-medium text-gray-500 dark:text-gray-400 space-x-2">
            { this.renderPill('Map', 'map') }
            { this.renderPill('Countries', 'countries') }
            { this.props.site.showCities && this.renderPill('Regions', 'regions') }
            { this.props.site.showCities && this.renderPill('Cities', 'cities') }
          </div>
        </div>
        {this.renderContent()}
      </div>
    )
  }
}
