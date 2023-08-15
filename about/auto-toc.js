/* Creates a table of contents for all headings automatically */

const headingLevels = { h1: 1, h2: 2, h3: 3, h4: 4, h5: 5, h6: 6 };
const tableOfContents = document.querySelector(".toc");
const linkEmoji = " 🔗 ";

/**
 * @typedef {{ heading: HTMLElement, parent: TreeNode, level: number, slug: string, children: TreeNode[] }} TreeNode
 */

/**
 * @param {string} string
 */
function slugify(string) {
    const slug = string && string.toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/&/g, "and")
        .replace(/[()]/g, "")
        .trim();
    return encodeURIComponent(slug);
}

/**
 * @param {HTMLElement} heading
 * @param {TreeNode} parent
 * @param {number} level
 * @returns {TreeNode}
 */
function createTreeNode(heading, parent, level) {
    return { heading, parent, level, slug: slugify(heading?.innerText), children: [] };
}

/**
 * @param {number} startingLevel
 */
function buildHeadingTree(startingLevel) {
    const allHeadingsSelector = Object.entries(headingLevels)
        .filter(([_, level]) => level >= startingLevel)
        .map(([name, _]) => name)
        .join(",");

    const allHeadings = document.querySelectorAll(allHeadingsSelector);
    const tree = createTreeNode(null, null);

    let currentLevel = startingLevel;
    let previousNode = null;
    let parentNode = tree;

    for (const heading of allHeadings) {
        const level = headingLevels[heading.tagName.toLowerCase()];
        const currentNode = createTreeNode(heading, parentNode, level);
        if (level > currentLevel) {
            parentNode = previousNode;
            currentLevel = level;
        }
        if (level < currentLevel) {
            parentNode = parentNode.parent;
            currentLevel = level;
        }
        parentNode.children.push(currentNode);
        previousNode = currentNode;
    }

    return tree;
}

/**
 * @param {HTMLElement} container
 * @param {TreeNode} node
 */
function createHeadingEntries(container, node) {
    if (node.children) {
        const list = document.createElement("ul");
        container.appendChild(list);
        for (const child of node.children) {
            const listItem = document.createElement("li");
            const anchor = document.createElement("a");
            anchor.innerText = child.heading.innerText;
            anchor.href = "#" + child.slug;
            listItem.appendChild(anchor);
            list.appendChild(listItem);
            createHeadingEntries(listItem, child);
        }
    }
}

/**
 * @param {TreeNode} node
 */
function addAnchorsToHeaders(node) {
    for (const child of node.children) {
        const span = document.createElement("span");
        span.innerHTML = child.heading.innerHTML;
        const anchor = document.createElement("a");
        anchor.innerText = linkEmoji;
        anchor.href = "#" + child.slug;
        anchor.className = "anchor";
        child.heading.innerHTML = "";
        child.heading.append(span, anchor);
        addAnchorsToHeaders(child);
    }
}

function flashActiveHeading() {
    const headingId = location.hash && location.hash.replace(/^#/, "");
    if (headingId) {
        const target = document.getElementById(headingId).firstElementChild;
        if (target) {
            target.classList.add("flash");
            setTimeout(() => target.classList.remove("flash"), 1000);
        }
    }
}

const headingTree = buildHeadingTree(2);
createHeadingEntries(tableOfContents, headingTree);
addAnchorsToHeaders(headingTree);

window.addEventListener("hashchange", flashActiveHeading);
flashActiveHeading();
