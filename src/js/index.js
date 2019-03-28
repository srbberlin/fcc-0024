window.onload = function () {
  const tooltip = d3.select('#tooltip')

  const color = d3.scaleThreshold()
    .domain(d3.range(2.6, 75.1, (75.1-2.6)/8))
    .range(d3.schemeGreens[9])

  const legScale = d3.scaleLinear()
    .domain([2.6, 75.1])
    .rangeRound([600, 860])


  const svg = d3.select('svg')

  const legend = svg
    .append('g')
    .attr('class', 'key')
    .attr('id', 'legend')
    .attr('transform', 'translate(0,40)')

  d3.queue()
    .defer(d3.json, 'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json')
    .defer(d3.json, 'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json')
    .await((error, us, education) =>  {
      if (error) throw error
      let path = d3.geoPath()

      legend
        .selectAll('rect')
        .data(color.range().map(function(d) {
          d = color.invertExtent(d)
          if (d[0] == null) d[0] = legScale.domain()[0]
          if (d[1] == null) d[1] = legScale.domain()[1]
          return d
        }))
        .enter()
        .append('rect')
        .attr('height', 8)
        .attr('x', function(d) { return legScale(d[0]) })
        .attr('width', function(d) { return legScale(d[1]) - legScale(d[0]) })
        .attr('fill', function(d) { return color(d[0]) })

      legend
        .append('text')
        .attr('class', 'caption')
        .attr('x', legScale.range()[0])
        .attr('y', -6)
        .attr('width', 240)
        .attr('fill', '#000')
        .attr('text-anchor', 'start')
        .attr('font-weight', 'bold')
        .text('The meaning of colors on the map')
      
      legend
        .call(d3.axisBottom(legScale)
          .tickSize(13)
          .tickFormat(function(x) { return Math.round(x) + '%' })
          .tickValues(color.domain())
        )
        .select('.domain')
        .remove()

      svg
        .append('g')
        .attr('class', 'counties')
        .selectAll('path')
        .data(topojson.feature(us, us.objects.counties).features)
        .enter()
        .append('path')
        .attr('class', 'county')
        .attr('data-fips', function(d) {
          return d.id
        })
        .attr('data-education', function(d) {
          const result = education.filter(function(obj) {
            return obj.fips == d.id
          })
          if(result[0]){
            return result[0].bachelorsOrHigher
          }
          return 0
        })
        .attr('fill', function(d) { 
          const result = education.filter(function(obj) {
            return obj.fips == d.id
          })
          if(result[0]){
            return color(result[0].bachelorsOrHigher)
          }
          return color(0)
        })
        .attr('d', path)
        .on('mouseover', function(d) {      
          tooltip.style('opacity', .9) 
          tooltip.html(function() {
            const result = education.filter(function(obj) {
              return obj.fips == d.id
            })
            if(result[0]){
              return result[0]['area_name'] + ', ' + result[0]['state'] + ': ' + result[0].bachelorsOrHigher + '%'
            }
            return 'not found'
          })
            .attr('data-education', function() {
              const result = education.filter(function(obj) {
                return obj.fips == d.id
              })
              if(result[0]){
                return result[0].bachelorsOrHigher
              }
              return 0
            })
            .style('left', (d3.event.pageX + 10) + 'px') 
            .style('top', (d3.event.pageY - 28) + 'px')
        }) 
        .on('mouseout', function() { 
          tooltip.style('opacity', 0) 
        })
    
      //svg.append('path')
      //  .datum(topojson.feature(us, us.objects.states))
      //  .attr('d', d3.geo.path()
      //    .projection(d3.geo.albersUsa())
      //  )
      //  .attr('class', 'states')

      //  .selectAll('path')
      //  .data(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b }))
      //  .enter()
      //  .append('path')
      //  .attr('class', 'states')
      //  .attr('d', path)
    })
}