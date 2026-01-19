export interface OpmlFeed {
  type: 'rss'
  text: string
  title: string
  xmlUrl: string
  htmlUrl?: string
  category?: string
}

export interface OpmlExport {
  head: {
    title: string
    dateCreated: string
  }
  body: {
    outline: OpmlOutline[]
  }
}

export interface OpmlOutline {
  text: string
  title: string
  type?: 'rss'
  xmlUrl?: string
  htmlUrl?: string
  outline?: OpmlOutline[]
}
