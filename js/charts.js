// KeenTracking - https://github.com/keen/keen-tracking.js#automated-event-tracking
// KeenAnalysis - API client - https://github.com/keen/keen-analysis.js
// KeenDataviz - Data visualisation library - https://github.com/keen/keen-dataviz.js

const client = new KeenAnalysis({
  projectId: '', // your Project Id
  readKey: '' // your Read key
});

// You an replace this timeframe with other relative timeframes
// Examples: 'this_6_months', 'previous_6_weeks', or 'this_7_days'
// See the Keen API docs for more relative timeframes: https://keen.io/docs/api/#relative-timeframes
const timeframe = 'this_14_days';
const timezone = 'UTC'; // https://keen.io/docs/api/#timezone

const chartColors = [
  '#5E77FF',
  '#9C60FE',
  '#F162FE',
  '#FD65B7',
  '#FD6768',
  '#FDB86A',
  '#F2FC6C',
  '#A5FC6E',
  '#71FB85',
  '#73FBD0',
  '#76DDFA',
  '#76f4fa',
  '#bb76fa',
  '#fa76bf'
];

// helper function for rendering 1st row's small charts on the Overview page
const areaChartWithDetails = async ({
  client,
  container,
  queries,
  title,
  savedQuery = false
}) => {

  const queryPrevious = savedQuery ?
    {
      saved_query_name: queries.current
    } : queries.current;

  const queryNow = savedQuery ? {
      saved_query_name: queries.compareWith
    } : queries.compareWith;

  const queryInterval = savedQuery ? {
      saved_query_name: queries.area
    } : queries.area;


  const previous = client.query(queryPrevious).then(res => res);
  const current = client.query(queryNow).then(res => res);
  const results = client.query(queryInterval).then(res =>res);

  const data = await Promise.all([previous, current, results]);

  const revenueChart = new KeenDataviz({
    container,
    title,
    type: 'metric-combo',
    colors: chartColors,
    metricResults: {
      previous: data[0],
      current: data[1],
    },
    results: data[2],
    tooltip: {
      format: {
        title: (d) => new Date(d).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
      }
    }
  })
  .render();

};


renderCharts = () => {

  // Overview Tab

  if (activeTab === 'overview') {

    areaChartWithDetails({
      client,
      title: 'Views Last 24h',
      container: '#chart-views-last-24h',
      queries: {
        current: {
          event_collection: 'pageviews',
          analysis_type: 'count',
          timeframe: 'previous_24_hours',
          timezone
        },
        compareWith: {
          event_collection: 'pageviews',
          analysis_type: 'count',
          timeframe: 'previous_48_hours',
          timezone
        },
        area: {
          event_collection: 'pageviews',
          analysis_type: 'count',
          timeframe: 'previous_24_hours',
          interval: 'hourly',
          timezone
        }
      }
    });

    areaChartWithDetails({
      client,
      title: 'Views Last 7d',
      container: '#chart-views-last-7d',
      queries: {
        current: {
          event_collection: 'pageviews',
          analysis_type: 'count',
          timeframe: 'previous_7_days',
          timezone
        },
        compareWith: {
          event_collection: 'pageviews',
          analysis_type: 'count',
          timeframe: 'previous_14_days',
          timezone
        },
        area: {
          event_collection: 'pageviews',
          analysis_type: 'count',
          timeframe: 'previous_7_days',
          interval: 'daily',
          timezone
        }
      }
    });

    areaChartWithDetails({
      client,
      title: 'Clicks Last 24h',
      container: '#chart-clicks-last-24h',
      queries: {
        current: {
          event_collection: 'clicks',
          analysis_type: 'count',
          timeframe: 'previous_24_hours',
          timezone
        },
        compareWith: {
          event_collection: 'clicks',
          analysis_type: 'count',
          timeframe: 'previous_48_hours',
          timezone
        },
        area: {
          event_collection: 'clicks',
          analysis_type: 'count',
          timeframe: 'previous_24_hours',
          interval: 'hourly',
          timezone
        }
      }
    });

    areaChartWithDetails({
      client,
      title: 'Clicks Last 7d',
      container: '#chart-clicks-last-7d',
      queries: {
        current: {
          event_collection: 'clicks',
          analysis_type: 'count',
          timeframe: 'previous_7_days',
          timezone
        },
        compareWith: {
          event_collection: 'clicks',
          analysis_type: 'count',
          timeframe: 'previous_14_days',
          timezone
        },
        area: {
          event_collection: 'clicks',
          analysis_type: 'count',
          timeframe: 'previous_7_days',
          interval: 'daily',
          timezone
        }
      }
    });

    client
      .query({
      event_collection: 'pageviews',
      analysis_type: 'count_unique',
      target_property: 'user.uuid',
      timeframe,
      timezone,
      group_by: 'geo.city',
      filters: [
        {
          property_name: 'geo.city',
          operator: 'exists',
          property_value: true
        },
        {
          property_name: 'geo.city',
          operator: 'ne',
          property_value: null
        },
        {
          property_name: 'geo.country',
          operator: 'eq',
          property_value: 'United States'
        },
        {
          property_name: 'user.email',
          operator: 'not_contains',
          property_value: 'keen.io'
        },
      ]
    })
    .then(res => {

      const citiesFromResult = res.result;
      citiesFromResult.forEach(cityFromResult => {
        let cityInCoordinatesArray =
        coordinates.find(item => item.fields.city.toLowerCase() === cityFromResult['geo.city'].toLowerCase());
        if (cityInCoordinatesArray) {
          cityFromResult.coordinates = cityInCoordinatesArray.geometry.coordinates;
        }
      });
      const citiesWithCoordinates = citiesFromResult.filter(city => !!city.coordinates);

      let activeMapData;
      const appMapAreaNode = document.getElementById('map');

      function init(){
        window.mapInited = true;
        L.mapbox.accessToken = 'pk.eyJ1Ijoia2Vlbi1pbyIsImEiOiIza0xnNXBZIn0.PgzKlxBmYkOq6jBGErpqOg';
        const map = L.mapbox.map('map', 'keen-io.kae20cg0', {
          attributionControl: true,
          center: [ 35.77350, -98.41104 ],
          zoom: 5
        });
        activeMapData = L.layerGroup().addTo(map);
        activeMapData.clearLayers();

        citiesWithCoordinates.forEach((city, index) => {
          let size = 'small';
          if (city.result > 3) {
            size = 'medium';
          }
          if (city.result > 7) {
            size = 'large';
          }
          var em = L.marker(new L.LatLng(city.coordinates[1], city.coordinates[0]), {
            icon: L.mapbox.marker.icon({
              'marker-color': {
                small: chartColors[0],
                medium: chartColors[1],
                large: chartColors[2]
              }[size],
              'marker-size':  size,
              'marker-symbol': city.result
            })
          }).addTo(activeMapData);;
        });
    }

    if (!window.mapInited) {
      init();
    }

  });

  client
  .query({
    event_collection: 'pageviews',
    analysis_type: 'count',
    timeframe,
    timezone,
    group_by: 'utm_source',
    filters: [
      {
        property_name: 'utm_source',
        operator: 'exists',
        property_value: true
      },
      {
        property_name: 'utm_source',
        operator: 'ne',
        property_value: null
      }
    ],
    interval: 'daily'
  })
  .then(results => {
    new KeenDataviz({
      container: '.chart-top-referrers',
      title: 'Views By Top 3 Sources',
      type: 'area-spline',
      colors: chartColors,
      results,
      legend: {
        position: 'top'
      },
      labelMapping: {
        'fbads': 'Facebook',
        'adwords': 'Google',
        'sendgrid_docs': 'Sendgrid'
      },
      sortGroups: 'desc',
      padding: {
        left: 50,
        top: 0,
        right: 35,
        bottom: 0
      }
    });
  });

const metricBox = ({ title, value, container, icon }) => {
  const element = document.getElementById(container);
  element.innerHTML = `
  <i class='fas fa-${icon}'></i>
  <div class='label'>
  <div class='value'>${value}</div>
  <div class='title'>${title}</div>
  </div>
  `;
};

client
  .query({
    event_collection: 'pageviews',
    analysis_type: 'count_unique',
    target_property: 'user.uuid',
    timeframe,
    timezone
  })
  .then(results => {
    metricBox({
      title: 'Unique Visitors',
      icon: 'users',
      value: results.result,
      container: 'unique-users-this-7d'
    });
  });

  client
    .query({
      event_collection: 'pageviews',
      analysis_type: 'average',
      target_property: 'page.time_on_page',
      timeframe,
      timezone
    })
    .then(results => {
      metricBox({
      title: 'Avg Time on Site',
      icon: 'clock',
      value: results.result.toFixed(0) + ' seconds',
      container: 'average-time-on-page'
    });
  });

  client
    .query({
      event_collection: 'clicks',
      analysis_type: 'count',
      timeframe,
      timezone,
      group_by: 'user.uuid'
    })
    .then(results => {
      const clicksPerUser = Math.floor(
        results.result.reduce((acc = 0, item) => {
          return (acc.result || acc || 0) + parseInt(item.result);
        }) / results.result.length
      );
      metricBox({
        title: 'Avg Clicks per User',
        icon: 'hand-pointer',
        value: clicksPerUser,
        container: 'average-clicks-per-user'
      });
  });

  client
    .query({
      event_collection: 'pageviews',
      analysis_type: 'average',
      target_property: 'page.scroll_state.ratio_max',
      timeframe,
      timezone
    })
    .then(results => {
      metricBox({
        title: 'Avg Page Read',
        icon: 'percent',
        value: results.result.toFixed(2) * 100,
        container: 'average-scroll-ratio'
      });
  });

  }


  // Views Tab

  if (activeTab === 'views') {
    client
      .query({
        event_collection: 'pageviews',
        analysis_type: 'count',
        timeframe,
        timezone,
        group_by: 'geo.country',
        interval: 'daily'
      })
      .then(results => {
        results.result.forEach(result => {
          result.value.sort((a,b) =>{
            return b.result - a.result;
          })
          .splice(7, 9999);
        });
        const chart = new KeenDataviz({
          container: `.chart-pageviews-by-country-interval-daily`,
          title: 'Views by country',
          type: 'bar',
          legend: {
            position: 'right',
            pagination: {
              limit: 9
            },
            label: {
              textMaxLength: 30
            }
          },
          results,
          sortGroups: 'desc',
          colors: chartColors,
          padding: {
            left: 55,
            top: 0,
            right: 25,
            bottom: 30
          }
        });
      });

    client
      .query({
        event_collection: 'pageviews',
        analysis_type: 'count',
        timeframe: 'previous_14_days',
        timezone,
        group_by: 'time.day_of_week'
      })
      .then(results => {
        const chart = new KeenDataviz({
          container: `.chart-pageviews-by-day-of-week`,
          title: 'Views by day of the week',
          type: 'area',
          labelMapping: {
            1: 'Sun',
            2: 'Mon',
            3: 'Tue',
            4: 'Wed',
            5: 'Thu',
            6: 'Fri',
            7: 'Sat'
          },
          legend: {
            position: 'right',
            pagination: {
              limit: 7
            },
            label: {
              textMaxLength: 30
            }
          },
          colors: chartColors,
          results,
          padding: {
            left: 60,
            top: 0,
            right: 30,
            bottom: 20
          }
        });
      });

    client
    .query({
      event_collection: 'pageviews',
      analysis_type: 'count',
      timeframe,
      timezone,
      group_by: 'time.hour_of_day'
    })
    .then(results => {
      const chart = new KeenDataviz({
        container: `.chart-views-by-hour`,
        title: 'Views by hour',
        type: 'bar',
        legend: {
          position: 'right',
          pagination: {
            limit: 7
          },
          label: {
            textMaxLength: 30
          }
        },
        colors: chartColors,
        results,
        padding: {
          left: 45,
          top: 0,
          right: 20,
          bottom: 20
        }
      });
    });

    client
      .query({
        event_collection: 'pageviews',
        analysis_type: 'count',
        timeframe,
        timezone,
        group_by: 'url.info.path'
      })
      .then(results => {
        results.result.sort((a,b) =>{
          return b.result - a.result;
        })
        .splice(10, 9999);
        const chart = new KeenDataviz({
          container: `.chart-count-views-by-page`,
          title: 'Top pages by views',
          type: 'pie',
          stacked: true,
        //  sortGroups: 'desc',
          legend: {
            position: 'right',
            pagination: {
              limit: 10
            },
            label: {
              textMaxLength: 30
            }
          },
          colors: chartColors,
          results,
          padding: {
            left: 0,
            top: 0,
            right: 0,
            bottom: 0
          }
        });
      });

    client
    .query({
      event_collection: 'pageviews',
      analysis_type: 'average',
      target_property: 'page.time_on_page',
      timeframe,
      timezone,
      group_by: 'url.info.path'
    })
    .then(results => {
      results.result.forEach(a =>{
        a.result = (a.result).toFixed(0);
      });
      results.result.sort((a,b) =>{
        return b.result - a.result;
      });
      const chart = new KeenDataviz({
        container: `.chart-longest-time-on-page`,
        title: 'Time on page',
        type: 'table',
        labelMapping: {
          Index: 'Link',
          Result: 'Seconds'
        },
        labelMappingDimension: 'column',
        results
      });
    });

    client
      .query({
        event_collection: 'pageviews',
        analysis_type: 'average',
        target_property: 'page.scroll_state.ratio_max',
        timeframe,
        timezone,
        group_by: 'url.info.path'
      })
      .then(results => {
        results.result.forEach(a =>{
          a.result = (a.result * 100).toFixed(0);
        });
        results.result.sort((a,b) =>{
          return b.result - a.result;
        });
        const chart = new KeenDataviz({
          container: `.chart-percent-of-page-read`,
          title: 'Pages by scroll depth',
          type: 'table',
          labelMapping: {
            Index: 'Page',
            Result: '%'
          },
          labelMappingDimension: 'column',
          legend: {
            position: 'right',
            pagination: {
              limit: 6
            },
            label: {
              textMaxLength: 30
            }
          },
          colors: chartColors,
          results
        });
      });


    client
      .query({
        event_collection: 'pageviews',
        analysis_type: 'count',
        timeframe,
        timezone,
        group_by: 'firstExternalReferrer.domain'
      })
      .then(function(results){
        results.result.sort((a,b) =>{
          return b.result - a.result;
        })
        .splice(20,9999);
        const chart = new KeenDataviz({
          container: `.chart-pageviews-by-referrer`,
          title: 'Pageviews by referrer',
          type: 'donut',
          labelMapping: {
            Index: 'Domain',
            Result: 'Visitors'
          },
          labelMappingDimension: 'column',
          legend: {
            position: 'left',
            label: {
              textMaxLength: 32
            },
            pagination: {
              limit: 11
            }
          },
          padding:{
            left: 40
          },
          donut: {
            width: 60
          },
          colors: chartColors,
          results
        });
      });

    client
      .query({
        event_collection: 'pageviews',
        analysis_type: 'count',
        timeframe,
        timezone,
        group_by: 'tech.profile.screen.width'
      })
      .then(function(results){
        results.result.sort((a,b) =>{
          return b.result - a.result;
        })
        .splice(10,9999);

        const chart = new KeenDataviz({
          container: `.chart-top-pages-screen-width`,
          title: 'Screen resolutions',
          type: 'horizontal-bar',
          results,
          colors: chartColors,
          padding: {
            bottom: 20
          }
        });
    });

    client
      .query({
        event_collection: 'pageviews',
        analysis_type: 'count',
        timeframe,
        timezone,
        group_by: 'tech.os.family'
      })
      .then(function(results){
        results.result.sort((a,b) =>{
          return b.result - a.result;
        })
        .splice(3,9999);

        const chart = new KeenDataviz({
          container: `.chart-pageviews-by-os`,
          title: 'Guests by OS',
          type: 'bar',
          results,
          colors: chartColors,
          padding: {
            bottom: 20,
            right: 30
          }
        });
      });

    client
      .query({
        event_collection: 'pageviews',
        analysis_type: 'count',
        timeframe,
        timezone,
        interval: 'daily'
      })
      .then(results => {

      client
        .query({
          event_collection: 'pageviews',
          analysis_type: 'count_unique',
          target_property: 'user.uuid',
          timeframe,
          timezone,
          interval: 'daily'
        })
        .then(resultsUnique => {

        const pageviewsInterval = new KeenDataviz({
          container: '#chart-views-uniques-7d',
          title: 'Page views by day',
          type: 'area',
          colors: chartColors,
          results: [results, resultsUnique],
          legend: {
            position: 'top'
          },
          labelMapping: {
            'pageviews count': 'Views',
            'pageviews count_unique': 'Uniques'
          },
          sortGroups: 'desc',
          padding: {
            left: 50,
            top: 0,
            right: 20,
            bottom: 0
          },

          point: {
            r: 0,
            focus: {
              expand: {
                r: 4,
                enabled: true
              },
            },
            select: {
              r: 5,
              enabled: true
            }
          }
        });

        pageviewsInterval.view._artifacts.c3.select(false, false);
      });
    });

  }


  // Clicks Tab

  if (activeTab === 'clicks') {
    client
      .query({
        event_collection: 'clicks',
        analysis_type: 'count',
        timeframe,
        timezone,
        group_by: 'geo.country',
        interval: 'daily'
      })
      .then(function(results){
        results.result.forEach(result => {
          result.value.sort((a,b) =>{
            return b.result - a.result;
          })
          .splice(7, 9999);
        });
        const chart = new KeenDataviz({
          container: `.chart-clicks-by-country-daily`,
          title: 'Clicks by Country daily',
          type: 'bar',
          padding:{
            left: 60,
            bottom: 20
          },
          legend: {
            pagination:{
              limit: 12
            },
            label: {
              textMaxLength: 32
            }
          },
          colors: chartColors,
          results,
          sortGroups: 'desc'
        });
        chart.view._artifacts.c3.select(false, false);
      });

    client
      .query({
        event_collection: 'clicks',
        analysis_type: 'count',
        timeframe,
        timezone,
        group_by: 'geo.country'
      })
      .then(function(results){
        const chart = new KeenDataviz({
          container: `.chart-clicks-by-country`,
          title: 'Overall clicks by Country',
          type: 'pie',
          padding:{
            left: 50,
            bottom: 20
          },
          legend: {
            pagination:{
              limit: 8
            },
            label: {
              textMaxLength: 32
            }
          },
          colors: chartColors,
          results,
          sortGroups: 'desc'
        });
      });

    client
      .query({
        event_collection: 'clicks',
        analysis_type: 'count',
        timeframe,
        timezone,
        group_by: 'element.href'
      })
      .then(results => {
        results.result.sort((a,b) =>{
          return b.result - a.result;
        })
        .splice(10,9999);
        const chart = new KeenDataviz({
          container: `.chart-outbound-clicks`,
          title: 'Outbound link clicks',
          type: 'table',
          labelMapping: {
            Index: 'Link',
            Result: 'Clicks'
          },
          labelMappingDimension: 'column',
          results
        });
      });

    client
      .query({
        event_collection: 'clicks',
        analysis_type: 'count',
        timeframe,
        timezone,
        group_by: 'element.node_name'
      })
      .then(results => {
        results.result
          .splice(10,9999);
        const chart = new KeenDataviz({
          container: `.chart-clicks-by-html-tag`,
          title: 'Clicks by HTML tag',
          type: 'donut',
          colors: chartColors,
          results,
          sortGroups: 'desc',
          legend: {
            pagination: {
              limit: 18
            }
          },
          padding:{
            bottom: 20
          }
        });
      });

    client
      .query({
        event_collection: 'clicks',
        analysis_type: 'count',
        timeframe: "previous_24_hours",
        interval: 'hourly',
        timezone,
      })
      .then(results => {

        const chart = new KeenDataviz({
          container: `.chart-clicks-by-button-in-org-section`,
          title: 'Clicks - previous 24h',
          type: 'area-spline',
          results,
          colors: chartColors,
          sortGroups: 'desc',
          padding:{
            bottom: 20
          },
        });
      });

    client
      .query({
        event_collection: 'clicks',
        analysis_type: 'count',
        timeframe,
        timezone,
        group_by: 'element.text',
        filters: [
          {
            property_name: 'url.info.path',
            operator: 'contains',
            property_value: '/docs/'
          }
        ]
      })
      .then(results => {

      results.result.sort((a,b) =>{
        return b.result - a.result;
      })
      .splice(12,9999);

      results.result.forEach(item => {
        item['element.text'] = item['element.text'].trim();
      });

      results.result = results.result.filter(item => {
        return !!item['element.text'];
      });

      const chart = new KeenDataviz({
        container: `.chart-clicks-by-button-in-static-section`,
        title: 'Clicks by Button in Docs',
        type: 'pie',
        colors: chartColors,
        results,
        sortGroups: 'desc',
        padding:{
          left: 20,
          bottom: 20
        },
        legend:{
          pagination: {
            limit: 22
          },
          label:{
            textMaxLength: 32
          }
        }
      });
    });

    client
      .query({
        event_collection: 'clicks',
        analysis_type: 'count',
        timeframe,
        timezone,
        group_by: 'element.text',
        filters: [
          {
            property_name: 'url.info.path',
            operator: 'contains',
            property_value: '/api/'
          }
        ]
      })
      .then(results => {

      results.result.sort((a,b) =>{
        return b.result - a.result;
      })
      .splice(12,9999);

      results.result.forEach(item => {
        item['element.text'] = item['element.text'].trim();
      });

      results.result = results.result.filter(item => {
        return !!item['element.text'];
      });

      const chart = new KeenDataviz({
        container: `.chart-clicks-api-docs-sdks`,
        title: 'API SDKs',
        type: 'pie',
        colors: chartColors,
        results,
        sortGroups: 'desc',
        padding:{
          left: 20,
          bottom: 20
        },
        legend:{
          pagination: {
            limit: 22
          },
          label:{
            textMaxLength: 32
          }
        }
      });
    });

    client
      .query({
        event_collection: 'clicks',
        analysis_type: 'count',
        timeframe,
        timezone,
        group_by: 'element.text',
        filters: [
          {
            property_name: 'url.info.path',
            operator: 'contains',
            property_value: '/signup'
          }
        ]
      })
    .then(results => {
      results.result.sort((a,b) =>{
        return b.result - a.result;
      })
      .splice(2,9999);

      const chart = new KeenDataviz({
        container: `.chart-clicks-login-google-github`,
        title: 'Sign Up clicks',
        type: 'bar',
        colors: chartColors,
        results,
        sortGroups: 'desc',
        padding:{
          left: 50,
          bottom: 20
        },
        legend:{
          label:{
            textMaxLength: 32
          }
        }
      });
    });

    client
      .query({
        event_collection: 'clicks',
        analysis_type: 'count',
        timeframe,
        timezone,
        group_by: ['element.text', 'geo.country'],
        filters: [
          {
            property_name: 'url.info.path',
            operator: 'contains',
            property_value: '/api'
          }
        ]
      })
    .then(results => {

      results.result.sort((a,b) =>{
          return b.result - a.result;
        })
        .splice(6,9999);

      const chart = new KeenDataviz({
        container: `.chart-clicks-api-docs-sdks-by-country`,
        title: 'The most popular SDKs by Country',
        type: 'bar',
        colors: chartColors,
        results,
        sortGroups: 'desc',
        padding:{
          left: 50,
          bottom: 20
        },
        legend:{
          label:{
            textMaxLength: 32
          }
        }
      });
    });

    client
    .query({
      event_collection: 'clicks',
      analysis_type: 'count',
      timeframe,
      timezone,
      group_by: 'element.text',
      filters: [
        {
          property_name: 'url.info.path',
          operator: 'contains',
          property_value: '/explorer'
        }
      ],
      interval: 'hourly'
    })
    .then(results => {
      const chart = new KeenDataviz({
        container: `.chart-clicks-explorer`,
        title: 'Clicks in the Keen Explorer',
        type: 'area-step',
        colors: chartColors,
        results,
        sortGroups: 'desc',
        padding:{
          left: 50,
          bottom: 20
        },
        legend:{
          label:{
            textMaxLength: 32
          }
        }
      });
    });

  }

}

switchTab('overview');

const elementCurrentDatetime = document.getElementById('current-datetime');
if (elementCurrentDatetime) elementCurrentDatetime.innerHTML = new Date().toUTCString();
