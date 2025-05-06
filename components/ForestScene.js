import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function ForestScene({ forestData }) {
  const cloudContainerRef = useRef(null);
  const islandRef = useRef(null);
  const gridRef = useRef(null);

  // Create animated clouds
  useEffect(() => {
    if (!cloudContainerRef.current) return;

    const cloudContainer = cloudContainerRef.current;
    const numberOfClouds = 10;

    // Clear existing clouds first
    cloudContainer.innerHTML = "";

    // Create new clouds
    for (let i = 0; i < numberOfClouds; i++) {
      const cloud = document.createElement("div");
      cloud.className = "cloud";

      // Random size
      const size = Math.random() * 100 + 50;
      cloud.style.width = `${size}px`;
      cloud.style.height = `${size / 2}px`;

      // Random initial position
      const posX = Math.random() * 100;
      const posY = Math.random() * 60 + 10;
      cloud.style.left = `${posX}%`;
      cloud.style.top = `${posY}%`;

      cloudContainer.appendChild(cloud);

      // Animation with GSAP
      const gridWidth = gridRef.current ? gridRef.current.offsetWidth : 1000;

      gsap.to(cloud, {
        x: `+=${gridWidth + 150}`, // move to the right beyond grid width
        duration: Math.random() * 60 + 60, // between 60s and 120s (slower)
        repeat: -1,
        ease: "none",
        modifiers: {
          x: gsap.utils.unitize((x) => {
            // When it goes off screen, reset to -200px
            return (parseFloat(x) % (gridWidth + 400)) - 200;
          }),
        },
      });

      gsap.to(cloud, {
        y: "+=20",
        duration: Math.random() * 10 + 5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }
  }, []);

  // Animate floating island
  useEffect(() => {
    if (!islandRef.current) return;

    const island = islandRef.current;

    gsap.to(island, {
      y: "+=20",
      duration: 4,
      repeat: -1,
      ease: "sine.inOut",
      yoyo: true,
    });

    gsap.to(island, {
      rotation: 2,
      duration: 6,
      repeat: -1,
      ease: "sine.inOut",
      yoyo: true,
    });
  }, []);

  // Update forest scene based on data
  useEffect(() => {
    if (!gridRef.current || !forestData || forestData.length === 0) return;

    const grid = gridRef.current;
    grid.innerHTML = ""; // Clear the scene

    const gridWidth = grid.offsetWidth;
    const gridHeight = grid.offsetHeight;
    const cx = gridWidth / 2;
    const cy = gridHeight / 2;

    // Calculate total trees and stumps based on database data
    const totalTrees = 60; // Max number of trees/stumps to display
    const totalPlanted = forestData.reduce((sum, d) => sum + d.planted, 0);
    const totalCut = forestData.reduce((sum, d) => sum + d.cut, 0);

    // Calculate proportion of cut vs planted trees
    const cutPercentage = totalCut / (totalPlanted > 0 ? totalPlanted : 1);

    // Determine how many trees and stumps to display
    const treesCount = Math.min(
      Math.max(Math.round(totalTrees * (1 - cutPercentage)), 0),
      totalTrees
    );
    const stumpsCount = totalTrees - treesCount;

    // Check if a point is inside the diamond
    function isInsideDiamond(x, y) {
      return (
        Math.abs(x - cx) / (gridWidth / 2) +
          Math.abs(y - cy) / (gridHeight / 2) <=
        1
      );
    }

    const positions = [];

    // Generate positions inside the diamond
    for (let i = 0; i < totalTrees; i++) {
      let attempts = 0;
      let point;
      do {
        // Generate a point in the center and apply random offsets
        const dx = ((Math.random() * 2 - 1) * gridWidth) / 2;
        const dy = ((Math.random() * 2 - 1) * gridHeight) / 2;

        const x = cx + dx;
        const y = cy + dy;

        point = { x, y };
        attempts++;
      } while (
        (!isInsideDiamond(point.x, point.y) || // Check if inside diamond
          positions.some(
            (p) => Math.abs(p.x - point.x) < 40 && Math.abs(p.y - point.y) < 80
          )) && // Check if not colliding with another tree
        attempts < 100
      );
      positions.push(point);
    }

    // Add trees
    for (let i = 0; i < treesCount; i++) {
      const tree = document.createElement("div");
      tree.className = "tree";
      tree.style.position = "absolute";
      tree.style.left = `${positions[i].x - 20}px`; // Center the tree (width 40)
      tree.style.top = `${positions[i].y - 40}px`; // Center the tree (height 80)
      const scale = 0.8 + Math.random() * 0.4;
      tree.style.transform = `scale(${scale})`;
      grid.appendChild(tree);
    }

    // Add stumps
    for (let i = treesCount; i < totalTrees; i++) {
      const stump = document.createElement("div");
      stump.className = "stump";
      stump.style.position = "absolute";
      stump.style.left = `${positions[i].x - 15}px`; // Center the stump (width 30)
      stump.style.top = `${positions[i].y - 15}px`; // Center the stump (height 30)
      grid.appendChild(stump);
    }
  }, [forestData]);

  return (
    <div className="isometric-container">
      <div className="isometric-scene">
        <div
          className="floating-clouds"
          id="clouds"
          ref={cloudContainerRef}
        ></div>
        <div className="floating-island" ref={islandRef}>
          <div className="ground"></div>
          <div className="isometric-grid" id="forestGrid" ref={gridRef}></div>
        </div>
      </div>
    </div>
  );
}
