"use client";

import React, { useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  MarkerType,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";
import FamilyNode from "./FamilyNode";
import { FamilyMember } from "@/types/member";

interface InteractiveTreeProps {
  members: FamilyMember[];
}

interface FamilyUnit {
  id: string;
  primary: FamilyMember;
  spouse?: FamilyMember;
  children: FamilyUnit[];
  level: number;
  width?: number;
}

const nodeTypes = {
  familyNode: FamilyNode,
};

export default function InteractiveTree({ members }: InteractiveTreeProps) {
  // Compute family forest, layout coordinates, and build React Flow nodes and edges
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const visited = new Set<string>();

    const findSpouseOf = (m: FamilyMember) => {
      if (m.spouseId) {
        return members.find(other => other.id === m.spouseId);
      }
      return members.find(other => other.spouseId === m.id);
    };

    // 1. Build Family Unit Hierarchy
    const buildUnit = (primary: FamilyMember, level: number): FamilyUnit => {
      visited.add(primary.id);
      const spouse = findSpouseOf(primary);
      if (spouse) {
        visited.add(spouse.id);
      }

      const childMembers = members.filter(m => 
        !visited.has(m.id) && (
          (m.fatherId === primary.id || (spouse && m.fatherId === spouse.id)) ||
          (m.motherId === primary.id || (spouse && m.motherId === spouse.id))
        )
      );

      // Sort children by birthDate (oldest first)
      childMembers.sort((a, b) => {
        return new Date(a.birthDate).getTime() - new Date(b.birthDate).getTime();
      });

      const childrenUnits = childMembers.map(child => buildUnit(child, level + 1));

      return {
        id: `${primary.id}-${spouse?.id || 'none'}`,
        primary,
        spouse,
        children: childrenUnits,
        level
      };
    };

    // Determine roots
    const isRoot = (m: FamilyMember) => {
      const hasFather = m.fatherId && members.some(p => p.id === m.fatherId);
      const hasMother = m.motherId && members.some(p => p.id === m.motherId);
      if (hasFather || hasMother) return false;

      const spouse = findSpouseOf(m);
      if (spouse) {
        const spouseHasFather = spouse.fatherId && members.some(p => p.id === spouse.fatherId);
        const spouseHasMother = spouse.motherId && members.some(p => p.id === spouse.motherId);
        if (spouseHasFather || spouseHasMother) return false;
      }

      return true;
    };

    // Sort: put males first to start the root node as the patriarch (Kuppaya Poojari)
    const roots = members.filter(isRoot).sort((a, b) => {
      if (a.gender === 'MALE' && b.gender !== 'MALE') return -1;
      if (a.gender !== 'MALE' && b.gender === 'MALE') return 1;
      return 0;
    });

    const forest: FamilyUnit[] = [];
    roots.forEach(root => {
      if (!visited.has(root.id)) {
        forest.push(buildUnit(root, 0));
      }
    });

    // Fallback for any leftovers
    members.forEach(m => {
      if (!visited.has(m.id)) {
        forest.push(buildUnit(m, 0));
      }
    });

    // 2. Compute Subtree Columns recursively
    const calcSubtreeWidth = (unit: FamilyUnit): number => {
      if (unit.children.length === 0) {
        unit.width = 1;
        return 1;
      }
      const childrenWidth = unit.children.reduce((sum, child) => sum + calcSubtreeWidth(child), 0);
      unit.width = Math.max(childrenWidth, unit.spouse ? 1.5 : 1);
      return unit.width;
    };

    forest.forEach(root => calcSubtreeWidth(root));

    // 3. Coordinate Positioning layoutUnit
    const layoutUnit = (unit: FamilyUnit, xStart: number, colWidth: number, y: number) => {
      const unitColWidth = unit.width || 1;
      const centerX = xStart + (unitColWidth * colWidth) / 2;

      // Position Node(s)
      if (unit.spouse) {
        // Double node (couple)
        nodes.push({
          id: unit.primary.id,
          type: "familyNode",
          position: { x: centerX - 110, y },
          data: unit.primary,
        });
        nodes.push({
          id: unit.spouse.id,
          type: "familyNode",
          position: { x: centerX + 110, y },
          data: unit.spouse,
        });

        // Add spouse connector line
        edges.push({
          id: `spouse-${unit.primary.id}-${unit.spouse.id}`,
          source: unit.primary.id,
          target: unit.spouse.id,
          sourceHandle: "spouse-r",
          targetHandle: "spouse-l",
          type: "smoothstep",
          style: { stroke: "#d4af37", strokeWidth: 2, strokeDasharray: "4 4" },
          animated: true,
        });
      } else {
        // Single node
        nodes.push({
          id: unit.primary.id,
          type: "familyNode",
          position: { x: centerX - 96, y }, // Center the node (w-48 is 192px wide)
          data: unit.primary,
        });
      }

      // Lay out children
      let currentX = xStart;
      unit.children.forEach(child => {
        const childColWidth = child.width || 1;
        const nextY = y + 250; // Vertical gap between generations

        layoutUnit(child, currentX, colWidth, nextY);

        // Add parent-to-child connection line from the primary parent to the child
        edges.push({
          id: `child-${unit.primary.id}-${child.primary.id}`,
          source: unit.primary.id,
          target: child.primary.id,
          type: "smoothstep",
          style: { stroke: "rgba(255, 255, 255, 0.25)", strokeWidth: 1.5 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: "rgba(255, 255, 255, 0.25)",
            width: 10,
            height: 10,
          },
        });

        currentX += childColWidth * colWidth;
      });
    };

    // Execute layout
    let currentX = 0;
    const colWidth = 320; // horizontal spacing per column
    forest.forEach(root => {
      const rootColWidth = root.width || 1;
      layoutUnit(root, currentX, colWidth, 50);
      currentX += rootColWidth * colWidth + 160; // gap between separate family trees
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [members]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div className="w-full h-[600px] md:h-[750px] glass-panel border border-white/5 rounded-2xl overflow-hidden shadow-2xl relative">
      <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded border border-white/10 text-xs text-slate-300 pointer-events-none">
        💡 Drag node to rearrange • Use scroll wheel to Zoom
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        preventScrolling={false}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.1}
        maxZoom={1.5}
        className="bg-slate-950/20"
      >
        <Background color="#1e293b" gap={16} size={1} />
        <Controls className="bg-slate-900 border border-white/10 text-white rounded [&_button]:border-white/5 [&_button]:bg-slate-800 [&_button]:text-slate-300 [&_button:hover]:bg-gold [&_button:hover]:text-black" />
        <MiniMap
          nodeColor="#0f172a"
          maskColor="rgba(6, 9, 19, 0.7)"
          className="bg-slate-900 border border-white/10 rounded overflow-hidden hidden sm:block"
        />
      </ReactFlow>
    </div>
  );
}
