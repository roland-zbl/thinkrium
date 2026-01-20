import { Highlight } from '@shared/types/feed'

/**
 * Traverses the DOM tree to find text nodes within the given offset range.
 */
function getTextNodesInRange(root: Node, startOffset: number, endOffset: number) {
  const treeWalker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null)
  const nodes: { node: Text; start: number; end: number }[] = []
  let currentOffset = 0

  while (treeWalker.nextNode()) {
    const node = treeWalker.currentNode as Text
    const nodeLength = node.textContent?.length || 0
    const nodeStart = currentOffset
    const nodeEnd = currentOffset + nodeLength

    if (nodeEnd > startOffset && nodeStart < endOffset) {
      nodes.push({
        node,
        start: Math.max(0, startOffset - nodeStart),
        end: Math.min(nodeLength, endOffset - nodeStart)
      })
    }

    currentOffset += nodeLength
  }

  return nodes
}

/**
 * Applies highlights to an HTML string by creating a temporary DOM,
 * wrapping text ranges with <mark> tags, and serializing back to HTML.
 */
export function applyHighlightsToHtml(html: string, highlights: Highlight[]): string {
  if (!html) return ''
  if (!highlights || highlights.length === 0) return html

  // Create a temporary container
  const container = document.createElement('div')
  container.innerHTML = html

  // Sort highlights by start_offset (descending) to avoid offset shifts
  // But since we are wrapping nodes in a live DOM, we should process them carefully.
  // Actually, standard practice for DOM manipulation is often simpler if we don't worry about index shifts
  // because we are traversing nodes, not string splicing.
  // However, overlapping highlights or nested structures can be tricky.
  // We'll process sorted by start_offset ASC.
  // const sortedHighlights = [...highlights].sort((a, b) => a.start_offset - b.start_offset)

  // We need to be careful: if we modify the DOM, the TreeWalker in subsequent steps might be affected?
  // Yes. If we split a text node, the tree structure changes.
  // Strategy:
  // 1. Find all ranges first.
  // 2. Apply them.
  // But ranges become invalid if we split nodes.
  // Better Strategy:
  // Process from end to start?
  // If we process from end to start, splitting a node at offset X won't affect offsets < X.
  // So let's sort Descending.
  const descendingHighlights = [...highlights].sort((a, b) => b.start_offset - a.start_offset)

  descendingHighlights.forEach((highlight) => {
    try {
      const nodesToWrap = getTextNodesInRange(container, highlight.start_offset, highlight.end_offset)

      // We need to wrap these ranges.
      // Since we are iterating backwards, we should be safer, but wrapping a range might involve splitting text nodes.

      // If a single text node covers the whole range (or part of it), we might need to split it.
      // Example: "Hello World", highlight "World". Node "Hello World" -> "Hello " + "World".
      // Then wrap "World".

      // Since we collected nodes based on original structure, if we modify one node,
      // it *might* affect others if they are the same node?
      // `getTextNodesInRange` returns specific Text nodes.
      // If we process one highlight, we might split a node that another highlight also uses?
      // Yes, if highlights overlap.
      // Assuming NO OVERLAPS for MVP or simple cases.
      // If overlaps exist, this logic might be fragile.
      // But let's proceed with standard "split and wrap".

      nodesToWrap.forEach(({ node, start, end }) => {
        const range = document.createRange()
        range.setStart(node, start)
        range.setEnd(node, end)

        const mark = document.createElement('mark')
        mark.className = `highlight-${highlight.color} cursor-pointer`
        mark.dataset.highlightId = highlight.id
        // mark.onclick = (e) => {
        //    // We'll handle clicks via event delegation in the parent component
        //    // but adding an attribute helps identify it.
        // }

        try {
           range.surroundContents(mark)
        } catch (e) {
           console.warn('Failed to surround contents for highlight', highlight.id, e)
        }
      })
    } catch (e) {
      console.error('Error applying highlight', highlight.id, e)
    }
  })

  return container.innerHTML
}

/**
 * Calculates the plain text offset from the start of the container to the selection.
 */
export function getSelectionOffsets(container: HTMLElement) {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return null

  const range = selection.getRangeAt(0)

  // Check if selection is inside container
  if (!container.contains(range.commonAncestorContainer)) return null

  // Calculate start offset
  // We need to traverse all text nodes before the start of the range
  const preSelectionRange = range.cloneRange()
  preSelectionRange.selectNodeContents(container)
  preSelectionRange.setEnd(range.startContainer, range.startOffset)
  const start = preSelectionRange.toString().length

  // Calculate end offset
  const end = start + range.toString().length

  return {
    start,
    end,
    text: range.toString()
  }
}
