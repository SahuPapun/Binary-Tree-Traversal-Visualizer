class TreeNode {
    constructor(val) {
        this.val = val;
        this.left = null;
        this.right = null;
    }
}

let root = null;
const treeContainer = document.getElementById("tree-container");
const outputDiv = document.getElementById("output");
const nodeElements = new Map();

function updateParentDropdown() {
    const dropdown = document.getElementById("nodePositionSelect");
    dropdown.innerHTML = `<option value="root">Set as Root</option>`;

    function traverse(node) {
        if (!node) return;
        if (!node.left) {
            const opt = document.createElement("option");
            opt.value = `${node.val}-left`;
            opt.textContent = `Add as Left child of ${node.val}`;
            dropdown.appendChild(opt);
        }
        if (!node.right) {
            const opt = document.createElement("option");
            opt.value = `${node.val}-right`;
            opt.textContent = `Add as Right child of ${node.val}`;
            dropdown.appendChild(opt);
        }
        traverse(node.left);
        traverse(node.right);
    }

    if (root) traverse(root);
}

function addNodeManually() {
    const value = document.getElementById("nodeValue").value.trim();
    const selection = document.getElementById("nodePositionSelect").value;

    if (!value) return alert("Please enter a node value.");
    if (!selection) return alert("Please select a position.");

    const newNode = new TreeNode(value);

    if (selection === "root") {
        if (root !== null) return alert("Root already exists.");
        root = newNode;
        outputDiv.innerHTML = `Added ${value} as root.`;
    } else {
        const [parentValue, side] = selection.split("-");
        let added = false;

        function attach(node) {
            if (!node) return false;
            if (node.val === parentValue) {
                if (side === "left") {
                    if (node.left) return alert("Left child already exists.");
                    node.left = newNode;
                    outputDiv.innerHTML = `Added ${value} as left child of ${parentValue}`;
                } else {
                    if (node.right) return alert("Right child already exists.");
                    node.right = newNode;
                    outputDiv.innerHTML = `Added ${value} as right child of ${parentValue}`;
                }
                added = true;
                return true;
            }
            return attach(node.left) || attach(node.right);
        }

        if (!attach(root)) return alert("Parent node not found.");
        if (!added) return;
    }

    document.getElementById("nodeValue").value = "";
    updateParentDropdown();
    renderTree(root);
}

function renderTree(node) {
    treeContainer.innerHTML = '';
    nodeElements.clear();
    const spacingX = 60;
    const spacingY = 100;

    function dfs(node, x, y, level) {
        if (!node) return;

        const div = document.createElement("div");
        div.className = "node";
        div.textContent = node.val;
        div.style.left = `${x}px`;
        div.style.top = `${y}px`;
        div.style.position = "absolute";
        div.setAttribute("data-val", node.val);
        treeContainer.appendChild(div);

        makeDraggable(div, node.val);
        nodeElements.set(node.val, div);

        dfs(node.left, x - spacingX * Math.pow(2, 2 - level), y + spacingY, level + 1);
        dfs(node.right, x + spacingX * Math.pow(2, 2 - level), y + spacingY, level + 1);
    }

    dfs(node, 500, 50, 0);
    setTimeout(updateAllLines, 20);
}

function drawLine(fromEl, toEl) {
    const x1 = fromEl.offsetLeft + fromEl.offsetWidth / 2;
    const y1 = fromEl.offsetTop + fromEl.offsetHeight / 2;
    const x2 = toEl.offsetLeft + toEl.offsetWidth / 2;
    const y2 = toEl.offsetTop + toEl.offsetHeight / 2;

    const deltaX = x2 - x1;
    const deltaY = y2 - y1;
    const length = Math.sqrt(deltaX ** 2 + deltaY ** 2);
    const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;

    const line = document.createElement("div");
    line.className = "arrow";
    line.style.width = `${length}px`;
    line.style.transform = `rotate(${angle}deg)`;
    line.style.transformOrigin = '0 0';
    line.style.left = `${x1}px`;
    line.style.top = `${y1}px`;
    treeContainer.appendChild(line);
}

function updateAllLines() {
    document.querySelectorAll(".arrow").forEach(el => el.remove());

    function drawLinks(node) {
        if (!node) return;
        const parentEl = nodeElements.get(node.val);
        if (node.left) {
            const childEl = nodeElements.get(node.left.val);
            drawLine(parentEl, childEl);
            drawLinks(node.left);
        }
        if (node.right) {
            const childEl = nodeElements.get(node.right.val);
            drawLine(parentEl, childEl);
            drawLinks(node.right);
        }
    }

    drawLinks(root);
}

function resetTree() {
    root = null;
    outputDiv.innerHTML = "";
    treeContainer.innerHTML = "";
    document.getElementById("nodePositionSelect").innerHTML = `<option value="root">Set as Root</option>`;
}

function generateRandomTree() {
    resetTree();
    root = new TreeNode("10");
    root.left = new TreeNode("5");
    root.right = new TreeNode("15");
    root.left.left = new TreeNode("3");
    root.left.right = new TreeNode("7");
    root.right.left = new TreeNode("12");
    root.right.right = new TreeNode("18");
    updateParentDropdown();
    renderTree(root);
}

// async function highlightTraversal(node, callback) {
//     if (!node) return;
//     const el = document.querySelector(`.node[data-val="${node.val}"]`);
//     el?.classList.add('visited');
//     outputDiv.innerHTML += node.val + " ";
//     await new Promise(resolve => setTimeout(resolve, 700));
//     callback?.();
// }
async function highlightTraversal(node, list = []) {
    if (!node) return;
    const el = document.querySelector(`.node[data-val="${node.val}"]`);
    el?.classList.add('visited');
    list.push(node.val);
    await new Promise(resolve => setTimeout(resolve, 700));
}


async function inorder(node, list) {
    if (!node) return;
    await inorder(node.left, list);
    await highlightTraversal(node, list);
    await inorder(node.right, list);
}


async function preorder(node, list) {
    if (!node) return;
    await highlightTraversal(node, list);
    await preorder(node.left, list);
    await preorder(node.right, list);
}


async function postorder(node, list) {
    if (!node) return;
    await postorder(node.left, list);
    await postorder(node.right, list);
    await highlightTraversal(node, list);
}


async function levelorder(root, list) {
    if (!root) return;
    const queue = [root];
    while (queue.length > 0) {
        const node = queue.shift();
        await highlightTraversal(node, list);
        if (node.left) queue.push(node.left);
        if (node.right) queue.push(node.right);
    }
}


async function morris(root, list) {
    let current = root;
    while (current) {
        if (!current.left) {
            await highlightTraversal(current, list);
            current = current.right;
        } else {
            let pre = current.left;
            while (pre.right && pre.right !== current) {
                pre = pre.right;
            }
            if (!pre.right) {
                pre.right = current;
                current = current.left;
            } else {
                pre.right = null;
                await highlightTraversal(current, list);
                current = current.right;
            }
        }
    }
}


// function startTraversal(type) {
//     outputDiv.innerHTML = `${type.toUpperCase()} Traversal: `;
//     document.querySelectorAll('.node').forEach(n => n.classList.remove('visited'));

//     switch (type) {
//         case 'inorder': inorder(root); break;
//         case 'preorder': preorder(root); break;
//         case 'postorder': postorder(root); break;
//         case 'levelorder': levelorder(root); break;
//         case 'morris': morris(root); break;
//     }
// }
async function startTraversal(type) {
    document.querySelectorAll('.node').forEach(n => n.classList.remove('visited'));

    const traversalList = [];

    switch (type) {
        case 'inorder': await inorder(root, traversalList); break;
        case 'preorder': await preorder(root, traversalList); break;
        case 'postorder': await postorder(root, traversalList); break;
        case 'levelorder': await levelorder(root, traversalList); break;
        case 'morris': await morris(root, traversalList); break;
    }

    outputDiv.innerHTML = `
        <div class="traversal-title">${type.charAt(0).toUpperCase() + type.slice(1)} Traversal:</div>
        <div class="traversal-path">${traversalList.join(", ")}</div>
    `;
}



function toggleDarkMode() {
    const isDark = document.body.classList.toggle('dark-mode');
    const label = document.getElementById('theme-label');
    label.innerText = isDark ? "Dark Theme" : "Light Theme";
}



function makeDraggable(nodeDiv, nodeVal) {
    let isDragging = false;
    let offsetX, offsetY;

    nodeDiv.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.offsetX;
        offsetY = e.offsetY;
        nodeDiv.classList.add("dragging");
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const containerRect = treeContainer.getBoundingClientRect();
        const x = e.clientX - containerRect.left - offsetX;
        const y = e.clientY - containerRect.top - offsetY;

        nodeDiv.style.left = `${x}px`;
        nodeDiv.style.top = `${y}px`;

        updateAllLines();
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            nodeDiv.classList.remove("dragging");
        }
    });
}
