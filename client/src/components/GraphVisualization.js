import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

const GraphVisualization = ({ 
  data, 
  width = 800, 
  height = 600, 
  onNodeClick, 
  onNodeDrag,
  nodeViewMode = 'ingredient' // 'ingredient' or 'liquor'
}) => {
  const svgRef = useRef(null);
  const [simulation, setSimulation] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    if (!data || !data.nodes || !data.links) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous render

    // Create container group for zoom
    const container = svg.append("g");

    // Set up zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        container.attr("transform", event.transform);
      });

    svg.call(zoom);

    // Color scales for different node types
    const colorScale = d3.scaleOrdinal()
      .domain(['liquor', 'ingredient', 'compound'])
      .range(['#ff6b6b', '#4ecdc4', '#45b7d1']);

    // Create force simulation
    const sim = d3.forceSimulation(data.nodes)
      .force("link", d3.forceLink(data.links)
        .id(d => d.id)
        .distance(80)
        .strength(0.1))
      .force("charge", d3.forceManyBody()
        .strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(25));

    setSimulation(sim);

    // Create links
    const link = container.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(data.links)
      .enter().append("line")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", d => Math.sqrt(d.value || 1));

    // Create node groups
    const node = container.append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(data.nodes)
      .enter().append("g")
      .attr("class", "node")
      .style("cursor", "pointer");

    // Add circles to nodes
    node.append("circle")
      .attr("r", d => d.size || 15)
      .attr("fill", d => colorScale(d.type))
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .on("click", (event, d) => {
        setSelectedNode(d);
        if (onNodeClick) onNodeClick(d);
      })
      .on("mouseover", function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", (d.size || 15) * 1.2)
          .attr("stroke-width", 3);
        
        // Show tooltip
        const tooltip = d3.select("body").append("div")
          .attr("class", "graph-tooltip")
          .style("position", "absolute")
          .style("padding", "10px")
          .style("background", "rgba(0, 0, 0, 0.8)")
          .style("color", "white")
          .style("border-radius", "5px")
          .style("pointer-events", "none")
          .style("opacity", 0);

        tooltip.transition()
          .duration(200)
          .style("opacity", 1);

        tooltip.html(`
          <strong>${d.name}</strong><br/>
          Type: ${d.type}<br/>
          ${d.score ? `Score: ${d.score}` : ''}
        `)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 10) + "px");
      })
      .on("mouseout", function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", d.size || 15)
          .attr("stroke-width", 2);
        
        d3.selectAll(".graph-tooltip").remove();
      });

    // Add labels to nodes
    node.append("text")
      .text(d => d.name)
      .attr("text-anchor", "middle")
      .attr("dy", d => (d.size || 15) + 20)
      .attr("font-size", "12px")
      .attr("font-family", "Arial, sans-serif")
      .attr("fill", "#333");

    // Add drag behavior
    const drag = d3.drag()
      .on("start", (event, d) => {
        if (!event.active) sim.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on("drag", (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
        if (onNodeDrag) onNodeDrag(d, event);
      })
      .on("end", (event, d) => {
        if (!event.active) sim.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    node.call(drag);

    // Update positions on simulation tick
    sim.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      node
        .attr("transform", d => `translate(${d.x},${d.y})`);
    });

    return () => {
      if (sim) sim.stop();
    };
  }, [data, width, height, onNodeClick, onNodeDrag]);

  // Function to highlight connections
  const highlightConnections = (nodeId) => {
    const svg = d3.select(svgRef.current);
    
    // Reset all styles
    svg.selectAll(".node circle")
      .style("opacity", 0.3)
      .attr("stroke-width", 2);
    
    svg.selectAll(".links line")
      .style("opacity", 0.1);

    // Highlight selected node
    svg.selectAll(".node")
      .filter(d => d.id === nodeId)
      .select("circle")
      .style("opacity", 1)
      .attr("stroke-width", 4);

    // Highlight connected nodes and links
    const connectedLinks = data.links.filter(
      l => l.source.id === nodeId || l.target.id === nodeId
    );

    connectedLinks.forEach(link => {
      const connectedNodeId = link.source.id === nodeId ? link.target.id : link.source.id;
      
      svg.selectAll(".node")
        .filter(d => d.id === connectedNodeId)
        .select("circle")
        .style("opacity", 0.8);
    });

    svg.selectAll(".links line")
      .filter(d => d.source.id === nodeId || d.target.id === nodeId)
      .style("opacity", 0.8)
      .attr("stroke", "#ff6b6b");
  };

  // Function to reset highlighting
  const resetHighlight = () => {
    const svg = d3.select(svgRef.current);
    
    svg.selectAll(".node circle")
      .style("opacity", 1)
      .attr("stroke-width", 2);
    
    svg.selectAll(".links line")
      .style("opacity", 0.6)
      .attr("stroke", "#999");
  };

  // Control panel for graph interactions
  const GraphControls = () => (
    <div style={{
      position: 'absolute',
      top: '10px',
      right: '10px',
      background: 'white',
      padding: '10px',
      borderRadius: '5px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      zIndex: 10
    }}>
      <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Graph Controls</h4>
      
      <button
        onClick={resetHighlight}
        style={{
          margin: '2px',
          padding: '5px 10px',
          fontSize: '12px',
          border: '1px solid #ddd',
          borderRadius: '3px',
          background: 'white',
          cursor: 'pointer'
        }}
      >
        Reset Highlight
      </button>
      
      <button
        onClick={() => {
          if (simulation) {
            simulation.alphaTarget(0.3).restart();
            setTimeout(() => simulation.alphaTarget(0), 1000);
          }
        }}
        style={{
          margin: '2px',
          padding: '5px 10px',
          fontSize: '12px',
          border: '1px solid #ddd',
          borderRadius: '3px',
          background: 'white',
          cursor: 'pointer'
        }}
      >
        Restart Layout
      </button>

      {selectedNode && (
        <div style={{ marginTop: '10px', fontSize: '12px' }}>
          <strong>Selected:</strong><br/>
          {selectedNode.name}
          <button
            onClick={() => highlightConnections(selectedNode.id)}
            style={{
              margin: '5px 0',
              padding: '3px 8px',
              fontSize: '10px',
              border: '1px solid #ddd',
              borderRadius: '3px',
              background: '#f0f0f0',
              cursor: 'pointer',
              display: 'block'
            }}
          >
            Highlight Connections
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div style={{ position: 'relative', width, height }}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{
          border: '1px solid #ddd',
          borderRadius: '5px',
          background: '#fafafa'
        }}
      />
      <GraphControls />
      
      {/* Legend */}
      <div style={{
        position: 'absolute',
        bottom: '10px',
        left: '10px',
        background: 'white',
        padding: '10px',
        borderRadius: '5px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        fontSize: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', margin: '2px 0' }}>
          <div style={{ width: '12px', height: '12px', background: '#ff6b6b', borderRadius: '50%', marginRight: '5px' }}></div>
          Liquor
        </div>
        <div style={{ display: 'flex', alignItems: 'center', margin: '2px 0' }}>
          <div style={{ width: '12px', height: '12px', background: '#4ecdc4', borderRadius: '50%', marginRight: '5px' }}></div>
          Ingredient
        </div>
        <div style={{ display: 'flex', alignItems: 'center', margin: '2px 0' }}>
          <div style={{ width: '12px', height: '12px', background: '#45b7d1', borderRadius: '50%', marginRight: '5px' }}></div>
          Compound
        </div>
      </div>
    </div>
  );
};

export default GraphVisualization;
