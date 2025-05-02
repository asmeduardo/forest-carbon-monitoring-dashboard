/**
 * Forest Scene Service
 * Handles the interactive forest visualization
 */
export class ForestSceneService {
    constructor() {
        // Elements
        this.forestGrid = document.getElementById('forestGrid');
        this.cloudContainer = document.getElementById('clouds');
        this.floatingIsland = document.querySelector('.floating-island');
    }
    
    /**
     * Create animated clouds
     */
    createClouds() {
        if (!this.cloudContainer) return;
        
        const numberOfClouds = 10;
        
        for (let i = 0; i < numberOfClouds; i++) {
            const cloud = document.createElement('div');
            cloud.className = 'cloud';
            
            // Random size
            const size = Math.random() * 100 + 50;
            cloud.style.width = `${size}px`;
            cloud.style.height = `${size / 2}px`;
            
            // Random initial position
            const posX = Math.random() * 100;
            const posY = Math.random() * 60 + 10;
            cloud.style.left = `${posX}%`;
            cloud.style.top = `${posY}%`;
            
            this.cloudContainer.appendChild(cloud);
            
            // Animation with GSAP
            gsap.to(cloud, {
                x: `+=${this.forestGrid ? this.forestGrid.offsetWidth + 150 : window.innerWidth + 150}`,
                duration: Math.random() * 60 + 60, // between 60s and 120s (slower)
                repeat: -1,
                ease: 'none',
                modifiers: {
                    x: gsap.utils.unitize((x) => {
                        // When it goes off-screen, reset to -200px
                        return (parseFloat(x) % (this.forestGrid ? this.forestGrid.offsetWidth + 400 : window.innerWidth + 400)) - 200;
                    }),
                },
            });
            
            gsap.to(cloud, {
                y: '+=20',
                duration: Math.random() * 10 + 5,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
            });
        }
    }
    
    /**
     * Animate the floating island
     */
    animateFloatingIsland() {
        if (!this.floatingIsland) return;
        
        gsap.to(this.floatingIsland, {
            y: '+=20',
            duration: 4,
            repeat: -1,
            ease: 'sine.inOut',
            yoyo: true,
        });
        
        gsap.to(this.floatingIsland, {
            rotation: 2,
            duration: 6,
            repeat: -1,
            ease: 'sine.inOut',
            yoyo: true,
        });
    }
    
    /**
     * Update the forest scene based on data
     */
    updateForestScene(forestData) {
        if (!this.forestGrid) return;
        
        // Clear the scene
        this.forestGrid.innerHTML = '';
        
        // Grid dimensions
        const gridWidth = this.forestGrid.offsetWidth;
        const gridHeight = this.forestGrid.offsetHeight;
        const cx = gridWidth / 2;
        const cy = gridHeight / 2;
        
        // Calculate tree counts
        const totalTrees = 60; // Maximum trees to show
        const totalPlanted = forestData.reduce((sum, d) => sum + d.planted, 0);
        const totalCut = forestData.reduce((sum, d) => sum + d.cut, 0);
        
        // Calculate percentage of trees that should be cut
        const cutPercentage = totalCut / (totalPlanted > 0 ? totalPlanted : 1);
        
        // Calculate actual tree and stump counts to display
        const treesCount = Math.round(totalTrees * (1 - cutPercentage));
        const stumpsCount = totalTrees - treesCount;
        
        // Generate positions for trees
        const positions = this.generatePositions(cx, cy, gridWidth, gridHeight, totalTrees);
        
        // Add trees
        for (let i = 0; i < treesCount; i++) {
            const tree = document.createElement('div');
            tree.className = 'tree';
            tree.style.position = 'absolute';
            tree.style.left = `${positions[i].x - 20}px`; // Center tree (width 40)
            tree.style.top = `${positions[i].y - 40}px`; // Center tree (height 80)
            
            // Random scale for variety
            const scale = 0.8 + Math.random() * 0.4;
            tree.style.transform = `scale(${scale})`;
            
            this.forestGrid.appendChild(tree);
        }
        
        // Add stumps
        for (let i = treesCount; i < totalTrees; i++) {
            const stump = document.createElement('div');
            stump.className = 'stump';
            stump.style.position = 'absolute';
            stump.style.left = `${positions[i].x - 15}px`; // Center stump (width 30)
            stump.style.top = `${positions[i].y - 15}px`; // Center stump (height 30)
            
            this.forestGrid.appendChild(stump);
        }
    }
    
    /**
     * Generate positions for trees within a diamond shape
     */
    generatePositions(cx, cy, gridWidth, gridHeight, count) {
        const positions = [];
        
        // Helper function to check if a point is inside the diamond
        const isInsideDiamond = (x, y) => {
            return (
                Math.abs(x - cx) / (gridWidth / 2) +
                Math.abs(y - cy) / (gridHeight / 2) <= 1
            );
        };
        
        // Generate positions with collision detection
        for (let i = 0; i < count; i++) {
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
                
                // Check if the position is valid
                const isValid = isInsideDiamond(point.x, point.y) &&
                    !positions.some(p => 
                        Math.sqrt(Math.pow(p.x - point.x, 2) + Math.pow(p.y - point.y, 2)) < 40
                    );
                
                if (isValid) break;
            } while (attempts < 100);
            
            positions.push(point);
        }
        
        return positions;
    }
}