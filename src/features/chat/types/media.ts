export type Media = {
  url: string,
  thumbUrl?: string,
  type: MediaType
}

export enum MediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO'
}