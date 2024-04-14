// Define global variable to hold the data array
var matrixData = [];

// Read CSV file and generate visualizations
d3.csv("2022_net_plant_data-org.csv")
	.then(function(data) {
	console.log("Data loaded:", data);
	
	// Data has been successfully loaded
	matrixData = data.map(function(d) {
	  // Process data here
	  // Example: extract companion plants for each plant
	  var plantName = d.plant_name;
	  var companionPlants = d.companion_plants.split(',').map(function(item) {
		return item.trim();
	  });
	  return { plant: plantName, companions: companionPlants };
	});

	console.log("Matrix Data-HERE:", matrixData);				
	
		if (matrixData && matrixData.length > 0) {
            // Generate logical data
            var logicalData = generateLogicalData(matrixData);
            console.log("Logical Data:", logicalData);
            // Render visualizations
            renderAdjacencyMatrix(matrixData, "#adjacency-matrix");
            renderLogicalRepresentation(logicalData, "#logical-representation");
        } else {
            console.error("Error: matrixData is empty or undefined.");
        }
	
/* 		if (Array.isArray(matrixData)) {
		  console.log("matrixData is an array");
		} else {
		  console.log("matrixData is not an array");
		} */
	
})
.catch(function(error) {
	// Handle any errors that occur during data loading
	console.error("Error loading/parsing data:", error);
});


// Function to render visualizations using matrixData
/* function renderVisualizations(matrixData) {
    // Generate logical data
    var logicalData = generateLogicalData(matrixData);
	console.log("Logical Data:", logicalData);
    // Render visualizations
    renderAdjacencyMatrix(matrixData, "#adjacency-matrix");
    renderLogicalRepresentation(logicalData, "#logical-representation");
} */

// Generate logical representation data from adjacency matrix data
function generateLogicalData(matrixData) {
    // Initialize nodes and edges arrays
    const nodes = [];
    const edges = [];
  
    // Counter for generating unique IDs
    let idCounter = 0;

    // Ensure matrixData is defined and not empty before iterating
    if (matrixData && matrixData.length > 0) {
        // Iterate over each plant in the matrix data
        matrixData.forEach((plantData, index) => {
            // Create a node for the plant
            const node = { id: idCounter++, name: plantData.plant, x: 50, y: index * 100 + 50 }; // Adjust x and y positions as needed
            nodes.push(node);

            // Iterate over the companions of the plant
            plantData.companions.forEach((companion) => {
                // Find the index of the companion plant in the matrix data
                const companionIndex = matrixData.findIndex((data) => data.plant === companion);
                
                // If the companion plant is found, create an edge
                if (companionIndex !== -1) {
                    const edge = { source: node.id, target: companionIndex };
                    edges.push(edge);
                }
			});
		});
	}
	// Return the generated logical data
    return { nodes, edges };
}

	// Usage example:
	const logicalData = generateLogicalData(matrixData);

	console.log("Logical Data:", logicalData.nodes, logicalData.edges);

	console.log("Node IDs:");
	logicalData.nodes.forEach(node => {
		console.log(node.id);
});

// Function to render the adjacency matrix
function renderAdjacencyMatrix(matrixData, containerId, viewBoxWidth, viewBoxHeight) {
		console.log("AM1", matrixData);
		// Create SVG container
		const svg = d3.select(containerId)
					  .append("svg")
					  .attr("width", "100%")
					  .attr("height", "100%")
					  .attr("preserveAspectRatio", "xMidYMid meet")
		//			  .attr("viewBox", `${-viewBoxWidth/2} ${-viewBoxHeight/2} ${viewBoxWidth*2} ${viewBoxHeight*2}`)
		//			  .attr("class", "svg-style");

		const cellSize = 40; // Adjust cell size as needed

		// Create a group element for the matrix
		const matrixGroup = svg.append("g");

		console.log("Matrix Data Type:", typeof matrixData);


		// Add labels for plants along the top row
		matrixGroup.selectAll(".plant-label-column")
			.data(matrixData)
			.enter()
			.append("text")
			.attr("class", "plant-label-column")
			.attr("x", function (d, i) { return (i + 1) * cellSize + cellSize / 2; }) // Centered horizontally within the cell
			.attr("y", cellSize / 2)
			.text(function (d) { return d.plant; })
			.style("text-anchor", "middle")
			.style("alignment-baseline", "middle")
			.style("font-size", "10px");

		// Add labels for plants to the left of each row
		matrixGroup.selectAll(".plant-label-row")
			.data(matrixData)
			.enter()
			.append("text")
			.attr("class", "plant-label-row")
			.attr("x", cellSize / 2)
			.attr("y", function (d, i) { return (i + 1) * cellSize + cellSize / 2; }) // Centered vertically within the cell
			.text(function (d) { return d.plant; })
			.style("text-anchor", "middle")
			.style("alignment-baseline", "middle")
			.style("font-size", "10px");

		
		console.log("AM2", matrixData);
		
		// Add labels for plants to the left of each row
		const cells = matrixGroup.selectAll(".cell-row")
			.data(matrixData)
			.enter()
			.append("g")
			.attr("class", "cell-row")
			.attr("transform", function (d, i) { return "translate(0," + (i + 1) * cellSize + ")"; })
			.selectAll(".cell")
			.data(function (d, rowIndex) {
				return matrixData.map(function (plant, columnIndex) {
					return {
						rowIndex: rowIndex,
						columnIndex: columnIndex,
						isDiagonal: rowIndex === columnIndex,
						isAdjacent: rowIndex !== columnIndex && d.companions.includes(plant.plant),
						plant: plant.plant
					};
				});
			})
			.enter()
			.append("g")
			.attr("class", "cell");

		// Create matrix cells
		cells.append("rect")
			 .attr("x", function(d, i) { return (d.columnIndex + 1) * cellSize; })
			 .attr("width", cellSize)
			 .attr("height", cellSize)
			 .style("fill", function(d) { 
				 if (d.isDiagonal) {
					 return "black"; // Diagonal cells
				 } else {
					 return d.isAdjacent ? "lightblue" : "white"; // Adjacent (companions) and non-adjacent cells
				 }
			 })
			 .style("stroke", "black");
		
		console.log("AM3", matrixData);
		
		 // Add text to non-diagonal cells (optional)
		cells.append("text")
			.attr("x", function (d, i) { return (d.columnIndex + 1) * cellSize + cellSize / 2; })
			.attr("y", cellSize / 2)
	//		.text(function (d) { return d.isDiagonal ? d.plant : (d.isAdjacent ? "1" : "0"); })
			.style("text-anchor", "middle")
			.style("alignment-baseline", "middle")
			.style("font-size", "10px");
		  
		  // Calculate the size of the adjacency matrix
		const matrixWidth = matrixData.length * cellSize;
		const matrixHeight = matrixData.length * cellSize;

		// Check if the matrix is larger than the viewport
		const isMatrixLarger = matrixWidth > viewBoxWidth || matrixHeight > viewBoxHeight;

		// If the matrix is larger, add sliders
		if (isMatrixLarger) {
			// Add horizontal and vertical sliders
			addSliders(containerId, matrixWidth, matrixHeight, viewBoxWidth, viewBoxHeight);
		}

		// Render the adjacency matrix SVG
		// Adjust the viewBox attribute based on slider positions
	  
	  
		// Set the viewBox attribute
		 svg.attr("viewBox", `${-viewBoxWidth/2} ${-viewBoxHeight/2} ${viewBoxWidth*2} ${viewBoxHeight*2}`);
	  
		// Log the width and height for debugging
		console.log("Adjacency Matrix SVG width:", viewBoxWidth);
		console.log("Adjacency Matrix SVG height:", viewBoxHeight);

		// Setup zoom behavior
		setupZoomAndPan(containerId);

 }

// Function to add horizontal and vertical sliders
function addSliders(containerId, matrixWidth, matrixHeight, viewBoxWidth, viewBoxHeight) {
	
	console.log(VBH, viewBoxHeight);
	
    // Create horizontal slider
    const horizontalSlider = document.createElement("input");
    horizontalSlider.type = "range";
    horizontalSlider.min = 0;
    horizontalSlider.max = matrixWidth - viewBoxWidth;
    horizontalSlider.value = 0;
    horizontalSlider.addEventListener("input", function() {
        updateViewBox(+this.value, +verticalSlider.value, viewBoxWidth, viewBoxHeight);
    });
    document.getElementById(containerId).appendChild(horizontalSlider);

    // Create vertical slider
    const verticalSlider = document.createElement("input");
    verticalSlider.type = "range";
    verticalSlider.min = 0;
    verticalSlider.max = matrixHeight - viewBoxHeight;
    verticalSlider.value = 0;
    verticalSlider.addEventListener("input", function() {
        updateViewBox(+horizontalSlider.value, +this.value, viewBoxWidth, viewBoxHeight);
    });
    document.getElementById(containerId).appendChild(verticalSlider);
}

// Function to update the viewBox based on slider positions
function updateViewBox(horizontalPosition, verticalPosition, viewBoxWidth, viewBoxHeight) {
    // Update the viewBox attribute of the SVG
    const svg = document.querySelector("svg"); // Assuming the SVG element exists
    svg.setAttribute("viewBox", `${horizontalPosition} ${verticalPosition} ${viewBoxWidth} ${viewBoxHeight}`);
}

// Function to render the logical representation with a force-directed layout
function renderLogicalRepresentation(logicalData, containerId, viewBoxWidth, viewBoxHeight) {
	console.log("Log ViewBox Width - 2:", viewBoxWidth);
    console.log("Log ViewBox Height - 2:", viewBoxHeight);
  
    // Create SVG container
    const svg = d3.select(containerId)
        .append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("preserveAspectRatio", "xMidYMid meet")
	//	.attr("viewBox", `${-viewBoxWidth/2} ${-viewBoxHeight/2} ${viewBoxWidth*2} ${viewBoxHeight*2}`);
  
	console.log("log rep. viewboxWidth: ", viewBoxWidth);
	console.log("log rep. viewboxHeight: ", viewBoxHeight);

    const simulation = d3.forceSimulation(logicalData.nodes)
        .force("charge", d3.forceManyBody().strength(-100))
        .force("center", d3.forceCenter(viewBoxWidth / 2, viewBoxHeight / 2))
        .force("link", d3.forceLink(logicalData.edges).distance(50))

	// Set initial positions for nodes
	logicalData.nodes.forEach((node, index) => {
		node.x = index % 2 === 0 ? viewBoxWidth / 4 : (3 * viewBoxWidth) / 4; // Alternating x positions
		node.y = index * 30; // Adjust y position spacing as needed
	});
    // Draw edges
    const edges = svg.selectAll(".edge")
                     .data(logicalData.edges)
                     .enter()
                     .append("line")
                     .attr("class", "edge")
                     .style("stroke", "black");

    // Draw nodes
    const nodes = svg.selectAll(".node")
                     .data(logicalData.nodes)
                     .enter()
                     .append("circle")
                     .attr("class", "node")
                     .attr("r", 10) // Adjust node radius as needed
                     .style("fill", "lightgreen")
                     .style("stroke", "black")
                     .call(drag(simulation));
        console.log("test nodes", logicalData.nodes);
  
  
    // Add labels for plants
    const labels = svg.selectAll(".plant-label")
                      .data(logicalData.nodes)
                      .enter()
                      .append("text")
                      .attr("class", "plant-label")
                      .attr("x", 12)
                      .attr("y", ".31em")
                      .text(function(d) { return d.name; });

    simulation.on("tick", () => {
        edges.attr("x1", function(d) { return d.source.x; })
             .attr("y1", function(d) { return d.source.y; })
             .attr("x2", function(d) { return d.target.x; })
             .attr("y2", function(d) { return d.target.y; });

        nodes.attr("cx", function(d) { return d.x; })
             .attr("cy", function(d) { return d.y; });

        labels.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
    });
    console.log("test edges", logicalData.edges);
  
    // Set the viewBox attribute
     svg.attr("viewBox", `${-viewBoxWidth/2} ${-viewBoxHeight/2} ${viewBoxWidth*2} ${viewBoxHeight*2}`);

    // Log the width and height for debugging
    console.log("Logical Representation SVG width:", viewBoxWidth);
    console.log("Logical Representation SVG height:", viewBoxHeight);

    return svg.node();
	
	// Setup zoom behavior
    setupZoomAndPan(containerId);

}

function drag(simulation) {
    function dragStarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
    }

    function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
    }

    function dragEnded(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
    }

    return d3.drag()
        .on("start", dragStarted)
        .on("drag", dragged)
        .on("end", dragEnded);
}

function setupZoomAndPan(containerId) {
    const svg = d3.select(containerId).select("svg");
    const g = svg.select("g");
    
    const containerRect = svg.node().getBoundingClientRect();
    const width = containerRect.width;
    const height = containerRect.height;

    const zoom = d3.zoom()
        .scaleExtent([1, 8])
        .on("zoom", zoomed);

    svg.call(zoom);

    function zoomed(event) {
        g.attr("transform", event.transform);
    }

    function constrainTranslation(transform) {
        const scale = transform.k;
        const tx = Math.min(0, Math.max(width * (1 - scale), transform.x));
        const ty = Math.min(0, Math.max(height * (1 - scale), transform.y));
        return d3.zoomIdentity.translate(tx, ty).scale(transform.k);
    }

    svg.on("wheel", function () {
        const t = d3.zoomTransform(this);
        const newTransform = constrainTranslation(t);
        if (!t.equals(newTransform)) {
            svg.transition().duration(500).call(zoom.transform, newTransform);
        }
    });
}


// Initial setup: Render SVG with viewBox covering the entire container
