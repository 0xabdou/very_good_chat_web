const pattern = new RegExp('^(https?:\\/\\/)' + // protocol
  '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
  '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
  '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'); // port and path

const isUrl = (str: string) => pattern.test(str);

export default isUrl;