//U20026580

// Load and parse the CSV file
d3.csv("/mnt/data/mock_stock_data.csv").then(function(data) {
    // Extract unique stock names and populate the dropdown
    const stockNames = [...new Set(data.map(d => d.stockName))];
    const stockNameSelect = d3.select("#stockName");
    stockNames.forEach(name => {
        stockNameSelect.append("option").text(name).attr("value", name);
    });

    // Create the SVG container
    const svg = d3.select("svg");
    const margin = {top: 20, right: 30, bottom: 40, left: 40};
    const width = svg.attr("width") - margin.left - margin.right;
    const height = svg.attr("height") - margin.top - margin.bottom;
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // Set up scales
    const x = d3.scaleTime().range([0, width]);
    const y = d3.scaleLinear().range([height, 0]);

    // Set up axes
    const xAxis = g.append("g").attr("transform", `translate(0,${height})`);
    const yAxis = g.append("g");

    // Set up line generator
    const line = d3.line()
        .x(d => x(new Date(d.date)))
        .y(d => y(d.value));

    // Tooltip setup
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // Filter data function
    function filterData() {
        const selectedStock = stockNameSelect.node().value;
        const startDate = new Date(d3.select("#startDate").node().value);
        const endDate = new Date(d3.select("#endDate").node().value);

        const filteredData = data.filter(d => {
            const date = new Date(d.date);
            return d.stockName === selectedStock && date >= startDate && date <= endDate;
        });

        updateChart(filteredData);
    }

    // Update chart function
    function updateChart(filteredData) {
        x.domain(d3.extent(filteredData, d => new Date(d.date)));
        y.domain([0, d3.max(filteredData, d => +d.value)]);

        xAxis.transition().call(d3.axisBottom(x));
        yAxis.transition().call(d3.axisLeft(y));

        const path = g.selectAll(".line")
            .data([filteredData], d => d.date);

        path.exit().remove();

        path.enter().append("path")
            .attr("class", "line")
            .merge(path)
            .transition()
            .attr("d", line);

        // Add circles for data points
        const circles = g.selectAll("circle")
            .data(filteredData, d => d.date);

        circles.exit().remove();

        circles.enter().append("circle")
            .attr("r", 4)
            .merge(circles)
            .transition()
            .attr("cx", d => x(new Date(d.date)))
            .attr("cy", d => y(d.value));

        // Add tooltip interaction
        g.selectAll("circle")
            .on("mouseover", function(event, d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(`Stock: ${d.stockName}<br/>Value: ${d.value}<br/>Date: ${d.date}`)
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function() {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });
    }

    // Filter
    d3.select("#filterButton").on("click", filterData);
})
