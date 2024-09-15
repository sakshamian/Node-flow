import React, { useState, useCallback } from 'react';
import {
    ReactFlow,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import Sidebar from './Sidebar';

const fetchCategories = async () => {
    const response = await fetch('https://www.themealdb.com/api/json/v1/1/list.php?c=list');
    const data = await response.json();
    const categoriesArray=[];
    for (let i = 0; i < Math.min(5, data.meals.length);i++){
        categoriesArray.push(data.meals[i].strCategory);
    }
    return categoriesArray;
};

const fetchMeals = async (category) => {
    const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`);
    const data = await response.json();
    const mealsArray = [];
    for (let i = 0; i < Math.min(5, data.meals.length); i++) {
        mealsArray.push(data.meals[i].strMeal);
    }
    return mealsArray;
};

const fetchIngredients = async (meal) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return ['Tomatoes', 'Cheese', 'Flour', 'Eggs', 'Olive Oil'];
};

const fetchTags = async (meal) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return ['Vegetarian', 'Gluten-free', 'Spicy', 'Quick', 'Easy'];
};

const fetchMealDetails = async (meal) => {
    const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${meal}`);
    const data = await response.json();
    return data.meals[0];
};

const initialNodes = [
    {
        id: 'explore',
        data: { label: 'Explore' },
        position: { x: 20, y: 250 },
        sourcePosition: 'right'
    },
];

const Flow = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [sidebar, setSidebar] = useState(null);

    const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

    const createNode = (id, label, x, y, type = 'default', parent="") => ({
        id,
        type,
        data: { label, parent: parent },
        targetPosition: 'left',
        sourcePosition: 'right',
        position: { x, y },
    });

    const createEdge = (source, target) => ({
        id: `e${source}-${target}`,
        source,
        target,
        markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
        },
    });

    const removeNodesAndEdgesToTheRight = (clickedNodeId) => {
        const clickedNode = nodes.find(node => node.id === clickedNodeId);
        if (!clickedNode) return;

        const nodesToKeep = nodes.filter(node => node.position.x <= clickedNode.position.x);
        const edgesToKeep = edges.filter(edge => {
            const sourceNode = nodes.find(node => node.id === edge.source);
            return sourceNode && sourceNode.position.x < clickedNode.position.x;
        });

        setNodes(nodesToKeep);
        setEdges(edgesToKeep);
        setSidebar(null);
    };

    const onNodeClick = useCallback(async (_, node) => {
        removeNodesAndEdgesToTheRight(node.id);

        if (node.id === 'explore') {
            const categories = await fetchCategories();
            const newNodes = categories.map((category, index) =>
                createNode(`category-${index}`, category, 200, index * 100, "default", category)
            );
            const newEdges = categories.map((_, index) =>
                createEdge('explore', `category-${index}`)
            );
            setNodes((nds) => [...nds, ...newNodes]);
            setEdges((eds) => [...eds, ...newEdges]);
        } else if (node.id.startsWith('category-')) {
            console.log(node.data.label, "xx");
            const viewMealsNode = createNode('view-meals', 'View Meals', 400, node.position.y, "default", node.data.label);
            setNodes((nds) => [...nds, viewMealsNode]);
            setEdges((eds) => [...eds, createEdge(node.id, 'view-meals')]);
        } else if (node.id === 'view-meals') {
            const meals = await fetchMeals(node.data.parent);
            const newNodes = meals.map((meal, index) =>
                createNode(`meal-${index}`, meal, 600, index * 100, "default", meal)
            );
            const newEdges = meals.map((_, index) =>
                createEdge('view-meals', `meal-${index}`)
            );
            setNodes((nds) => [...nds, ...newNodes]);
            setEdges((eds) => [...eds, ...newEdges]);
        } else if (node.id.startsWith('meal-') && (node.id.length === 6)) {
            const optionNodes = [
                createNode(`${node.id}-ingredients`, 'View Ingredients', 800, node.position.y - 50, "default", node.data.parent),
                createNode(`${node.id}-tags`, 'View Tags', 800, node.position.y, "default", node.data.parent),
                createNode(`${node.id}-details`, 'View Details', 800, node.position.y + 50, "default", node.data.parent),
            ];
            const optionEdges = optionNodes.map((optionNode) =>
                createEdge(node.id, optionNode.id)
            );
            setNodes((nds) => [...nds, ...optionNodes]);
            setEdges((eds) => [...eds, ...optionEdges]);
        } else if (node.id.includes('-ingredients')) {
            const ingredients = await fetchIngredients();
            const newNodes = ingredients.map((ingredient, index) =>
                createNode(`${node.id}-${index}`, ingredient, 1000, node.position.y - 100 + index * 50)
            );
            const newEdges = ingredients.map((_, index) =>
                createEdge(node.id, `${node.id}-${index}`)
            );
            setNodes((nds) => [...nds, ...newNodes]);
            setEdges((eds) => [...eds, ...newEdges]);
        } else if (node.id.includes('-tags')) {
            const tags = await fetchTags();
            const newNodes = tags.map((tag, index) =>
                createNode(`${node.id}-${index}`, tag, 1000, node.position.y - 100 + index * 50)
            );
            const newEdges = tags.map((_, index) =>
                createEdge(node.id, `${node.id}-${index}`)
            );
            setNodes((nds) => [...nds, ...newNodes]);
            setEdges((eds) => [...eds, ...newEdges]);
        } else if (node.id.includes('-details')) {
            const details = await fetchMealDetails(node.data.parent);
            setSidebar(details);
        }
    }, [setNodes, setEdges, nodes]);

    return (
        <div style={{ width: '100vw', height: '100vh' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
            >
                <Controls />
                <Background variant="dots" gap={12} size={1} />
            </ReactFlow>
            {sidebar && <Sidebar mealDetails={sidebar} onClose={() => setSidebar(null)} />}
        </div>
    );
};

export default Flow;