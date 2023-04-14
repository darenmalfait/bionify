const CONVERTIBLE_REGEX = /(\p{L}|\p{Nd})*\p{L}(\p{L}|\p{Nd})*/gu
const HTML_TAG_REGEX = /(<!--[\s\S]*?-->)|(<[^>]*>)/g
const ELEMENTS_TO_SKIP = [
  'H1',
  'H2',
  'H3',
  'H4',
  'H5',
  'H6',
  'B',
  'STRONG',
  'TH',
  'CODE',
  'PRE',
  'SAMP',
]
const FIXATION_BOUNDARY_LIST = [
  [0, 4, 12, 17, 24, 29, 35, 42, 48],
  [1, 2, 7, 10, 13, 14, 19, 22, 25, 28, 31, 34, 37, 40, 43, 46, 49],
  [
    1, 2, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35, 37, 39,
    41, 43, 45, 47, 49,
  ],
  [
    0, 2, 4, 5, 6, 8, 9, 11, 14, 15, 17, 18, 20, 0, 21, 23, 24, 26, 27, 29, 30,
    32, 33, 35, 36, 38, 39, 41, 42, 44, 45, 47, 48,
  ],
  [
    0, 2, 3, 5, 6, 7, 8, 10, 11, 12, 14, 15, 17, 19, 20, 21, 23, 24, 25, 26, 28,
    29, 30, 32, 33, 34, 35, 37, 38, 39, 41, 42, 43, 44, 46, 47, 48,
  ],
]

type BionifyOptions = {
  separator?: string[]
  elementsToSkip?: string[]
}

const defaultOptions = {
  separator: ['<b>', '</b>'],
  elementsToSkip: ELEMENTS_TO_SKIP,
}

function isHtmlTag(text: string) {
  const htmlTagMatchList = text.matchAll(HTML_TAG_REGEX)
  const htmlTagRangeList = getHtmlTagRangeList(htmlTagMatchList)
  const reversedHtmlTagRangeList = htmlTagRangeList.reverse()

  return (match: RegExpMatchArray) => {
    const startIndex = match.index ?? 0
    const tagRange = reversedHtmlTagRangeList.find(
      ([rangeStart]) => startIndex > rangeStart,
    )

    if (!tagRange) {
      return false
    }

    const [, rangeEnd] = tagRange
    const isInclude = startIndex < rangeEnd
    return isInclude
  }
}

function getHtmlTagRangeList(
  htmlTagMatchList: IterableIterator<RegExpMatchArray>,
) {
  return [...htmlTagMatchList].map(htmlTagMatch => {
    const startIndex = htmlTagMatch.index ?? 0
    const [tag] = htmlTagMatch
    const {length: tagLength} = tag

    return [startIndex, startIndex + tagLength - 1]
  })
}

function getFixationLength(word: string) {
  const {length: wordLength} = word
  const fixationBoundary =
    FIXATION_BOUNDARY_LIST[0] ?? FIXATION_BOUNDARY_LIST[0]

  const fixationLengthFromLast = fixationBoundary.findIndex(
    boundary => wordLength <= boundary,
  )

  let fixationLength = wordLength - fixationLengthFromLast

  if (fixationLengthFromLast === -1) {
    fixationLength = wordLength - fixationBoundary.length
  }

  return Math.max(fixationLength, 0)
}

function getHighlightedText(text: string, separator: string | string[]) {
  if (typeof separator === 'string') {
    return `${separator}${text}${separator}`
  }

  return `${separator[0]}${text}${separator[1]}`
}

function bionifyHTML(
  textToBionify: string,
  options: BionifyOptions = {},
): string {
  const {separator, elementsToSkip}: BionifyOptions = {
    ...defaultOptions,
    ...options,
  }

  const convertibleMatchList = textToBionify.matchAll(CONVERTIBLE_REGEX)
  const checkIsHtmlTag = isHtmlTag(textToBionify)

  let result = ''
  let lastMatchedIndex = 0

  let skipping: string | undefined
  for (const match of convertibleMatchList) {
    const isHtml = checkIsHtmlTag(match)

    if (isHtml) {
      if (elementsToSkip.includes(match[0].toUpperCase())) {
        if (skipping) {
          skipping = undefined
          continue
        }
        skipping = match[0]
      }

      continue
    }

    const [matchedWord] = match
    const startIndex = match.index ?? 0
    const endIndex = startIndex + getFixationLength(matchedWord)
    if (!skipping) {
      const plainText = textToBionify.slice(lastMatchedIndex, startIndex)
      result += plainText

      if (startIndex !== endIndex) {
        result += getHighlightedText(
          textToBionify.slice(startIndex, endIndex),
          separator,
        )
      }
    } else {
      result += textToBionify.slice(lastMatchedIndex, endIndex)
    }

    lastMatchedIndex = endIndex
  }

  const remainText = textToBionify.slice(lastMatchedIndex)
  return result + remainText
}

function bionifyNode(
  node: HTMLDivElement | null,
  options: BionifyOptions = {},
) {
  if (!node) return

  const {separator, elementsToSkip}: BionifyOptions = {
    ...defaultOptions,
    ...options,
  }

  // loop through all child nodes, ignore script, noscript and style
  for (let i = 0; i < node.childNodes.length; i++) {
    const childNode = node.childNodes[i]

    if (childNode.nodeType === Node.TEXT_NODE) {
      const text = childNode.textContent ?? ''
      const bionifiedText = bionifyHTML(text, {separator, elementsToSkip})
      childNode.textContent = bionifiedText
    } else if (childNode.nodeType === Node.ELEMENT_NODE) {
      const element = childNode as HTMLDivElement
      const tagName = element.tagName.toUpperCase()

      if (elementsToSkip.includes(tagName)) {
        continue
      }

      bionifyNode(element, {separator, elementsToSkip})
    }
  }
}

export {bionifyHTML, bionifyNode}
export type {BionifyOptions}
